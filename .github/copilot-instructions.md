# Copilot Instructions — BikeHaus Freiburg

## Proje Hakkında
BikeHaus Freiburg, Freiburg'daki bir bisiklet dükkânı için geliştirilmiş full-stack envanter ve satış yönetim sistemidir. Bisiklet alım-satım, müşteri yönetimi, fatura/belge oluşturma, istatistik ve arşiv gibi modülleri kapsar.

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| **Backend** | .NET 9, ASP.NET Core Web API, C# |
| **Frontend** | Angular 17 (standalone components), TypeScript |
| **Veritabanı** | SQLite (EF Core 8) |
| **PDF** | QuestPDF |
| **Auth** | JWT Bearer Authentication (BCrypt hash) |
| **Deploy** | Docker (multi-stage), Nginx reverse proxy |
| **Desktop** | Electron (opsiyonel) |

## Mimari (Clean Architecture)
```
BikeHaus.Domain        → Entity & Enum'lar (hiçbir bağımlılığı yok)
BikeHaus.Application   → DTO, Interface, Service implementasyonları (Domain'e bağımlı)
BikeHaus.Infrastructure→ EF Core DbContext, Repository, Auth/PDF/FileStorage servisleri
BikeHaus.API           → Controller'lar, Program.cs (DI, middleware)
BikeHaus.Client        → Angular SPA (src/app altında pages, services, models, components)
```

## Önemli Kurallar

### Backend (C# / .NET)
- **Dil:** Entity property isimleri Almanca (Marke, Modell, Preis, Vorname, Nachname vb.)
- **Framework:** .NET 9, target framework `net9.0`
- **ORM:** Entity Framework Core 8 + SQLite
- **Pattern:** Repository Pattern (`IRepository<T>` generic + spesifik repo'lar), Service Pattern
- **DI:** Tüm kayıtlar `BikeHaus.Infrastructure/DependencyInjection.cs` içinde
- **API prefix:** Controller route'ları `api/[controller]` formatında
- **Decimal alanlar:** `decimal(18,2)` column type kullanılır
- **JSON:** camelCase naming policy + JsonStringEnumConverter aktif
- **Nullable:** Proje genelinde `<Nullable>enable</Nullable>`

### Frontend (Angular / TypeScript)
- **Angular 17** standalone component mimarisi (NgModule yok)
- **Routing:** `app.routes.ts` dosyasında tanımlı, `authGuard` ile korunan sayfalar
- **State:** Signal-based (`signal()`, `computed()`)
- **HTTP:** `HttpClient` + functional interceptor (`authInterceptor`)
- **Modeller:** `src/app/models/models.ts` merkezi dosyada (interface & enum)
- **Servisler:** Her modül için ayrı service (`bicycle.service.ts`, `sale.service.ts` vb.)
- **Çeviri:** `TranslationService` ile DE/TR/EN desteği
- **Tema:** `ThemeService` ile dark/light mode

### Veritabanı Şeması (Entity'ler)
| Entity | Açıklama |
|--------|----------|
| `Bicycle` | Bisiklet (Marke, Modell, Rahmennummer, Status, Zustand) |
| `Customer` | Müşteri (Vorname, Nachname, adres bilgileri) |
| `Purchase` | Alım kaydı (bisiklet + satıcı + fiyat) |
| `Sale` | Satış kaydı (bisiklet + alıcı + fiyat + garanti + aksesuarlar) |
| `SaleAccessory` | Satışa eklenen aksesuarlar |
| `Reservation` | Rezervasyon (bisiklet + müşteri + süre) |
| `Return` | İade (satış referansı + sebep + ücret iadesi) |
| `Expense` | Dükkan giderleri |
| `Document` | Dosya/belge (screenshot, PDF, fatura) |
| `Signature` | Dijital imza (base64) |
| `AccessoryCatalog` | Aksesuvar kataloğu |
| `ShopSettings` | Dükkan bilgileri (adres, logo, banka, vergi) |
| `User` | Kullanıcı (username, password hash, rol) |

### İlişkiler
- `Bicycle` ↔ `Purchase` (1:1) — her bisikletin bir alımı var
- `Bicycle` ↔ `Sale` (1:1) — her bisikletin en fazla bir satışı var
- `Bicycle` ↔ `Reservation` (1:1)
- `Customer` → `Purchase[]`, `Sale[]`, `Return[]`, `Reservation[]`
- `Sale` → `SaleAccessory[]` (cascade delete)
- `Sale` → `BuyerSignature`, `SellerSignature`
- `Purchase` → `Signature` (cascade delete)
- `Document` → `Bicycle?`, `Purchase?`, `Sale?`

### Enum'lar
- `BikeStatus`: Available, Sold, Reserved
- `BikeCondition`: Neu, Gebraucht
- `PaymentMethod`: Bar, PayPal, Karte
- `ReservationStatus`: Active, Converted, Expired, Cancelled
- `ReturnReason`: Defekt, NichtWieErwartet, Garantie, Sonstiges
- `DocumentType`: Screenshot, PDF, Image, Kaufbeleg, Verkaufsbeleg, Rechnung
- `SignatureType`: Seller, Buyer, ShopOwner

## Dosya Yapısı Rehberi

### Yeni Backend Özelliği Eklerken
1. `BikeHaus.Domain/Entities/` → Entity class
2. `BikeHaus.Domain/Enums/` → Gerekli enum'lar
3. `BikeHaus.Domain/Interfaces/` → Repository interface
4. `BikeHaus.Application/DTOs/` → DTO'lar (Create, Update, List, Detail)
5. `BikeHaus.Application/Interfaces/` → Service interface
6. `BikeHaus.Application/Services/` → Service implementasyonu
7. `BikeHaus.Infrastructure/Repositories/` → Repository implementasyonu
8. `BikeHaus.Infrastructure/Data/BikeHausDbContext.cs` → DbSet + OnModelCreating config
9. `BikeHaus.Infrastructure/DependencyInjection.cs` → DI kaydı
10. `BikeHaus.API/Controllers/` → Controller

### Yeni Frontend Özelliği Eklerken
1. `src/app/models/models.ts` → TypeScript interface/enum
2. `src/app/services/` → Angular service (HttpClient)
3. `src/app/pages/` → Sayfa component'leri
4. `src/app/components/` → Paylaşılan component'ler
5. `src/app/app.routes.ts` → Route tanımı
6. `src/app/app.component.ts` → Sidebar menü linkleri

## Kod Stili

### C#
- Namespace: dosya-scoped (`namespace X;`)
- Records / DTOs: mümkünse `record` kullan
- Async metotlar: `Async` suffix (ör. `GetAllAsync`)
- Constructor injection

### TypeScript / Angular
- Standalone components (no NgModule)
- Signals preferred over BehaviorSubject
- Inline template & styles for small components
- PascalCase for interfaces/enums, camelCase for properties
- Functional guards & interceptors

## Çalıştırma

### Backend
```bash
cd BikeHaus.API
dotnet run
# Swagger: https://localhost:5001/swagger
```

### Frontend
```bash
cd BikeHaus.Client
npm install
ng serve
# http://localhost:4200
```

### Docker
```bash
docker-compose up --build
# http://localhost:5000
```
