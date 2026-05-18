"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Coins, TrendingUp, Activity, Coffee, MessageCircle, Navigation, Cloud, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  finance:       TrendingUp,
  food:          Coffee,
  communication: MessageCircle,
  transport:     Navigation,
  weather:       Cloud,
  productivity:  Cpu,
};

const typeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  user_to_agent:     { label: "Kullanıcı → Ajan", icon: <ArrowDownRight className="w-3 h-3" />, color: "text-green-500" },
  agent_to_agent:    { label: "Ajan → Ajan",       icon: <ArrowLeftRight className="w-3 h-3" />, color: "text-[#6b7fff]" },
  agent_to_external: { label: "Ajan → Dış Servis", icon: <ArrowUpRight className="w-3 h-3" />,   color: "text-orange-500" },
};

const agentGradients: Record<string, string> = {
  finance:       "linear-gradient(135deg,#f6d365,#fda085)",
  food:          "linear-gradient(135deg,#84fab0,#8fd3f4)",
  communication: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  transport:     "linear-gradient(135deg,#4facfe,#00f2fe)",
  weather:       "linear-gradient(135deg,#43e97b,#38f9d7)",
  productivity:  "linear-gradient(135deg,#f093fb,#f5576c)",
};

export default function WalletPage() {
  const { agents, wallets, transactions, fundWallet } = useAppStore();
  const [fundingAgent, setFundingAgent] = useState<string | null>(null);
  const [fundAmount,   setFundAmount]   = useState("10");

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const totalAgt     = wallets.reduce((s, w) => s + w.agtBalance, 0);
  const totalSpent   = transactions
    .filter((t) => t.type === "agent_to_agent" || t.type === "agent_to_external")
    .reduce((s, t) => s + t.amount, 0);

  const agentsWithWallets = agents
    .map((a) => ({ agent: a, wallet: wallets.find((w) => w.agentId === a.id)! }))
    .filter((x) => x.wallet);

  const getAgentName = (id: string) => {
    if (id === "user") return "Kullanıcı";
    return agents.find((a) => a.id === id)?.name ?? id;
  };

  const handleFund = () => {
    if (!fundingAgent) return;
    fundWallet(fundingAgent, parseFloat(fundAmount) || 0);
    setFundingAgent(null);
    setFundAmount("10");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Agent Wallet</h1>
        <p className="text-sm text-gray-400 mt-0.5">Tüm ajan bakiyeleri ve transfer geçmişi</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Coins,      label: "Toplam Bakiye",  value: `$${totalBalance.toFixed(2)}`, sub: `${totalAgt.toLocaleString()} AGT` },
          { icon: TrendingUp, label: "Toplam Harcama", value: `$${totalSpent.toFixed(2)}`,   sub: `${transactions.length} işlem` },
          { icon: Activity,   label: "Aktif Ajan",     value: agents.filter((a) => a.isConnected).length, sub: `${agents.length} ajandan` },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="rounded-2xl p-6" style={{ background: "#f5f5f5" }}>
            <Icon className="w-5 h-5 text-gray-400 mb-3" />
            <p className="text-3xl font-bold text-black leading-none mb-1">{value}</p>
            <p className="text-xs font-medium text-black">{label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Agent wallets grid */}
      <div>
        <h2 className="text-sm font-bold text-black mb-4">Ajan Bakiyeleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agentsWithWallets.map(({ agent, wallet }) => {
            const pct   = Math.min((wallet.balance / 20) * 100, 100);
            const isLow = wallet.balance > 0 && wallet.balance < 2;
            const grad  = agentGradients[agent.category] ?? "linear-gradient(135deg,#e0e0e0,#ccc)";
            return (
              <div key={agent.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: grad }}>
                      {(() => { const Icon = CATEGORY_ICONS[agent.category] ?? Cpu; return <Icon className="w-4 h-4 text-white opacity-90" />; })()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black leading-tight">{agent.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{agent.walletAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: agent.status === "active"  ? "#00e96e"
                                  : agent.status === "running" ? "#6b7fff"
                                  : agent.status === "error"   ? "#ff4d4d"
                                  :                              "#ddd",
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold text-black">${wallet.balance.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">{wallet.agtBalance.toLocaleString()} AGT</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: isLow ? "#ff4d4d" : "#00e96e" }}
                    />
                  </div>
                  {isLow && <p className="text-[10px] text-orange-500">Düşük bakiye — fon ekleyin</p>}
                  {wallet.balance === 0 && <p className="text-[10px] text-gray-400">Henüz fonlanmamış</p>}
                </div>

                {agent.pricePerCall > 0 && (
                  <p className="text-[10px] text-gray-400 border-t border-gray-100 pt-2">
                    Çağrı başına: <span className="font-semibold text-black">${agent.pricePerCall.toFixed(3)}</span>
                    {wallet.balance > 0 && (
                      <> · Kalan: <span className="font-semibold text-black">
                        {Math.floor(wallet.balance / agent.pricePerCall).toLocaleString()}
                      </span> çağrı</>
                    )}
                  </p>
                )}

                <button
                  onClick={() => setFundingAgent(agent.id)}
                  className="w-full py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
                  style={{ background: "#f0f0f0", color: "#000" }}
                >
                  + Fon Ekle
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fund modal */}
      {fundingAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-7 w-80 space-y-5 shadow-2xl">
            <h3 className="font-bold text-black">
              {getAgentName(fundingAgent)}&apos;e Fon Ekle
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {["5", "10", "25", "50", "100", "200"].map((v) => (
                <button
                  key={v}
                  onClick={() => setFundAmount(v)}
                  className="py-2 rounded-xl text-sm font-bold transition-all"
                  style={
                    fundAmount === v
                      ? { background: "#000", color: "#fff" }
                      : { background: "#f5f5f5", color: "#333" }
                  }
                >
                  ${v}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-black text-sm focus:outline-none focus:border-gray-300"
              placeholder="Özel miktar"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setFundingAgent(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-500 text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleFund}
                className="flex-1 py-2.5 rounded-xl text-black text-sm font-bold transition-all hover:-translate-y-0.5"
                style={{ background: "#00e96e" }}
              >
                Fonla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div>
        <h2 className="text-sm font-bold text-black mb-4">Transfer Geçmişi</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["İşlem", "Gönderen", "Alıcı", "Tutar", "Blok", "Tx Hash"].map((h, i) => (
                  <th
                    key={h}
                    className={`text-[10px] font-semibold text-gray-400 uppercase tracking-wider p-4 ${i >= 2 ? "text-right" : "text-left"} ${h === "Tx Hash" ? "hidden lg:table-cell" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => {
                const typeInfo = typeLabels[tx.type];
                return (
                  <tr
                    key={tx.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === transactions.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 ${typeInfo.color}`}>
                        {typeInfo.icon}
                        <span className="text-[10px] font-semibold">{typeInfo.label}</span>
                      </span>
                    </td>
                    <td className="p-4 text-xs text-black font-medium">{getAgentName(tx.fromAgentId)}</td>
                    <td className="p-4 text-xs text-black font-medium">{getAgentName(tx.toAgentId)}</td>
                    <td className="p-4 text-right">
                      <span className="text-xs font-bold text-black">${tx.amount.toFixed(2)}</span>
                      <span className="text-[10px] text-gray-400 ml-1">{tx.agtAmount} AGT</span>
                    </td>
                    <td className="p-4 text-right text-xs text-gray-400">#{tx.blockNumber.toLocaleString()}</td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-[10px] font-mono text-gray-400">{tx.txHash.slice(0, 18)}...</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
