"use client";

import { use } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Task, TransactionType } from "@/types";
import {
  ArrowLeft, CheckCircle, Clock, AlertCircle, Loader2,
  Zap, Hash, Award, ChevronRight,
} from "lucide-react";

const TASK_STATE_COLOR: Record<Task["state"], string> = {
  PENDING:   "#334155",
  READY:     "#64748b",
  BIDDING:   "#f59e0b",
  ASSIGNED:  "#3B82F6",
  RUNNING:   "#8B5CF6",
  DONE:      "#64748b",
  VERIFYING: "#f59e0b",
  VERIFIED:  "#3B82F6",
  PAID:      "#10B981",
  REVISION:  "#f97316",
  REJECTED:  "#ef4444",
  FAILED:    "#ef4444",
};

const TX_COLORS: Record<TransactionType, string> = {
  GENESIS:           "#334155",
  ESCROW_LOCK:       "#3B82F6",
  MANAGER_FUNDING:   "#8B5CF6",
  MILESTONE_RELEASE: "#10B981",
  JUDGE_FEE:         "#f59e0b",
  PM_PROFIT:         "#8B5CF6",
  AGENT_PAYMENT:     "#10B981",
  REFUND:            "#64748b",
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { jobs, tasks, bids, transactions, evaluations, agents } = useAppStore();

  const job  = jobs.find(j => j.id === id);
  const jobTasks = tasks.filter(t => t.jobId === id);
  const jobTx    = transactions.filter(t => t.jobId === id);

  if (!job) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Link href="/jobs" className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#F8FAFC] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
        <div className="text-center py-20 bg-[#131929] rounded-2xl border border-[#1e2d4a]">
          <p className="text-base font-medium text-[#94a3b8]">Job not found</p>
          <p className="text-sm text-[#64748b] mt-1" style={{ fontFamily: "var(--font-jetbrains)" }}>{id}</p>
        </div>
      </div>
    );
  }

  const stateColor = job.state === "COMPLETED" ? "#10B981" : job.state === "FAILED" || job.state === "REJECTED" ? "#ef4444" : "#3B82F6";
  const managerAgent = agents.find(a => a.id === job.assignedManagerId);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Link href="/jobs" className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#F8FAFC] transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      {/* Job header */}
      <div className="bg-[#131929] rounded-2xl border border-[#1e2d4a] p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: `${stateColor}15`, color: stateColor, border: `1px solid ${stateColor}30` }}
              >
                {job.state}
              </span>
              {job.budgetTier && (
                <span className="text-[10px] text-[#64748b] bg-[#1a2440] px-2 py-0.5 rounded-full">{job.budgetTier}</span>
              )}
            </div>
            <p className="text-lg font-bold text-[#F8FAFC] leading-tight">{job.userPrompt}</p>
            <p className="text-[10px] text-[#475569] mt-1" style={{ fontFamily: "var(--font-jetbrains)" }}>{job.id}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-[#F8FAFC]">${job.budget.toFixed(2)}</p>
            {job.managerBidAmount != null && (
              <p className="text-[10px] text-[#64748b]">bid ${job.managerBidAmount.toFixed(2)}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Created",   value: new Date(job.createdAt).toLocaleString() },
            { label: "Completed", value: job.completedAt ? new Date(job.completedAt).toLocaleString() : "—" },
            { label: "Manager",   value: job.assignedManagerId ?? "—" },
            { label: "Margin",    value: job.managerProfitMargin != null ? `${Math.round(job.managerProfitMargin * 100)}%` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#0f1525] rounded-xl p-3 border border-[#1e2d4a]">
              <p className="text-[9px] text-[#64748b] uppercase tracking-wider">{label}</p>
              <p className="text-xs font-semibold text-[#F8FAFC] mt-1 truncate" style={{ fontFamily: label === "Manager" ? "var(--font-jetbrains)" : undefined }}>{value}</p>
            </div>
          ))}
        </div>

        {managerAgent && (
          <div className="flex items-center gap-3 bg-[#0f1525] rounded-xl p-3 border border-[#1e2d4a]">
            <Zap className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-jetbrains)" }}>{managerAgent.displayName}</p>
              <p className="text-[10px] text-[#64748b]">Rep {managerAgent.reputation.toFixed(2)} · {Math.round(managerAgent.successRate * 100)}% success · {managerAgent.completedJobs} jobs</p>
            </div>
          </div>
        )}
      </div>

      {/* Task DAG */}
      {jobTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>Task DAG · {jobTasks.length} tasks</h2>
          <div className="space-y-3">
            {jobTasks.map(task => {
              const color = TASK_STATE_COLOR[task.state];
              const taskBids = bids.filter(b => b.taskId === task.id);
              const taskEvals = evaluations.filter(e => e.taskId === task.id);
              const assignedAgent = agents.find(a => a.id === task.assignedAgentId);
              const isActive = ["BIDDING", "ASSIGNED", "RUNNING", "VERIFYING"].includes(task.state);

              return (
                <div
                  key={task.id}
                  className="bg-[#131929] rounded-2xl border p-5 space-y-4 transition-all"
                  style={{ borderColor: isActive ? `${color}40` : task.state === "PAID" ? "#10B98130" : "#1e2d4a" }}
                >
                  {/* Task header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-[#F8FAFC]">{task.title}</p>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                        >
                          {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 animate-pulse" style={{ background: color }} />}
                          {task.state}
                        </span>
                        {task.revisionCount > 0 && (
                          <span className="text-[9px] text-[#f97316] bg-[#1a2440] px-2 py-0.5 rounded-full">{task.revisionCount}x revision</span>
                        )}
                      </div>
                      <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">{task.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#F8FAFC]">${task.budget.toFixed(2)}</p>
                      {task.finalCost != null && <p className="text-[10px] text-[#10B981]">cost ${task.finalCost.toFixed(2)}</p>}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1">
                    {task.requiredSkills.map(s => (
                      <span key={s} className="text-[9px] px-2 py-0.5 rounded-full bg-[#1a2440] text-[#64748b] border border-[#1e2d4a]">{s}</span>
                    ))}
                  </div>

                  {/* Dependencies */}
                  {task.dependencies.length > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-[#64748b]">
                      <ChevronRight className="w-3 h-3" />
                      <span>Depends on: </span>
                      {task.dependencies.map(dep => {
                        const depTask = jobTasks.find(t => t.id === dep);
                        return (
                          <span key={dep} className="text-[#94a3b8]">{depTask?.title ?? dep.slice(0, 10)}</span>
                        );
                      })}
                    </div>
                  )}

                  {/* Assigned agent */}
                  {assignedAgent && (
                    <div className="flex items-center gap-2 bg-[#0f1525] rounded-xl px-3 py-2 border border-[#1e2d4a]">
                      <Zap className="w-3 h-3 text-[#3B82F6]" />
                      <span className="text-xs font-bold text-[#94a3b8]" style={{ fontFamily: "var(--font-jetbrains)" }}>{assignedAgent.displayName}</span>
                      <span className="text-[10px] text-[#64748b] ml-auto">Rep {assignedAgent.reputation.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Bids */}
                  {taskBids.length > 0 && (
                    <div>
                      <p className="text-[9px] font-semibold text-[#64748b] uppercase tracking-wider mb-2">Bidding Round · {taskBids.length} bids</p>
                      <div className="space-y-1.5">
                        {taskBids.map(bid => {
                          const bidAgent = agents.find(a => a.id === bid.agentId);
                          return (
                            <div key={bid.id} className="flex items-center gap-3 bg-[#0f1525] rounded-xl px-3 py-2 border border-[#1e2d4a]">
                              {bid.isWinner
                                ? <CheckCircle className="w-3 h-3 text-[#10B981] flex-shrink-0" />
                                : <Clock className="w-3 h-3 text-[#334155] flex-shrink-0" />}
                              <span className="text-[10px] font-semibold text-[#94a3b8] flex-1" style={{ fontFamily: "var(--font-jetbrains)" }}>
                                {bidAgent?.displayName ?? bid.agentId}
                                {bidAgent?.isGhost && <span className="text-[#475569] ml-1">(ghost)</span>}
                              </span>
                              <span className="text-[10px] font-bold" style={{ color: bid.isWinner ? "#10B981" : "#64748b" }}>${bid.bidAmount.toFixed(2)}</span>
                              {bid.selectionScore != null && (
                                <span className="text-[9px] text-[#475569]">score {bid.selectionScore.toFixed(3)}</span>
                              )}
                              {bid.isWinner && <span className="text-[9px] font-bold text-[#10B981]">WINNER</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Judge evaluations */}
                  {taskEvals.length > 0 && (
                    <div>
                      <p className="text-[9px] font-semibold text-[#64748b] uppercase tracking-wider mb-2">
                        <Award className="w-3 h-3 inline mr-1 text-[#10B981]" />
                        Judge Evaluations · {taskEvals.length}
                      </p>
                      {taskEvals.map((ev, i) => (
                        <div key={ev.id} className="bg-[#0f1525] rounded-xl p-3 border border-[#1e2d4a] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold" style={{ color: ev.decision === "APPROVED" ? "#10B981" : ev.decision === "REVISION_REQUESTED" ? "#f59e0b" : "#ef4444" }}>
                              {i > 0 && <span className="text-[#475569] mr-1">Revision {i}:</span>}
                              {ev.decision}
                            </span>
                            <span className="text-sm font-bold" style={{ color: ev.finalScore >= 0.70 ? "#10B981" : "#ef4444" }}>
                              {ev.finalScore.toFixed(2)}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: "Scope", val: ev.scopeCompleteness },
                              { label: "Structure", val: ev.structuralQuality },
                              { label: "Content", val: ev.contentQuality },
                              { label: "Brief", val: ev.briefFidelity },
                            ].map(({ label, val }) => val != null && (
                              <div key={label} className="text-center">
                                <div className="h-1 rounded-full bg-[#1e2d4a] overflow-hidden mb-1">
                                  <div className="h-full rounded-full" style={{ width: `${val * 100}%`, background: val >= 0.70 ? "#10B981" : "#f59e0b" }} />
                                </div>
                                <p className="text-[8px] text-[#475569]">{label}</p>
                                <p className="text-[9px] font-bold text-[#94a3b8]">{val.toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                          {ev.reasoning && <p className="text-[10px] text-[#64748b] italic">&ldquo;{ev.reasoning}&rdquo;</p>}
                          {ev.feedbackForRevision && (
                            <p className="text-[10px] text-[#f59e0b]">Revision feedback: {ev.feedbackForRevision}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Job transactions */}
      {jobTx.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            <Hash className="w-4 h-4 inline mr-2 text-[#3B82F6]" />
            Ledger Entries · {jobTx.length} blocks
          </h2>
          <div className="bg-[#131929] rounded-2xl border border-[#1e2d4a] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e2d4a] bg-[#0f1525]">
                  {["Block", "Type", "From → To", "Amount", "Hash"].map((h, i) => (
                    <th key={h} className={`text-[9px] font-semibold text-[#64748b] uppercase tracking-wider p-3 ${i >= 3 ? "text-right" : "text-left"} ${h === "Hash" ? "hidden lg:table-cell" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobTx.map(tx => {
                  const color = TX_COLORS[tx.transactionType] ?? "#64748b";
                  return (
                    <tr key={tx.id} className="border-b border-[#1a2440] hover:bg-[#1a2440]/30 transition-colors">
                      <td className="p-3 text-[10px] text-[#64748b]" style={{ fontFamily: "var(--font-jetbrains)" }}>#{tx.blockNumber}</td>
                      <td className="p-3">
                        <span className="text-[9px] font-bold" style={{ color }}>
                          {tx.transactionType.replace(/_/g, " ")}
                          {tx.milestone && <span className="ml-1 opacity-70">·{tx.milestone}</span>}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-[#64748b] max-w-[200px] truncate">
                        {tx.fromWalletId.replace("wallet_", "")} → {tx.toWalletId.replace("wallet_", "")}
                      </td>
                      <td className="p-3 text-right">
                        {tx.amount > 0 && <span className="text-xs font-bold text-[#F8FAFC]">${tx.amount.toFixed(2)}</span>}
                      </td>
                      <td className="p-3 text-right hidden lg:table-cell">
                        <span className="text-[9px] text-[#475569]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                          {tx.blockHash.slice(0, 10)}…
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
