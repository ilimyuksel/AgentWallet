# AgentFlow — AI Agent Orchestration & Wallet Platform

AgentFlow, yapay zeka ajanları arasındaki finansal altyapıdır. Orchestrator Engine her ajanı doğal dil ile tetikler; wallet sistemi ödemeleri otomatik olarak on-chain'e yazar.

> **MVP Demo** — Tüm veriler simüle edilmiştir. Gerçek API entegrasyonu içermez.

---

## Ekran Görüntüleri

### Dashboard — Hero (Karanlık Komut Merkezi)
![Dashboard Hero](public/screenshots/dashboard.png)

### Dashboard — Gerçek Zamanlı Ajan Ağı (SVG + Blockchain Animasyonu)
![Dashboard Network](public/screenshots/dashboard_network.png)

### Dashboard — Platform Metrikleri & Canlı Transfer Akışı
![Dashboard Metrics](public/screenshots/dashboard_metrics.png)

### Pipeline — Çalışma Sonucu (Ajan Akışı + Log + Zincir Transferleri)
![Pipeline Done](public/screenshots/pipeline.png)

### Pipeline — Çalışma Sırasında (RUNNING durumu)
![Pipeline Running](public/screenshots/pipeline_running.png)

### Agent Marketplace
![Marketplace](public/screenshots/marketplace.png)

### Agent Wallet
![Wallet](public/screenshots/wallet.png)

### Ayarlar
![Settings](public/screenshots/settings.png)

---

## Özellikler

- **Orchestrator Engine** — Doğal dil prompt'ından intent çıkarır, marketplace'den en uygun ajanları seçer ve pipeline'ı kurar
- **Agent Wallet** — Her ajanın kendi on-chain cüzdanı; bakiyeler ve transferler gerçek zamanlı izlenir
- **Otomatik Settlement** — Orchestrator bir adımı onayladığında ödeme milisaniyeler içinde bir sonraki ajana aktarılır
- **Pipeline Görselleştirme** — React Flow canvas ile canlı ajan akışı
- **Blockchain Şeffaflığı** — Tx hash, blok numarası, gas maliyeti — değiştirilemez kayıt
- **AGT Token** — Mikro ödeme optimizasyonu için native token desteği

---

## Teknik Yığın

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 14 (App Router) |
| Dil | TypeScript |
| Stil | Tailwind CSS |
| Bileşenler | shadcn/ui |
| State | Zustand (localStorage persist) |
| Pipeline Canvas | SVG + CSS Animations |
| İkonlar | Lucide React |
| Fontlar | Geist Sans + Playfair Display |

---

## Kurulum

```bash
git clone https://github.com/ilimyuksel/AgentWallet.git
cd AgentWallet
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini aç.

---

## Proje Yapısı

```
agentflow/
├── app/
│   ├── page.tsx                  # Landing page
│   └── (app)/
│       ├── dashboard/page.tsx    # Dashboard
│       ├── marketplace/page.tsx  # Agent Marketplace
│       ├── pipeline/page.tsx     # Pipeline oluşturucu
│       ├── wallet/page.tsx       # Agent Wallet
│       └── settings/page.tsx     # Ayarlar
├── components/
│   └── layout/AppShell.tsx       # Sticky top nav bar
├── lib/
│   ├── store.ts                  # Zustand store
│   ├── orchestrator.ts           # Pipeline simülatörü
│   └── utils.ts
├── data/
│   └── mock.ts                   # Mock ajan ve transaction verisi
└── types/
    └── index.ts                  # TypeScript tipleri
```

---

## Sayfa Açıklamaları

### Landing (`/`)
OpenServ tarzında editorial tasarım. Serif display başlıklar, dashed bölüm ayırıcılar ve organic blob görsellerle AgentFlow'un değer önerisini anlatır.

### Dashboard (`/dashboard`)
Karanlık hero bölümü, 6 floating ajan orb'u ve glowing prompt input. Scroll ile SVG ajan ağı (animasyonlu blockchain transferleri), 3D ajan kartları, platform metrikleri ve canlı transfer akışı açılır.

### Marketplace (`/marketplace`)
8 mock ajan; kategori filtresi ve arama ile listelenir. Lucide ikon haritası, gradient kartlar ve altta "daha fazla ajan var" silikleşme efekti.

### Pipeline (`/pipeline`)
Doğal dil promptu → orchestrator keyword matching → ajan seçimi → CSS animasyonlu ajan akış diyagramı → akıllı log paneli (sayfayı kaydırmaz) → on-chain transfer kartları.

### Wallet (`/wallet`)
Tüm ajan cüzdanları, bakiye progress barları, düşük bakiye uyarısı. Fon ekleme modal'ı ve full transfer geçmişi tablosu.

### Ayarlar (`/settings`)
Profil bilgileri, bildirim toggle'ları ve plan bilgisi.

---

## Lisans

MIT
