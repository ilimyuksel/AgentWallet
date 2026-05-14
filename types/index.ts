export type AgentCategory =
  | "finance"
  | "food"
  | "communication"
  | "transport"
  | "weather"
  | "productivity";

export type AgentStatus = "active" | "idle" | "error" | "running";

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  pricePerCall: number;
  capabilities: string[];
  isConnected: boolean;
  status: AgentStatus;
  icon: string;
  walletAddress: string;
}

export interface AgentWallet {
  id: string;
  agentId: string;
  userId: string;
  balance: number;
  agtBalance: number;
  currency: "USD";
}

export type PipelineStatus = "active" | "paused" | "completed" | "error";

export interface PipelineAgent {
  agentId: string;
  order: number;
  status: AgentStatus;
}

export interface Pipeline {
  id: string;
  userId: string;
  prompt: string;
  agents: PipelineAgent[];
  status: PipelineStatus;
  triggerCondition: string;
  createdAt: string;
  lastRunAt?: string;
  totalCost: number;
  runCount: number;
}

export type TransactionType = "user_to_agent" | "agent_to_agent" | "agent_to_external";

export interface Transaction {
  id: string;
  fromAgentId: string | "user";
  toAgentId: string;
  amount: number;
  agtAmount: number;
  type: TransactionType;
  pipelineId: string;
  createdAt: string;
  txHash: string;
  blockNumber: number;
  gasUsed: number;
  status: "confirmed" | "pending";
}

export interface PipelineLog {
  timestamp: string;
  message: string;
  type: "info" | "success" | "error" | "transfer";
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  logs: PipelineLog[];
  transactions: Transaction[];
}
