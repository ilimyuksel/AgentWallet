"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Activity, Zap, Wallet, Store, ArrowRight, Play } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { agents, wallets, pipelines, transactions } = useAppStore();
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const totalBalance    = wallets.reduce((s, w) => s + w.balance, 0);
  const activePipelines = pipelines.filter((p) => p.status === "active").length;
  const connectedAgents = agents.filter((a) => a.isConnected).length;
  const recentTxs       = transactions.slice(0, 5);

  const getAgentName = (id: string) => {
    if (id === "user") return "Kullanıcı";
    return agents.find((a) => a.id === id)?.name ?? id;
  };

  const handleRun = () => {
    if (!prompt.trim()) return;
    router.push("/pipeline?prompt=" + encodeURIComponent(prompt));
  };

  return (
    <div className="p-8 max-w-5xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Hoş geldiniz, Demo User</p>
      </div>

      {/* Prompt bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <p className="text-sm font-semibold text-black mb-1">Yeni Pipeline Oluştur</p>
        <p className="text-xs text-gray-400 mb-4">Ne otomatize etmek istiyorsunuz?</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRun()}
              placeholder="Örn: Borsadan $100 kar ettiğimde kahve sipariş et..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-black placeholder:text-gray-300 focus:outline-none focus:border-gray-300 text-sm transition-colors"
            />
          </div>
          <button
            onClick={handleRun}
            disabled={!prompt.trim()}
            className="px-5 py-2.5 rounded-xl text-black font-semibold flex items-center gap-2 text-sm transition-all disabled:opacity-30 hover:-translate-y-0.5"
            style={{ background: "#00e96e" }}
          >
            <Play className="w-3.5 h-3.5" /> Çalıştır
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Activity, label: "Aktif Pipeline", value: activePipelines,               sub: `${pipelines.length} toplam` },
          { icon: Store,    label: "Bağlı Ajan",     value: connectedAgents,               sub: `${agents.length} mevcut` },
          { icon: Wallet,   label: "Toplam Bakiye",  value: `$${totalBalance.toFixed(2)}`, sub: `${wallets.reduce((s, w) => s + w.agtBalance, 0).toLocaleString()} AGT` },
          { icon: Zap,      label: "İşlem",          value: transactions.length,           sub: "toplam transfer" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: "#f5f5f5" }}>
            <Icon className="w-5 h-5 text-gray-400 mb-3" />
            <p className="text-3xl font-bold text-black leading-none mb-1">{value}</p>
            <p className="text-xs font-medium text-black">{label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Pipelines + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active pipelines */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-black">Aktif Pipeline&apos;lar</h2>
            <Link href="/pipeline" className="text-xs text-gray-400 hover:text-black flex items-center gap-1 transition-colors">
              Tümü <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 space-y-2">
            {pipelines.filter((p) => p.status === "active").map((p) => (
              <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#00e96e" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-black font-medium truncate">{p.prompt}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {p.agents.length} ajan ·{" "}
                    {p.lastRunAt
                      ? new Date(p.lastRunAt).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </p>
                </div>
              </div>
            ))}
            {pipelines.filter((p) => p.status === "active").length === 0 && (
              <p className="text-sm text-gray-300 text-center py-8">Henüz aktif pipeline yok</p>
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-black">Son İşlemler</h2>
            <Link href="/wallet" className="text-xs text-gray-400 hover:text-black flex items-center gap-1 transition-colors">
              Tümü <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 space-y-2">
            {recentTxs.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-black truncate">
                    {getAgentName(tx.fromAgentId)} → {getAgentName(tx.toAgentId)}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{tx.txHash.slice(0, 16)}...</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-black">${tx.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-gray-400">#{tx.blockNumber.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connected agents */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-black">Bağlı Ajanlar</h2>
          <Link href="/marketplace" className="text-xs text-gray-400 hover:text-black flex items-center gap-1 transition-colors">
            Marketplace <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {agents.filter((a) => a.isConnected).map((a) => (
            <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-sm">{a.icon}</span>
              <span className="text-xs font-medium text-black">{a.name}</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e96e" }} />
            </div>
          ))}
          {agents.filter((a) => a.isConnected).length === 0 && (
            <p className="text-sm text-gray-300 py-2">Henüz bağlı ajan yok.</p>
          )}
        </div>
      </div>
    </div>
  );
}
