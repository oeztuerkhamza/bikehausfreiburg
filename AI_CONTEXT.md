# BikeHaus Freiburg — AI Context Guide

> Bu dosya, AI asistanlarının (ChatGPT, Claude, Copilot vb.) projeyi hızlıca anlaması için hazırlanmıştır.
> Yeni bir sohbete başlarken bu dosyanın içeriğini AI'a verin.

---

## 1. Proje Özeti

**BikeHaus Freiburg** — Almanya Freiburg'da bir bisiklet dükkânı için envanter ve satış yönetim sistemi.

- Bisiklet alım (Purchase) ve satım (Sale) kaydı
- Müşteri yönetimi (Customer)
- Rezervasyon sistemi (Reservation → Sale dönüştürme)
- İade yönetimi (Return)
- Gider takibi (Expense)
- Aksesuvar kataloğu & satışa ekleme
- Dijital imza (Signature)
- PDF belge üretimi (QuestPDF) — Kaufbeleg, Rechnung, Verkaufsbeleg
- Dosya yükleme (screenshot, fotoğraf)
- Dashboard & İstatistikler
- Arşiv & bisiklet geçmişi timeline
- Yedekleme / geri yükleme (Backup)
- Dark/Light tema, DE/TR/EN çoklu dil

---

## 2. Teknolojiler

| Alan       | Detay                                           |
| ---------- | ----------------------------------------------- |
| Backend    | **.NET 9** (ASP.NET Core Web API), C# 12        |
| Frontend   | **Angular 17** (standalone components, signals) |
| Database   | **SQLite** via Entity Framework Core 8          |
| PDF        | **QuestPDF**                                    |
| Auth       | JWT Bearer + BCrypt password hashing            |
| Deployment | Docker multi-stage build, Nginx reverse proxy   |
| Desktop    | Electron (opsiyonel paketleme)                  |

---

## 3. Proje Yapısı

```
BikeHausFreiburg/
├── BikeHaus.Domain/              ← Entity & Enum (saf C#, bağımlılık yok)
│   ├── Entities/                 ← BaseEntity, Bicycle, Customer, Purchase, Sale ...
│   ├── Enums/                    ← BikeStatus, PaymentMethod, ReturnReason ...
│   └── Interfaces/               ← IRepository<T>, IBicycleRepository ...
│
├── BikeHaus.Application/         ← İş mantığı katmanı
│   ├── DTOs/                     ← BicycleDtos, SaleDtos, PurchaseDtos ...
│   ├── Interfaces/               ← IBicycleService, ISaleService ...
│   ├── Services/                 ← BicycleService, SaleService ...
│   └── Mappings/                 ← (AutoMapper profilleri — varsa)
│
├── BikeHaus.Infrastructure/      ← Altyapı katmanı
│   ├── Data/BikeHausDbContext.cs  ← EF Core DbContext (tüm DbSet + OnModelCreating)
│   ├── Repositories/             ← Repository implementasyonları
│   ├── Services/                 ← AuthService, PdfService, FileStorageService, BackupService
│   └── DependencyInjection.cs    ← Tüm DI kayıtları
│
├── BikeHaus.API/                 ← Web API katmanı
│   ├── Controllers/              ← BicyclesController, SalesController ...
│   ├── Program.cs                ← Uygulama başlatma, middleware, CORS, JWT config
│   └── appsettings.json          ← ConnectionString, JWT ayarları
│
├── BikeHaus.Client/              ← Angular SPA
│   └── src/app/
│       ├── models/models.ts      ← TÜM TypeScript interface & enum tanımları
│       ├── services/             ← HTTP servisler (bicycle, sale, purchase ...)
│       ├── pages/                ← Sayfa component'leri (dashboard, bicycles, sales ...)
│       ├── components/           ← Ortak component'ler (dialog, notification, signature-pad ...)
│       ├── guards/auth.guard.ts
│       ├── interceptors/auth.interceptor.ts
│       ├── app.routes.ts         ← Routing tanımları
│       └── app.component.ts      ← Ana layout (sidebar + topbar)
│
├── docker-compose.yml
├── Dockerfile
└── nginx/nginx.conf
```

---

## 4. Domain Modeli (Entity'ler)

### Bicycle (Bisiklet)

```
Id, Marke, Modell, Rahmennummer, Rahmengroesse, Farbe, Reifengroesse,
StokNo, Fahrradtyp, Beschreibung, Status (enum), Zustand (enum)
→ Purchase (1:1), Sale (1:1), Reservation (1:1), Documents (1:N)
```

### Customer (Müşteri)

```
Id, Vorname, Nachname, Strasse, Hausnummer, PLZ, Stadt, Telefon, Email, Steuernummer
→ Purchases (1:N), Sales (1:N), Returns (1:N), Reservations (1:N)
```

### Purchase (Alım)

```
Id, BicycleId, SellerId, Preis, Zahlungsart, Kaufdatum, Notizen,
BelegNummer, VerkaufspreisVorschlag, AnzeigeNr
→ Bicycle, Seller (Customer), Signature, Documents, Sale (1:1 opsiyonel)
```

### Sale (Satış)

```
Id, BicycleId, BuyerId, PurchaseId?, Preis, Zahlungsart, Verkaufsdatum,
Garantie, GarantieBedingungen, Notizen, BelegNummer, Rabatt
Gesamtbetrag = Preis + Accessories.Sum - Rabatt (computed)
→ Bicycle, Buyer (Customer), Purchase?, BuyerSignature?, SellerSignature?,
  Accessories (1:N), Documents (1:N)
```

### SaleAccessory

```
Id, SaleId, Bezeichnung, Preis, Menge
Gesamtpreis = Preis * Menge (computed)
```

### Reservation (Rezervasyon)

```
Id, BicycleId, CustomerId, ReservierungsDatum, AblaufDatum,
Anzahlung?, Notizen, Status (enum), ReservierungsNummer, SaleId?
```

### Return (İade)

```
Id, SaleId, BicycleId, CustomerId, Rueckgabedatum, Grund (enum),
GrundDetails, Erstattungsbetrag, Zahlungsart, Notizen, BelegNummer
→ CustomerSignature?, ShopSignature?, Documents
```

### Expense (Gider)

```
Id, Bezeichnung, Kategorie, Betrag, Datum, Lieferant, BelegNummer, Notizen
```

### Document, Signature, AccessoryCatalog, ShopSettings, User

(Detaylar Entity dosyalarında)

---

## 5. Enum Değerleri

| Enum              | Values                                                     |
| ----------------- | ---------------------------------------------------------- |
| BikeStatus        | Available, Sold, Reserved                                  |
| BikeCondition     | Neu, Gebraucht                                             |
| PaymentMethod     | Bar, PayPal, Karte                                         |
| ReservationStatus | Active, Converted, Expired, Cancelled                      |
| ReturnReason      | Defekt, NichtWieErwartet, Garantie, Sonstiges              |
| DocumentType      | Screenshot, PDF, Image, Kaufbeleg, Verkaufsbeleg, Rechnung |
| SignatureType     | Seller, Buyer, ShopOwner                                   |

---

## 6. API Endpoint'leri (Özet)

| Controller                 | Prefix                  | Temel İşlemler                                          |
| -------------------------- | ----------------------- | ------------------------------------------------------- |
| BicyclesController         | `/api/bicycles`         | CRUD, arama, güncelleme                                 |
| CustomersController        | `/api/customers`        | CRUD, arama                                             |
| PurchasesController        | `/api/purchases`        | Oluşturma (bisiklet+müşteri birlikte), düzenleme, silme |
| SalesController            | `/api/sales`            | Oluşturma, düzenleme, silme, PDF belge                  |
| ReservationsController     | `/api/reservations`     | Oluşturma, satışa dönüştürme, iptal                     |
| ReturnsController          | `/api/returns`          | İade oluşturma                                          |
| ExpensesController         | `/api/expenses`         | Gider CRUD                                              |
| DocumentsController        | `/api/documents`        | Upload, download, silme                                 |
| DashboardController        | `/api/dashboard`        | Özet veriler                                            |
| StatisticsController       | `/api/statistics`       | Dönemsel istatistikler                                  |
| ArchiveController          | `/api/archive`          | Arama, bisiklet geçmişi timeline                        |
| SettingsController         | `/api/settings`         | Dükkan ayarları CRUD                                    |
| BackupController           | `/api/backup`           | Yedekleme / geri yükleme                                |
| AuthController             | `/api/auth`             | Login, register                                         |
| AccessoryCatalogController | `/api/accessorycatalog` | Aksesuvar kataloğu CRUD                                 |

---

## 7. Frontend Sayfaları

| Sayfa        | Route           | Açıklama                           |
| ------------ | --------------- | ---------------------------------- |
| Dashboard    | `/`             | Genel özet, son alım/satımlar      |
| Bicycles     | `/bicycles`     | Bisiklet listesi + detay           |
| Labels       | `/labels`       | Etiket basımı                      |
| Customers    | `/customers`    | Müşteri listesi                    |
| Purchases    | `/purchases`    | Alım listesi + form                |
| Sales        | `/sales`        | Satış listesi + form               |
| Reservations | `/reservations` | Rezervasyonlar + satışa dönüştürme |
| Returns      | `/returns`      | İade listesi + form                |
| Parts        | `/parts`        | Aksesuvar kataloğu yönetimi        |
| Expenses     | `/expenses`     | Gider yönetimi                     |
| Statistics   | `/statistics`   | Grafik ve raporlar                 |
| Archive      | `/archive`      | Bisiklet geçmişi arama & timeline  |
| Settings     | `/settings`     | Dükkan ayarları, logo, imza        |
| Login        | `/login`        | Giriş sayfası                      |

---

## 8. Yeni Özellik Eklerken Checklist

### Backend

- [ ] Entity → `BikeHaus.Domain/Entities/`
- [ ] Enum → `BikeHaus.Domain/Enums/`
- [ ] Repository Interface → `BikeHaus.Domain/Interfaces/`
- [ ] DTOs → `BikeHaus.Application/DTOs/`
- [ ] Service Interface → `BikeHaus.Application/Interfaces/`
- [ ] Service Implementation → `BikeHaus.Application/Services/`
- [ ] Repository Implementation → `BikeHaus.Infrastructure/Repositories/`
- [ ] DbContext DbSet + Config → `BikeHaus.Infrastructure/Data/BikeHausDbContext.cs`
- [ ] DI Registration → `BikeHaus.Infrastructure/DependencyInjection.cs`
- [ ] Controller → `BikeHaus.API/Controllers/`
- [ ] Migration → `dotnet ef migrations add MigrationName`

### Frontend

- [ ] Model (interface/enum) → `src/app/models/models.ts`
- [ ] Service → `src/app/services/`
- [ ] Page Component → `src/app/pages/`
- [ ] Route → `src/app/app.routes.ts`
- [ ] Sidebar Link → `src/app/app.component.ts`

---

## 9. Sık Kullanılan Komutlar

```bash
# Backend
cd BikeHaus.API && dotnet run
dotnet ef migrations add <Name> --project BikeHaus.Infrastructure --startup-project BikeHaus.API
dotnet ef database update --project BikeHaus.Infrastructure --startup-project BikeHaus.API

# Frontend
cd BikeHaus.Client && npm start     # ng serve → localhost:4200
cd BikeHaus.Client && npm run build  # Production build

# Docker
docker-compose up --build
docker-compose down -v
```

---

## 10. Dikkat Edilecekler

1. **Entity property isimleri Almanca** — Marke, Modell, Preis, Vorname, Nachname vb.
2. **JSON camelCase** — API response'ları camelCase (Angular model property'leri ile eşleşir)
3. **Enum'lar string olarak serialize** — `JsonStringEnumConverter` aktif
4. **SQLite kullanılıyor** — Migration'larda SQLite uyumluluğuna dikkat
5. **Standalone Angular components** — NgModule kullanılmıyor
6. **Signal-based state** — `signal()`, `computed()` tercih edilir
7. **PDF belgeleri QuestPDF ile** — `PdfService` içinde
8. **Dosyalar `uploads/` klasörüne** — `FileStorageService` aracılığıyla
