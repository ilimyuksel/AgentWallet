"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AgentTier, BiddingStyle } from "@/types";
import {
  Search, Star, Zap, Award, Ghost,
  ChevronRight, Users, CheckCircle,
} from "lucide-react";

const TIER_STYLES: Record<AgentTier, { label: string; bg: string; color: string; border: string }> = {
  T1:    { label: "T1 Manager", bg: "#1e2d4a", color: "#3B82F6", border: "#3B82F6" },
  T2:    { label: "T2 Worker",  bg: "#1e1a3a", color: "#8B5CF6", border: "#8B5CF6" },
  JUDGE: { label: "Judge",      bg: "#1a2a1a", color: "#10B981", border: "#10B981" },
};

const BIDDING_LABELS: Record<BiddingStyle, string> = {
  aggressive: "Aggressive",
  analytical: "Analytical",
  premium:    "Premium",
  volume:     "Volume",
  underdog:   "Underdog",
  none:       "Auto",
};

const BIDDING_COLORS: Record<BiddingStyle, string> = {
  aggressive: "#ef4444",
  analytical: "#3B82F6",
  premium:    "#8B5CF6",
  volume:     "#f59e0b",
  underdog:   "#10B981",
  none:       "#64748b",
};

function ReputationBar({ value }: { value: number }) {
  const color = value >= 0.85 ? "#10B981" : value >= 0.70 ? "#f59e0b" : "#ef4444";
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-[#64748b]">Reputation</span>
        <span className="text-xs font-bold" style={{ color }}>{value.toFixed(2)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1a2440] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

const TIER_FILTERS: { value: AgentTier | "all" | "ghost"; label: string }[] = [
  { value: "all",   label: "All" },
  { value: "T1",    label: "T1 Manager" },
  { value: "T2",    label: "T2 Workers" },
  { value: "JUDGE", label: "Judge" },
  { value: "ghost", label: "Ghost" },
];

export default function MarketplacePage() {
  const { agents, wallets } = useAppStore();
  const [search, setSearch]       = useState("");
  const [tierFilter, setTierFilter] = useState<AgentTier | "all" | "ghost">("all");

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.displayName.toLowerCase().includes(q) || a.skillKeywords.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
    const matchTier =
      tierFilter === "all" ? true :
      tierFilter === "ghost" ? a.isGhost :
      a.tier === tierFilter && !a.isGhost;
    return matchSearch && matchTier;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Agent Marketplace</h1>
        <p className="text-sm text-[#94a3b8] mt-0.5">
          {agents.filter(a => !a.isGhost).length} primary agents · {agents.filter(a => a.isGhost).length} ghost competitors · {agents.filter(a => a.isActive).length} active
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
          <input
            placeholder="Agent ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0f1525] border border-[#1e2d4a] rounded-xl text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:border-[#3B82F6] text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TIER_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTierFilter(value)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                background: tierFilter === value ? "#3B82F6" : "#1a2440",
                color:      tierFilter === value ? "#fff"    : "#94a3b8",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-[#131929] border border-[#1e2d4a]">
          <p className="text-base font-medium text-[#94a3b8]">Ajan bulunamadı</p>
          <p className="text-sm mt-1 text-[#64748b]">Arama kriterlerinizi değiştirin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((agent) => {
            const wallet = wallets.find((w) => w.id === agent.walletId);
            const tierStyle = TIER_STYLES[agent.tier];
            const biddingColor = BIDDING_COLORS[agent.biddingStyle];

            return (
              <div
                key={agent.id}
                className="bg-[#131929] rounded-2xl border border-[#1e2d4a] p-5 space-y-4 hover:border-[#3B82F6]/40 transition-all"
                style={agent.isGhost ? { opacity: 0.75 } : {}}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold"
                      style={{ background: tierStyle.bg, border: `1px solid ${tierStyle.border}30` }}
                    >
                      {agent.tier === "JUDGE" ? <Award className="w-5 h-5" style={{ color: tierStyle.color }} />
                        : agent.tier === "T1" ? <Star className="w-5 h-5" style={{ color: tierStyle.color }} />
                        : <Zap className="w-5 h-5" style={{ color: tierStyle.color }} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-bold text-[#F8FAFC] leading-tight truncate" style={{ fontFamily: "var(--font-jetbrains)" }}>{agent.displayName}</p>
                        {agent.isGhost && (
                          <span className="flex items-center gap-0.5 text-[9px] font-semibold text-[#64748b] bg-[#1a2440] px-1.5 py-0.5 rounded-full border border-[#2a3a50]">
                            <Ghost className="w-2.5 h-2.5" /> Ghost
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#64748b] mt-0.5">{agent.role}</p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ color: tierStyle.color, background: tierStyle.bg, borderColor: `${tierStyle.border}40` }}
                    >
                      {tierStyle.label}
                    </span>
                  </div>
                </div>

                {/* Reputation */}
                <ReputationBar value={agent.reputation} />

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#0f1525] rounded-xl p-2 text-center border border-[#1e2d4a]">
                    <p className="text-sm font-bold text-[#F8FAFC]">{Math.round(agent.successRate * 100)}%</p>
                    <p className="text-[9px] text-[#64748b] mt-0.5">Success</p>
                  </div>
                  <div className="bg-[#0f1525] rounded-xl p-2 text-center border border-[#1e2d4a]">
                    <p className="text-sm font-bold text-[#F8FAFC]">{agent.completedJobs}</p>
                    <p className="text-[9px] text-[#64748b] mt-0.5">Jobs</p>
                  </div>
                  <div className="bg-[#0f1525] rounded-xl p-2 text-center border border-[#1e2d4a]">
                    <p className="text-sm font-bold" style={{ color: biddingColor }}>
                      {BIDDING_LABELS[agent.biddingStyle]}
                    </p>
                    <p className="text-[9px] text-[#64748b] mt-0.5">Bid Style</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {agent.skillKeywords.split(", ").slice(0, 4).map((skill) => (
                    <span key={skill} className="text-[9px] px-2 py-0.5 rounded-full bg-[#1a2440] text-[#64748b] border border-[#1e2d4a]">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1e2d4a]">
                  <div>
                    {agent.basePrice !== null ? (
                      <p className="text-xs text-[#94a3b8]">
                        Base: <span className="font-bold text-[#F8FAFC]">${agent.basePrice}</span>
                        <span className="text-[#64748b]"> · min ${agent.minAcceptance}</span>
                      </p>
                    ) : (
                      <p className="text-xs font-semibold" style={{ color: "#10B981" }}>Profit Margin</p>
                    )}
                    {wallet && wallet.balance > 0 && (
                      <p className="text-[10px] text-[#64748b] mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-2.5 h-2.5" />
                          ${wallet.balance.toFixed(2)} balance
                        </span>
                      </p>
                    )}
                  </div>
                  {!agent.isGhost ? (
                    <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#10B981" }}>
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-[#64748b]">
                      <ChevronRight className="w-3 h-3" />
                      Rule-based
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="bg-[#131929] border border-[#1e2d4a] rounded-2xl p-5">
        <h3 className="text-xs font-bold text-[#F8FAFC] mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>Agent Tier System</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(TIER_STYLES).map(([tier, style]) => (
            <div key={tier} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: style.bg }}>
                {tier === "JUDGE" ? <Award className="w-4 h-4" style={{ color: style.color }} />
                  : tier === "T1" ? <Star className="w-4 h-4" style={{ color: style.color }} />
                  : <Zap className="w-4 h-4" style={{ color: style.color }} />}
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: style.color }}>{style.label}</p>
                <p className="text-[10px] text-[#64748b] mt-0.5 leading-relaxed">
                  {tier === "T1" ? "Accepts user jobs, decomposes into tasks, hires sub-agents." :
                   tier === "T2" ? "Specialist workers that bid on and execute individual tasks." :
                   "Auto-invoked evaluator. Approves/rejects outputs, triggers payments."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
