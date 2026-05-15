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
  info:     "text-gray-400",
  success:  "text-green-400",
  error:    "text-red-400",
  transfer: "text-[#a78bfa]",
};

export default function PipelinePage() {
  const {
    addPipeline, addLiveLog, addLiveTransaction, setSimulating,
    resetLive, liveLogs, liveTransactions, isSimulating, pipelines,
  } = useAppStore();
  const [prompt,       setPrompt]       = useState("");
  const [activeAgents, setActiveAgents] = useState<typeof mockAgents>([]);
  const [activeIndex,  setActiveIndex]  = useState(-1);
  const [, setDone] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const scrollLogs = () => setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  const handleRun = async () => {
    if (!prompt.trim() || isSimulating) return;
    resetLive(); setActiveAgents([]); setActiveIndex(-1); setDone(false); setSimulating(true);
    let agentList: typeof mockAgents = [];
    let step = 0;
    await simulatePipeline(
      prompt,
      (log) => {
        addLiveLog(log); scrollLogs();
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
    <div className="p-8 max-w-4xl space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Pipeline Oluştur</h1>
        <p className="text-sm text-gray-400 mt-0.5">Doğal dille yaz, AgentFlow ajanları otomatik seçer ve bağlar</p>
      </div>

      {/* Prompt */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRun()}
              placeholder="Ne yapmak istiyorsunuz?"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-black placeholder:text-gray-300 focus:outline-none focus:border-gray-300 text-sm transition-colors"
            />
          </div>
          <button
            onClick={handleRun}
            disabled={isSimulating || !prompt.trim()}
            className="px-5 py-2.5 rounded-xl text-black font-bold flex items-center gap-2 text-sm transition-all disabled:opacity-30 hover:-translate-y-0.5"
            style={{ background: "#00e96e" }}
          >
            {isSimulating ? (
              <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {isSimulating ? "Çalışıyor..." : "Çalıştır"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => setPrompt(p)}
              className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-all hover:bg-gray-200"
              style={{ background: "#f0f0f0", color: "#666" }}
            >
              <ChevronRight className="w-3 h-3" />{p}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      {activeAgents.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Seçilen Ajanlar</p>
          <PipelineCanvas agents={activeAgents} activeIndex={activeIndex} />
        </div>
      )}

      {/* Live log */}
      {liveLogs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Canlı Log</p>
            <button
              onClick={() => { resetLive(); setActiveAgents([]); setActiveIndex(-1); setDone(false); }}
              className="text-xs text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Temizle
            </button>
          </div>
          <div className="bg-black rounded-2xl p-4 h-48 overflow-y-auto font-mono space-y-1">
            {liveLogs.map((log, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-gray-600 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString("tr-TR")}
                </span>
                <span className={logColors[log.type]}>{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Chain transfers */}
      {liveTransactions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Zincir Transferleri</p>
          <div className="space-y-3">
            {liveTransactions.map((tx) => {
              const from = tx.fromAgentId === "user" ? "Kullanıcı" : mockAgents.find((a) => a.id === tx.fromAgentId)?.name;
              const to   = mockAgents.find((a) => a.id === tx.toAgentId)?.name;
              return (
                <div key={tx.id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-black">{from} → {to}</span>
                    <span className="text-sm font-bold" style={{ color: "#6b7fff" }}>${tx.amount.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Tx Hash", value: `${tx.txHash.slice(0, 22)}...`, mono: true },
                      { label: "Blok",    value: `#${tx.blockNumber.toLocaleString()}` },
                      { label: "AGT",     value: `${tx.agtAmount} AGT` },
                      { label: "Gas",     value: tx.gasUsed.toLocaleString() },
                    ].map(({ label, value, mono }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                        <p className={`text-[11px] font-semibold text-black ${mono ? "font-mono" : ""}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#00e96e" }} />
                    <span className="text-xs font-semibold" style={{ color: "#00e96e" }}>Onaylandı</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Saved pipelines */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Kayıtlı Pipeline&apos;lar</p>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {pipelines.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors ${
                i < pipelines.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">{p.prompt}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {p.agents.length} ajan · {p.runCount} çalıştırma · ${p.totalCost.toFixed(3)}
                </p>
              </div>
              <span
                className="ml-4 text-[10px] px-3 py-1 rounded-full font-bold flex-shrink-0"
                style={
                  p.status === "active"  ? { background: "#e8fdf0", color: "#00a854" } :
                  p.status === "paused"  ? { background: "#fff3e0", color: "#e67e00" } :
                                           { background: "#f5f5f5", color: "#999" }
                }
              >
                {p.status === "active" ? "Aktif" : p.status === "paused" ? "Duraklatıldı" : "Tamamlandı"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
