"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Transaction, TransactionType, WalletOwnerType } from "@/types";
import {
  Activity, Shield, User, Lock,
  ChevronDown, ChevronRight, Hash, Plus,
} from "lucide-react";

const TX_TYPE_STYLE: Record<TransactionType, { label: string; color: string }> = {
  GENESIS:           { label: "Genesis",          color: "#334155" },
  ESCROW_LOCK:       { label: "Escrow Lock",       color: "#3B82F6" },
  MANAGER_FUNDING:   { label: "Manager Funding",   color: "#8B5CF6" },
  MILESTONE_RELEASE: { label: "Milestone",         color: "#10B981" },
  JUDGE_FEE:         { label: "Judge Fee",         color: "#f59e0b" },
  PM_PROFIT:         { label: "PM Profit",         color: "#8B5CF6" },
  AGENT_PAYMENT:     { label: "Agent Payment",     color: "#10B981" },
  REFUND:            { label: "Refund",            color: "#64748b" },
};

const OWNER_ICON: Record<WalletOwnerType, React.ReactNode> = {
  USER:   <User className="w-4 h-4" />,
  ESCROW: <Lock className="w-4 h-4" />,
  AGENT:  <Activity className="w-4 h-4" />,
  SYSTEM: <Shield className="w-4 h-4" />,
};

const OWNER_COLOR: Record<WalletOwnerType, string> = {
  USER:   "#3B82F6",
  ESCROW: "#f59e0b",
  AGENT:  "#8B5CF6",
  SYSTEM: "#64748b",
};

function truncHash(h: string, n = 8) {
  return `${h.slice(0, n)}…${h.slice(-4)}`;
}

function TxRow({ tx, walletNames }: { tx: Transaction; walletNames: Record<string, string> }) {
  const [expanded, setExpanded] = useState(false);
  const style = TX_TYPE_STYLE[tx.transactionType] ?? { label: tx.transactionType, color: "#64748b" };
  const fromName = walletNames[tx.fromWalletId] ?? tx.fromWalletId.slice(0, 16) + "…";
  const toName   = walletNames[tx.toWalletId]   ?? tx.toWalletId.slice(0, 16)   + "…";

  return (
    <>
      <tr
        className="border-b border-[#1a2440] hover:bg-[#1a2440]/40 cursor-pointer transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <td className="p-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold" style={{ color: "#64748b", fontFamily: "var(--font-jetbrains)" }}>#{tx.blockNumber}</span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${style.color}15`, color: style.color }}>
              {style.label}
              {tx.milestone && <span className="ml-1 opacity-70">·{tx.milestone}</span>}
            </span>
          </div>
        </td>
        <td className="p-3 text-[10px] text-[#94a3b8]">
          <span className="text-[#64748b]">{fromName}</span>
          <ArrowRight className="w-2.5 h-2.5 inline mx-1 text-[#334155]" />
          <span>{toName}</span>
        </td>
        <td className="p-3 text-right">
          <span className="text-xs font-bold" style={{ color: tx.amount > 0 ? "#F8FAFC" : "#334155" }}>
            {tx.amount > 0 ? `$${tx.amount.toFixed(2)}` : "—"}
          </span>
        </td>
        <td className="p-3 text-right hidden lg:table-cell">
          <span className="text-[10px] text-[#64748b]" style={{ fontFamily: "var(--font-jetbrains)" }}>
            {truncHash(tx.blockHash)}
          </span>
        </td>
        <td className="p-3 text-right w-8">
          {expanded ? <ChevronDown className="w-3 h-3 text-[#64748b] ml-auto" /> : <ChevronRight className="w-3 h-3 text-[#64748b] ml-auto" />}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-[#1a2440] bg-[#080e1a]">
          <td colSpan={5} className="px-4 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]" style={{ fontFamily: "var(--font-jetbrains)" }}>
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <span className="text-[#475569] w-28 flex-shrink-0">block_hash</span>
                  <span className="text-[#64748b] break-all">{tx.blockHash}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#475569] w-28 flex-shrink-0">prev_hash</span>
                  <span className="text-[#475569] break-all">{tx.previousBlockHash.slice(0, 32)}…</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <span className="text-[#475569] w-28 flex-shrink-0">from_wallet</span>
                  <span className="text-[#94a3b8]">{tx.fromWalletId}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#475569] w-28 flex-shrink-0">to_wallet</span>
                  <span className="text-[#94a3b8]">{tx.toWalletId}</span>
                </div>
                {tx.description && (
                  <div className="flex gap-2">
                    <span className="text-[#475569] w-28 flex-shrink-0">description</span>
                    <span className="text-[#64748b]">{tx.description}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-[#475569] w-28 flex-shrink-0">created_at</span>
                  <span className="text-[#64748b]">{new Date(tx.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ArrowRight({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function WalletPage() {
  const { agents, wallets, transactions, fundWallet } = useAppStore();
  const [fundingWalletId, setFundingWalletId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState("50");
  const [txFilter, setTxFilter] = useState<TransactionType | "ALL">("ALL");

  const userWallets   = wallets.filter(w => w.ownerType === "USER");
  const escrowWallets = wallets.filter(w => w.ownerType === "ESCROW");
  const agentWallets  = wallets.filter(w => w.ownerType === "AGENT");
  const systemWallets = wallets.filter(w => w.ownerType === "SYSTEM");

  const totalBalance = userWallets.reduce((s, w) => s + w.balance, 0);
  const totalEscrow  = escrowWallets.reduce((s, w) => s + w.balance, 0);
  const totalAgents  = agentWallets.reduce((s, w) => s + w.balance, 0);

  const walletNames: Record<string, string> = {};
  wallets.forEach(w => {
    walletNames[w.id] = w.id
      .replace("wallet_", "")
      .replace(/_001$/, "_001")
      .replace(/_002$/, "_002");
  });

  const filteredTx = txFilter === "ALL"
    ? transactions
    : transactions.filter(t => t.transactionType === txFilter);

  const getAgentForWallet = (walletId: string) =>
    agents.find(a => a.walletId === walletId);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Wallet</h1>
        <p className="text-sm text-[#94a3b8] mt-0.5">Multi-owner wallets · Hash-chained ledger</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: User,     label: "User Balance",  value: `$${totalBalance.toFixed(2)}`, sub: `${userWallets.length} user wallets`,   color: "#3B82F6" },
          { icon: Lock,     label: "In Escrow",     value: `$${totalEscrow.toFixed(2)}`,  sub: `${escrowWallets.length} escrow wallets`, color: "#f59e0b" },
          { icon: Activity, label: "Agent Earnings",value: `$${totalAgents.toFixed(2)}`,  sub: `${agentWallets.length} agent wallets`,  color: "#8B5CF6" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="rounded-2xl p-6 bg-[#131929] border border-[#1e2d4a]">
            <Icon className="w-5 h-5 mb-3" style={{ color }} />
            <p className="text-3xl font-bold text-[#F8FAFC] leading-none mb-1">{value}</p>
            <p className="text-xs font-medium text-[#F8FAFC]">{label}</p>
            <p className="text-[10px] text-[#94a3b8] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Wallet groups */}
      {[
        { type: "USER"   as WalletOwnerType, wallets: userWallets,   label: "User Wallets" },
        { type: "ESCROW" as WalletOwnerType, wallets: escrowWallets,  label: "Escrow Wallets" },
        { type: "AGENT"  as WalletOwnerType, wallets: agentWallets,   label: "Agent Wallets" },
        { type: "SYSTEM" as WalletOwnerType, wallets: systemWallets,  label: "System Wallets" },
      ].filter(g => g.wallets.length > 0).map(group => (
        <div key={group.type}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: `${OWNER_COLOR[group.type]}20`, color: OWNER_COLOR[group.type] }}>
              {OWNER_ICON[group.type]}
            </div>
            <h2 className="text-sm font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>{group.label}</h2>
            <span className="text-[10px] text-[#64748b] bg-[#1a2440] px-2 py-0.5 rounded-full">{group.wallets.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {group.wallets.map(wallet => {
              const agentEntry = group.type === "AGENT" ? getAgentForWallet(wallet.id) : null;
              const isLow = wallet.balance > 0 && wallet.balance < 5 && group.type === "AGENT";
              return (
                <div key={wallet.id} className="bg-[#131929] rounded-2xl border border-[#1e2d4a] p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#F8FAFC] truncate" style={{ fontFamily: "var(--font-jetbrains)" }}>
                        {wallet.id}
                      </p>
                      {agentEntry && (
                        <p className="text-[10px] text-[#64748b] mt-0.5">{agentEntry.role} · Rep {agentEntry.reputation.toFixed(2)}</p>
                      )}
                      {wallet.ownerId && !agentEntry && (
                        <p className="text-[10px] text-[#64748b] mt-0.5">{wallet.ownerId}</p>
                      )}
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: wallet.balance > 0 ? OWNER_COLOR[wallet.ownerType] : "#334155" }} />
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-[#F8FAFC]">${wallet.balance.toFixed(2)}</span>
                    <span className="text-[10px] text-[#64748b]">{wallet.currency}</span>
                  </div>

                  {isLow && <p className="text-[10px] text-[#f59e0b]">Low balance</p>}

                  {group.type === "AGENT" && (
                    <button
                      onClick={() => setFundingWalletId(wallet.id)}
                      className="w-full py-1.5 rounded-xl text-[10px] font-bold transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1"
                      style={{ background: "#1a2440", color: "#94a3b8", border: "1px solid #1e2d4a" }}
                    >
                      <Plus className="w-3 h-3" /> Fund
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Fund modal */}
      {fundingWalletId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#131929] rounded-3xl p-7 w-80 space-y-5 shadow-2xl border border-[#1e2d4a]">
            <h3 className="font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Fund Wallet</h3>
            <p className="text-[10px] text-[#64748b]" style={{ fontFamily: "var(--font-jetbrains)" }}>{fundingWalletId}</p>
            <div className="grid grid-cols-3 gap-2">
              {["10", "25", "50", "100", "200", "500"].map(v => (
                <button
                  key={v}
                  onClick={() => setFundAmount(v)}
                  className="py-2 rounded-xl text-sm font-bold transition-all"
                  style={fundAmount === v ? { background: "#3B82F6", color: "#fff" } : { background: "#1a2440", color: "#94a3b8" }}
                >
                  ${v}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={fundAmount}
              onChange={e => setFundAmount(e.target.value)}
              className="w-full bg-[#0f1525] border border-[#1e2d4a] rounded-xl px-3 py-2.5 text-[#F8FAFC] text-sm focus:outline-none focus:border-[#3B82F6]"
              placeholder="Custom amount"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setFundingWalletId(null)}
                className="flex-1 py-2.5 rounded-xl text-[#94a3b8] text-sm font-semibold"
                style={{ background: "#1a2440" }}
              >
                Cancel
              </button>
              <button
                onClick={() => { fundWallet(fundingWalletId, parseFloat(fundAmount) || 0); setFundingWalletId(null); setFundAmount("50"); }}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:-translate-y-0.5"
                style={{ background: "#10B981" }}
              >
                Fund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hash-chained Ledger */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#3B82F6]" />
            <h2 className="text-sm font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Hash-Chained Ledger</h2>
            <span className="text-[10px] text-[#64748b] bg-[#1a2440] px-2 py-0.5 rounded-full">{transactions.length} blocks</span>
          </div>
          {/* TX type filters */}
          <div className="flex gap-1.5 flex-wrap justify-end">
            {(["ALL", "ESCROW_LOCK", "MILESTONE_RELEASE", "JUDGE_FEE", "REFUND"] as const).map(f => (
              <button
                key={f}
                onClick={() => setTxFilter(f)}
                className="text-[9px] font-bold px-2.5 py-1 rounded-full transition-all"
                style={txFilter === f ? { background: "#3B82F6", color: "#fff" } : { background: "#1a2440", color: "#64748b" }}
              >
                {f === "ALL" ? "All" : TX_TYPE_STYLE[f]?.label ?? f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#131929] rounded-2xl border border-[#1e2d4a] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2d4a] bg-[#0f1525]">
                {["Block · Type", "From → To", "Amount", "Hash", ""].map((h, i) => (
                  <th
                    key={h + i}
                    className={`text-[9px] font-semibold text-[#64748b] uppercase tracking-wider p-3 ${i >= 2 ? "text-right" : "text-left"} ${h === "Hash" ? "hidden lg:table-cell" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTx.map(tx => (
                <TxRow key={tx.id} tx={tx} walletNames={walletNames} />
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-[#475569] mt-3 flex items-center gap-1.5">
          <Hash className="w-3 h-3" />
          Each block's <span className="text-[#64748b]">block_hash</span> is SHA-256 of the transaction data + <span className="text-[#64748b]">previous_block_hash</span>. Click any row to inspect the chain.
        </p>
      </div>
    </div>
  );
}
