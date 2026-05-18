"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AgentCategory } from "@/types";
import { Search, Check, TrendingUp, Coffee, MessageCircle, Navigation, Cloud, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  finance:       TrendingUp,
  food:          Coffee,
  communication: MessageCircle,
  transport:     Navigation,
  weather:       Cloud,
  productivity:  Cpu,
};

const categories: { value: AgentCategory | "all"; label: string }[] = [
  { value: "all",           label: "Tümü" },
  { value: "finance",       label: "Finans" },
  { value: "food",          label: "Yemek" },
  { value: "communication", label: "İletişim" },
  { value: "transport",     label: "Ulaşım" },
  { value: "weather",       label: "Hava Durumu" },
  { value: "productivity",  label: "Verimlilik" },
];

const categoryGradients: Record<string, string> = {
  finance:       "linear-gradient(135deg,#f6d365,#fda085)",
  food:          "linear-gradient(135deg,#84fab0,#8fd3f4)",
  communication: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  transport:     "linear-gradient(135deg,#4facfe,#00f2fe)",
  weather:       "linear-gradient(135deg,#43e97b,#38f9d7)",
  productivity:  "linear-gradient(135deg,#f093fb,#f5576c)",
};

const categoryLabels: Record<string, string> = {
  finance: "Finans", food: "Yemek", communication: "İletişim",
  transport: "Ulaşım", weather: "Hava", productivity: "Verimlilik",
};

export default function MarketplacePage() {
  const { agents, wallets, toggleConnect } = useAppStore();
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState<AgentCategory | "all">("all");

  const filtered = agents.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
      || a.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || a.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Agent Marketplace</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {agents.length} ajan mevcut · {agents.filter((a) => a.isConnected).length} bağlı
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            placeholder="Ajan ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-black placeholder:text-gray-300 focus:outline-none focus:border-gray-300 text-sm transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                background: category === value ? "#000" : "#f0f0f0",
                color:      category === value ? "#fff" : "#666",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-300 rounded-2xl bg-gray-50">
          <p className="text-base font-medium text-gray-400">Ajan bulunamadı</p>
          <p className="text-sm mt-1">Arama kriterlerinizi değiştirin</p>
        </div>
      ) : (
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((agent) => {
            const wallet    = wallets.find((w) => w.agentId === agent.id);
            const gradient  = categoryGradients[agent.category] ?? "linear-gradient(135deg,#e0e0e0,#c0c0c0)";
            const catLabel  = categoryLabels[agent.category] ?? agent.category;
            const statusDot = agent.status === "active"  ? "#00e96e"
                            : agent.status === "running" ? "#6b7fff"
                            : agent.status === "error"   ? "#ff4d4d"
                            :                              "#ccc";
            return (
              <div key={agent.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: gradient }}>
                      {(() => { const Icon = CATEGORY_ICONS[agent.category] ?? Cpu; return <Icon className="w-5 h-5 text-white opacity-90" />; })()}
                    </div>
                    <div>
                      <p className="font-bold text-black text-sm leading-tight">{agent.name}</p>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{catLabel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: statusDot }} />
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-4">{agent.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {agent.capabilities.slice(0, 3).map((cap) => (
                    <span key={cap} className="text-[10px] px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100">
                      {cap}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    {agent.pricePerCall > 0 ? (
                      <p className="text-xs text-gray-500">
                        <span className="font-bold text-black">${agent.pricePerCall.toFixed(3)}</span> / çağrı
                      </p>
                    ) : (
                      <p className="text-xs font-semibold" style={{ color: "#00e96e" }}>Ücretsiz</p>
                    )}
                    {wallet && wallet.balance > 0 && (
                      <p className="text-[10px] text-gray-400 mt-0.5">Bakiye: <span className="font-medium text-black">${wallet.balance.toFixed(2)}</span></p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleConnect(agent.id)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:-translate-y-0.5"
                    style={
                      agent.isConnected
                        ? { background: "#f0f0f0", color: "#000" }
                        : { background: "#000",    color: "#fff" }
                    }
                  >
                    {agent.isConnected ? (
                      <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Bağlı</span>
                    ) : "Bağla"}
                  </button>
                </div>
              </div>
            );
          })}
          </div>
          {filtered.length >= 6 && (
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: 160,
              background: "linear-gradient(to bottom, transparent, white)",
              pointerEvents: "none",
            }} />
          )}
        </div>
      )}
    </div>
  );
}
