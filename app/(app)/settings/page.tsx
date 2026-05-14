"use client";

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div className="pb-4 border-b border-[#d0d7de]">
        <h1 className="text-xl font-semibold text-[#1f2328]">Ayarlar</h1>
        <p className="text-sm text-[#656d76] mt-0.5">Profil ve bildirim tercihleri</p>
      </div>

      <div className="bg-white border border-[#d0d7de] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[#d0d7de] bg-[#f6f8fa]">
          <h2 className="text-sm font-semibold text-[#1f2328]">Profil</h2>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: "Ad Soyad", value: "Demo User" },
            { label: "E-posta",  value: "demo@agentflow.ai" },
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="text-xs text-[#656d76] font-medium block mb-1.5">{label}</label>
              <input
                defaultValue={value}
                className="w-full bg-white border border-[#d0d7de] rounded-lg px-3 py-2 text-[#1f2328] text-sm focus:outline-none focus:border-violet-400 transition-colors"
              />
            </div>
          ))}
          <button className="px-4 py-2 bg-[#1f2328] hover:bg-[#2d333a] text-white rounded-lg text-sm font-medium transition-colors">
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#d0d7de] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[#d0d7de] bg-[#f6f8fa]">
          <h2 className="text-sm font-semibold text-[#1f2328]">Bildirimler</h2>
        </div>
        <div className="p-2">
          {["Düşük bakiye uyarısı", "Pipeline tamamlandı", "Yeni ajan eklendi", "Haftalık özet"].map((item, i, arr) => (
            <div key={item} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? "border-b border-[#d0d7de]" : ""}`}>
              <span className="text-sm text-[#1f2328]">{item}</span>
              <button className="w-10 h-5 rounded-full bg-violet-600 relative flex-shrink-0">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#d0d7de] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[#d0d7de] bg-[#f6f8fa]">
          <h2 className="text-sm font-semibold text-[#1f2328]">Plan</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between p-4 rounded-lg bg-violet-50 border border-violet-200">
            <div>
              <p className="text-sm text-[#1f2328] font-semibold">Ücretsiz Plan</p>
              <p className="text-xs text-[#656d76] mt-0.5">5 pipeline · 10 ajan · 1,000 çağrı/ay</p>
            </div>
            <button className="text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium">
              Yükselt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
