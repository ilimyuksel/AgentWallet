import { create } from "zustand";
import { Agent, Wallet, Job, Task, Bid, Transaction, JudgeEvaluation, WSEvent, TaskState, JobState, BudgetTier } from "@/types";
import { mockAgents, mockWallets, mockJobs, mockTasks, mockBids, mockTransactions, mockEvaluations } from "@/data/mock";
import { api } from "@/lib/api";

function ts() { return new Date().toISOString(); }
function uid() { return Math.random().toString(36).slice(2, 10); }

function budgetTier(budget: number): BudgetTier {
  if (budget < 50) return "REJECTED";
  if (budget < 150) return "MINIMAL";
  if (budget < 500) return "STANDARD";
  return "PREMIUM";
}

function randHash() {
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

interface AppState {
  agents: Agent[];
  wallets: Wallet[];
  jobs: Job[];
  tasks: Task[];
  bids: Bid[];
  transactions: Transaction[];
  evaluations: JudgeEvaluation[];
  events: WSEvent[];
  activeJobId: string | null;
  isSubmitting: boolean;
  backendOnline: boolean;
  ws: WebSocket | null;

  checkBackend: () => Promise<void>;
  submitJob: (prompt: string, budget: number) => Promise<void>;
  setActiveJobId: (id: string | null) => void;
  addEvent: (event: WSEvent) => void;
  fundWallet: (walletId: string, amount: number) => void;
}

function makeEvent(eventType: string, jobId: string | null, taskId: string | null, payload: Record<string, unknown>): WSEvent {
  return { eventType, timestamp: ts(), jobId, taskId, payload };
}

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runSimulation(
  jobId: string,
  prompt: string,
  budget: number,
  tier: BudgetTier,
  set: (fn: (s: AppState) => Partial<AppState>) => void
) {
  const push = (event: WSEvent) =>
    set((s) => ({ events: [event, ...s.events].slice(0, 200) }));

  const updateJob = (update: Partial<Job>) =>
    set((s) => ({ jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, ...update } : j)) }));

  const updateTask = (taskId: string, update: Partial<Task>) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...update } : t)) }));

  const addTx = (tx: Transaction) =>
    set((s) => ({ transactions: [tx, ...s.transactions] }));

  const addBids = (newBids: Bid[]) =>
    set((s) => ({ bids: [...s.bids, ...newBids] }));

  const addEval = (ev: JudgeEvaluation) =>
    set((s) => ({ evaluations: [ev, ...s.evaluations] }));

  // Escrow lock
  await delay(800);
  push(makeEvent("job.escrow_locked", jobId, null, { amount: budget, wallet: `wallet_escrow_${jobId}` }));

  // Manager bidding
  updateJob({ state: "MANAGER_BIDDING" });
  push(makeEvent("job.manager_bidding_started", jobId, null, { manager: "ProjectManager_001" }));
  await delay(1500);

  if (tier === "REJECTED") {
    updateJob({ state: "REJECTED", failureReason: "Budget too low — minimum $50 required" });
    push(makeEvent("job.failed", jobId, null, { reason: "Budget too low" }));
    return;
  }

  const margin = tier === "MINIMAL" ? 0.15 : tier === "STANDARD" ? 0.18 : 0.22;
  const managerBid = parseFloat((budget * (1 - margin * 0.5)).toFixed(2));
  updateJob({ state: "PLANNING", assignedManagerId: "ProjectManager_001", managerBidAmount: managerBid, managerProfitMargin: margin });
  push(makeEvent("job.manager_assigned", jobId, null, { manager: "ProjectManager_001", bid: managerBid, margin }));

  // Planning
  await delay(2000);

  const taskDefs =
    tier === "MINIMAL"
      ? [
          { title: "Copywriting", skills: ["copywriting", "landing page copy"], agent: "ContentWriter_001", budget: budget * 0.35 },
          { title: "Web Development", skills: ["web development", "html", "css"], agent: "WebDeveloper_001", budget: budget * 0.45 },
        ]
      : [
          { title: "Market Research", skills: ["market research", "competitor analysis"], agent: "MarketResearcher_001", budget: budget * 0.14 },
          { title: "Copywriting", skills: ["copywriting", "landing page copy"], agent: "ContentWriter_001", budget: budget * 0.19 },
          { title: "Design Direction", skills: ["ui design", "design tokens"], agent: "Designer_001", budget: budget * 0.11 },
          { title: "Web Development", skills: ["web development", "html", "css"], agent: "WebDeveloper_001", budget: budget * 0.27 },
        ];

  const now = ts();
  const taskIds = taskDefs.map(() => `task_${uid()}`);

  const newTasks: Task[] = taskDefs.map((def, i) => ({
    id: taskIds[i],
    jobId,
    title: def.title,
    description: `${def.title} for: ${prompt}`,
    requiredSkills: def.skills,
    budget: parseFloat(def.budget.toFixed(2)),
    finalCost: null,
    state: "PENDING" as TaskState,
    dependencies: i === 0 ? [] : tier === "MINIMAL" ? [] : i === 1 ? [taskIds[0]] : i === 2 ? [taskIds[0]] : [taskIds[1], taskIds[2]],
    assignedAgentId: null,
    judgeScore: null,
    judgeVerdict: null,
    judgeFeedback: null,
    revisionCount: 0,
    createdAt: now,
    startedAt: null,
    completedAt: null,
  }));

  set((s) => ({ tasks: [...s.tasks, ...newTasks] }));
  updateJob({ state: "EXECUTING" });
  push(makeEvent("job.plan_completed", jobId, null, { taskCount: newTasks.length }));
  push(makeEvent("job.execution_started", jobId, null, {}));

  let prevHash = "0000000000000000000000000000000000000000000000000000000000000000";
  let blockNum = 100;

  // ESCROW_LOCK transaction
  const escrowTx: Transaction = {
    id: `tx_${uid()}`, jobId, taskId: null,
    fromWalletId: "wallet_user_demo", toWalletId: `wallet_escrow_${jobId}`,
    amount: budget, transactionType: "ESCROW_LOCK", milestone: null,
    description: `Escrow lock for ${jobId}`,
    blockNumber: blockNum++, blockHash: randHash(), previousBlockHash: prevHash, createdAt: ts(),
  };
  prevHash = escrowTx.blockHash;
  addTx(escrowTx);

  // MANAGER_FUNDING
  const mgrTx: Transaction = {
    id: `tx_${uid()}`, jobId, taskId: null,
    fromWalletId: `wallet_escrow_${jobId}`, toWalletId: "wallet_projectmanager_001",
    amount: managerBid, transactionType: "MANAGER_FUNDING", milestone: null,
    description: "Manager funding",
    blockNumber: blockNum++, blockHash: randHash(), previousBlockHash: prevHash, createdAt: ts(),
  };
  prevHash = mgrTx.blockHash;
  addTx(mgrTx);

  // Execute each task in dependency order
  for (let i = 0; i < newTasks.length; i++) {
    const task = newTasks[i];

    // Wait for dependencies
    if (task.dependencies.length > 0) await delay(500);

    updateTask(task.id, { state: "READY" });
    push(makeEvent("task.state_changed", jobId, task.id, { state: "READY", title: task.title }));
    await delay(600);

    // Bidding
    updateTask(task.id, { state: "BIDDING" });
    push(makeEvent("bidding.round_started", jobId, task.id, { task: task.title }));
    await delay(800);

    const winnerBid = parseFloat((task.budget * 0.95).toFixed(2));
    const ghostBid = parseFloat((task.budget * 0.80).toFixed(2));
    const newBids: Bid[] = [
      {
        id: `bid_${uid()}`, taskId: task.id, agentId: taskDefs[i].agent,
        bidAmount: winnerBid, reasoning: "Best fit for task requirements",
        confidence: 0.85, estimatedTimeSeconds: 45, scopeAssumption: "Standard scope",
        isWinner: true, selectionScore: 0.84, submittedAt: ts(),
      },
    ];

    if (i > 0) {
      const ghostAgent = taskDefs[i].agent === "ContentWriter_001" ? "ContentWriter_002"
        : taskDefs[i].agent === "WebDeveloper_001" ? "WebDeveloper_002"
        : taskDefs[i].agent === "Designer_001" ? "Designer_002" : null;

      if (ghostAgent) {
        newBids.push({
          id: `bid_${uid()}`, taskId: task.id, agentId: ghostAgent,
          bidAmount: ghostBid, reasoning: "Competitive pricing",
          confidence: 0.70, estimatedTimeSeconds: 60, scopeAssumption: "Standard scope",
          isWinner: false, selectionScore: 0.65, submittedAt: ts(),
        });
        push(makeEvent("bidding.bid_submitted", jobId, task.id, { agent: ghostAgent, amount: ghostBid }));
      }
    }

    push(makeEvent("bidding.bid_submitted", jobId, task.id, { agent: taskDefs[i].agent, amount: winnerBid }));
    addBids(newBids);
    await delay(500);

    push(makeEvent("bidding.winner_selected", jobId, task.id, { winner: taskDefs[i].agent, score: 0.84 }));
    updateTask(task.id, { state: "ASSIGNED", assignedAgentId: taskDefs[i].agent });

    // START payment
    const startAmount = parseFloat((winnerBid * 0.25).toFixed(2));
    const startTx: Transaction = {
      id: `tx_${uid()}`, jobId, taskId: task.id,
      fromWalletId: "wallet_projectmanager_001", toWalletId: `wallet_${taskDefs[i].agent.toLowerCase()}`,
      amount: startAmount, transactionType: "MILESTONE_RELEASE", milestone: "START",
      description: `START — ${taskDefs[i].agent}`,
      blockNumber: blockNum++, blockHash: randHash(), previousBlockHash: prevHash, createdAt: ts(),
    };
    prevHash = startTx.blockHash;
    addTx(startTx);
    push(makeEvent("payment.milestone_released", jobId, task.id, { milestone: "START", amount: startAmount, agent: taskDefs[i].agent }));

    // Running
    updateTask(task.id, { state: "RUNNING", startedAt: ts() });
    push(makeEvent("task.execution_started", jobId, task.id, { agent: taskDefs[i].agent }));
    await delay(1500 + Math.random() * 1000);

    // MID payment
    const midAmount = parseFloat((winnerBid * 0.25).toFixed(2));
    const midTx: Transaction = {
      id: `tx_${uid()}`, jobId, taskId: task.id,
      fromWalletId: "wallet_projectmanager_001", toWalletId: `wallet_${taskDefs[i].agent.toLowerCase()}`,
      amount: midAmount, transactionType: "MILESTONE_RELEASE", milestone: "MID",
      description: `MID — ${taskDefs[i].agent}`,
      blockNumber: blockNum++, blockHash: randHash(), previousBlockHash: prevHash, createdAt: ts(),
    };
    prevHash = midTx.blockHash;
    addTx(midTx);

    updateTask(task.id, { state: "DONE" });
    push(makeEvent("task.execution_completed", jobId, task.id, { agent: taskDefs[i].agent }));
    await delay(400);

    // Judge evaluation
    updateTask(task.id, { state: "VERIFYING" });
    push(makeEvent("judge.evaluation_started", jobId, task.id, {}));

    const judgeTx: Transaction = {
      id: `tx_${uid()}`, jobId, taskId: task.id,
      fromWalletId: "wallet_projectmanager_001", toWalletId: "wallet_qajudge_001",
      amount: 2.00, transactionType: "JUDGE_FEE", milestone: null,
      description: `Judge fee — ${task.title}`,
      blockNumber: blockNum++, blockHash: randHash(), previousBlockHash: prevHash, createdAt: ts(),
    };
    prevHash = judgeTx.blockHash;
    addTx(judgeTx);
    await delay(1000);

    const score = 0.75 + Math.random() * 0.20;
    const decision = score >= 0.70 ? "APPROVED" as const : "REVISION_REQUESTED" as const;
    const finalScore = parseFloat(score.toFixed(3));

    const evaluation: JudgeEvaluation = {
      id: `eval_${uid()}`, taskId: task.id, evaluatedAgentId: taskDefs[i].agent,
      scopeCompleteness: parseFloat((score * 0.95).toFixed(3)),
      structuralQuality: parseFloat((score * 0.98).toFixed(3)),
      contentQuality: parseFloat((score * 1.02).toFixed(3)),
      briefFidelity: parseFloat((score * 0.97).toFixed(3)),
      finalScore, decision,
      reasoning: decision === "APPROVED" ? "Output meets all acceptance criteria." : "Minor improvements needed.",
      feedbackForRevision: decision === "REVISION_REQUESTED" ? "Please refine the output quality." : null,
      confidenceInJudgment: 0.88,
      createdAt: ts(),
    };
    addEval(evaluation);
    push(makeEvent("judge.verdict_delivered", jobId, task.id, { decision, score: finalScore }));

    updateTask(task.id, { state: "VERIFIED", judgeScore: finalScore, judgeVerdict: decision });

    // COMPLETION payment
    const completionAmount = parseFloat((winnerBid * 0.50).toFixed(2));
    const completionTx: Transaction = {
      id: `tx_${uid()}`, jobId, taskId: task.id,
      fromWalletId: "wallet_projectmanager_001", toWalletId: `wallet_${taskDefs[i].agent.toLowerCase()}`,
      amount: completionAmount, transactionType: "MILESTONE_RELEASE", milestone: "COMPLETION",
      description: `COMPLETION — ${taskDefs[i].agent}`,
      blockNumber: blockNum++, blockHash: randHash(), previousBlockHash: prevHash, createdAt: ts(),
    };
    prevHash = completionTx.blockHash;
    addTx(completionTx);
    push(makeEvent("payment.milestone_released", jobId, task.id, { milestone: "COMPLETION", amount: completionAmount }));

    updateTask(task.id, { state: "PAID", finalCost: winnerBid, completedAt: ts() });
    push(makeEvent("task.state_changed", jobId, task.id, { state: "PAID", title: task.title }));
    await delay(300);
  }

  // Complete the job
  updateJob({ state: "COMPLETED", completedAt: ts() });
  push(makeEvent("job.completed", jobId, null, { tasksCompleted: newTasks.length }));
}

export const useAppStore = create<AppState>()((set, get) => ({
  agents: mockAgents,
  wallets: mockWallets,
  jobs: mockJobs,
  tasks: mockTasks,
  bids: mockBids,
  transactions: mockTransactions,
  evaluations: mockEvaluations,
  events: [],
  activeJobId: "job_001",
  isSubmitting: false,
  backendOnline: false,
  ws: null,

  checkBackend: async () => {
    const online = await api.healthCheck();
    set({ backendOnline: online });
    if (online) {
      try {
        const [agents, jobs, transactions] = await Promise.all([
          api.getAgents(),
          api.getJobs(),
          api.getLedger(),
        ]);
        set({ agents, jobs, transactions });
      } catch { /* keep mock data */ }
    }
  },

  submitJob: async (prompt, budget) => {
    set({ isSubmitting: true });
    const tier = budgetTier(budget);
    const jobId = `job_${uid()}`;
    const now = ts();

    const newJob: Job = {
      id: jobId,
      userId: "user_demo",
      userPrompt: prompt,
      budget,
      budgetTier: tier,
      escrowWalletId: `wallet_escrow_${jobId}`,
      assignedManagerId: null,
      managerBidAmount: null,
      managerProfitMargin: null,
      state: "CREATED",
      finalOutputId: null,
      createdAt: now,
      completedAt: null,
      failureReason: null,
    };

    set((s) => ({ jobs: [newJob, ...s.jobs], activeJobId: jobId, isSubmitting: false }));
    get().addEvent(makeEvent("job.created", jobId, null, { prompt, budget, tier }));

    if (get().backendOnline) {
      try {
        const result = await api.createJob(prompt, budget);
        const realJobId = result.job_id;
        set({ activeJobId: realJobId });
        const ws = api.connectJobWS(realJobId, get().addEvent);
        set({ ws });
        return;
      } catch { /* fall through to simulation */ }
    }

    runSimulation(jobId, prompt, budget, tier, set);
  },

  setActiveJobId: (id) => set({ activeJobId: id }),

  addEvent: (event) =>
    set((s) => ({ events: [event, ...s.events].slice(0, 200) })),

  fundWallet: (walletId, amount) =>
    set((s) => ({
      wallets: s.wallets.map((w) =>
        w.id === walletId ? { ...w, balance: w.balance + amount } : w
      ),
    })),
}));
