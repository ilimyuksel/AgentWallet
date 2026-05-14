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

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const activePipelines = pipelines.filter((p) => p.status === "active").length;
  const connectedAgents = agents.filter((a) => a.isConnected).length;
  const recentTransactions = transactions.slice(0, 5);

  const getAgentName = (id: string) => {
    if (id === "user") return "👤 Kullanıcı";
    const a = agents.find((ag) => ag.id === id);
    return a ? `${a.icon} ${a.name}` : id;
  };

  const handlePromptRun = () => {
    if (!prompt.trim()) return;
    router.push("/pipeline?prompt=" + encodeURIComponent(prompt));
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-[#d0d7de]">
        <h1 className="text-xl font-semibold text-[#1f2328]">Dashboard</h1>
        <p className="text-sm text-[#656d76] mt-0.5">Hoş geldiniz, Demo User</p>
      </div>

      <div className="bg-white border border-[#d0d7de] rounded-xl p-5 shadow-sm">
        <p className="text-sm font-semibold text-[#1f2328] mb-1">Yeni Pipeline Oluştur</p>
        <p className="text-xs text-[#656d76] mb-3">Ne otomatize etmek istiyorsunuz?</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePromptRun()}
              placeholder="Örn: Borsadan $100 kar ettiğimde kahve sipariş et..."
              className="w-full pl-10 pr-4 py-2 bg-[#f6f8fa] border border-[#d0d7de] rounded-lg text-[#1f2328] placeholder:text-[#9198a1] focus:outline-none focus:border-violet-400 focus:bg-white text-sm transition-colors"
            />
          </div>
          <button
            onClick={handlePromptRun}
            disabled={!prompt.trim()}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            Çalıştır
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Activity, label: "Aktif Pipeline", value: activePipelines,               sub: `${pipelines.length} toplam`,   color: "text-[#1a7f37]", bg: "bg-[#dafbe1]" },
          { icon: Store,    label: "Bağlı Ajan",     value: connectedAgents,               sub: `${agents.length} mevcut`,      color: "text-violet-600", bg: "bg-violet-50" },
          { icon: Wallet,   label: "Toplam Bakiye",  value: `$${totalBalance.toFixed(2)}`, sub: `${wallets.reduce((s, w) => s + w.agtBalance, 0).toLocaleString()} AGT`, color: "text-[#0969da]", bg: "bg-[#ddf4ff]" },
          { icon: Zap,      label: "İşlem",          value: transactions.length,           sub: "toplam transfer",              color: "text-[#bc4c00]", bg: "bg-[#fff8f0]" },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="bg-white border border-[#d0d7de] rounded-xl p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-[#1f2328]">{value}</p>
            <p className="text-xs text-[#656d76] mt-0.5">{label}</p>
            <p className="text-[10px] text-[#9198a1] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-[#d0d7de] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#d0d7de]">
            <h2 className="text-sm font-semibold text-[#1f2328]">Aktif Pipeline&apos;lar</h2>
            <Link href="/pipeline" className="text-xs text-[#0969da] hover:underline flex items-center gap-1">
              Tümü <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 space-y-1.5">
            {pipelines.filter((p) => p.status === "active").map((p) => (
              <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#f6f8fa] border border-[#d0d7de]">
                <span className="w-2 h-2 rounded-full bg-[#1a7f37] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1f2328] truncate font-medium">{p.prompt}</p>
                  <p className="text-xs text-[#656d76] mt-0.5">
                    {p.agents.length} ajan ·{" "}
                    {p.lastRunAt ? new Date(p.lastRunAt).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </p>
                </div>
              </div>
            ))}
            {pipelines.filter((p) => p.status === "active").length === 0 && (
              <p className="text-sm text-[#9198a1] text-center py-5">Henüz aktif pipeline yok</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#d0d7de] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#d0d7de]">
            <h2 className="text-sm font-semibold text-[#1f2328]">Son İşlemler</h2>
            <Link href="/wallet" className="text-xs text-[#0969da] hover:underline flex items-center gap-1">
              Tümü <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 space-y-1.5">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#f6f8fa] border border-[#d0d7de]">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#1f2328] font-medium">
                    {getAgentName(tx.fromAgentId)} → {getAgentName(tx.toAgentId)}
                  </p>
                  <p className="text-[10px] text-[#9198a1] font-mono mt-0.5">{tx.txHash.slice(0, 16)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1f2328]">${tx.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-[#9198a1]">#{tx.blockNumber.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#d0d7de] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#d0d7de]">
          <h2 className="text-sm font-semibold text-[#1f2328]">Bağlı Ajanlar</h2>
          <Link href="/marketplace" className="text-xs text-[#0969da] hover:underline flex items-center gap-1">
            Marketplace <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {agents.filter((a) => a.isConnected).map((a) => (
            <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f6f8fa] border border-[#d0d7de]">
              <span className="text-base">{a.icon}</span>
              <span className="text-xs text-[#1f2328] font-medium">{a.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a7f37]" />
            </div>
          ))}
          {agents.filter((a) => a.isConnected).length === 0 && (
            <p className="text-sm text-[#9198a1]">Henüz bağlı ajan yok.</p>
          )}
        </div>
      </div>
    </div>
  );
}
