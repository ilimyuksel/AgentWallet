import { Agent, Job, Task, Bid, Transaction, JudgeEvaluation, WSEvent, SystemStats, Wallet } from "@/types";

const API_BASE = "http://localhost:8000/api/v1";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "API error");
  return json.data as T;
}

export const api = {
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch("http://localhost:8000/health", {
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async createJob(prompt: string, budget: number) {
    return apiFetch<{ job_id: string; state: string; websocket_url: string; budget_tier: string }>("/jobs", {
      method: "POST",
      body: JSON.stringify({ user_id: "user_demo", prompt, budget }),
    });
  },

  async getJobs(): Promise<Job[]> {
    return apiFetch<Job[]>("/jobs");
  },

  async getJob(id: string): Promise<Job> {
    return apiFetch<Job>(`/jobs/${id}`);
  },

  async getJobTasks(id: string): Promise<Task[]> {
    return apiFetch<Task[]>(`/jobs/${id}/tasks`);
  },

  async getTaskBids(taskId: string): Promise<Bid[]> {
    return apiFetch<Bid[]>(`/tasks/${taskId}/bids`);
  },

  async getTaskEvaluation(taskId: string): Promise<JudgeEvaluation> {
    return apiFetch<JudgeEvaluation>(`/tasks/${taskId}/evaluation`);
  },

  async getAgents(): Promise<Agent[]> {
    return apiFetch<Agent[]>("/agents");
  },

  async getWallet(id: string): Promise<Wallet> {
    return apiFetch<Wallet>(`/wallets/${id}`);
  },

  async getLedger(): Promise<Transaction[]> {
    return apiFetch<Transaction[]>("/ledger/recent");
  },

  async getStats(): Promise<SystemStats> {
    return apiFetch<SystemStats>("/stats");
  },

  connectJobWS(jobId: string, onEvent: (event: WSEvent) => void): WebSocket {
    const ws = new WebSocket(`ws://localhost:8000/ws/jobs/${jobId}`);
    ws.onmessage = (e) => {
      try { onEvent(JSON.parse(e.data as string)); } catch { /* skip malformed */ }
    };
    return ws;
  },

  connectGlobalWS(onEvent: (event: WSEvent) => void): WebSocket {
    const ws = new WebSocket("ws://localhost:8000/ws/global");
    ws.onmessage = (e) => {
      try { onEvent(JSON.parse(e.data as string)); } catch { /* skip malformed */ }
    };
    return ws;
  },
};
