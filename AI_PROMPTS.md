# BikeHaus Freiburg — AI Prompt Şablonları

> Farklı AI araçlarıyla (ChatGPT, Claude, Copilot Chat vb.) etkili çalışmak için
> hazır prompt şablonları. Kopyalayıp yapıştırın, `[...]` kısımları doldurun.

---

## 1. Yeni Özellik Geliştirme

```
BikeHaus Freiburg projesinde yeni bir özellik eklemek istiyorum.

Proje: .NET 9 + Angular 17, Clean Architecture, SQLite, EF Core 8
Detaylar için AI_CONTEXT.md ve AI_TECHNICAL_REFERENCE.md dosyalarına bak.

Yeni özellik: [ÖZELLİK AÇIKLAMASI]

Lütfen şunları oluştur:
1. Entity (BikeHaus.Domain/Entities/)
2. Gerekli Enum'lar (BikeHaus.Domain/Enums/)
3. Repository interface (BikeHaus.Domain/Interfaces/)
4. DTO'lar (BikeHaus.Application/DTOs/)
5. Service interface (BikeHaus.Application/Interfaces/)
6. Service implementasyonu (BikeHaus.Application/Services/)
7. Repository implementasyonu (BikeHaus.Infrastructure/Repositories/)
8. DbContext güncellemesi
9. DI kaydı (DependencyInjection.cs)
10. Controller (BikeHaus.API/Controllers/)
11. Angular model (models.ts)
12. Angular service
13. Angular page component
14. Route tanımı

Mevcut kod stili: Almanca property isimleri, file-scoped namespace,
async/await, standalone Angular components, signal-based state.
```

---

## 2. Bug Fix / Hata Çözme

```
BikeHaus Freiburg projesinde bir hata var.

Proje: .NET 9 + Angular 17, Clean Architecture
Tech detaylar: AI_TECHNICAL_REFERENCE.md

Hata: [HATA AÇIKLAMASI]
Beklenen davranış: [NE OLMALI]
Mevcut davranış: [NE OLUYOR]

İlgili dosya(lar): [DOSYA YOLLARI]

Lütfen hatayı analiz edip düzeltme öner.
```

---

## 3. Mevcut Özelliği Değiştirme

```
BikeHaus Freiburg'da mevcut bir özelliği değiştirmek istiyorum.

Mevcut Entity/DTO yapısı için AI_TECHNICAL_REFERENCE.md dosyasına bak.
API endpoint'leri için AI_API_REFERENCE.md'ye bak.

Değişiklik: [DEĞIŞIKLIK AÇIKLAMASI]

Etkilenen katmanlar:
- Backend: [Entity / Service / Controller]
- Frontend: [Model / Service / Component]
- Database: [Migration gerekli mi?]
```

---

## 4. Frontend Component Oluşturma

```
BikeHaus Freiburg Angular 17 projesinde yeni bir component eklemek istiyorum.

Kurallar:
- Standalone component (NgModule yok)
- Signal-based state (signal(), computed())
- Inline template & styles (küçük component'ler için)
- HttpClient ile API çağrısı
- TranslationService ile çeviri desteği
- Dark/Light tema uyumlu (CSS variables kullan)

Component: [COMPONENT AÇIKLAMASI]
API endpoint: [KULLANILACAK ENDPOINT]

Örnek referans için mevcut component'lere bak:
- src/app/pages/bicycles/bicycle-list.component.ts
- src/app/pages/sales/sale-form.component.ts
```

---

## 5. PDF Belge Oluşturma

```
BikeHaus Freiburg'da yeni bir PDF belgesi eklemek istiyorum.

PDF kütüphanesi: QuestPDF
Mevcut PDF servisi: BikeHaus.Infrastructure/Services/PdfService.cs
Dükkan bilgileri: ShopSettings entity'sinden alınır

Yeni belge: [BELGE AÇIKLAMASI]
İçermesi gereken bilgiler: [BİLGİLER]

Mevcut Kaufbeleg/Verkaufsbeleg/Rechnung örneklerine benzer şekilde oluştur.
```

---

## 6. Veritabanı Migration

```
BikeHaus Freiburg projesinde veritabanı şemasını değiştirmem gerekiyor.

ORM: Entity Framework Core 8 + SQLite
DbContext: BikeHaus.Infrastructure/Data/BikeHausDbContext.cs

Değişiklik: [DEĞİŞİKLİK AÇIKLAMASI]

Lütfen:
1. Entity değişikliğini göster
2. DbContext OnModelCreating güncellemesini göster
3. Migration komutunu ver:
   dotnet ef migrations add <Name> --project BikeHaus.Infrastructure --startup-project BikeHaus.API
```

---

## 7. İstatistik / Dashboard Geliştirme

```
BikeHaus Freiburg dashboard veya istatistik sayfasına yeni veri eklemek istiyorum.

Backend: StatisticsService / DashboardService
Frontend: pages/statistics/ veya pages/dashboard/
DTO'lar: StatisticsDto.cs / DashboardDto.cs

Eklemek istediğim: [VERİ AÇIKLAMASI]

Mevcut istatistikler: toplam alım, toplam satış, kâr, dönemsel veriler
```

---

## 8. Genel Soru Sorma

```
BikeHaus Freiburg projesi hakkında bir sorum var.

Proje özeti: Almanya'da bisiklet dükkânı yönetim sistemi
Tech: .NET 9 + Angular 17 + SQLite + QuestPDF
Detaylar: AI_CONTEXT.md dosyasında

Sorum: [SORU]
```

---

## Dosya Referansı — Hangi dosyayı AI'a vereceğiniz

| Amaç                  | Verilecek Dosya                                       |
| --------------------- | ----------------------------------------------------- |
| Genel proje tanıtımı  | `AI_CONTEXT.md`                                       |
| Teknik detaylar       | `AI_TECHNICAL_REFERENCE.md`                           |
| API endpoint sorgusu  | `AI_API_REFERENCE.md`                                 |
| Copilot Chat otomatik | `.github/copilot-instructions.md` (otomatik yüklenir) |
| TypeScript modelleri  | `BikeHaus.Client/src/app/models/models.ts`            |
| C# entity'leri        | `BikeHaus.Domain/Entities/*.cs`                       |
| DbContext yapısı      | `BikeHaus.Infrastructure/Data/BikeHausDbContext.cs`   |
| DI konfigürasyonu     | `BikeHaus.Infrastructure/DependencyInjection.cs`      |
| Angular routing       | `BikeHaus.Client/src/app/app.routes.ts`               |
