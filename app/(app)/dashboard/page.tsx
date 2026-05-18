"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Job, Transaction, TransactionType } from "@/types";
import {
  Briefcase, CheckCircle, Activity, Hash, Zap, ArrowRight,
  Star, Award, PlusCircle, ExternalLink,
} from "lucide-react";

const TX_TYPE_COLOR: Record<TransactionType, string> = {
  GENESIS:           "#334155",
  ESCROW_LOCK:       "#3B82F6",
  MANAGER_FUNDING:   "#8B5CF6",
  MILESTONE_RELEASE: "#10B981",
  JUDGE_FEE:         "#f59e0b",
  PM_PROFIT:         "#8B5CF6",
  AGENT_PAYMENT:     "#10B981",
  REFUND:            "#64748b",
};

function JobStateBar({ state }: { state: Job["state"] }) {
  const steps = ["CREATED", "MANAGER_BIDDING", "PLANNING", "EXECUTING", "COMPLETED"];
  const idx   = steps.indexOf(state);
  const failed = state === "FAILED" || state === "REJECTED" || state === "CANCELLED";
  const pct = failed ? 100 : idx === -1 ? 0 : Math.round((idx / (steps.length - 1)) * 100);
  const color = failed ? "#ef4444" : state === "COMPLETED" ? "#10B981" : "#3B82F6";
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold" style={{ color }}>{state}</span>
        <span className="text-[9px] text-[#64748b]">{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-[#1a2440] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function TxFeedRow({ tx }: { tx: Transaction }) {
  const color = TX_TYPE_COLOR[tx.transactionType] ?? "#64748b";
  const label = tx.transactionType.replace(/_/g, " ");
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[#1a2440] last:border-0">
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold" style={{ color }}>{label}</span>
          {tx.milestone && <span className="text-[9px] text-[#475569]">·{tx.milestone}</span>}
        </div>
        <p className="text-[9px] text-[#475569] truncate" style={{ fontFamily: "var(--font-jetbrains)" }}>
          {tx.fromWalletId.replace("wallet_", "")} → {tx.toWalletId.replace("wallet_", "")}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        {tx.amount > 0 && <p className="text-xs font-bold text-[#F8FAFC]">${tx.amount.toFixed(2)}</p>}
        <p className="text-[9px] text-[#475569]">#{tx.blockNumber}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { agents, jobs, tasks, transactions, checkBackend, backendOnline } = useAppStore();

  useEffect(() => { checkBackend(); }, [checkBackend]);

  const completedJobs = jobs.filter(j => j.state === "COMPLETED").length;
  const activeJobs    = jobs.filter(j => !["COMPLETED", "FAILED", "REJECTED", "CANCELLED"].includes(j.state)).length;
  const totalVolume   = transactions.reduce((s, t) => s + t.amount, 0);
  const ledgerBlocks  = transactions.length;

  const mainAgents = agents.filter(a => !a.isGhost);
  const recentTx   = transactions.slice(0, 12);

  const totalTasksDone = tasks.filter(t => t.state === "PAID").length;
  const totalTasks     = tasks.length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Dashboard</h1>
          <p className="text-sm text-[#94a3b8] mt-0.5">Agent economy overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: backendOnline ? "#10B981" : "#334155" }} />
            <span className="text-xs text-[#64748b]">{backendOnline ? "Live" : "Demo"}</span>
          </div>
          <Link
            href="/pipeline"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
            style={{ background: "#10B981", color: "#fff" }}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Job
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Briefcase,    label: "Total Jobs",    value: jobs.length,               sub: `${completedJobs} completed`,    color: "#3B82F6" },
          { icon: Activity,     label: "Active Jobs",   value: activeJobs,                sub: `${jobs.length - completedJobs} in progress`, color: "#8B5CF6" },
          { icon: CheckCircle,  label: "Tasks Done",    value: `${totalTasksDone}/${totalTasks}`, sub: "paid milestones", color: "#10B981" },
          { icon: Hash,         label: "Ledger Volume", value: `$${totalVolume.toFixed(0)}`, sub: `${ledgerBlocks} blocks`,    color: "#f59e0b" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-[#131929] rounded-2xl border border-[#1e2d4a] p-5">
            <Icon className="w-4 h-4 mb-3" style={{ color }} />
            <p className="text-2xl font-bold text-[#F8FAFC] leading-none mb-1">{value}</p>
            <p className="text-xs font-medium text-[#F8FAFC]">{label}</p>
            <p className="text-[10px] text-[#94a3b8] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs list */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#131929] rounded-2xl border border-[#1e2d4a] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Jobs</h2>
              <Link href="/jobs" className="flex items-center gap-1 text-[10px] text-[#3B82F6] hover:text-[#60a5fa] transition-colors">
                View all <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-[#64748b]">No jobs yet.</p>
                <Link href="/pipeline" className="text-xs text-[#3B82F6] mt-1 inline-block">Submit your first job →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 5).map(job => {
                  const jobTasks = tasks.filter(t => t.jobId === job.id);
                  const paidTasks = jobTasks.filter(t => t.state === "PAID").length;
                  return (
                    <div key={job.id} className="bg-[#0f1525] rounded-xl border border-[#1e2d4a] p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#F8FAFC] leading-tight line-clamp-1">{job.userPrompt}</p>
                          <p className="text-[9px] text-[#475569] mt-0.5" style={{ fontFamily: "var(--font-jetbrains)" }}>{job.id}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#F8FAFC]">${job.budget.toFixed(0)}</p>
                          {job.budgetTier && <p className="text-[9px] text-[#64748b]">{job.budgetTier}</p>}
                        </div>
                      </div>
                      <JobStateBar state={job.state} />
                      {jobTasks.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-[#64748b]">{paidTasks}/{jobTasks.length} tasks paid</span>
                          <div className="flex gap-1 flex-1">
                            {jobTasks.map(t => (
                              <div
                                key={t.id}
                                className="flex-1 h-1 rounded-full"
                                style={{ background: t.state === "PAID" ? "#10B981" : ["RUNNING", "VERIFYING", "BIDDING"].includes(t.state) ? "#3B82F6" : "#1e2d4a" }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Agent performance */}
          <div className="bg-[#131929] rounded-2xl border border-[#1e2d4a] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Agent Performance</h2>
              <Link href="/marketplace" className="flex items-center gap-1 text-[10px] text-[#3B82F6] hover:text-[#60a5fa] transition-colors">
                Marketplace <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {mainAgents.map(agent => {
                const repColor = agent.reputation >= 0.85 ? "#10B981" : agent.reputation >= 0.70 ? "#f59e0b" : "#ef4444";
                const TierIcon = agent.tier === "JUDGE" ? Award : agent.tier === "T1" ? Star : Zap;
                const tierColor = agent.tier === "T1" ? "#3B82F6" : agent.tier === "JUDGE" ? "#10B981" : "#8B5CF6";
                return (
                  <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1525] border border-[#1e2d4a]">
                    <TierIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: tierColor }} />
                    <span className="text-xs font-semibold text-[#94a3b8] flex-1 truncate" style={{ fontFamily: "var(--font-jetbrains)" }}>{agent.displayName}</span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-bold" style={{ color: repColor }}>{agent.reputation.toFixed(2)}</p>
                        <p className="text-[9px] text-[#475569]">rep</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#F8FAFC]">{agent.completedJobs}</p>
                        <p className="text-[9px] text-[#475569]">jobs</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#F8FAFC]">{Math.round(agent.successRate * 100)}%</p>
                        <p className="text-[9px] text-[#475569]">success</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ledger feed */}
        <div>
          <div className="bg-[#080e1a] rounded-2xl border border-[#1e2d4a] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d4a] bg-[#0d1220]">
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span className="text-xs font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Ledger</span>
              </div>
              <Link href="/wallet" className="text-[10px] text-[#3B82F6] hover:text-[#60a5fa] transition-colors">view all</Link>
            </div>
            <div className="px-3 py-2 max-h-[520px] overflow-y-auto">
              {recentTx.map(tx => <TxFeedRow key={tx.id} tx={tx} />)}
            </div>
          </div>

          {/* Economy quick stats */}
          <div className="mt-4 bg-[#131929] rounded-2xl border border-[#1e2d4a] p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Economy</h3>
            {[
              { label: "Milestone payments", value: transactions.filter(t => t.transactionType === "MILESTONE_RELEASE").length, color: "#10B981" },
              { label: "Judge fees paid",    value: transactions.filter(t => t.transactionType === "JUDGE_FEE").length,         color: "#f59e0b" },
              { label: "Escrow locks",       value: transactions.filter(t => t.transactionType === "ESCROW_LOCK").length,       color: "#3B82F6" },
              { label: "Refunds issued",     value: transactions.filter(t => t.transactionType === "REFUND").length,            color: "#64748b" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  <span className="text-[10px] text-[#64748b]">{label}</span>
                </div>
                <span className="text-xs font-bold text-[#F8FAFC]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
