"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Job, Task, Agent, WSEvent, BudgetTier } from "@/types";
import {
  Send, Zap, CheckCircle, Clock, AlertCircle, Loader2,
  ChevronRight, DollarSign, Activity, Hash, ArrowRight,
} from "lucide-react";

const JOB_STATES: { key: Job["state"]; label: string }[] = [
  { key: "CREATED",         label: "Created" },
  { key: "MANAGER_BIDDING", label: "Manager Bidding" },
  { key: "PLANNING",        label: "Planning" },
  { key: "EXECUTING",       label: "Executing" },
  { key: "COMPLETED",       label: "Completed" },
];

const JOB_STATE_ORDER = ["CREATED", "MANAGER_BIDDING", "PLANNING", "EXECUTING", "COMPLETED"];

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

const TASK_STATE_LABEL: Record<Task["state"], string> = {
  PENDING:   "Pending",
  READY:     "Ready",
  BIDDING:   "Bidding",
  ASSIGNED:  "Assigned",
  RUNNING:   "Running",
  DONE:      "Done",
  VERIFYING: "Verifying",
  VERIFIED:  "Verified",
  PAID:      "Paid",
  REVISION:  "Revision",
  REJECTED:  "Rejected",
  FAILED:    "Failed",
};

function budgetTier(b: number): { tier: BudgetTier; color: string; desc: string } {
  if (b < 50)  return { tier: "REJECTED", color: "#ef4444", desc: "Budget too low — min $50" };
  if (b < 150) return { tier: "MINIMAL",  color: "#f59e0b", desc: "2 tasks: Copy + Web Dev" };
  if (b < 500) return { tier: "STANDARD", color: "#3B82F6", desc: "4 tasks: Research + Copy + Design + Web Dev" };
  return             { tier: "PREMIUM",   color: "#8B5CF6", desc: "Full pipeline + extra QA round" };
}

const EXAMPLE_PROMPTS = [
  "Create a landing page for a developer AI tool",
  "Build a marketing site for a SaaS startup with dark theme",
  "Design and develop a product showcase page for a mobile app",
];

function EventRow({ event }: { event: WSEvent }) {
  const colors: Record<string, string> = {
    "job.":        "#3B82F6",
    "task.":       "#8B5CF6",
    "bidding.":    "#f59e0b",
    "judge.":      "#10B981",
    "payment.":    "#10B981",
    "ledger.":     "#64748b",
    "reputation.": "#f97316",
    "system.":     "#64748b",
  };
  const color = Object.entries(colors).find(([k]) => event.eventType.startsWith(k))?.[1] ?? "#64748b";

  return (
    <div className="flex items-start gap-3 py-2 border-b border-[#1a2440] last:border-0">
      <span className="text-[9px] text-[#475569] mt-0.5 flex-shrink-0 w-16" style={{ fontFamily: "var(--font-jetbrains)" }}>
        {new Date(event.timestamp).toLocaleTimeString()}
      </span>
      <span className="text-[10px] font-semibold flex-shrink-0" style={{ color, fontFamily: "var(--font-jetbrains)" }}>
        {event.eventType}
      </span>
      <span className="text-[10px] text-[#64748b] truncate">
        {event.payload.amount != null && <span className="text-[#10B981] font-semibold">${Number(event.payload.amount as number).toFixed(2)} </span>}
        {event.payload.agent != null && <span className="text-[#94a3b8]">{event.payload.agent as string} </span>}
        {event.payload.state != null && <span className="text-[#F8FAFC]">{event.payload.state as string} </span>}
        {event.payload.score != null && <span className="text-[#f59e0b]">score={Number(event.payload.score as number).toFixed(2)}</span>}
      </span>
    </div>
  );
}

function TaskCard({ task, agents }: { task: Task; agents: Agent[] }) {
  const color = TASK_STATE_COLOR[task.state];
  const agent = agents.find(a => a.id === task.assignedAgentId);
  const isActive = ["BIDDING", "ASSIGNED", "RUNNING", "VERIFYING"].includes(task.state);
  const isDone = task.state === "PAID";

  return (
    <div
      className="bg-[#131929] rounded-2xl border p-4 space-y-3 transition-all"
      style={{ borderColor: isDone ? "#10B98130" : isActive ? `${color}40` : "#1e2d4a" }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold text-[#F8FAFC] leading-tight">{task.title}</p>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 animate-pulse" style={{ background: color }} />}
          {TASK_STATE_LABEL[task.state]}
        </span>
      </div>

      <div className="flex items-center justify-between text-[10px]">
        <span className="text-[#64748b]">Budget: <span className="text-[#F8FAFC] font-semibold">${task.budget.toFixed(2)}</span></span>
        {task.finalCost != null && <span className="text-[#64748b]">Cost: <span className="text-[#10B981] font-semibold">${task.finalCost.toFixed(2)}</span></span>}
      </div>

      {agent && (
        <div className="text-[10px] text-[#64748b] flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 text-[#3B82F6]" />
          <span className="text-[#94a3b8] font-semibold" style={{ fontFamily: "var(--font-jetbrains)" }}>{agent.displayName}</span>
        </div>
      )}

      {task.judgeScore != null && (
        <div className="flex items-center gap-2 pt-1 border-t border-[#1e2d4a]">
          <span className="text-[9px] text-[#64748b]">Judge:</span>
          <span className="text-[10px] font-bold" style={{ color: task.judgeScore >= 0.70 ? "#10B981" : "#ef4444" }}>
            {task.judgeScore.toFixed(2)}
          </span>
          <span className="text-[9px]" style={{ color: task.judgeVerdict === "APPROVED" ? "#10B981" : "#f59e0b" }}>
            {task.judgeVerdict}
          </span>
          {(task.revisionCount ?? 0) > 0 && (
            <span className="text-[9px] text-[#f97316] ml-auto">{task.revisionCount}x revision</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function PipelinePage() {
  const { agents, jobs, tasks, events, activeJobId, isSubmitting, submitJob, setActiveJobId, checkBackend, backendOnline } = useAppStore();
  const [prompt, setPrompt] = useState("");
  const [budget, setBudget] = useState("200");
  const eventsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { checkBackend(); }, [checkBackend]);

  useEffect(() => {
    if (eventsRef.current) eventsRef.current.scrollTop = 0;
  }, [events.length]);

  const activeJob = jobs.find(j => j.id === activeJobId) ?? jobs[0];
  const jobTasks = tasks.filter(t => t.jobId === activeJob?.id);
  const tierInfo = budgetTier(parseFloat(budget) || 0);
  const jobStateIndex = activeJob ? JOB_STATE_ORDER.indexOf(activeJob.state) : -1;

  const handleSubmit = async () => {
    const b = parseFloat(budget);
    if (!prompt.trim() || !b) return;
    await submitJob(prompt, b);
    setPrompt("");
  };

  const recentJobs = jobs.slice(0, 8);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>New Job</h1>
          <p className="text-sm text-[#94a3b8] mt-0.5">Submit a task to the autonomous agent marketplace</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: backendOnline ? "#10B981" : "#334155" }} />
          <span className="text-xs text-[#64748b]">{backendOnline ? "Backend Online" : "Demo Mode"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: submission + job progress */}
        <div className="lg:col-span-2 space-y-5">
          {/* Submission form */}
          <div className="bg-[#131929] rounded-2xl border border-[#1e2d4a] p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>What do you need done?</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a landing page for a developer AI tool"
              rows={3}
              className="w-full bg-[#0f1525] border border-[#1e2d4a] rounded-xl px-4 py-3 text-[#F8FAFC] text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#3B82F6] resize-none transition-colors"
            />

            <div className="flex items-center gap-3">
              <div className="relative max-w-[160px]">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#0f1525] border border-[#1e2d4a] rounded-xl text-[#F8FAFC] text-sm focus:outline-none focus:border-[#3B82F6] transition-colors"
                  placeholder="200"
                />
              </div>
              <div>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: `${tierInfo.color}15`, color: tierInfo.color, border: `1px solid ${tierInfo.color}30` }}
                >
                  <Activity className="w-3 h-3" />
                  {tierInfo.tier}
                </span>
                <p className="text-[10px] text-[#64748b] mt-1">{tierInfo.desc}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  className="text-[10px] px-3 py-1.5 rounded-full border transition-colors hover:border-[#3B82F6]/40 hover:text-[#F8FAFC]"
                  style={{ background: "#0f1525", color: "#64748b", borderColor: "#1e2d4a" }}
                >
                  {p.length > 45 ? p.slice(0, 45) + "…" : p}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isSubmitting || tierInfo.tier === "REJECTED"}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 hover:-translate-y-0.5 disabled:hover:translate-y-0"
              style={{ background: "#10B981", color: "#fff" }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSubmitting ? "Submitting…" : "Submit Job"}
            </button>
          </div>

          {/* Active job */}
          {activeJob && (
            <div className="bg-[#131929] rounded-2xl border border-[#1e2d4a] p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-[#64748b]" style={{ fontFamily: "var(--font-jetbrains)" }}>{activeJob.id}</span>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: activeJob.state === "COMPLETED" ? "#10B98120" : activeJob.state === "FAILED" || activeJob.state === "REJECTED" ? "#ef444420" : "#3B82F620",
                        color: activeJob.state === "COMPLETED" ? "#10B981" : activeJob.state === "FAILED" || activeJob.state === "REJECTED" ? "#ef4444" : "#3B82F6",
                      }}
                    >
                      {activeJob.state}
                    </span>
                    {activeJob.budgetTier && (
                      <span className="text-[9px] text-[#64748b] bg-[#1a2440] px-2 py-0.5 rounded-full">{activeJob.budgetTier}</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#F8FAFC] mt-1 leading-tight">{activeJob.userPrompt}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-[#F8FAFC]">${activeJob.budget.toFixed(0)}</p>
                  {activeJob.managerBidAmount != null && (
                    <p className="text-[10px] text-[#64748b]">bid ${activeJob.managerBidAmount.toFixed(0)}</p>
                  )}
                </div>
              </div>

              {/* Pipeline steps */}
              <div className="flex items-center gap-1">
                {JOB_STATES.map((step, i) => {
                  const done   = jobStateIndex > i;
                  const active = jobStateIndex === i;
                  const failed = (activeJob.state === "FAILED" || activeJob.state === "REJECTED") && jobStateIndex === i;
                  return (
                    <div key={step.key} className="flex items-center gap-1 flex-1 min-w-0">
                      <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: failed ? "#ef444420" : done ? "#10B98120" : active ? "#3B82F620" : "#1a2440",
                            border: `1.5px solid ${failed ? "#ef4444" : done ? "#10B981" : active ? "#3B82F6" : "#1e2d4a"}`,
                          }}
                        >
                          {failed   ? <AlertCircle className="w-3 h-3 text-[#ef4444]" /> :
                           done     ? <CheckCircle className="w-3 h-3 text-[#10B981]" /> :
                           active   ? <Loader2 className="w-3 h-3 text-[#3B82F6] animate-spin" /> :
                                      <Clock className="w-3 h-3 text-[#334155]" />}
                        </div>
                        <span className="text-[8px] text-center leading-tight" style={{ color: done ? "#10B981" : active ? "#3B82F6" : "#334155" }}>
                          {step.label}
                        </span>
                      </div>
                      {i < JOB_STATES.length - 1 && (
                        <ArrowRight className="w-3 h-3 flex-shrink-0 mb-3.5" style={{ color: done ? "#10B981" : "#1e2d4a" }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {activeJob.assignedManagerId && (
                <div className="flex items-center gap-2 text-xs text-[#64748b] bg-[#0f1525] rounded-xl px-3 py-2 border border-[#1e2d4a]">
                  <Zap className="w-3 h-3 text-[#3B82F6]" />
                  <span className="font-semibold text-[#94a3b8]" style={{ fontFamily: "var(--font-jetbrains)" }}>{activeJob.assignedManagerId}</span>
                  {activeJob.managerProfitMargin != null && (
                    <span className="ml-auto text-[#64748b]">{Math.round(activeJob.managerProfitMargin * 100)}% margin</span>
                  )}
                </div>
              )}

              {jobTasks.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-[#64748b] mb-3 uppercase tracking-wider">Task DAG · {jobTasks.length} tasks</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {jobTasks.map((t) => <TaskCard key={t.id} task={t} agents={agents} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {recentJobs.length > 1 && (
            <div className="bg-[#131929] rounded-2xl border border-[#1e2d4a] p-5">
              <h3 className="text-xs font-bold text-[#F8FAFC] mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>Recent Jobs</h3>
              <div className="space-y-2">
                {recentJobs.filter(j => j.id !== activeJobId).map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setActiveJobId(job.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border transition-all hover:border-[#3B82F6]/30"
                    style={{ background: "#0f1525", borderColor: "#1e2d4a" }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[9px] text-[#475569] flex-shrink-0" style={{ fontFamily: "var(--font-jetbrains)" }}>{job.id.slice(0, 12)}</span>
                      <span className="text-xs text-[#94a3b8] truncate">{job.userPrompt}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-[9px] font-bold" style={{ color: job.state === "COMPLETED" ? "#10B981" : job.state === "FAILED" ? "#ef4444" : "#3B82F6" }}>{job.state}</span>
                      <ChevronRight className="w-3 h-3 text-[#334155]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: event feed */}
        <div className="space-y-4">
          <div className="bg-[#080e1a] rounded-2xl border border-[#1e2d4a] overflow-hidden flex flex-col" style={{ height: "600px" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d4a] bg-[#0d1220]">
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span className="text-xs font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Event Feed</span>
              </div>
              <span className="text-[10px] text-[#64748b]">{events.length} events</span>
            </div>
            <div ref={eventsRef} className="flex-1 overflow-y-auto px-3 py-2">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Activity className="w-8 h-8 text-[#1e2d4a] mb-2" />
                  <p className="text-xs text-[#475569]">Submit a job to see live events</p>
                </div>
              ) : (
                events.map((ev, i) => <EventRow key={i} event={ev} />)
              )}
            </div>
          </div>

          <div className="bg-[#131929] rounded-2xl border border-[#1e2d4a] p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Budget Tiers</h3>
            {[
              { tier: "REJECTED", range: "< $50",   color: "#ef4444", desc: "No manager available" },
              { tier: "MINIMAL",  range: "$50–149",  color: "#f59e0b", desc: "Copy + Web Dev" },
              { tier: "STANDARD", range: "$150–499", color: "#3B82F6", desc: "Full 4-task pipeline" },
              { tier: "PREMIUM",  range: "$500+",    color: "#8B5CF6", desc: "Standard + extra QA" },
            ].map(({ tier, range, color, desc }) => (
              <div key={tier} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <div>
                  <span className="text-[10px] font-bold" style={{ color }}>{tier}</span>
                  <span className="text-[10px] text-[#64748b] ml-2">{range}</span>
                  <p className="text-[9px] text-[#475569]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
