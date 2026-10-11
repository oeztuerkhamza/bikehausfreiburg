# 🔒 Bike Haus Freiburg — Google'dan Kaldırma (Deindex)

> **Durum:** Site **bilinçli olarak** arama motorlarından çıkarıldı.
> **Metinler, sayfalar, tasarım, fiyatlar — hiçbiri değişmedi.** Site tam
> olarak eskisi gibi çalışıyor ve adresinden erişilebiliyor; sadece Google
> ve diğer arama motorlarının sonuç listelerinden düşüyor.
>
> Bu dosya ne yapıldığını, nasıl doğrulanacağını ve **nasıl geri alınacağını**
> anlatır. [SEO-OPTIMIZATION-PLAN.md](SEO-OPTIMIZATION-PLAN.md) ve
> [SEO-AUDIT-2026-08.md](SEO-AUDIT-2026-08.md) bilerek silinmedi: geri dönüş
> kararı verilirse yol haritası orada duruyor.

---

## 1. Temel mantık: `noindex`, `Disallow` değil

Sezgiye aykırı ama kritik olan nokta: **robots.txt'ye `Disallow: /` yazmak
siteyi Google'dan çıkarmaz, çıkmasını engeller.**

- `Disallow: /` → Google sayfayı **indiremez**. İndiremediği için üzerindeki
  "beni indeksleme" talimatını da **göremez**. Zaten indekste olan sayfalar
  belirsiz bir süre sonuçlarda kalmaya devam eder, çoğu zaman açıklama metni
  olmadan çirkin bir şekilde.
- `noindex` + tarama **açık** → Google sayfayı indirir, talimatı okur ve
  indeksten düşürür. Doğru yol budur.

Bu yüzden `robots.txt` hâlâ `Allow: /` diyor ve site haritaları yerinde
duruyor. Site haritası artık bir tanıtım aracı değil, **Google'ın kaldırılacak
sayfaları yeniden bulması için kullandığı liste**.

---

## 2. Tek anahtar

```ts
// BikeHaus.Homepage/src/app/services/search-indexing.ts
export const SEARCH_INDEXING_ENABLED = false;
```

Bu satır frontend tarafındaki her şeyi yönetir. Kullanılan direktif:
`noindex, follow, noimageindex`

- `noindex` → sonuçlardan çıkar
- `follow` → Google iç linkleri takip etmeye devam eder; her sayfadaki
  `noindex`'i böyle görür. `nofollow` kaldırmayı **yavaşlatırdı**.
- `noimageindex` → fotoğraflar Google Görseller'den de düşer

---

## 3. Değiştirilen dosyalar

| Dosya | Ne yapıldı |
| --- | --- |
| `BikeHaus.Homepage/src/app/services/search-indexing.ts` | **Yeni.** Anahtarın kendisi + `robotsFor()` yardımcısı. |
| `BikeHaus.Homepage/src/index.html` | `robots` / `googlebot` / `bingbot` meta etiketleri `noindex`. Her rotanın devraldığı başlangıç değeri. Eski değer yorum olarak duruyor. |
| 9 sayfa bileşeni (`pages/**`) | Kendi `robots` etiketini yazan sayfalar artık `robotsFor('index, follow')` üzerinden geçiyor. Orijinal değer parametrede saklı. |
| `BikeHaus.Homepage/src/robots.txt` | Tarama açık (zorunlu, bkz. §1). `Google-Extended` kapatıldı. Gerekçeler dosyanın içinde. |
| `BikeHaus.Homepage/scripts/generate-sitemap.mjs` | Anahtar kapalıyken `noindex` sayfaları site haritasına **bilerek** dahil ediyor — aksi halde harita boş çıkar ve kaldırma yavaşlar. |
| `nginx/nginx.conf` | `X-Robots-Tag` başlığı. En geniş katman: HTML başlığı olmayan yanıtları da (görseller, statik dosyalar) kapsar. Apex + admin + api bloklarında. |
| `BikeHaus.Infrastructure/Services/IndexNowService.cs` | `IndexNow:Enabled` anahtarı, varsayılan **kapalı**. Site indeksten çıkarılırken yeni URL'leri arama motorlarına bildirmek anlamsız olurdu. |
| `BikeHaus.API/appsettings.json` | `IndexNow:Enabled: false`. |

### Bilerek dokunulmayanlar

- **Metinler, başlıklar, açıklamalar, çeviriler** — istek buydu.
- **JSON-LD / schema.org blokları** — `noindex` sayfayı tamamen çıkardığı için
  zengin sonuçlar da kendiliğinden kayboluyor. Silmek gereksiz bir kayıp olurdu;
  geri dönüşte hazır duruyorlar.
- **canonical / hreflang** — yapı bozulmasın diye yerinde.
- **`sitemap.xml`, `sitemap-products.xml`, `robots.txt` nginx location'ları** —
  bu üçü `X-Robots-Tag` almıyor; onlar kaldırma listesinin kendisi.
- **`mail.bikehausfreiburg.com` nginx bloğu** — Mailcow arayüzü. Zaten giriş
  ekranı ve kendi başlıklarını üretiyor; CLAUDE.md'deki uyarılar gereği mail
  yığınına dokunmadım. İstenirse aynı `X-Robots-Tag` satırı oraya da eklenebilir.
- **ChatGPT / Claude / Perplexity tarayıcıları** — hâlâ açık. Talep Google'dı.
  Onlar da kapatılsın istenirse: `robots.txt` içinde ilgili `Allow: /`
  satırlarını `Disallow: /` yap.

---

## 4. Elle yapılması gerekenler (kod değil)

Bunlar depodan yapılamaz, hesaplara girmek gerekir:

1. **Google Search Console → Kaldırmalar (Removals)**
   `https://bikehausfreiburg.com/` için "Geçici kaldırma" talebi aç. Bu, ~6 ay
   boyunca sonuçları hemen gizler ve `noindex`'in kalıcı etkisi oturana kadar
   köprü görevi yapar. En hızlı sonuç veren adım budur.
2. **Search Console → Site Haritaları**
   Site haritalarını **şimdi kaldırma**. Google'ın sayfaları yeniden tarayıp
   `noindex` görmesi gerekiyor. Sonuçlar temizlendikten sonra kaldırabilirsin.
3. **Google Business Profile (Haritalar/İşletme kaydı)**
   ⚠️ Sitedeki `noindex` bunu **etkilemez**. Dükkân Google Haritalar'da ve
   yerel sonuçlarda görünmeye devam eder. İstenmiyorsa işletme profilinden
   ayrıca kapatılmalı/kaldırılmalı.
4. **Site dışı kayıtlar** — Kleinanzeigen mağaza sayfası, Instagram, Facebook,
   dizinler. Bunlar bağımsız; aramalarda çıkmaya devam ederler.
   [SEO-OFFPAGE-CHECKLIST.md](SEO-OFFPAGE-CHECKLIST.md) listeyi veriyor.
5. **Bing Webmaster Tools** — Bing için de aynı kaldırma aracı var.

---

## 5. Dağıtım ve doğrulama

```bash
# Homepage: build + sitemap üretimi
cd BikeHaus.Homepage && npm run build

# nginx değişikliği için (yeniden yükleme şart, dosya tek başına yetmez)
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload

# API (IndexNow anahtarı)
docker compose up -d --build bikehaus
```

Yayından sonra kontrol:

```bash
# HTTP başlığı — her sayfada görünmeli
curl -sI https://bikehausfreiburg.com/de | grep -i x-robots-tag

# Görseller de kapsanıyor mu
curl -sI https://bikehausfreiburg.com/assets/logo.png | grep -i x-robots-tag

# HTML meta etiketi
curl -s https://bikehausfreiburg.com/de | grep -o '<meta name="robots"[^>]*>'

# robots.txt tarama izni hâlâ açık mı (AÇIK OLMALI, bkz. §1)
curl -s https://bikehausfreiburg.com/robots.txt | head -40
```

Beklenen: `x-robots-tag: noindex, follow, noimageindex`.

**Ne kadar sürer:** Search Console kaldırma talebi → saatler. Doğal
indeksten düşme → sayfa sayısına ve tarama sıklığına göre birkaç hafta.

---

## 6. Geri alma (tek tek)

1. `search-indexing.ts` → `SEARCH_INDEXING_ENABLED = true`
2. `src/index.html` → `robots` meta etiketini yorumda duran eski değere döndür;
   `googlebot` / `bingbot` → `index, follow`
3. `src/robots.txt` → `Google-Extended` tekrar `Allow: /`, uyarı bloklarını sil
4. `nginx/nginx.conf` → eklenen `X-Robots-Tag` satırlarını sil, nginx'i reload et
5. `appsettings.json` → `IndexNow:Enabled: true`
6. Search Console → geçici kaldırma talebini iptal et, site haritalarını
   yeniden gönder, ana sayfalar için "İndekslenmeyi talep et"

Site haritası 1. adımdan sonra ilk build'de kendiliğinden normale döner.

> **Uyarı:** Geri dönüş otomatik ve hızlı değildir. Kaybedilen sıralamaların
> yeniden kazanılması aylar sürebilir ve eski konumun geri geleceğinin garantisi
> yoktur. Karar bilinçli alınmıştı; geri dönüş de aynı şekilde alınmalı.
