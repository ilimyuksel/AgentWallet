"use client";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Ayarlar</h1>
        <p className="text-sm text-[#94a3b8] mt-0.5">Profil ve bildirim tercihleri</p>
      </div>

      {/* Profile */}
      <div className="bg-[#131929] rounded-2xl border border-[#1e2d4a] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2d4a]">
          <h2 className="text-sm font-bold text-[#F8FAFC]">Profil</h2>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: "Ad Soyad", value: "Demo User" },
            { label: "E-posta",  value: "demo@agentflow.ai" },
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="text-xs font-semibold text-[#94a3b8] block mb-1.5">{label}</label>
              <input
                defaultValue={value}
                className="w-full bg-[#0f1525] border border-[#1e2d4a] rounded-xl px-3 py-2.5 text-[#F8FAFC] text-sm focus:outline-none focus:border-[#3B82F6] transition-colors"
              />
            </div>
          ))}
          <button
            className="px-6 py-2.5 rounded-full text-white text-sm font-bold transition-all hover:-translate-y-0.5"
            style={{ background: "#10B981" }}
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#131929] rounded-2xl border border-[#1e2d4a] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2d4a]">
          <h2 className="text-sm font-bold text-[#F8FAFC]">Bildirimler</h2>
        </div>
        <div>
          {["Düşük bakiye uyarısı", "Pipeline tamamlandı", "Yeni ajan eklendi", "Haftalık özet"].map((item, i, arr) => (
            <div
              key={item}
              className={`flex items-center justify-between px-5 py-4 ${i < arr.length - 1 ? "border-b border-[#1e2d4a]" : ""}`}
            >
              <span className="text-sm text-[#F8FAFC] font-medium">{item}</span>
              <button className="w-10 h-5 rounded-full relative flex-shrink-0" style={{ background: "#10B981" }}>
                <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Plan */}
      <div className="bg-[#131929] rounded-2xl border border-[#1e2d4a] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2d4a]">
          <h2 className="text-sm font-bold text-[#F8FAFC]">Plan</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: "#1a2440" }}>
            <div>
              <p className="text-sm font-bold text-[#F8FAFC]">Ücretsiz Plan</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">5 pipeline · 10 ajan · 1,000 çağrı/ay</p>
            </div>
            <button
              className="px-5 py-2 rounded-full text-white text-xs font-bold transition-all hover:-translate-y-0.5"
              style={{ background: "#8B5CF6" }}
            >
              Yükselt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
