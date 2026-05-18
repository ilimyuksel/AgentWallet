import { mockAgents } from "@/data/mock";
import { Agent, Pipeline, PipelineLog, PipelineRun, Transaction } from "@/types";

const keywords: Record<string, string[]> = {
  "agent-001": ["borsa", "hisse", "kar", "fiyat", "portföy", "stock", "profit"],
  "agent-002": ["kahve", "sipariş", "kafe", "coffee", "içecek"],
  "agent-003": ["email", "e-posta", "mail", "özet", "gelen kutusu"],
  "agent-004": ["hava", "yağmur", "fırtına", "sıcak", "soğuk", "weather"],
  "agent-005": ["taksi", "araba", "uber", "bolt", "araç", "seyahat"],
  "agent-006": ["slack", "bildirim", "mesaj", "kanal", "notify"],
  "agent-007": ["kripto", "bitcoin", "ethereum", "btc", "eth", "crypto"],
  "agent-008": ["takvim", "toplantı", "randevu", "reminder", "hatırlatıcı"],
};

function selectAgents(prompt: string): Agent[] {
  const lower = prompt.toLowerCase();
  const matched: Agent[] = [];

  for (const [agentId, words] of Object.entries(keywords)) {
    if (words.some((w) => lower.includes(w))) {
      const agent = mockAgents.find((a) => a.id === agentId);
      if (agent) matched.push(agent);
    }
  }

  if (matched.length === 0) {
    return [mockAgents[0], mockAgents[5]];
  }
  return matched.slice(0, 4);
}

function randomHash(): string {
  return "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function randomBlock(): number {
  return 18430000 + Math.floor(Math.random() * 5000);
}

export async function simulatePipeline(
  prompt: string,
  onLog: (log: PipelineLog) => void,
  onTransaction: (tx: Transaction) => void
): Promise<Pipeline> {
  const agents = selectAgents(prompt);
  const pipelineId = "pipeline-live-" + Date.now();

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  onLog({ timestamp: new Date().toISOString(), type: "info", message: "Prompt analiz ediliyor..." });
  await delay(800);

  onLog({ timestamp: new Date().toISOString(), type: "info", message: `Intent tespit edildi. ${agents.length} ajan seçildi.` });
  await delay(600);

  for (const agent of agents) {
    onLog({
      timestamp: new Date().toISOString(),
      type: "success",
      message: `[+] ${agent.name} pipeline'a eklendi`,
    });
    await delay(400);
  }

  onLog({ timestamp: new Date().toISOString(), type: "info", message: "Pipeline kuruluyor, tetikleyiciler bağlanıyor..." });
  await delay(1000);

  onLog({ timestamp: new Date().toISOString(), type: "success", message: "Pipeline aktif. Tetikleyici koşul izleniyor..." });
  await delay(1200);

  onLog({ timestamp: new Date().toISOString(), type: "info", message: "Tetikleyici koşul karşılandı. Transfer başlatılıyor..." });
  await delay(700);

  for (let i = 0; i < agents.length - 1; i++) {
    const from = agents[i];
    const to = agents[i + 1];
    const amount = parseFloat((Math.random() * 5 + 0.5).toFixed(2));
    const tx: Transaction = {
      id: "tx-live-" + Date.now() + i,
      fromAgentId: from.id,
      toAgentId: to.id,
      amount,
      agtAmount: amount * 500,
      type: "agent_to_agent",
      pipelineId,
      createdAt: new Date().toISOString(),
      txHash: randomHash(),
      blockNumber: randomBlock(),
      gasUsed: 21000 + Math.floor(Math.random() * 21000),
      status: "confirmed",
    };
    onTransaction(tx);
    onLog({
      timestamp: new Date().toISOString(),
      type: "transfer",
      message: `[TX] ${from.name} → ${to.name}  $${amount.toFixed(2)} · ${tx.txHash.slice(0, 14)}...`,
    });
    await delay(900);
  }

  const lastAgent = agents[agents.length - 1];
  onLog({ timestamp: new Date().toISOString(), type: "success", message: `${lastAgent.name} görevi tamamladı` });
  await delay(500);
  onLog({ timestamp: new Date().toISOString(), type: "success", message: "Pipeline başarıyla tamamlandı." });

  return {
    id: pipelineId,
    userId: "user-001",
    prompt,
    agents: agents.map((a, i) => ({ agentId: a.id, order: i + 1, status: "idle" })),
    status: "completed",
    triggerCondition: "manual",
    createdAt: new Date().toISOString(),
    lastRunAt: new Date().toISOString(),
    totalCost: agents.reduce((s, a) => s + a.pricePerCall, 0),
    runCount: 1,
  };
}
