# 🚴 Bike Haus Freiburg — 5 Aşamalı SEO Optimizasyon Planı

> **Hedef:** "fahrradladen freiburg", "fahrrad kaufen freiburg", "bike freiburg" gibi aramalarda Google'da 1. sırada yer almak + AI aramalarında (ChatGPT, Gemini, Perplexity, Bing Copilot) öne çıkmak.

---

## Mevcut Durum Analizi

### ✅ Zaten Yapılmış Olanlar (Güçlü Temel)

- SSR altyapısı (Angular Universal + `server.ts`)
- Meta tags (title, description, keywords, OG, Twitter)
- Schema.org (BikeStore, FAQ, BreadcrumbList, WebSite, Organization)
- Geo meta tags (lokal SEO için)
- Sitemap.xml + robots.txt
- hreflang (de, fr, tr)
- Product Schema dinamik olarak ürün detay sayfalarında
- HTTPS + security headers
- Gzip compression + caching
- Noscript fallback

### ❌ Kritik Eksiklikler

1. **Nginx SSR kullanmıyor** — Statik dosya sunuyor, Node.js SSR proxy yok
2. **Dinamik sitemap yok** — Ürün sayfaları (showroom/:id) sitemap'te yok
3. **Blog/içerik yok** — Bilgilendirici arama trafiği sıfır
4. **Google Business Profile bağlantısı yok** — `sameAs` boş
5. **AI aramaları için özel yapı yok** — llms.txt, AI-friendly content yok
6. **Ürün review/rating verisi eksik**
7. **İç link stratejisi yok**
8. **Anlık indexleme yok** (IndexNow/Google Indexing API)

---

## AŞAMA 1: Kritik Teknik SEO Düzeltmeleri (Hemen Yapılacak)

### 1.1 — Nginx'i SSR Proxy'ye Çevir ⚠️ KRİTİK

**Neden:** Şu an nginx statik HTML sunuyor. Google ve AI botları JavaScript render edemez,
SSR olmadan içerik boş görünür.

**nginx.conf değişikliği:**

```nginx
# ÖNCE (Şu anki durum — YANLIŞ):
server {
    server_name bikehausfreiburg.com;
    root /usr/share/nginx/html/homepage;
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# SONRA (SSR Proxy — DOĞRU):
upstream homepage_ssr {
    server homepage:4000;  # Node.js SSR server
}

server {
    server_name bikehausfreiburg.com;

    # Statik dosyalar direkt nginx'ten
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp|avif)$ {
        root /usr/share/nginx/html/homepage/browser;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Sitemap & robots direkt
    location = /sitemap.xml { root /usr/share/nginx/html/homepage/browser; }
    location = /robots.txt { root /usr/share/nginx/html/homepage/browser; }

    # Her şey SSR üzerinden
    location / {
        proxy_pass http://homepage_ssr;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**docker-compose.yml'ye Homepage SSR servisi ekle:**

```yaml
homepage:
  build:
    context: ./BikeHaus.Homepage
    dockerfile: Dockerfile
  ports:
    - '4000:4000'
  environment:
    - NODE_ENV=production
```

### 1.2 — Dinamik Sitemap API Endpoint'i Oluştur

**Neden:** Google'ın ürün sayfalarını keşfetmesi için her ürünün sitemap'te olması gerekir.

**Yeni API Endpoint:** `GET /api/public/sitemap`

- Tüm aktif ürünleri, kategorileri ve sayfaları içeren XML sitemap üretir
- Her yeni ürün eklendiğinde otomatik güncellenir
- `<image:image>` tagları ile ürün fotoğrafları da dahil

### 1.3 — Google Search Console Doğrulama

```html
<meta name="google-site-verification" content="DOGRULAMA_KODU" />
```

### 1.4 — Core Web Vitals Optimizasyonu

- `<link rel="preload">` ile hero image ve font dosyalarını önceden yükle
- Lazy loading tüm ekran dışı görsellerde aktif (✅ zaten var)
- `fetchpriority="high"` ana görselde kullan
- WebP/AVIF format desteği ekle

### 1.5 — `sameAs` Alanını Doldur

```json
"sameAs": [
  "https://www.google.com/maps/place/Bike+Haus+Freiburg/...",
  "https://www.instagram.com/bikehausfreiburg/",
  "https://www.facebook.com/bikehausfreiburg/",
  "https://wa.me/4915566300011"
]
```

**Süre:** 1-2 hafta  
**Etki:** ⭐⭐⭐⭐⭐ (SSR düzeltmesi tek başına büyük fark yaratır)

---

## AŞAMA 2: İçerik Stratejisi & Blog Sistemi

### 2.1 — Blog/Ratgeber Sayfası Ekle

**Neden:** Google, "fahrrad kaufen tipps", "welches e-bike passt zu mir", "fahrrad größe berechnen" gibi bilgilendirici aramalar için içerikli sayfaları öne çıkarır. AI aramaları da bu tür detaylı, yapılandırılmış içerikleri kaynak olarak gösterir.

**Yeni Route:** `/de/ratgeber`  
**Yeni Route:** `/de/ratgeber/:slug`

**İlk Blog Yazıları (Hedef Anahtar Kelimeler):**

| #   | Başlık (DE)                                            | Hedef Keyword                    | Arama Hacmi   |
| --- | ------------------------------------------------------ | -------------------------------- | ------------- |
| 1   | Gebrauchtes Fahrrad kaufen — Worauf achten?            | gebrauchtes fahrrad kaufen tipps | Yüksek        |
| 2   | Welches Fahrrad passt zu mir? Der große Ratgeber       | welches fahrrad passt zu mir     | Çok Yüksek    |
| 3   | Fahrrad Rahmengröße berechnen — Tabelle & Rechner      | fahrrad rahmengröße berechnen    | Çok Yüksek    |
| 4   | E-Bike gebraucht kaufen — Akku, Motor, Garantie        | e-bike gebraucht kaufen          | Yüksek        |
| 5   | Fahrradladen Freiburg — Die besten Fahrradgeschäfte    | fahrradladen freiburg            | Hedef Keyword |
| 6   | Fahrrad Inspektion — Was wird gemacht & was kostet es? | fahrrad inspektion               | Orta          |
| 7   | Fahrrad für Pendler — Die besten Stadträder 2026       | fahrrad pendler                  | Orta          |
| 8   | Kinderfahrrad Größe — Welche Größe für welches Alter?  | kinderfahrrad größe              | Yüksek        |

### 2.2 — Blog İçerik Schema.org

```json
{
  "@type": "Article",
  "headline": "...",
  "author": { "@type": "Organization", "name": "Bike Haus Freiburg" },
  "datePublished": "2026-04-15",
  "dateModified": "2026-04-15",
  "publisher": { "@type": "Organization", ... },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "..." }
}
```

### 2.3 — Her Blog Yazısında Internal Linking

- Blog yazılarından showroom sayfasına link
- Showroom'dan ilgili blog yazılarına link
- "Benzer Fahrräder" bölümü ürün sayfalarında

### 2.4 — FAQ Sayfası Genişlet

Mevcut FAQ şemasını genişlet + ayrı bir `/de/faq` sayfası oluştur:

- "Kann ich mein altes Fahrrad in Zahlung geben?"
- "Liefern Sie Fahrräder?"
- "Bieten Sie Fahrradreparatur an?"
- "Was kostet ein gebrauchtes E-Bike?"

**Süre:** 2-4 hafta  
**Etki:** ⭐⭐⭐⭐⭐ (İçerik, uzun vadede en büyük SEO faktörüdür)

---

## AŞAMA 3: AI Arama Optimizasyonu (AEO — Answer Engine Optimization)

### 3.1 — llms.txt Dosyası Oluştur

**Neden:** ChatGPT, Gemini, Perplexity gibi AI aramaları `llms.txt` dosyasını okuyarak siteyi anlar.

**Dosya:** `/llms.txt`

```
# Bike Haus Freiburg

> Fahrradladen in Freiburg im Breisgau. Neue und gebrauchte Fahrräder, E-Bikes, Kinderfahrräder.

## Über uns
Bike Haus Freiburg ist ein Fahrradgeschäft in der Heckerstraße 27, 79114 Freiburg.
Wir verkaufen neue und gebrauchte Fahrräder mit Garantie.
Öffnungszeiten: Mo, Di, Do 11:00–17:30 | Mi 14:00–17:30 | Fr 11:00–13:00 & 15:00–18:00 | Sa 11:30–17:00 Uhr.

## Angebot
- Neue Fahrräder (Citybikes, Trekkingräder, Mountainbikes, E-Bikes)
- Gebrauchte Fahrräder mit 3 Monaten Garantie
- E-Bikes (neu und gebraucht)
- Kinderfahrräder
- Fahrradankauf
- Fahrradzubehör
- Fahrradverleih

## Kontakt
- Adresse: Heckerstraße 27, 79114 Freiburg im Breisgau
- WhatsApp: +49 155 6630 0011
- E-Mail: bikehausfreiburg@gmail.com
- Website: https://bikehausfreiburg.com

## Einzugsgebiet
Freiburg, Emmendingen, Bad Krozingen, Breisach, March, Gundelfingen,
Merzhausen, Denzlingen, Waldkirch, Staufen, Kirchzarten, Breisgau-Hochschwarzwald

## Sprachen
Deutsch, Französisch, Türkisch
```

**Dosya:** `/llms-full.txt` (detaylı versiyon — tüm ürün listesi dahil)

### 3.2 — AI-Optimized Content Structure

Her sayfada:

- **Kısa, net cevaplar** ile başla (AI featured snippet için)
- **Soru-Cevap formatı** kullan (Q&A pairs)
- **Yapılandırılmış listeler** (bullet points)
- **"Zusammenfassung" / TL;DR** kutusu her blog yazısının başında

### 3.3 — Speakable Schema (Sesli Arama İçin)

```json
{
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".hero-title", ".hero-description", ".faq-answer"]
  }
}
```

### 3.4 — Bing IndexNow Entegrasyonu

**Neden:** Bing Copilot (AI) + Bing arama için anlık indexleme.

```csharp
// API'ye yeni endpoint
POST /api/internal/index-now
// Her ürün ekleme/güncelleme sonrası otomatik çağrılır
```

**Dosya:** `/indexnow-key.txt` (Bing doğrulama)

### 3.5 — Google Indexing API

Yeni ürünler eklendiğinde Google'a anında bildir:

```csharp
// Her yeni ürün kaydedildiğinde
await _indexingService.NotifyGoogleAsync(productUrl);
```

**Süre:** 2-3 hafta  
**Etki:** ⭐⭐⭐⭐ (AI aramaları hızla büyüyor, erken optimizasyon avantaj)

---

## AŞAMA 4: Lokal SEO & Google Business Optimizasyonu

### 4.1 — Google Business Profile Tam Optimizasyon

- ✅ Tüm bilgiler eksiksiz (adres, saat, telefon, web)
- ✅ Kategori: "Fahrradgeschäft" (ana) + "Gebrauchtwarenhändler" (ek)
- ✅ Haftada 1 Google Post paylaş (yeni ürünler, indirimler)
- ✅ Tüm ürün fotoğraflarını yükle
- ✅ Q&A bölümünü kendi sorularınla doldur
- ✅ Açılış saatlerini her tatilde güncelle

### 4.2 — Review Stratejisi (ÇOK KRİTİK)

**Neden:** Google lokal aramada reviewları çok ağır tartar. 50+ review = top 3 garanti.

**Eylem Planı:**

- Her satış sonrası müşteriye WhatsApp ile review linki gönder
- Mağazada QR kod ile "Bewerten Sie uns" yapıştır
- İlk 30 gün hedef: 20 yeni Google review

### 4.3 — Review Schema Entegrasyonu

```json
{
  "@type": "BikeStore",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "47",
    "bestRating": "5"
  }
}
```

Google Business'tan gelen reviewları API ile çekip siteye yerleştir.

### 4.4 — Yerel Dizinler & Backlink

Aşağıdaki dizinlere kayıt ol:
| Platform | URL | Öncelik |
|----------|-----|---------|
| Google Business | maps.google.com | ⭐⭐⭐⭐⭐ |
| Yelp | yelp.de | ⭐⭐⭐⭐ |
| Das Örtliche | dasoertliche.de | ⭐⭐⭐⭐ |
| Gelbe Seiten | gelbeseiten.de | ⭐⭐⭐⭐ |
| GoLocal | golocal.de | ⭐⭐⭐ |
| Freiburg.de | freiburg.de/auskunft | ⭐⭐⭐ |
| meinestadt.de | meinestadt.de | ⭐⭐⭐ |
| KennstDuEinen | kennstdueinen.de | ⭐⭐⭐ |
| Cylex | cylex.de | ⭐⭐ |
| Branchenbuch | branchenbuch.de | ⭐⭐ |
| Apple Maps | mapsconnect.apple.com | ⭐⭐⭐⭐ |
| Bing Places | bingplaces.com | ⭐⭐⭐⭐ |

**Tüm dizinlerde bilgiler BİREBİR AYNI olmalı (NAP Consistency):**

```
Bike Haus Freiburg
Heckerstraße 27
79114 Freiburg im Breisgau
+49 155 6630 0011
bikehausfreiburg@gmail.com
https://bikehausfreiburg.com
```

### 4.5 — Lokal İçerik Sayfaları

Her çevre şehir için landing page:

- `/de/fahrrad-emmendingen`
- `/de/fahrrad-bad-krozingen`
- `/de/fahrrad-breisach`
- `/de/fahrrad-gundelfingen`
- `/de/fahrrad-march`

İçerik: "Fahrrad kaufen in Emmendingen? Bike Haus Freiburg ist nur X km entfernt..."

**Süre:** 3-4 hafta  
**Etki:** ⭐⭐⭐⭐⭐ (Lokal SEO, fiziksel mağaza için EN önemli faktör)

---

## AŞAMA 5: Gelişmiş Optimizasyon & Sürdürülebilirlik

### 5.1 — Otomatik Ürün Sayfası SEO

Her ürün eklendiğinde otomatik:

- Unique title: `"{Marka} {Model} {Tip} kaufen | Bike Haus Freiburg"`
- Unique description: `"{Marka} {Model} — {Durum}, {Fiyat}€. {Tip} in Freiburg kaufen..."`
- Product Schema.org (✅ zaten var, genişlet)
- Open Graph image (ürün fotoğrafı)
- Canonical URL

### 5.2 — Dinamik Breadcrumbs (Her Sayfa İçin)

```
Startseite > Showroom > Kategorisi > Ürün Adı
Startseite > Ratgeber > Blog Yazısı
Startseite > Neue Fahrräder > Ürün Adı
```

### 5.3 — Sayfa Hız Optimizasyonu

- **Brotli compression** nginx'e ekle (gzip'ten %15-20 daha iyi)
- **Image CDN** veya otomatik WebP dönüşümü
- **Critical CSS** inline
- **Service Worker** cache stratejisi (PWA ✅ zaten var)
- Hedef: Lighthouse Performance > 95

### 5.4 — Structured Data Genişletme

Mevcut şemalara ek:

```json
// VideoObject (varsa ürün videoları)
{
  "@type": "VideoObject",
  "name": "Bike Haus Freiburg Showroom Tour",
  "thumbnailUrl": "...",
  "uploadDate": "..."
}

// Event (özel günler, açılış)
{
  "@type": "Event",
  "name": "Fahrrad Frühlings-Sale",
  "startDate": "2026-04-20",
  "location": { "@type": "Place", "name": "Bike Haus Freiburg" }
}

// HowTo (blog yazıları için)
{
  "@type": "HowTo",
  "name": "Fahrrad Rahmengröße berechnen",
  "step": [...]
}
```

### 5.5 — Monitoring & Continuous Improvement

- **Google Search Console** — haftalık takip
- **Core Web Vitals** — aylık kontrol
- **Keyword Ranking Tracking** — ahrefs/semrush/sistrix
- **AI Search Monitoring** — Perplexity, ChatGPT'de "fahrradladen freiburg" aramalarını test et
- **Competitor Analysis** — Rack Attack, Radstation, Lucky Bike takip
- **Sitemap auto-update** — Her ürün ekleme/silme sonrası

### 5.6 — Social Signals & Brand Building

- Instagram'da düzenli paylaşım (yeni ürünler, before/after)
- Google Posts haftada 1
- Freiburg lokal gruplarda varlık (Facebook, Reddit r/freiburg)
- YouTube kısa videolar (30sn ürün tanıtım)

**Süre:** Sürekli (aylık)  
**Etki:** ⭐⭐⭐⭐ (Kümülatif etki, uzun vadede fark yaratır)

---

## 📊 Öncelik Sıralaması & Tahmini ROI

| Aşama | Başlık                       | Öncelik        | SEO Etkisi | AI Arama Etkisi |
| ----- | ---------------------------- | -------------- | ---------- | --------------- |
| 1     | Teknik SEO (SSR, Sitemap)    | 🔴 ACİL        | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐      |
| 2     | İçerik & Blog                | 🟠 YÜKSEK      | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐      |
| 3     | AI Arama Optimizasyonu       | 🟡 ORTA-YÜKSEK | ⭐⭐⭐     | ⭐⭐⭐⭐⭐      |
| 4     | Lokal SEO & Reviews          | 🔴 ACİL        | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐        |
| 5     | Gelişmiş & Sürdürülebilirlik | 🟢 SÜREKLİ     | ⭐⭐⭐⭐   | ⭐⭐⭐⭐        |

---

## 🎯 Hedef Anahtar Kelimeler & Mevcut Ranking

### Birincil (Must #1)

- `fahrradladen freiburg`
- `fahrrad kaufen freiburg`
- `gebrauchte fahrräder freiburg`
- `bike haus freiburg`
- `fahrradgeschäft freiburg`
- `fahrradhändler freiburg`

### İkincil (Top 3)

- `e-bike freiburg`
- `e-bike gebraucht freiburg`
- `kinderfahrrad freiburg`
- `citybike freiburg`
- `mountainbike freiburg`
- `fahrrad emmendingen`
- `fahrrad bad krozingen`

### Uzun Kuyruk (Blog ile hedefle)

- `gebrauchtes fahrrad kaufen worauf achten`
- `welches fahrrad passt zu mir`
- `fahrrad rahmengröße berechnen`
- `e-bike akku lebensdauer`
- `fahrrad inspektion kosten`

---

## ⚡ Hemen Başla Checklist

- [ ] Google Search Console'a site ekle
- [ ] Google Business Profile'ı kontrol et ve optimize et
- [ ] Nginx'i SSR proxy'ye çevir
- [ ] Dinamik sitemap endpoint'i yaz
- [ ] `llms.txt` dosyası oluştur
- [ ] `sameAs` alanını sosyal medya linkleriyle doldur
- [ ] Bing Places'a kayıt ol
- [ ] Apple Maps'e kayıt ol
- [ ] İlk 3 blog yazısını yaz
- [ ] Müşterilerden Google review toplamaya başla
