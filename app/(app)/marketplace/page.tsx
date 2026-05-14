"use client";

import { useState } from "react";
import { AgentCard } from "@/components/agents/AgentCard";
import { useAppStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { AgentCategory } from "@/types";
import { Search } from "lucide-react";

const categories: { value: AgentCategory | "all"; label: string }[] = [
  { value: "all",           label: "Tümü" },
  { value: "finance",       label: "Finans" },
  { value: "food",          label: "Yemek" },
  { value: "communication", label: "İletişim" },
  { value: "transport",     label: "Ulaşım" },
  { value: "weather",       label: "Hava Durumu" },
  { value: "productivity",  label: "Verimlilik" },
];

export default function MarketplacePage() {
  const { agents, wallets, toggleConnect } = useAppStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AgentCategory | "all">("all");

  const filtered = agents.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || a.category === category;
    return matchSearch && matchCat;
  });

  const connected = agents.filter((a) => a.isConnected).length;

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-[#d0d7de]">
        <h1 className="text-xl font-semibold text-[#1f2328]">Agent Marketplace</h1>
        <p className="text-sm text-[#656d76] mt-0.5">
          {agents.length} ajan mevcut · {connected} bağlı
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9198a1]" />
          <Input
            placeholder="Ajan ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-[#d0d7de] text-[#1f2328] placeholder:text-[#9198a1] focus:border-violet-400"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {categories.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                category === value
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-[#656d76] border-[#d0d7de] hover:border-[#b7bfc8] hover:text-[#1f2328]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#9198a1] border border-[#d0d7de] rounded-xl bg-white">
          <p className="text-lg font-medium text-[#656d76]">Ajan bulunamadı</p>
          <p className="text-sm mt-1">Arama kriterlerinizi değiştirin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              wallet={wallets.find((w) => w.agentId === agent.id)}
              onConnect={toggleConnect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
