"use client";

import { useState, useRef } from "react";
import { PipelineCanvas } from "@/components/pipeline/PipelineCanvas";
import { useAppStore } from "@/lib/store";
import { simulatePipeline } from "@/lib/orchestrator";
import { mockAgents } from "@/data/mock";
import { PipelineLog } from "@/types";
import { Zap, Play, RotateCcw, ChevronRight } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Borsadan $100 kar ettiğimde bana kahve siparişi ver",
  "Yağmur yağacaksa taksi rezervasyonu yap ve Slack'e bildir",
  "Her sabah e-postalarımı özetle ve Slack kanalına gönder",
  "Bitcoin %5 düşünce bana haber ver",
];

const logColors: Record<PipelineLog["type"], string> = {
  info:     "text-[#656d76]",
  success:  "text-[#1a7f37]",
  error:    "text-[#cf222e]",
  transfer: "text-[#8250df]",
};

export default function PipelinePage() {
  const {
    addPipeline, addLiveLog, addLiveTransaction, setSimulating,
    resetLive, liveLogs, liveTransactions, isSimulating, pipelines,
  } = useAppStore();
  const [prompt, setPrompt] = useState("");
  const [activeAgents, setActiveAgents] = useState<typeof mockAgents>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [done, setDone] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const scrollLogs = () => {
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleRun = async () => {
    if (!prompt.trim() || isSimulating) return;
    resetLive();
    setActiveAgents([]);
    setActiveIndex(-1);
    setDone(false);
    setSimulating(true);

    let agentList: typeof mockAgents = [];
    let step = 0;

    await simulatePipeline(
      prompt,
      (log) => {
        addLiveLog(log);
        scrollLogs();
        if (log.type === "success" && log.message.includes("pipeline'a eklendi")) {
          const icon = log.message.split(" ")[0];
          const found = mockAgents.find((a) => a.icon === icon);
          if (found) { agentList = [...agentList, found]; setActiveAgents([...agentList]); }
        }
        if (log.type === "transfer") { setActiveIndex(step); step++; }
        if (log.message.includes("tamamlandı!")) { setActiveIndex(agentList.length); setDone(true); }
      },
      (tx) => addLiveTransaction(tx)
    ).then((pipeline) => addPipeline(pipeline));

    setSimulating(false);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-[#d0d7de]">
        <h1 className="text-xl font-semibold text-[#1f2328]">Pipeline Oluştur</h1>
        <p className="text-sm text-[#656d76] mt-0.5">Doğal dille yaz, AgentFlow ajanları otomatik seçer ve bağlar</p>
      </div>

      {/* Prompt */}
      <div className="bg-white border border-[#d0d7de] rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRun()}
              placeholder="Ne yapmak istiyorsunuz?"
              className="w-full pl-10 pr-4 py-2.5 bg-[#f6f8fa] border border-[#d0d7de] rounded-lg text-[#1f2328] placeholder:text-[#9198a1] focus:outline-none focus:border-violet-400 focus:bg-white transition-colors text-sm"
            />
          </div>
          <button
            onClick={handleRun}
            disabled={isSimulating || !prompt.trim()}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm text-sm"
          >
            {isSimulating ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {isSimulating ? "Çalışıyor..." : "Çalıştır"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => setPrompt(p)}
              className="text-xs px-3 py-1.5 rounded-full bg-[#f6f8fa] text-[#656d76] border border-[#d0d7de] hover:border-violet-400 hover:text-violet-600 transition-colors flex items-center gap-1"
            >
              <ChevronRight className="w-3 h-3" />
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline canvas */}
      {activeAgents.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#656d76] font-semibold uppercase tracking-wider">Seçilen Ajanlar</p>
          <PipelineCanvas agents={activeAgents} activeIndex={activeIndex} />
        </div>
      )}

      {/* Canlı log */}
      {liveLogs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#656d76] font-semibold uppercase tracking-wider">Canlı Log</p>
            <button
              onClick={() => { resetLive(); setActiveAgents([]); setActiveIndex(-1); setDone(false); }}
              className="text-xs text-[#656d76] hover:text-[#1f2328] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Temizle
            </button>
          </div>
          <div className="bg-white border border-[#d0d7de] rounded-xl p-4 h-48 overflow-y-auto font-mono space-y-1 shadow-sm">
            {liveLogs.map((log, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-[#9198a1] shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString("tr-TR")}
                </span>
                <span className={logColors[log.type]}>{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Zincir transferleri */}
      {liveTransactions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#656d76] font-semibold uppercase tracking-wider">Zincir Transferleri</p>
          <div className="space-y-2">
            {liveTransactions.map((tx) => {
              const from = tx.fromAgentId === "user" ? "👤 Kullanıcı" : mockAgents.find((a) => a.id === tx.fromAgentId)?.name;
              const to   = mockAgents.find((a) => a.id === tx.toAgentId)?.name;
              return (
                <div key={tx.id} className="bg-white border border-[#d0d7de] rounded-xl p-4 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#1f2328] font-semibold">{from} → {to}</span>
                    <span className="text-sm font-bold text-[#8250df]">${tx.amount.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {[
                      { label: "Tx Hash", value: `${tx.txHash.slice(0, 22)}...`, mono: true },
                      { label: "Blok",    value: `#${tx.blockNumber.toLocaleString()}` },
                      { label: "AGT",     value: `${tx.agtAmount} AGT` },
                      { label: "Gas",     value: tx.gasUsed.toLocaleString() },
                    ].map(({ label, value, mono }) => (
                      <div key={label}>
                        <p className="text-[10px] text-[#9198a1]">{label}</p>
                        <p className={`text-[10px] text-[#1f2328] font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 border-t border-[#d0d7de]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a7f37]" />
                    <span className="text-[10px] text-[#1a7f37] font-medium">Onaylandı</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kayıtlı pipeline'lar */}
      <div className="space-y-2">
        <p className="text-xs text-[#656d76] font-semibold uppercase tracking-wider">Kayıtlı Pipeline&apos;lar</p>
        <div className="bg-white border border-[#d0d7de] rounded-xl overflow-hidden shadow-sm">
          {pipelines.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-5 py-3 ${i < pipelines.length - 1 ? "border-b border-[#d0d7de]" : ""} hover:bg-[#f6f8fa] transition-colors`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1f2328] font-medium truncate">{p.prompt}</p>
                <p className="text-xs text-[#656d76] mt-0.5">
                  {p.agents.length} ajan · {p.runCount} çalıştırma · ${p.totalCost.toFixed(3)}
                </p>
              </div>
              <span className={`ml-4 text-xs px-2.5 py-1 rounded-full font-medium border ${
                p.status === "active"  ? "bg-[#dafbe1] text-[#1a7f37] border-[#aceebb]" :
                p.status === "paused" ? "bg-[#fff8f0] text-[#bc4c00] border-[#ffd9a0]" :
                                        "bg-[#f6f8fa] text-[#656d76] border-[#d0d7de]"
              }`}>
                {p.status === "active" ? "Aktif" : p.status === "paused" ? "Duraklatıldı" : "Tamamlandı"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
