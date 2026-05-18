"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Job } from "@/types";
import {
  Briefcase, CheckCircle, Clock, AlertCircle, Loader2,
  ChevronRight, DollarSign, PlusCircle,
} from "lucide-react";

const STATE_STYLE: Record<Job["state"], { color: string; icon: React.ReactNode }> = {
  CREATED:         { color: "#64748b", icon: <Clock className="w-3 h-3" /> },
  MANAGER_BIDDING: { color: "#3B82F6", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  PLANNING:        { color: "#8B5CF6", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  EXECUTING:       { color: "#f59e0b", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  COMPLETED:       { color: "#10B981", icon: <CheckCircle className="w-3 h-3" /> },
  REJECTED:        { color: "#ef4444", icon: <AlertCircle className="w-3 h-3" /> },
  FAILED:          { color: "#ef4444", icon: <AlertCircle className="w-3 h-3" /> },
  CANCELLED:       { color: "#64748b", icon: <AlertCircle className="w-3 h-3" /> },
};

export default function JobsPage() {
  const { jobs, tasks } = useAppStore();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Jobs</h1>
          <p className="text-sm text-[#94a3b8] mt-0.5">{jobs.length} total · {jobs.filter(j => j.state === "COMPLETED").length} completed</p>
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

      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-[#131929] rounded-2xl border border-[#1e2d4a]">
          <Briefcase className="w-10 h-10 text-[#1e2d4a] mx-auto mb-3" />
          <p className="text-base font-medium text-[#94a3b8]">No jobs yet</p>
          <Link href="/pipeline" className="text-sm text-[#3B82F6] mt-2 inline-block">Submit your first job →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => {
            const jobTasks = tasks.filter(t => t.jobId === job.id);
            const paidTasks = jobTasks.filter(t => t.state === "PAID").length;
            const style = STATE_STYLE[job.state];
            const totalCost = jobTasks.reduce((s, t) => s + (t.finalCost ?? 0), 0);

            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block bg-[#131929] rounded-2xl border border-[#1e2d4a] p-5 hover:border-[#3B82F6]/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${style.color}15`, color: style.color }}
                    >
                      {style.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#F8FAFC] leading-tight line-clamp-1 group-hover:text-white">{job.userPrompt}</p>
                      <p className="text-[10px] text-[#475569] mt-1" style={{ fontFamily: "var(--font-jetbrains)" }}>{job.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-[#F8FAFC]">${job.budget.toFixed(0)}</p>
                      {totalCost > 0 && <p className="text-[10px] text-[#10B981]">cost ${totalCost.toFixed(0)}</p>}
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold" style={{ color: style.color }}>{job.state}</p>
                      {job.budgetTier && <p className="text-[10px] text-[#64748b]">{job.budgetTier}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#334155] group-hover:text-[#64748b] transition-colors" />
                  </div>
                </div>

                {jobTasks.length > 0 && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex gap-1 flex-1">
                      {jobTasks.map(t => (
                        <div
                          key={t.id}
                          className="flex-1 h-1 rounded-full"
                          title={`${t.title}: ${t.state}`}
                          style={{
                            background: t.state === "PAID" ? "#10B981"
                              : ["RUNNING", "VERIFYING", "BIDDING", "ASSIGNED"].includes(t.state) ? "#3B82F6"
                              : t.state === "FAILED" ? "#ef4444"
                              : "#1e2d4a",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] text-[#64748b] flex-shrink-0">{paidTasks}/{jobTasks.length} paid</span>
                    {job.assignedManagerId && (
                      <span className="text-[9px] text-[#475569] flex-shrink-0 hidden md:block" style={{ fontFamily: "var(--font-jetbrains)" }}>
                        {job.assignedManagerId}
                      </span>
                    )}
                    <div className="hidden sm:flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-[#64748b]" />
                      <span className="text-[9px] text-[#64748b]">{new Date(job.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
