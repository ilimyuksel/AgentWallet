"use client";

import { useState } from "react";
import { WalletCard } from "@/components/wallet/WalletCard";
import { useAppStore } from "@/lib/store";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Coins, TrendingUp, Activity } from "lucide-react";

const typeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  user_to_agent:      { label: "Kullanıcı → Ajan",  icon: <ArrowDownRight className="w-3 h-3" />,  color: "text-[#1a7f37]" },
  agent_to_agent:     { label: "Ajan → Ajan",        icon: <ArrowLeftRight className="w-3 h-3" />,  color: "text-[#0969da]" },
  agent_to_external:  { label: "Ajan → Dış Servis",  icon: <ArrowUpRight className="w-3 h-3" />,    color: "text-[#bc4c00]" },
};

export default function WalletPage() {
  const { agents, wallets, transactions, fundWallet } = useAppStore();
  const [fundingAgent, setFundingAgent] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState("10");

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const totalAgt     = wallets.reduce((s, w) => s + w.agtBalance, 0);
  const totalSpent   = transactions
    .filter((t) => t.type === "agent_to_agent" || t.type === "agent_to_external")
    .reduce((s, t) => s + t.amount, 0);

  const agentsWithWallets = agents
    .map((a) => ({ agent: a, wallet: wallets.find((w) => w.agentId === a.id)! }))
    .filter((x) => x.wallet);

  const getAgentName = (id: string) => {
    if (id === "user") return "👤 Kullanıcı";
    const a = agents.find((ag) => ag.id === id);
    return a ? `${a.icon} ${a.name}` : id;
  };

  const handleFund = () => {
    if (!fundingAgent) return;
    fundWallet(fundingAgent, parseFloat(fundAmount) || 0);
    setFundingAgent(null);
    setFundAmount("10");
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="pb-4 border-b border-[#d0d7de]">
        <h1 className="text-xl font-semibold text-[#1f2328]">Agent Wallet</h1>
        <p className="text-sm text-[#656d76] mt-0.5">Tüm ajan bakiyeleri ve transfer geçmişi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Coins,      label: "Toplam Bakiye", primary: `$${totalBalance.toFixed(2)}`, sub: `${totalAgt.toLocaleString()} AGT`, color: "text-violet-600", bg: "bg-violet-50" },
          { icon: TrendingUp, label: "Toplam Harcama", primary: `$${totalSpent.toFixed(2)}`,  sub: `${transactions.length} işlem`,   color: "text-[#0969da]", bg: "bg-[#ddf4ff]" },
          { icon: Activity,   label: "Aktif Ajan",     primary: `${agents.filter((a) => a.isConnected).length}`, sub: `${agents.length} ajandan`, color: "text-[#1a7f37]", bg: "bg-[#dafbe1]" },
        ].map(({ icon: Icon, label, primary, sub, color, bg }) => (
          <div key={label} className="bg-white border border-[#d0d7de] rounded-xl p-5 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-[#1f2328]">{primary}</p>
            <p className="text-xs text-[#656d76] mt-0.5">{label}</p>
            <p className="text-[10px] text-[#9198a1] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[#1f2328] mb-3">Ajan Bakiyeleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agentsWithWallets.map(({ agent, wallet }) => (
            <div key={agent.id} className="space-y-2">
              <WalletCard agent={agent} wallet={wallet} />
              <button
                onClick={() => setFundingAgent(agent.id)}
                className="w-full text-xs py-1.5 rounded-lg bg-white border border-[#d0d7de] text-[#656d76] hover:border-violet-400 hover:text-violet-600 transition-colors font-medium"
              >
                + Fon Ekle
              </button>
            </div>
          ))}
        </div>
      </div>

      {fundingAgent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border border-[#d0d7de] rounded-2xl p-6 w-80 space-y-4 shadow-xl">
            <h3 className="text-[#1f2328] font-semibold text-sm">
              {getAgentName(fundingAgent)}&apos;e Fon Ekle
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {["5", "10", "25", "50", "100", "200"].map((v) => (
                <button
                  key={v}
                  onClick={() => setFundAmount(v)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
                    fundAmount === v
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-[#f6f8fa] text-[#656d76] border-[#d0d7de] hover:border-violet-400"
                  }`}
                >
                  ${v}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-lg px-3 py-2 text-[#1f2328] text-sm focus:outline-none focus:border-violet-400"
              placeholder="Özel miktar"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setFundingAgent(null)}
                className="flex-1 py-2 rounded-lg bg-[#f6f8fa] text-[#656d76] text-sm border border-[#d0d7de] hover:bg-[#eaeef2]"
              >
                İptal
              </button>
              <button
                onClick={handleFund}
                className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
              >
                Fonla
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-[#1f2328] mb-3">Transfer Geçmişi</h2>
        <div className="bg-white border border-[#d0d7de] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#d0d7de] bg-[#f6f8fa]">
                <th className="text-left text-xs text-[#656d76] font-medium p-4">İşlem</th>
                <th className="text-left text-xs text-[#656d76] font-medium p-4">Gönderen</th>
                <th className="text-left text-xs text-[#656d76] font-medium p-4">Alıcı</th>
                <th className="text-right text-xs text-[#656d76] font-medium p-4">Tutar</th>
                <th className="text-right text-xs text-[#656d76] font-medium p-4">Blok</th>
                <th className="text-left text-xs text-[#656d76] font-medium p-4 hidden lg:table-cell">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => {
                const typeInfo = typeLabels[tx.type];
                return (
                  <tr key={tx.id} className={`border-b border-[#d0d7de]/50 hover:bg-[#f6f8fa] transition-colors ${i % 2 === 0 ? "" : "bg-[#f6f8fa]/30"}`}>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 ${typeInfo.color}`}>
                        {typeInfo.icon}
                        <span className="text-xs">{typeInfo.label}</span>
                      </span>
                    </td>
                    <td className="p-4 text-xs text-[#1f2328]">{getAgentName(tx.fromAgentId)}</td>
                    <td className="p-4 text-xs text-[#1f2328]">{getAgentName(tx.toAgentId)}</td>
                    <td className="p-4 text-right">
                      <span className="text-[#1f2328] font-semibold text-xs">${tx.amount.toFixed(2)}</span>
                      <span className="text-[#9198a1] text-[10px] ml-1">{tx.agtAmount} AGT</span>
                    </td>
                    <td className="p-4 text-right text-xs text-[#656d76]">#{tx.blockNumber.toLocaleString()}</td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-[10px] font-mono text-[#9198a1]">{tx.txHash.slice(0, 18)}...</span>
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
