"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Zap, Layers, Wallet, ArrowLeftRight,
  Shield, Activity, GitBranch, Bell,
} from "lucide-react";

/* ─────────────────────────────────
   Hooks
───────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}


/* ─────────────────────────────────
   Wave Discs — the hero visual
───────────────────────────────── */
function WaveDiscs({ scale = 1 }: { scale?: number }) {
  const rafRef = useRef<number>(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let f = 0;
    const run = () => { f++; setTick(f); rafRef.current = requestAnimationFrame(run); };
    rafRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const count = 28;

  return (
    <div
      style={{
        perspective: "1100px",
        perspectiveOrigin: "50% 55%",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          gap: `${11 * scale}px`,
          transform: "rotateX(18deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {Array.from({ length: count }, (_, i) => {
          const t    = i / (count - 1);
          const ph   = tick * 0.02 + i * 0.36;
          const yOff = Math.sin(ph) * 32 * scale;

          /* height: tall in the centre of the group */
          const baseH = (30 + Math.sin(t * Math.PI) * 90) * scale;
          const h     = baseH + Math.sin(ph + 1.1) * 9 * scale;

          /* width: wide enough to look like a coin when rotated */
          const baseW = (16 + Math.sin(t * Math.PI) * 16) * scale;
          const w     = baseW + Math.sin(ph + 0.6) * 2 * scale;

          /* colour: deep blue → violet → rose → blue */
          const hue  = 232 + t * 108;
          const sat  = 72 + Math.sin(t * Math.PI) * 16;
          const lit  = 55 + Math.sin(ph) * 9;

          /* individual tilt so they look like side-on coins */
          const rotY = -58 + t * 28;

          /* glow scales with size */
          const glowR = (18 + Math.sin(ph) * 7) * scale;

          return (
            <div
              key={i}
              style={{
                width:        `${w}px`,
                height:       `${h}px`,
                borderRadius: "50%",
                flexShrink:   0,
                background:   `linear-gradient(180deg,
                  hsl(${hue},${sat}%,${lit + 26}%) 0%,
                  hsl(${hue + 10},${sat + 4}%,${lit + 4}) 40%,
                  hsl(${hue - 5},${sat - 3}%,${lit - 22}%) 100%)`,
                boxShadow: `
                  0 0 ${glowR}px hsl(${hue},${sat}%,${lit}%,0.7),
                  0 0 ${glowR * 2}px hsl(${hue},${sat}%,${lit}%,0.25),
                  inset 0 1px 0 rgba(255,255,255,0.18)`,
                transform: `translateY(${yOff}px) rotateY(${rotY}deg)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────
   Scroll-driven "How it works"
───────────────────────────────── */
/* ── inline dark card style (guaranteed, no Tailwind purge risk) ── */
const CARD = {
  background: "#0d0d1f",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "16px",
  padding: "24px",
} as const;

const CARD_ROW = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "12px",
  padding: "12px",
} as const;

const STEPS = [
  {
    num: "01",
    title: "Bir cümle yazın",
    body: "Ne yapmak istediğinizi doğal dille ifade edin. Kod yazmak, API bağlamak, altyapı kurmak gerekmez.",
    visual: (
      <div style={CARD} className="space-y-4">
        <p style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>Prompt</p>
        <div style={{ ...CARD_ROW, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Zap style={{ width: 16, height: 16, color: "#818cf8", marginTop: 2, flexShrink: 0 }} />
          <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.6 }}>
            Borsadan $100 kar ettiğimde bana kahve siparişi ver ve Slack&apos;e bildir
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 12, color: "#64748b" }}>Orchestrator analiz ediyor...</span>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    title: "Ajanlar seçilir ve bağlanır",
    body: "Orchestrator, intent'i analiz ederek marketplace'den en uygun ajanları otomatik seçer ve pipeline'ı kurar.",
    visual: (
      <div style={{ ...CARD, padding: "20px" }} className="space-y-2">
        {[
          { label: "Borsa Takip",    status: "Tetikleyici", color: "#3b82f6" },
          { label: "Kahve Siparişi", status: "Aksiyon",     color: "#8b5cf6" },
          { label: "Slack Bildirim", status: "Çıktı",       color: "#10b981" },
        ].map((a, i) => (
          <div key={i} style={{ ...CARD_ROW, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `${a.color}20`, border: `1px solid ${a.color}35`, flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color }} />
            </div>
            <p style={{ flex: 1, fontSize: 12, fontWeight: 500, color: "#fff" }}>{a.label}</p>
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: `${a.color}20`, color: a.color }}>
              {a.status}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 16, padding: "4px 8px 0" }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(99,102,241,0.4), rgba(168,85,247,0.4))", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.55)", animation: `slideRight ${1.5 + i * 0.3}s linear infinite` }} />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "03",
    title: "Ödemeler otomatik gerçekleşir",
    body: "Her ajan kendi on-chain cüzdanına sahip. Orchestrator bir adım tamamlandığında ödeme otomatik olarak bir sonraki ajana aktarılır.",
    visual: (
      <div style={{ ...CARD, padding: "20px" }} className="space-y-3">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.1em", fontWeight: 600 }}>Transfer Logu</span>
          <span style={{ fontSize: 10, color: "#34d399", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
            Onaylandı
          </span>
        </div>
        {[
          { from: "Borsa Ajanı", to: "Kahve Ajanı", amount: "$4.80", hash: "0xabc...f91c" },
          { from: "Kahve Ajanı", to: "Slack Ajanı",  amount: "$0.00", hash: "0xdef...a23f" },
        ].map((tx, i) => (
          <div key={i} style={CARD_ROW}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{tx.from} → {tx.to}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#818cf8" }}>{tx.amount}</span>
            </div>
            <p style={{ fontSize: 10, fontFamily: "monospace", color: "#475569" }}>{tx.hash}</p>
          </div>
        ))}
      </div>
    ),
  },
];

function StepRow({ step, index }: { step: (typeof STEPS)[0]; index: number }) {
  const { ref, inView } = useInView(0.15);
  const flip = index % 2 !== 0;
  return (
    <div
      ref={ref}
      className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(32px)",
        transition: "all 0.7s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <div className={`space-y-5 ${flip ? "lg:order-2" : ""}`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
          <span className="text-indigo-600 text-xs font-bold tracking-widest">{step.num}</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-black text-[#0a0a1a] leading-tight">{step.title}</h2>
        <p className="text-slate-500 text-lg leading-relaxed">{step.body}</p>
      </div>
      <div className={flip ? "lg:order-1" : ""}>{step.visual}</div>
    </div>
  );
}

function ScrollStory() {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-20">
          <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">Nasıl Çalışır?</p>
          <h2 className="text-3xl lg:text-4xl font-black text-[#0a0a1a] mb-4">Üç adımda tam otomasyon</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">Bir cümle yazın, gerisini AgentFlow halleder.</p>
        </div>
        <div className="space-y-24">
          {STEPS.map((step, i) => <StepRow key={i} step={step} index={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────
   Wallet Flow Diagram
───────────────────────────────── */
function WalletDiagram() {
  const { ref, inView } = useInView(0.1);

  const nodes = [
    { label: "Kullanıcı", sub: "Fon ekler", color: "#64748b", icon: null },
    { label: "Borsa Ajanı", sub: "$12.50 bakiye", color: "#3b82f6", icon: <Activity className="w-4 h-4" /> },
    { label: "AgentFlow\nWallet", sub: "Köprü — Settlement katmanı", color: "#4338ca", icon: <Wallet className="w-5 h-5" />, highlight: true },
    { label: "Kahve Ajanı", sub: "$8.20 bakiye", color: "#8b5cf6", icon: <GitBranch className="w-4 h-4" /> },
    { label: "Dış Servis", sub: "Sipariş verildi", color: "#10b981", icon: null },
  ];

  return (
    <div ref={ref} className="overflow-x-auto">
      <div className="flex items-center justify-center gap-0 min-w-max mx-auto px-4">
        {nodes.map((n, i) => (
          <div key={i} className="flex items-center">
            <div
              className="flex flex-col items-center gap-2"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.6s cubic-bezier(.4,0,.2,1) ${i * 120}ms`,
              }}
            >
              <div
                className="flex flex-col items-center justify-center rounded-2xl p-4 text-center"
                style={{
                  width: n.highlight ? 120 : 100,
                  height: n.highlight ? 120 : 100,
                  background: n.highlight
                    ? `linear-gradient(135deg, ${n.color}18, ${n.color}08)`
                    : `${n.color}10`,
                  border: `${n.highlight ? 2 : 1}px solid ${n.color}${n.highlight ? "40" : "20"}`,
                  boxShadow: n.highlight ? `0 0 32px ${n.color}15` : "none",
                  transform: n.highlight ? "scale(1.08)" : "scale(1)",
                }}
              >
                {n.icon && <div style={{ color: n.color }} className="mb-1">{n.icon}</div>}
                <p className="text-xs font-bold text-[#0a0a1a] leading-tight whitespace-pre-line">{n.label}</p>
              </div>
              <p className="text-[10px] text-slate-400 text-center max-w-[90px] leading-tight">{n.sub}</p>
            </div>

            {i < nodes.length - 1 && (
              <div
                className="flex flex-col items-center mx-2"
                style={{
                  opacity: inView ? 1 : 0,
                  transition: `opacity 0.6s ease ${(i + 0.5) * 120}ms`,
                }}
              >
                <div className="flex items-center gap-1">
                  <div className="w-8 h-px bg-gradient-to-r from-slate-200 to-slate-300" />
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
                <span className="text-[9px] text-slate-400 mt-1 whitespace-nowrap">
                  {i === 0 ? "fon ekler" : i === 1 ? "tetikler" : i === 2 ? "$4.80" : "sipariş"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────
   Stat counter
───────────────────────────────── */
function StatCounter({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const { ref, inView } = useInView();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let c = 0;
    const step = target / 55;
    const id = setInterval(() => {
      c += step;
      if (c >= target) { setCount(target); clearInterval(id); }
      else setCount(Math.floor(c));
    }, 16);
    return () => clearInterval(id);
  }, [inView, target]);
  return (
    <div ref={ref} className="text-center py-2">
      <p className="text-5xl font-black text-[#0a0a1a] tabular-nums">
        {count.toLocaleString("tr-TR")}<span className="text-indigo-600">{suffix}</span>
      </p>
      <p className="text-slate-500 text-sm mt-2 font-medium">{label}</p>
    </div>
  );
}

/* ─────────────────────────────────
   Feature card
───────────────────────────────── */
const FEATURES = [
  { icon: Zap,            title: "Orchestrator Engine",   desc: "Doğal dil prompt'ından intent çıkarır. Marketplace'den semantik aramayla en uygun ajan kombinasyonunu seçer.", tag: "AI" },
  { icon: Wallet,         title: "Agent Wallet",          desc: "Her ajanın kendi on-chain cüzdanı vardır. Tüm bakiyeler ve transferler gerçek zamanlı izlenebilir.", tag: "On-Chain" },
  { icon: ArrowLeftRight, title: "Otomatik Settlement",   desc: "Orchestrator bir adımı onayladığında ödeme milisaniyeler içinde bir sonraki ajana aktarılır. İnsan müdahalesi yok.", tag: "Instant" },
  { icon: GitBranch,      title: "Pipeline Görselleştirme", desc: "Ajan akışını canlı olarak izleyin. Hangi adımda, hangi ajan çalışıyor, ne kadar harcandı — anlık.", tag: "Live" },
  { icon: Shield,         title: "Blockchain Şeffaflığı", desc: "Her transfer zincire yazılır. Tx hash, blok numarası, gas maliyeti. Değiştirilemez kayıt.", tag: "Transparent" },
  { icon: Bell,           title: "Akıllı Uyarılar",       desc: "Düşük bakiye, başarısız pipeline, eşik aşımı gibi kritik olaylar için anlık bildirimler.", tag: "Smart" },
];

function FeatureCard({ feature, delay }: { feature: (typeof FEATURES)[0]; delay: number }) {
  const { ref, inView } = useInView(0.05);
  const Icon = feature.icon;
  return (
    <div
      ref={ref}
      className="p-6 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-lg transition-all duration-300 cursor-default group"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `all 0.6s cubic-bezier(.4,0,.2,1) ${delay}ms`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
          {feature.tag}
        </span>
      </div>
      <h3 className="text-base font-bold text-[#0a0a1a] mb-2">{feature.title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
    </div>
  );
}

/* ─────────────────────────────────
   Page
───────────────────────────────── */
export default function LandingPage() {
  const { ref: h2Ref, inView: h2InView } = useInView(0.1);
  const { ref: walletRef, inView: walletInView } = useInView(0.05);
  const { ref: featRef, inView: featInView } = useInView(0.05);
  const { ref: statsRef, inView: statsInView } = useInView(0.1);
  const { ref: ctaRef, inView: ctaInView } = useInView(0.1);

  return (
    <div className="bg-white text-[#0a0a1a] overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-[#0a0a1a]">AgentFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm text-slate-500">
            {["Platform", "Marketplace", "Wallet", "Docs"].map((l) => (
              <a key={l} href="#" className="hover:text-[#0a0a1a] transition-colors font-medium">{l}</a>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col pt-16 overflow-hidden">
        {/* subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#4338ca 1px, transparent 1px), linear-gradient(90deg, #4338ca 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* top content */}
        <div className="relative z-10 max-w-4xl mx-auto px-8 pt-28 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            MVP Demo — Mayıs 2025
          </div>

          <h1 className="text-6xl lg:text-8xl font-black leading-[1.0] tracking-tight text-[#0a0a1a] mb-6">
            Ajanlar çalışır.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600">
              Para akar.
            </span>
          </h1>

          <p className="text-slate-500 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            AgentFlow, yapay zeka ajanları arasındaki <strong className="text-[#1e3a5f] font-semibold">finansal altyapıdır.</strong>{" "}
            Orchestrator Engine her ajanı doğru anda tetikler, wallet sistemi ödemeleri otomatik olarak zincire yazar.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/pipeline"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              Demo&apos;yu Dene <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-50 hover:bg-slate-100 text-[#0a0a1a] border border-slate-200 rounded-2xl font-bold text-base transition-all hover:-translate-y-0.5"
            >
              Ajanları Keşfet
            </Link>
          </div>
        </div>

        {/* WAVE band — dark section */}
        <div className="relative bg-[#07071a] py-16 overflow-hidden">
          {/* left glow */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.25), transparent)" }} />
          {/* right glow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2), transparent)" }} />

          <WaveDiscs scale={1.1} />

          {/* stats row */}
          <div className="flex items-center justify-center gap-10 mt-12">
            {[
              { val: "1,247", label: "Çalıştırılan Pipeline" },
              { val: "$28.4K", label: "İşlenen Hacim" },
              { val: "~2s", label: "Blok Onay Süresi" },
              { val: "94%", label: "Başarı Oranı" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM / VALUE PROP ── */}
      <section
        ref={h2Ref}
        className="py-28 px-8 max-w-4xl mx-auto text-center"
        style={{
          opacity: h2InView ? 1 : 0,
          transform: h2InView ? "none" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-4">Neden AgentFlow?</p>
        <h2 className="text-4xl lg:text-5xl font-black text-[#0a0a1a] leading-tight mb-7">
          Ajanlar güçlüdür.<br />
          <span className="text-[#1e3a5f]">Ama birbirlerine para gönderemezler.</span>
        </h2>
        <p className="text-slate-500 text-xl leading-relaxed max-w-2xl mx-auto">
          Bugün farklı yapay zeka araçlarını birleştirmek teknik bilgi, özel API entegrasyonları ve ayrı ödeme altyapısı gerektirir.
          AgentFlow bu üçünü tek platformda çözer — ve<strong className="text-[#0a0a1a]"> ajanlar arasındaki finansal katman olarak</strong> her pipeline'ın merkezinde yer alır.
        </p>
      </section>

      {/* ── SCROLL STORY ── */}
      <ScrollStory />

      {/* ── WALLET DIAGRAM ── */}
      <section
        ref={walletRef}
        className="py-24 bg-slate-50 border-y border-slate-100"
        style={{
          opacity: walletInView ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}
      >
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">Mimari</p>
            <h2 className="text-3xl lg:text-4xl font-black text-[#0a0a1a] mb-4">
              AgentFlow: Aradaki Cüzdan
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
              Biz sadece bir orkestratör değiliz. Ajanlar arasındaki her finansal hareketi yöneten <strong className="text-[#1e3a5f]">settlement katmanıyız.</strong>
            </p>
          </div>
          <WalletDiagram />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { title: "On-Chain Şeffaflık", body: "Her transfer blockchain'e yazılır. Tx hash, blok, gas — değiştirilemez kayıt." },
              { title: "Mikro Ödeme Optimizasyonu", body: "AGT token ile $0.001'den başlayan transferler. Geleneksel sistemlerin yapamadığı." },
              { title: "Otomatik Settlement", body: "İnsan müdahalesi yok. Orchestrator tetikler, wallet öder, ajan çalışır." },
            ].map(({ title, body }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <p className="font-bold text-[#0a0a1a] mb-2">{title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-8 max-w-6xl mx-auto">
        <div
          ref={featRef}
          className="text-center mb-14"
          style={{ opacity: featInView ? 1 : 0, transform: featInView ? "none" : "translateY(20px)", transition: "all 0.7s ease" }}
        >
          <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">Platform</p>
          <h2 className="text-3xl lg:text-4xl font-black text-[#0a0a1a] mb-4">Her şey dahil</h2>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">Agent orchestration ve finansal settlement için ihtiyacınız olan her araç.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => <FeatureCard key={f.title} feature={f} delay={i * 70} />)}
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} className="py-20 border-y border-slate-100 bg-slate-50">
        <div
          className="max-w-4xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-10"
          style={{ opacity: statsInView ? 1 : 0, transition: "opacity 0.8s ease" }}
        >
          <StatCounter target={8}    suffix="+" label="Hazır Ajan" />
          <StatCounter target={1247}       label="Toplam Çalıştırma" />
          <StatCounter target={94}   suffix="%" label="Başarı Oranı" />
          <StatCounter target={2}          label="Sn. Blok Onayı" />
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        ref={ctaRef}
        className="py-32 px-8 text-center"
        style={{
          opacity: ctaInView ? 1 : 0,
          transform: ctaInView ? "none" : "translateY(24px)",
          transition: "all 0.8s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-4">Başlayın</p>
          <h2 className="text-4xl lg:text-5xl font-black text-[#0a0a1a] leading-tight mb-5">
            Geleceğin iş dünyası<br />
            <span className="text-[#1e3a5f]">ajanlarla yönetilir.</span>
          </h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            AgentFlow bu geleceğin finansal altyapısıdır.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-9 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5"
            >
              Dashboard&apos;a Git
            </Link>
            <Link
              href="/pipeline"
              className="px-9 py-4 bg-slate-50 hover:bg-slate-100 text-[#0a0a1a] border border-slate-200 rounded-2xl font-bold text-base transition-all hover:-translate-y-0.5"
            >
              Pipeline Dene
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 py-8 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-slate-600 text-sm font-semibold">AgentFlow</span>
          </div>
          <p className="text-slate-400 text-xs">MVP Demo · Mayıs 2025 · Tüm veriler simüle edilmiştir</p>
          <div className="flex gap-6 text-xs text-slate-400">
            {["Gizlilik", "Şartlar", "İletişim"].map((l) => (
              <a key={l} href="#" className="hover:text-slate-600 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
