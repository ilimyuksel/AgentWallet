import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Agent, AgentWallet, Pipeline, PipelineLog, Transaction } from "@/types";
import { mockAgents, mockWallets, mockPipelines, mockTransactions } from "@/data/mock";

interface AppState {
  agents: Agent[];
  wallets: AgentWallet[];
  pipelines: Pipeline[];
  transactions: Transaction[];
  liveLogs: PipelineLog[];
  liveTransactions: Transaction[];
  isSimulating: boolean;

  toggleConnect: (agentId: string) => void;
  addPipeline: (pipeline: Pipeline) => void;
  addLiveLog: (log: PipelineLog) => void;
  addLiveTransaction: (tx: Transaction) => void;
  setSimulating: (val: boolean) => void;
  resetLive: () => void;
  fundWallet: (agentId: string, amount: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      agents: mockAgents,
      wallets: mockWallets,
      pipelines: mockPipelines,
      transactions: mockTransactions,
      liveLogs: [],
      liveTransactions: [],
      isSimulating: false,

      toggleConnect: (agentId) =>
        set((s) => ({
          agents: s.agents.map((a) =>
            a.id === agentId ? { ...a, isConnected: !a.isConnected } : a
          ),
        })),

      addPipeline: (pipeline) =>
        set((s) => ({ pipelines: [pipeline, ...s.pipelines] })),

      addLiveLog: (log) =>
        set((s) => ({ liveLogs: [...s.liveLogs, log] })),

      addLiveTransaction: (tx) =>
        set((s) => ({
          liveTransactions: [...s.liveTransactions, tx],
          transactions: [tx, ...s.transactions],
        })),

      setSimulating: (val) => set({ isSimulating: val }),

      resetLive: () => set({ liveLogs: [], liveTransactions: [] }),

      fundWallet: (agentId, amount) =>
        set((s) => ({
          wallets: s.wallets.map((w) =>
            w.agentId === agentId
              ? { ...w, balance: w.balance + amount, agtBalance: w.agtBalance + amount * 500 }
              : w
          ),
        })),
    }),
    { name: "agentflow-store" }
  )
);
