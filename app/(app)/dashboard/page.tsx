"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Zap, Activity, TrendingUp, Wallet, ChevronRight,
  Coffee, MessageCircle, Navigation, Cloud, Cpu, BarChart2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const AGENT_ICONS: Record<string, LucideIcon> = {
  finance:       TrendingUp,
  food:          Coffee,
  communication: MessageCircle,
  transport:     Navigation,
  weather:       Cloud,
  productivity:  Cpu,
  orchestrator:  Zap,
  data:          BarChart2,
  default:       Cpu,
};

/* ─── useInView ──────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Agent data for visualization ──────────────────────────────── */
const VIZ_AGENTS = [
  { id: "orchestrator", name: "Orchestrator", category: "orchestrator", gradient: "linear-gradient(135deg,#6b7fff,#a78bfa)", x: 50, y: 12 },
  { id: "finance",      name: "Finance AI",   category: "finance",      gradient: "linear-gradient(135deg,#f6d365,#fda085)", x: 18, y: 45 },
  { id: "data",         name: "Data Agent",   category: "data",         gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", x: 50, y: 78 },
  { id: "comms",        name: "Comms Agent",  category: "communication",gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)", x: 82, y: 45 },
  { id: "transport",    name: "Transport AI", category: "transport",    gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", x: 82, y: 78 },
  { id: "weather",      name: "Weather Bot",  category: "weather",      gradient: "linear-gradient(135deg,#84fab0,#8fd3f4)", x: 18, y: 78 },
];

const CONNECTIONS = [
  { from: 0, to: 1 }, { from: 0, to: 3 }, { from: 0, to: 2 },
  { from: 1, to: 5 }, { from: 2, to: 4 }, { from: 3, to: 4 },
];

/* ─── SVG Network ────────────────────────────────────────────────── */
function AgentNetwork({ activeIdx }: { activeIdx: number }) {
  const W = 800, H = 420;
  const toXY = (a: typeof VIZ_AGENTS[0]) => ({ x: (a.x / 100) * W, y: (a.y / 100) * H });

  return (
    <div className="relative w-full" style={{ maxWidth: 800, margin: "0 auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ overflow: "visible" }}
      >
        <defs>
          {VIZ_AGENTS.map((a) => {
            const stops = a.gradient.match(/#[a-f0-9]{6}/gi) ?? ["#6b7fff", "#a78bfa"];
            return (
              <g key={a.id}>
                <radialGradient id={`glow-${a.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00e96e" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#00e96e" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`fill-${a.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={stops[0]} />
                  <stop offset="100%" stopColor={stops[1] ?? stops[0]} />
                </linearGradient>
              </g>
            );
          })}
        </defs>

        {/* Connection lines */}
        {CONNECTIONS.map(({ from, to }, ci) => {
          const a = toXY(VIZ_AGENTS[from]);
          const b = toXY(VIZ_AGENTS[to]);
          const cpX = (a.x + b.x) / 2 + (b.y - a.y) * 0.2;
          const cpY = (a.y + b.y) / 2 - (b.x - a.x) * 0.2;
          const pathD = `M ${a.x} ${a.y} Q ${cpX} ${cpY} ${b.x} ${b.y}`;
          const isActive = ci === activeIdx % CONNECTIONS.length;
          const isDone = ci < activeIdx % CONNECTIONS.length;

          return (
            <g key={ci}>
              <path
                d={pathD}
                fill="none"
                stroke={isDone ? "#00e96e" : isActive ? "#6b7fff" : "#e5e7eb"}
                strokeWidth={isActive ? 2.5 : isDone ? 2 : 1.5}
                strokeDasharray={isActive ? "none" : isDone ? "none" : "6 4"}
                opacity={isActive ? 1 : isDone ? 0.8 : 0.5}
                style={{ transition: "all 0.5s" }}
              />
              {isActive && (
                <>
                  {[0, 0.33, 0.66].map((offset, pi) => (
                    <circle key={pi} r="5" fill="#00e96e" opacity="0.9">
                      <animateMotion path={pathD} dur="1.8s" begin={`${offset * 1.8}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                  <text
                    x={(a.x + b.x) / 2 + 8}
                    y={(a.y + b.y) / 2 - 8}
                    fontSize="11"
                    fill="#00e96e"
                    fontWeight="bold"
                    fontFamily="monospace"
                    style={{ animation: "pulse 1s ease-in-out infinite" }}
                  >
                    $0.042
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Agent nodes */}
        {VIZ_AGENTS.map((agent, i) => {
          const { x, y } = toXY(agent);
          const isActive = CONNECTIONS[activeIdx % CONNECTIONS.length]?.from === i
            || CONNECTIONS[activeIdx % CONNECTIONS.length]?.to === i;

          return (
            <g key={agent.id}>
              {isActive && (
                <circle cx={x} cy={y} r="38" fill={`url(#glow-${agent.id})`} opacity="0.5">
                  <animate attributeName="r" values="34;44;34" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={x} cy={y} r="30"
                fill={`url(#fill-${agent.id})`}
                stroke={isActive ? "#00e96e" : "rgba(255,255,255,0.6)"}
                strokeWidth={isActive ? 2.5 : 1.5}
                style={{
                  filter: isActive
                    ? "drop-shadow(0 0 14px #00e96e70)"
                    : "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
                  transition: "all 0.5s",
                }}
              />
              <foreignObject x={x - 12} y={y - 12} width={24} height={24} style={{ overflow: "visible" }}>
                <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {(() => { const Icon = AGENT_ICONS[agent.category] ?? AGENT_ICONS.default; return <Icon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.95)", strokeWidth: 2.2 }} />; })()}
                </div>
              </foreignObject>
              <text
                x={x} y={y + 48}
                textAnchor="middle"
                fontSize="10"
                fill={isActive ? "#000" : "#6b7280"}
                fontWeight={isActive ? "700" : "500"}
                fontFamily="system-ui, sans-serif"
                style={{ transition: "all 0.5s" }}
              >
                {agent.name}
              </text>
              {isActive && (
                <circle cx={x + 22} cy={y - 22} r="6" fill="#00e96e">
                  <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── 3D Agent Card ──────────────────────────────────────────────── */
function Agent3DCard({ agent, state, delay }: {
  agent: { name: string; gradient: string; category: string };
  state: "active" | "idle" | "done";
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);
  const stateColors = {
    active: { bg: "#00e96e", label: "ACTIVE" },
    idle:   { bg: "#d1d5db", label: "IDLE" },
    done:   { bg: "#6b7fff", label: "DONE" },
  };
  const sc = stateColors[state];
  const AgentIcon = AGENT_ICONS[agent.category] ?? AGENT_ICONS.default;

  return (
    <div
      style={{ perspective: 700, animationDelay: `${delay}ms` }}
      className="fade-up-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          transform: hovered ? "rotateX(-8deg) rotateY(10deg) translateY(-6px)" : "rotateX(-6deg) rotateY(6deg)",
          transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          transformStyle: "preserve-3d",
          position: "relative",
        }}
      >
        {/* Depth shadow layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 20,
            background: "#000",
            transform: "translateZ(-1px) translateX(8px) translateY(10px)",
            opacity: 0.12,
            filter: "blur(8px)",
          }}
        />
        {/* Card face */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: "20px",
            border: state === "active" ? "2px solid #00e96e" : "1.5px solid #e5e7eb",
            boxShadow: state === "active"
              ? "0 0 0 4px #00e96e18, 0 8px 32px rgba(0,233,110,0.15)"
              : "0 4px 20px rgba(0,0,0,0.08)",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: agent.gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AgentIcon style={{ width: 20, height: 20, color: "rgba(255,255,255,0.92)" }} />
            </div>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
              color: state === "active" ? "#00a854" : state === "done" ? "#4338ca" : "#9ca3af",
              background: state === "active" ? "#e8fdf0" : state === "done" ? "#ede9fe" : "#f3f4f6",
              padding: "3px 8px", borderRadius: 20,
            }}>
              {sc.label}
            </span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 3 }}>{agent.name}</p>
          {state === "active" && (
            <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
              {[0, 1, 2].map((d) => (
                <div key={d} style={{
                  width: 4, height: 4, borderRadius: "50%", background: "#00e96e",
                  animation: `bounce 1.2s ${d * 0.2}s ease-in-out infinite`,
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Floating Orb ───────────────────────────────────────────────── */
function FloatingOrb({ Icon, gradient, x, y, delay, size = 56 }: {
  Icon: LucideIcon; gradient: string; x: string; y: string; delay: number; size?: number;
}) {
  const iconSize = Math.round(size * 0.4);
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      width: size, height: size, borderRadius: "50%",
      background: gradient,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 0 24px rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.3)",
      animation: `floatY 3.5s ${delay}ms ease-in-out infinite`,
      zIndex: 2,
    }}>
      <Icon style={{ width: iconSize, height: iconSize, color: "rgba(255,255,255,0.92)" }} />
    </div>
  );
}

/* ─── Transaction Row ────────────────────────────────────────────── */
function TxRow({ from, to, amount, hash, delay }: {
  from: string; to: string; amount: string; hash: string; delay: number;
}) {
  return (
    <div className="tx-row" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%", background: "#00e96e", flexShrink: 0,
          animation: "pulse 2s ease-in-out infinite",
        }} />
        <span style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}>
          {from} → {to}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#00e96e" }}>{amount}</span>
        <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace" }}>{hash}</span>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */
export default function DashboardPage() {
  const { agents, pipelines, transactions, wallets } = useAppStore();
  const [prompt, setPrompt] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [txFeed, setTxFeed] = useState(transactions.slice(0, 5));
  const router = useRouter();

  const heroSection    = useInView(0.1);
  const networkSection = useInView(0.15);
  const statsSection   = useInView(0.2);
  const txSection      = useInView(0.15);

  useEffect(() => {
    const iv = setInterval(() => setActiveIdx((p) => p + 1), 2000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      const fake = {
        id: Math.random().toString(36).slice(2),
        type: "agent_to_agent" as const,
        fromAgentId: VIZ_AGENTS[Math.floor(Math.random() * VIZ_AGENTS.length)].id,
        toAgentId:   VIZ_AGENTS[Math.floor(Math.random() * VIZ_AGENTS.length)].id,
        amount: Math.random() * 0.1 + 0.01,
        agtAmount: Math.floor(Math.random() * 40 + 10),
        txHash: "0x" + Math.random().toString(16).slice(2, 18),
        blockNumber: 18420000 + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        status: "confirmed" as const,
        pipelineId: "demo",
        createdAt: new Date().toISOString(),
        gasUsed: Math.floor(Math.random() * 21000 + 5000),
      };
      setTxFeed((prev) => [fake, ...prev].slice(0, 8));
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const activePipelines = pipelines.filter((p) => p.status === "active").length;
  const connectedAgents = agents.filter((a) => a.isConnected).length;

  const STATS = [
    { icon: Zap,        label: "Aktif Pipeline",  value: activePipelines || 3,          sub: "+2 bugün",         color: "#6b7fff" },
    { icon: Activity,   label: "Bağlı Ajan",       value: connectedAgents || 6,           sub: `${agents.length} ajandan`, color: "#00e96e" },
    { icon: Wallet,     label: "Toplam Bakiye",    value: `$${totalBalance.toFixed(2)}`,  sub: "4 cüzdanda",       color: "#fda085" },
    { icon: TrendingUp, label: "İşlem Hacmi",      value: `$${(transactions.reduce((s,t)=>s+t.amount,0)).toFixed(2)}`, sub: `${transactions.length} işlem`, color: "#f093fb" },
  ];

  const handleRun = useCallback(() => {
    if (prompt.trim()) router.push(`/pipeline?prompt=${encodeURIComponent(prompt)}`);
  }, [prompt, router]);

  return (
    <>
      <style>{`
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes bounce {
          0%,80%,100% { transform: scale(0); }
          40%          { transform: scale(1.2); }
        }
        @keyframes pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.4; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(30px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes txSlide {
          from { opacity:0; transform:translateX(-20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .fade-up-card { animation: fadeUp 0.6s ease both; }
        .tx-row {
          animation: txSlide 0.4s ease both;
          display:flex; align-items:center; justify-content:space-between;
          padding:12px 0; border-bottom:1px solid #1f2937;
        }
        .tx-row:last-child { border-bottom:none; }
        .glow-input:focus { box-shadow:0 0 0 3px #00e96e30, 0 0 40px #00e96e15; border-color:#00e96e !important; }
        .section-visible { opacity:1 !important; transform:translateY(0) !important; }
        .section-hidden { opacity:0; transform:translateY(40px); transition:opacity 0.7s ease, transform 0.7s ease; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fff" }}>

        {/* ── HERO (dark) ─────────────────────────────────────────── */}
        <section
          ref={heroSection.ref}
          style={{
            background: "#000",
            minHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            padding: "60px 40px",
          }}
        >
          {/* Background glow blobs */}
          <div style={{ position:"absolute", top:"20%", left:"15%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,#6b7fff22,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"20%", right:"15%", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,#00e96e18,transparent 70%)", pointerEvents:"none" }} />

          {/* Floating orbs */}
          <FloatingOrb Icon={Zap}          gradient="linear-gradient(135deg,#6b7fff,#a78bfa)" x="8%"  y="15%" delay={0}    size={52} />
          <FloatingOrb Icon={TrendingUp}   gradient="linear-gradient(135deg,#f6d365,#fda085)" x="85%" y="12%" delay={400}  size={44} />
          <FloatingOrb Icon={BarChart2}    gradient="linear-gradient(135deg,#43e97b,#38f9d7)" x="6%"  y="65%" delay={800}  size={48} />
          <FloatingOrb Icon={MessageCircle}gradient="linear-gradient(135deg,#a18cd1,#fbc2eb)" x="88%" y="60%" delay={600}  size={42} />
          <FloatingOrb Icon={Navigation}   gradient="linear-gradient(135deg,#4facfe,#00f2fe)" x="78%" y="80%" delay={1000} size={38} />
          <FloatingOrb Icon={Cloud}        gradient="linear-gradient(135deg,#84fab0,#8fd3f4)" x="18%" y="82%" delay={200}  size={40} />

          {/* Content */}
          <div style={{ textAlign:"center", maxWidth:680, position:"relative", zIndex:3 }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px",
              borderRadius:20, background:"#111", border:"1px solid #222", marginBottom:24,
            }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#00e96e", animation:"pulse 1.5s ease-in-out infinite", display:"block" }} />
              <span style={{ fontSize:11, color:"#9ca3af", letterSpacing:"0.08em", fontWeight:600 }}>LIVE · {connectedAgents || 6} AJAN AKTIF</span>
            </div>

            <h1 style={{
              fontSize:"clamp(36px,5vw,60px)", fontWeight:800, color:"#fff",
              lineHeight:1.1, marginBottom:16,
              fontFamily:"var(--font-playfair), Georgia, serif",
            }}>
              Agent Orchestration<br />
              <span style={{ background:"linear-gradient(90deg,#6b7fff,#00e96e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Command Center
              </span>
            </h1>
            <p style={{ fontSize:16, color:"#6b7280", marginBottom:40, lineHeight:1.6 }}>
              Doğal dil ile yapay zeka ajanlarınızı yönetin.<br />Blockchain üzerinde anlık ödeme ve şeffaf izleme.
            </p>

            {/* Prompt input */}
            <div style={{ position:"relative", maxWidth:580, margin:"0 auto" }}>
              <div style={{
                background:"#0a0a0a", border:"1.5px solid #222", borderRadius:20,
                padding:"6px 6px 6px 20px",
                display:"flex", alignItems:"center", gap:10,
                transition:"border-color 0.3s, box-shadow 0.3s",
              }}
                className="glow-input-wrap"
              >
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRun()}
                  placeholder="Ajanlarına ne yaptırmak istiyorsun? (Enter ile çalıştır)"
                  style={{
                    flex:1, background:"transparent", border:"none", outline:"none",
                    color:"#fff", fontSize:14, padding:"10px 0",
                    fontFamily:"system-ui,sans-serif",
                  }}
                  className="glow-input"
                />
                <button
                  onClick={handleRun}
                  style={{
                    background: prompt.trim() ? "linear-gradient(135deg,#00e96e,#00c95e)" : "#1a1a1a",
                    border:"none", borderRadius:14, padding:"10px 20px",
                    color: prompt.trim() ? "#000" : "#4b5563",
                    fontSize:13, fontWeight:700, cursor:"pointer",
                    transition:"all 0.3s", display:"flex", alignItems:"center", gap:6,
                    whiteSpace:"nowrap",
                  }}
                >
                  <Zap style={{ width:14, height:14 }} />
                  Çalıştır
                </button>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap", justifyContent:"center" }}>
                {[
                  "📊 Finansal analiz yap",
                  "🌍 Hava durumu raporu al",
                  "💌 E-posta özetle",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPrompt(s.slice(3))}
                    style={{
                      background:"#111", border:"1px solid #222", borderRadius:20,
                      padding:"5px 12px", color:"#9ca3af", fontSize:11,
                      cursor:"pointer", transition:"all 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor="#00e96e"; (e.currentTarget as HTMLButtonElement).style.color="#fff"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor="#222"; (e.currentTarget as HTMLButtonElement).style.color="#9ca3af"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:36 }}>
              <Link href="/pipeline" style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"11px 24px", borderRadius:50,
                background:"white", color:"#000", fontSize:13, fontWeight:700,
                textDecoration:"none", transition:"all 0.2s",
              }}>
                Pipeline Oluştur <ArrowRight style={{width:14,height:14}} />
              </Link>
              <Link href="/marketplace" style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"11px 24px", borderRadius:50,
                background:"transparent", border:"1px solid #333",
                color:"#fff", fontSize:13, fontWeight:600,
                textDecoration:"none",
              }}>
                Marketplace
              </Link>
            </div>
          </div>
        </section>

        {/* ── NETWORK SECTION (white) ──────────────────────────────── */}
        <section
          ref={networkSection.ref}
          className={`section-hidden ${networkSection.visible ? "section-visible" : ""}`}
          style={{ padding:"80px 40px", maxWidth:960, margin:"0 auto" }}
        >
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center", marginBottom:16 }}>
              <div style={{ height:1, width:40, background:"#e5e7eb" }} />
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:"#9ca3af" }}>◆ AJAN AĞI</span>
              <div style={{ height:1, width:40, background:"#e5e7eb" }} />
            </div>
            <h2 style={{ fontSize:32, fontWeight:800, color:"#000", fontFamily:"var(--font-playfair),Georgia,serif", marginBottom:10 }}>
              Gerçek Zamanlı Ajan Ağı
            </h2>
            <p style={{ color:"#6b7280", fontSize:14 }}>
              Ajanlar arası blockchain transferleri canlı animasyonla izlenir
            </p>
          </div>

          <AgentNetwork activeIdx={activeIdx} />

          {/* Legend */}
          <div style={{ display:"flex", gap:24, justifyContent:"center", marginTop:32, flexWrap:"wrap" }}>
            {[
              { color:"#00e96e", label:"Tamamlandı" },
              { color:"#6b7fff", label:"Transfer Aktif" },
              { color:"#e5e7eb", label:"Bekleniyor" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:20, height:2.5, borderRadius:2, background:color }} />
                <span style={{ fontSize:11, color:"#6b7280" }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3D AGENT CARDS ──────────────────────────────────────── */}
        <section style={{ padding:"0 40px 80px", maxWidth:960, margin:"0 auto" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#000", marginBottom:20 }}>Bağlı Ajanlar</h3>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))",
            gap:16,
          }}>
            {VIZ_AGENTS.map((a, i) => {
              const activeConn = CONNECTIONS[activeIdx % CONNECTIONS.length];
              const state = activeConn?.from === i || activeConn?.to === i
                ? "active"
                : i < activeIdx % VIZ_AGENTS.length ? "done" : "idle";
              return (
                <Agent3DCard
                  key={a.id}
                  agent={a}
                  state={state as "active"|"idle"|"done"}
                  delay={i * 80}
                />
              );
            })}
          </div>
        </section>

        {/* ── STATS (light gray) ──────────────────────────────────── */}
        <section
          ref={statsSection.ref}
          style={{ background:"#f9fafb", padding:"72px 40px" }}
        >
          <div style={{ maxWidth:900, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:40 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center", marginBottom:14 }}>
                <div style={{ height:1, width:40, background:"#e5e7eb" }} />
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:"#9ca3af" }}>◆ PLATFORM METRİKLERİ</span>
                <div style={{ height:1, width:40, background:"#e5e7eb" }} />
              </div>
              <h2 style={{ fontSize:30, fontWeight:800, color:"#000", fontFamily:"var(--font-playfair),Georgia,serif" }}>
                Canlı Performans
              </h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16 }}>
              {STATS.map(({ icon: Icon, label, value, sub, color }, i) => (
                <div
                  key={label}
                  className={`section-hidden ${statsSection.visible ? "section-visible" : ""}`}
                  style={{
                    background:"white", borderRadius:20, padding:"24px",
                    border:"1.5px solid #f3f4f6",
                    boxShadow:"0 4px 20px rgba(0,0,0,0.04)",
                    transitionDelay: statsSection.visible ? `${i * 80}ms` : "0ms",
                  }}
                >
                  <div style={{
                    width:40, height:40, borderRadius:12, background:`${color}18`,
                    display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14,
                  }}>
                    <Icon style={{ width:18, height:18, color }} />
                  </div>
                  <p style={{ fontSize:28, fontWeight:800, color:"#000", lineHeight:1, marginBottom:4 }}>{value}</p>
                  <p style={{ fontSize:12, fontWeight:600, color:"#000" }}>{label}</p>
                  <p style={{ fontSize:10, color:"#9ca3af", marginTop:3 }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TX FEED (dark) ───────────────────────────────────────── */}
        <section
          ref={txSection.ref}
          className={`section-hidden ${txSection.visible ? "section-visible" : ""}`}
          style={{ background:"#000", padding:"72px 40px" }}
        >
          <div style={{ maxWidth:820, margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                  <div style={{ height:1, width:30, background:"#222" }} />
                  <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", color:"#4b5563" }}>◆ BLOCKCHAIN KAYITLARI</span>
                </div>
                <h2 style={{ fontSize:28, fontWeight:800, color:"#fff", fontFamily:"var(--font-playfair),Georgia,serif" }}>
                  Canlı Transfer Akışı
                </h2>
              </div>
              <div style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"6px 14px", borderRadius:20, background:"#0d1117", border:"1px solid #1f2937",
              }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#00e96e", animation:"pulse 1.5s ease-in-out infinite" }} />
                <span style={{ fontSize:11, color:"#4b5563", fontWeight:600 }}>CANLI</span>
              </div>
            </div>

            <div style={{ background:"#0a0a0a", borderRadius:20, border:"1px solid #1f2937", padding:"8px 20px" }}>
              {txFeed.map((tx, i) => (
                <TxRow
                  key={tx.id}
                  from={VIZ_AGENTS.find(a => a.id === tx.fromAgentId)?.name ?? tx.fromAgentId}
                  to={VIZ_AGENTS.find(a => a.id === tx.toAgentId)?.name ?? tx.toAgentId}
                  amount={`$${tx.amount.toFixed(3)}`}
                  hash={tx.txHash.slice(0, 18) + "..."}
                  delay={i * 60}
                />
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"center", marginTop:28 }}>
              <Link href="/wallet" style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"11px 28px", borderRadius:50,
                background:"white", color:"#000", fontSize:13, fontWeight:700,
                textDecoration:"none",
              }}>
                Tüm Transferleri Gör <ChevronRight style={{width:14,height:14}} />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
