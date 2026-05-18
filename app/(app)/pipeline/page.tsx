"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { simulatePipeline } from "@/lib/orchestrator";
import { mockAgents } from "@/data/mock";
import { PipelineLog, Agent } from "@/types";
import {
  Zap, RotateCcw, ArrowRight,
  TrendingUp, Coffee, MessageCircle, Navigation, Cloud, Cpu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_STYLE: Record<string, { bg: string; color: string; Icon: LucideIcon }> = {
  finance:       { bg: "#fef3c7", color: "#b45309", Icon: TrendingUp   },
  food:          { bg: "#d1fae5", color: "#065f46", Icon: Coffee        },
  communication: { bg: "#ede9fe", color: "#5b21b6", Icon: MessageCircle },
  transport:     { bg: "#dbeafe", color: "#1e40af", Icon: Navigation    },
  weather:       { bg: "#ccfbf1", color: "#0f766e", Icon: Cloud         },
  productivity:  { bg: "#fce7f3", color: "#9d174d", Icon: Cpu           },
};

const LOG_COLORS: Record<PipelineLog["type"], string> = {
  info:     "#6b7280",
  success:  "#4ade80",
  error:    "#f87171",
  transfer: "#a78bfa",
};

const EXAMPLES = [
  "Borsadan $100 kar ettiğimde kahve siparişi ver",
  "Yağmur yağacaksa taksi rezervasyonu yap ve Slack'e bildir",
  "Her sabah e-postalarımı özetle ve Slack kanalına gönder",
  "Bitcoin %5 düşünce bana haber ver",
];

/* ─── Connector ─────────────────────────────────────────────────── */
type ConnectorState = "idle" | "active" | "done";

function Connector({ state, amount }: { state: ConnectorState; amount?: string }) {
  const color =
    state === "done"   ? "#00e96e" :
    state === "active" ? "#6b7fff" : "#e5e7eb";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0, width: 64, marginTop: -8 }}>
      {/* Amount badge */}
      <div style={{
        height: 18,
        display: "flex", alignItems: "center",
      }}>
        {state === "active" && amount && (
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#6b7fff",
            background: "#ede9fe", padding: "2px 7px", borderRadius: 10,
            letterSpacing: "0.04em",
          }}>
            {amount}
          </span>
        )}
        {state === "done" && (
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#00a854",
            background: "#e8fdf0", padding: "2px 7px", borderRadius: 10,
          }}>
            ✓
          </span>
        )}
      </div>

      {/* Line */}
      <div style={{ position: "relative", width: "100%", height: 2, overflow: "visible", display: "flex", alignItems: "center" }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2,
          background: color,
          borderRadius: 2,
          transition: "background 0.4s",
        }} />

        {/* Moving particle */}
        {state === "active" && (
          <div style={{
            position: "absolute",
            width: 8, height: 8, borderRadius: "50%",
            background: "#6b7fff",
            top: "50%", transform: "translateY(-50%)",
            boxShadow: "0 0 8px #6b7fff80",
            animation: "slideParticle 1.2s linear infinite",
          }} />
        )}

        {/* Arrow head */}
        <div style={{
          position: "absolute", right: -5,
          width: 0, height: 0,
          borderTop: "5px solid transparent",
          borderBottom: "5px solid transparent",
          borderLeft: `6px solid ${color}`,
          transition: "border-color 0.4s",
        }} />
      </div>
    </div>
  );
}

/* ─── Agent Node ────────────────────────────────────────────────── */
function AgentNode({ agent, state, step }: {
  agent: Agent;
  state: ConnectorState;
  step: number;
}) {
  const { bg, color, Icon: AgentIcon } =
    CATEGORY_STYLE[agent.category] ?? { bg: "#f3f4f6", color: "#374151", Icon: Cpu };
  const borderColor =
    state === "active" ? "#6b7fff" :
    state === "done"   ? "#00e96e" : "#e5e7eb";
  const shadow =
    state === "active" ? "0 0 0 4px #6b7fff18, 0 4px 24px rgba(107,127,255,0.18)" :
    state === "done"   ? "0 0 0 4px #00e96e14, 0 4px 16px rgba(0,233,110,0.12)" :
                         "0 1px 4px rgba(0,0,0,0.06)";

  return (
    <div style={{
      width: 120, flexShrink: 0,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
    }}>
      <div style={{
        width: "100%",
        background: "white",
        border: `1.5px solid ${borderColor}`,
        borderRadius: 16,
        padding: "14px 10px 12px",
        boxShadow: shadow,
        transition: "all 0.4s",
        position: "relative",
        textAlign: "center",
      }}>
        {/* Step badge */}
        <div style={{
          position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
          width: 20, height: 20, borderRadius: "50%",
          background:
            state === "done"   ? "#00e96e" :
            state === "active" ? "#6b7fff" : "#f3f4f6",
          color: state === "idle" ? "#9ca3af" : "white",
          fontSize: 9, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        }}>
          {state === "done" ? "✓" : step + 1}
        </div>

        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "4px auto 10px",
        }}>
          <AgentIcon style={{ width: 18, height: 18, color }} />
        </div>

        {/* Name */}
        <p style={{
          fontSize: 11, fontWeight: 700,
          color: state === "idle" ? "#374151" : "#000",
          lineHeight: 1.3, marginBottom: 6,
          wordBreak: "break-word",
        }}>
          {agent.name}
        </p>

        {/* Status chip */}
        <span style={{
          display: "inline-block",
          fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
          padding: "2px 8px", borderRadius: 10,
          background:
            state === "active" ? "#ede9fe" :
            state === "done"   ? "#e8fdf0" : "#f9fafb",
          color:
            state === "active" ? "#4338ca" :
            state === "done"   ? "#00a854" : "#9ca3af",
        }}>
          {state === "active" ? "RUNNING" : state === "done" ? "DONE" : "WAITING"}
        </span>

        {/* Price */}
        {agent.pricePerCall > 0 && (
          <p style={{ fontSize: 9, color: "#9ca3af", marginTop: 6 }}>
            ${agent.pricePerCall.toFixed(3)} / çağrı
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Pipeline Flow ─────────────────────────────────────────────── */
function PipelineFlow({ agents, activeIndex }: { agents: Agent[]; activeIndex: number }) {
  if (agents.length === 0) {
    return (
      <div style={{
        border: "1.5px dashed #e5e7eb", borderRadius: 20,
        minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#fafafa",
      }}>
        <p style={{ fontSize: 13, color: "#9ca3af" }}>
          Pipeline başlatıldığında akış burada görünecek
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "#fafafa",
      border: "1.5px solid #f3f4f6",
      borderRadius: 20,
      padding: "28px 32px",
      overflowX: "auto",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        minWidth: "max-content",
        gap: 0,
      }}>
        {agents.map((agent, i) => {
          const isDone   = activeIndex > i;
          const isActive = activeIndex === i;
          const state: ConnectorState = isDone ? "done" : isActive ? "active" : "idle";
          const connState: ConnectorState =
            activeIndex > i  ? "done" :
            activeIndex === i ? "active" : "idle";

          return (
            <div key={agent.id} style={{ display: "flex", alignItems: "center" }}>
              <AgentNode agent={agent} state={state} step={i} />
              {i < agents.length - 1 && (
                <Connector
                  state={connState}
                  amount={isActive ? `$${agent.pricePerCall.toFixed(3)}` : undefined}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function PipelinePage() {
  const {
    addPipeline, addLiveLog, addLiveTransaction, setSimulating,
    resetLive, liveLogs, liveTransactions, isSimulating, pipelines,
  } = useAppStore();
  const searchParams = useSearchParams();

  const [prompt, setPrompt]             = useState(searchParams.get("prompt") ?? "");
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
  const [activeIndex, setActiveIndex]   = useState(-1);
  const [, setDone]                     = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUp  = useRef(false);

  const handleLogScroll = () => {
    const el = logContainerRef.current;
    if (!el) return;
    userScrolledUp.current = el.scrollHeight - el.scrollTop - el.clientHeight > 40;
  };

  const scrollLogs = () =>
    setTimeout(() => {
      if (!userScrolledUp.current) {
        const el = logContainerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      }
    }, 50);

  const handleRun = useCallback(async () => {
    if (!prompt.trim() || isSimulating) return;
    resetLive();
    setActiveAgents([]);
    setActiveIndex(-1);
    setDone(false);
    setSimulating(true);
    let agentList: Agent[] = [];
    let step = 0;
    await simulatePipeline(
      prompt,
      (log) => {
        addLiveLog(log);
        scrollLogs();
        if (log.type === "success" && log.message.includes("pipeline'a eklendi")) {
          const name = log.message.replace("[+] ", "").replace(" pipeline'a eklendi", "").trim();
          const found = mockAgents.find((a) => a.name === name);
          if (found) {
            agentList = [...agentList, found];
            setActiveAgents([...agentList]);
          }
        }
        if (log.type === "transfer") { setActiveIndex(step); step++; }
        if (log.message.includes("tamamlandı!")) {
          setActiveIndex(agentList.length);
          setDone(true);
        }
      },
      (tx) => addLiveTransaction(tx),
    ).then((pipeline) => addPipeline(pipeline));
    setSimulating(false);
  }, [prompt, isSimulating, resetLive, setSimulating, addLiveLog, addLiveTransaction, addPipeline]);

  useEffect(() => {
    const p = searchParams.get("prompt");
    if (p) { setPrompt(p); setTimeout(handleRun, 300); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    resetLive();
    setActiveAgents([]);
    setActiveIndex(-1);
    setDone(false);
  };

  return (
    <>
      <style>{`
        @keyframes slideParticle {
          0%   { left: -10%; }
          100% { left: 110%; }
        }
        @keyframes logIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: none; }
        }
        .log-entry { animation: logIn 0.2s ease both; }
      `}</style>

      <div className="p-8 max-w-4xl mx-auto space-y-7">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-black">Pipeline Oluştur</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Doğal dille yaz — orchestrator ajanları seçer, bağlar ve blockchain üzerinde öder
          </p>
        </div>

        {/* Prompt card */}
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
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              {isSimulating ? "Çalışıyor…" : "Çalıştır"}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:bg-gray-200"
                style={{ background: "#f0f0f0", color: "#666" }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Flow visualization */}
        <div className="space-y-2">
          {activeAgents.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Ajan Akışı</p>
              {!isSimulating && activeIndex >= activeAgents.length && (
                <span
                  className="text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ background: "#e8fdf0", color: "#00a854" }}
                >
                  Pipeline tamamlandı
                </span>
              )}
            </div>
          )}
          <PipelineFlow agents={activeAgents} activeIndex={activeIndex} />
        </div>

        {/* Log + transfers */}
        {(liveLogs.length > 0 || liveTransactions.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Terminal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Log</p>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Temizle
                </button>
              </div>
              <div
                ref={logContainerRef}
                onScroll={handleLogScroll}
                className="rounded-2xl p-4 overflow-y-auto font-mono"
                style={{ background: "#0d1117", height: 260 }}
              >
                {liveLogs.map((log, i) => (
                  <div
                    key={i}
                    className="log-entry flex gap-2 mb-1"
                    style={{ fontSize: 11, animationDelay: `${i * 15}ms` }}
                  >
                    <span style={{ color: "#374151", flexShrink: 0 }}>
                      {new Date(log.timestamp).toLocaleTimeString("tr-TR")}
                    </span>
                    <span style={{ color: LOG_COLORS[log.type], lineHeight: 1.5 }}>
                      {log.message}
                    </span>
                  </div>
                ))}

              </div>
            </div>

            {/* Chain transfers */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Zincir Transferleri</p>
              <div style={{ height: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {liveTransactions.map((tx) => {
                  const from =
                    tx.fromAgentId === "user"
                      ? "Kullanıcı"
                      : mockAgents.find((a) => a.id === tx.fromAgentId)?.name ?? tx.fromAgentId;
                  const to = mockAgents.find((a) => a.id === tx.toAgentId)?.name ?? tx.toAgentId;
                  return (
                    <div
                      key={tx.id}
                      className="bg-white rounded-2xl border border-gray-100 p-4"
                      style={{ flexShrink: 0 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-black">
                          <span>{from}</span>
                          <ArrowRight className="w-3 h-3 text-gray-300" />
                          <span>{to}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: "#6b7fff" }}>
                          ${tx.amount.toFixed(3)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Tx Hash", value: `${tx.txHash.slice(0, 14)}…`, mono: true },
                          { label: "Blok",    value: `#${tx.blockNumber.toLocaleString()}` },
                          { label: "AGT",     value: `${tx.agtAmount} AGT` },
                          { label: "Gas",     value: tx.gasUsed.toLocaleString() },
                        ].map(({ label, value, mono }) => (
                          <div key={label} className="bg-gray-50 rounded-xl p-2">
                            <p className="text-[9px] text-gray-400 mb-0.5">{label}</p>
                            <p className={`text-[10px] font-semibold text-black ${mono ? "font-mono" : ""}`}>
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e96e" }} />
                        <span className="text-[10px] font-semibold" style={{ color: "#00e96e" }}>
                          Onaylandı
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Saved pipelines */}
        {pipelines.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Kayıtlı Pipeline&apos;lar
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {pipelines.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setPrompt(p.prompt)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors ${
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
                    className="ml-4 text-[9px] px-2.5 py-1 rounded-full font-bold flex-shrink-0 uppercase tracking-wide"
                    style={
                      p.status === "active"
                        ? { background: "#e8fdf0", color: "#00a854" }
                        : p.status === "paused"
                        ? { background: "#fff3e0", color: "#e67e00" }
                        : { background: "#f5f5f5", color: "#999" }
                    }
                  >
                    {p.status === "active" ? "Aktif" : p.status === "paused" ? "Durduruldu" : "Tamamlandı"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
