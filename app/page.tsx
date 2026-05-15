"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Zap } from "lucide-react";

/* ─── Scroll-reveal hook ─────────────────────────────────────────────────── */
function useInView(threshold = 0.1) {
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

/* ─── Section header: big serif title + dashed lines + diamonds ─────────── */
function SectionHeader({
  title, subtitle, dark = false,
}: { title: string; subtitle?: string; dark?: boolean }) {
  const { ref, inView } = useInView(0.05);
  return (
    <div
      ref={ref}
      className="w-full text-center mb-16"
      style={{ opacity: inView ? 1 : 0, transition: "opacity 0.9s ease" }}
    >
      <div className="flex items-center w-full mb-5">
        <div
          className="flex-1 border-t-2 border-dashed"
          style={{ borderColor: dark ? "#333" : "#e0e0e0" }}
        />
        <span className="mx-5 text-sm" style={{ color: dark ? "#555" : "#bbb" }}>◆</span>
        <h2
          className="leading-none font-normal px-2"
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "clamp(4rem, 11vw, 9rem)",
            color: dark ? "#fff" : "#000",
          }}
        >
          {title}
        </h2>
        <span className="mx-5 text-sm" style={{ color: dark ? "#555" : "#bbb" }}>◆</span>
        <div
          className="flex-1 border-t-2 border-dashed"
          style={{ borderColor: dark ? "#333" : "#e0e0e0" }}
        />
      </div>
      {subtitle && (
        <p
          className="text-xl lg:text-2xl"
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            color: dark ? "#aaa" : "#666",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── Organic blob (CSS border-radius trick) ─────────────────────────────── */
function Blob({ gradient, size = 320, rx, rotate = 0 }: {
  gradient: string; size?: number; rx?: string; rotate?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: gradient,
        borderRadius: rx ?? "60% 40% 30% 70% / 60% 30% 70% 40%",
        transform: `rotate(${rotate}deg)`,
        filter: "blur(4px)",
      }}
    />
  );
}

/* ─── Pipeline card (Orchestrate section) ────────────────────────────────── */
function PipelineCard({ gradient, agentName, task, badge, state = "idle" }: {
  gradient: string; agentName: string; task: string; badge?: string;
  state?: "done" | "active" | "idle";
}) {
  return (
    <div
      className="relative bg-white rounded-2xl p-6 w-52 flex-shrink-0"
      style={{
        border:
          state === "active" ? "2px dashed #6b7fff" :
          state === "done"   ? "2px solid #22c55e"   :
                               "2px solid #e5e7eb",
      }}
    >
      {state === "active" && badge && (
        <div
          className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-full text-white text-xs font-semibold"
          style={{ background: "#6b7fff" }}
        >
          {badge}
        </div>
      )}
      {state === "done" && (
        <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className="flex justify-center my-3">
        <div className="w-16 h-16 rounded-2xl" style={{ background: gradient }} />
      </div>
      <p className="text-[11px] text-gray-400 text-center mb-1">{agentName}</p>
      <p className="text-sm font-bold text-black text-center leading-tight">{task}</p>
    </div>
  );
}

/* ─── Connector between pipeline cards ──────────────────────────────────── */
function PipeConnector() {
  return (
    <div className="flex items-center gap-0.5 mx-1 flex-shrink-0">
      <span className="text-gray-300 text-[10px]">◆</span>
      <div className="w-10 border-t border-dashed border-gray-300" />
      <span className="text-gray-300 text-[10px]">◆</span>
    </div>
  );
}

/* ─── Stat card (Track section) ──────────────────────────────────────────── */
function StatCard({ gradient, name, stats, delay = 0 }: {
  gradient: string; name: string; stats: string[]; delay?: number;
}) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className="flex-1 rounded-2xl p-6"
      style={{
        background: "#f0f0f0",
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(20px)",
        transition: `all 0.6s cubic-bezier(.4,0,.2,1) ${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-2xl" style={{ background: gradient }} />
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Active</span>
        </div>
      </div>
      <h3 className="text-base font-bold text-black mb-3">{name}</h3>
      <div className="space-y-1.5">
        {stats.map((s, i) => <p key={i} className="text-sm text-gray-500">{s}</p>)}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="bg-white text-black overflow-x-hidden">

      {/* ── NAV: floating centered pill ── */}
      <nav className="fixed top-4 left-0 right-0 z-50">
        <div className="relative flex items-center justify-center px-8">
          <div className="flex items-center gap-7 rounded-full px-6 h-12" style={{ background: "#ebebeb" }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-black flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-sm text-black">AgentFlow</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
              {["Platform", "Marketplace", "Wallet", "Docs"].map((l) => (
                <a key={l} href="#" className="hover:text-black transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <Link
            href="/dashboard"
            className="absolute right-8 px-5 py-2.5 rounded-full text-white text-sm font-semibold flex items-center gap-1 hover:opacity-90 transition-opacity"
            style={{ background: "#6b7fff" }}
          >
            Demo Aç <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center pt-20 pb-12">
        {/* Big headline */}
        <div className="mb-8">
          <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2 mb-1">
            <span
              className="leading-none font-normal rounded-xl px-4 py-1 text-white"
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: "clamp(3.5rem, 11vw, 9rem)",
                background: "#6b7fff",
              }}
            >
              Ajanlar
            </span>
            <span
              className="leading-none font-normal text-black"
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: "clamp(3.5rem, 11vw, 9rem)",
              }}
            >
              çalışır.
            </span>
          </div>
          <span
            className="leading-none font-normal text-black"
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(3.5rem, 11vw, 9rem)",
            }}
          >
            Para akar.
          </span>
        </div>

        <p
          className="text-2xl font-bold text-black mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Orchestrate · Transfer · Settle
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-md leading-relaxed">
          Yapay zeka ajanları arasındaki finansal altyapı. Her pipeline adımı otomatik ödenir.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/pipeline"
            className="px-8 py-4 rounded-full text-black font-bold text-base transition-transform hover:-translate-y-0.5"
            style={{ background: "#00e96e" }}
          >
            Demo Başlat
          </Link>
          <Link
            href="/marketplace"
            className="px-8 py-4 rounded-full text-white font-bold text-base flex items-center gap-1.5 transition-transform hover:-translate-y-0.5"
            style={{ background: "#6b7fff" }}
          >
            Keşfet <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bottom color stripe */}
        <div className="absolute bottom-0 left-0 right-0 flex h-1">
          <div className="flex-1" style={{ background: "#00e96e" }} />
          <div className="flex-1" style={{ background: "#6b7fff" }} />
          <div className="flex-1 bg-black" />
        </div>
      </section>

      {/* ── ORCHESTRATE ── */}
      <section className="min-h-screen flex flex-col items-center justify-center py-28 px-8">
        <div className="w-full max-w-5xl">
          <SectionHeader title="Orchestrate" subtitle="Pipeline'ını tek cümleyle kur" />
        </div>

        <div className="flex items-center justify-center mb-16 mt-4">
          <PipelineCard
            gradient="linear-gradient(135deg,#f6d365,#fda085)"
            agentName="Borsa Takip"
            task="Fiyat Analizi Yap"
            state="done"
          />
          <PipeConnector />
          <PipelineCard
            gradient="linear-gradient(135deg,#a18cd1,#fbc2eb)"
            agentName="AgentFlow Wallet"
            task="Ödeme Transferi"
            badge="Transfer İşleniyor"
            state="active"
          />
          <PipeConnector />
          <PipelineCard
            gradient="linear-gradient(135deg,#84fab0,#8fd3f4)"
            agentName="Kahve Siparişi"
            task="Sipariş Oluştur"
            state="idle"
          />
        </div>

        <Link
          href="/pipeline"
          className="px-8 py-4 rounded-full text-black font-bold text-base transition-transform hover:-translate-y-0.5"
          style={{ background: "#00e96e" }}
        >
          Pipeline Dene
        </Link>
      </section>

      {/* ── TRANSFER — with organic blobs ── */}
      <section className="min-h-screen relative flex flex-col items-center justify-center py-28 px-8 overflow-hidden">
        {/* Left blob */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 pointer-events-none">
          <Blob
            gradient="linear-gradient(135deg,#4facfe 0%,#00f2fe 45%,#00e96e 100%)"
            size={360}
            rx="40% 60% 70% 30% / 40% 50% 60% 50%"
          />
        </div>
        {/* Right blob */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 pointer-events-none">
          <Blob
            gradient="linear-gradient(135deg,#6b7fff 0%,#b47fff 55%,#00e96e 100%)"
            size={300}
            rx="30% 70% 40% 60% / 50% 40% 60% 40%"
            rotate={50}
          />
        </div>

        <div className="w-full max-w-5xl">
          <SectionHeader title="Transfer" subtitle="Otomatik on-chain settlement" />
        </div>

        {/* Wallet card */}
        <div className="relative z-10 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold">AF</div>
            <div>
              <p className="text-sm font-bold">AgentFlow Wallet</p>
              <p className="text-xs font-semibold" style={{ color: "#6b7fff" }}>$AGT</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">Borsa ajanı $100 kar eşiğini geçti. Ödeme başlatıldı.</p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-3">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm font-medium">Borsa → Kahve</span>
              <span className="text-sm font-bold" style={{ color: "#6b7fff" }}>$4.80</span>
            </div>
            <p className="text-[11px] font-mono text-gray-400">0xabc...f91c · blok #18,241,093</p>
          </div>
          <div className="flex justify-between items-center bg-gray-50 rounded-2xl px-4 py-3">
            <span className="text-sm text-gray-400">Sonraki tetik:</span>
            <span className="text-sm font-bold" style={{ color: "#6b7fff" }}>11s 44m 6s</span>
          </div>
        </div>

        <Link
          href="/wallet"
          className="relative z-10 mt-10 px-8 py-4 rounded-full text-white font-bold text-base flex items-center gap-1.5 transition-transform hover:-translate-y-0.5"
          style={{ background: "#6b7fff" }}
        >
          Wallet Görüntüle <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── TRACK ── */}
      <section className="min-h-screen flex flex-col items-center justify-center py-28 px-8">
        <div className="w-full max-w-5xl">
          <SectionHeader title="Track" subtitle="Tüm ajanlarınızın canlı durumu" />
        </div>

        <div className="flex gap-5 w-full max-w-4xl mb-14">
          <StatCard
            gradient="linear-gradient(135deg,#f6d365,#fda085)"
            name="Borsa Takip Ajanı"
            stats={["$12.5K işlendi", "847 fiyat takibi", "94% başarı", "12 aktif pipeline"]}
          />
          <StatCard
            gradient="linear-gradient(135deg,#a18cd1,#fbc2eb)"
            name="Ödeme Ajanı"
            stats={["$28.4K transfer", "1,247 işlem", "~2s blok onayı", "99.9% uptime"]}
            delay={120}
          />
          <StatCard
            gradient="linear-gradient(135deg,#43e97b,#38f9d7)"
            name="Bildirim Ajanı"
            stats={["3,420 bildirim", "0 başarısız", "12 kanal aktif", "Anlık teslimat"]}
            delay={240}
          />
        </div>

        <Link
          href="/dashboard"
          className="px-8 py-4 rounded-full bg-black text-white font-bold text-base transition-transform hover:-translate-y-0.5"
        >
          Dashboard&apos;a Git
        </Link>
      </section>

      {/* ── DARK SHOWCASE ── */}
      <section className="bg-black text-white min-h-screen flex flex-col items-center justify-center py-28 px-8">
        <h2
          className="text-5xl lg:text-7xl font-normal text-white text-center mb-16"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          AgentFlow&apos;da Çalışan Pipeline&apos;lar
        </h2>

        <div className="flex gap-5 justify-center flex-wrap mb-14">
          {[
            { name: "Borsa + Kahve",    desc: "Kar → Otomatik sipariş",   bg: "#111" },
            { name: "E-posta Otomasyon", desc: "Gelen kutusu → Aksiyon",  bg: "#0f0f2e" },
            { name: "Hava + Takvim",    desc: "Durum → Etkinlik iptali",  bg: "#0a150a" },
            { name: "Kripto Arbitraj",  desc: "Fiyat farkı → Trade",      bg: "#1a0a0a" },
          ].map((p, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 w-52 flex-shrink-0"
              style={{ background: "#1c1c1c" }}
            >
              <div
                className="w-20 h-20 rounded-2xl mb-4 mx-auto flex items-center justify-center"
                style={{ background: p.bg }}
              >
                <Zap className="w-8 h-8 text-white opacity-50" />
              </div>
              <p className="text-white font-semibold text-center text-sm">{p.name}</p>
              <p className="text-gray-500 text-xs text-center mt-1">{p.desc}</p>
            </div>
          ))}
        </div>

        <Link
          href="/pipeline"
          className="px-8 py-4 rounded-full text-black font-bold text-base transition-transform hover:-translate-y-0.5"
          style={{ background: "#00e96e" }}
        >
          Kendi Pipeline&apos;ını Kur
        </Link>
      </section>

      {/* ── ENTERPRISE — dark + green blob bg ── */}
      <section className="bg-black text-white min-h-screen relative flex flex-col items-center justify-center py-28 px-8 text-center overflow-hidden">
        {/* Green/teal ambient glow */}
        <div
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{
            width: 700, height: 550,
            background: "radial-gradient(ellipse at bottom right, #00e96e 0%, #4facfe 35%, transparent 65%)",
            filter: "blur(90px)",
            opacity: 0.45,
          }}
        />

        <h2
          className="relative z-10 text-5xl lg:text-7xl font-normal text-white mb-8 max-w-3xl"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Ajanlar Arası <br />
          <strong className="font-bold">Finansal Altyapı</strong>
        </h2>
        <p className="relative z-10 text-xl text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed">
          Sadece bir orkestratör değil — ajanlar arasındaki her finansal hareketi yöneten settlement katmanıyız.
          On-chain şeffaflık, mikro ödeme optimizasyonu, anlık otomasyon.
        </p>
        <Link
          href="/dashboard"
          className="relative z-10 px-8 py-4 rounded-full text-black font-bold text-base transition-transform hover:-translate-y-0.5"
          style={{ background: "#00e96e" }}
        >
          Demo Dene
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black border-t border-gray-800 py-8 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-white font-bold text-sm">AgentFlow</span>
          </div>
          <p className="text-gray-600 text-xs">MVP Demo · Mayıs 2025 · Tüm veriler simüle edilmiştir</p>
          <div className="flex gap-6 text-xs text-gray-600">
            {["Gizlilik", "Şartlar", "İletişim"].map((l) => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* Bottom color bar */}
      <div className="h-1 flex">
        <div className="flex-1" style={{ background: "#00e96e" }} />
        <div className="flex-1" style={{ background: "#6b7fff" }} />
        <div className="flex-1 bg-black" />
      </div>

      <style jsx global>{`
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
