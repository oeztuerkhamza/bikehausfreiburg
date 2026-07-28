<!-- markdownlint-disable -->

# BikeHaus Freiburg — AI Context

**This file is loaded into every Claude Code session.** It is the canonical map of the project. Read it before searching the codebase. Detailed file-path index lives in [.claude/INDEX.md](.claude/INDEX.md).

---

## Stack at a glance

| Layer         | Tech                                                              |
| ------------- | ----------------------------------------------------------------- |
| API           | ASP.NET Core (net8.0), EF Core, SQLite, JWT, Swagger              |
| Admin SPA     | Angular 17.3 (CSR), standalone components, signals, custom SCSS   |
| Public site   | Angular 17.3 + SSR (Express + CommonEngine), 8 locales, prerender |
| Background    | Hosted service every 4h for Kleinanzeigen sync                    |
| Payments      | Mollie                                                            |
| Email         | MailKit/SMTP via mail.bikehausfreiburg.com (Mailcow self-hosted)  |
| Scraping      | Playwright (Chromium in API container)                            |
| Reverse proxy | nginx (TLS via certbot/Let's Encrypt)                             |
| Desktop       | Electron 33 wrapper (Windows installer via NSIS)                  |
| Browser ext   | Manifest V3 Chrome extension (Kleinanzeigen bulk edit)            |

**Note on .NET version**: csproj targets `net8.0`, but the production `Dockerfile` builds with the .NET 9 SDK image (`mcr.microsoft.com/dotnet/sdk:9.0`) and runs on `dotnet/aspnet:9.0`. Both work because net8.0 is compatible.

---

## Solution layout

```
bikehausfreiburg/
├── BikeHaus.Domain/          # Entities + Enums (no deps)
├── BikeHaus.Application/     # DTOs, Interfaces, Services, Mappings
├── BikeHaus.Infrastructure/  # EF Core DbContext, Migrations, Repos, external services
├── BikeHaus.API/             # ASP.NET Core entry, Controllers, appsettings, SQLite DB
├── BikeHaus.Client/          # Angular admin SPA
├── BikeHaus.Homepage/        # Angular public SSR site
├── CreateTestDb/             # CLI: seed test data
├── ResetPw/                  # CLI: reset admin password
├── KleinSync/                # CLI: manual Kleinanzeigen sync
├── electron/                 # Desktop wrapper (Windows .exe)
├── chrome-extension-bulk-edit/ # MV3 extension for kleinanzeigen.de
├── deploy/                   # VPS provisioning + deploy scripts
├── nginx/                    # nginx.conf for reverse proxy
└── docker-compose.yml        # Production orchestration (5 services)
```

Solution file: [BikeHausFreiburg.sln](BikeHausFreiburg.sln).

---

## Common commands (PowerShell, run from repo root unless noted)

### Backend

```powershell
dotnet build BikeHausFreiburg.sln                                    # Build solution
dotnet run --project BikeHaus.API                                    # Run API (http://localhost:5196)
dotnet ef migrations add <Name> --project BikeHaus.Infrastructure --startup-project BikeHaus.API
dotnet ef database update --project BikeHaus.Infrastructure --startup-project BikeHaus.API
dotnet ef migrations list --project BikeHaus.Infrastructure --startup-project BikeHaus.API
```

### Frontends

```powershell
cd BikeHaus.Client    ; npm start          # Admin SPA at http://localhost:4200
cd BikeHaus.Homepage  ; npm start          # Public site CSR at http://localhost:4300
cd BikeHaus.Homepage  ; npm run build      # Build with SSR + prerender
cd BikeHaus.Homepage  ; npm run serve:ssr:BikeHaus.Homepage  # Test SSR locally on :4000
```

### Docker / production

```powershell
docker compose up -d --build              # Bring full stack up
docker compose logs -f bikehaus           # API logs
docker compose logs -f homepage           # SSR logs
docker compose ps                         # Service status
```

### Utilities

```powershell
dotnet run --project ResetPw              # Reset admin password
dotnet run --project CreateTestDb         # Seed test DB
dotnet run --project KleinSync            # Manual Kleinanzeigen sync
.\build-installer.bat                     # Build Windows .exe installer (Electron + API bundle)
```

---

## Backend (.NET 8)

### Entry & wiring — [BikeHaus.API/Program.cs](BikeHaus.API/Program.cs)

- **Controllers**: JSON camelCase + enum string converters.
- **JWT**: `Jwt:Key` (env var in prod), Issuer `BikeHausFreiburg`, Audience `BikeHausApp`.
- **CORS** policy `AllowAngular`: dev → localhost:4200/4300; prod → `AllowAnyOrigin`.
- **Swagger**: dev only at `/swagger`.
- **Infrastructure DI** via `services.AddInfrastructure(config)` in [DependencyInjection.cs](BikeHaus.Infrastructure/DependencyInjection.cs).
- **Compression**: Brotli + Gzip for JSON/XML.
- **Background service**: `KleinanzeigenSyncBackgroundService` runs every 4h.
- **Static files**: `/uploads` served from `uploads/` (dev) or `/app/data/uploads` (prod).
- **SPA fallback**: prod serves `wwwroot/index.html` for non-API routes (Electron mode).
- **Startup**: `db.Database.Migrate()` then `IAuthService.SeedDefaultUserAsync()`.

### Controllers — `BikeHaus.API/Controllers/` (31 files, route prefix `api/[controller]`)

| Controller                                                                                 | Public?           | Notes                                                   |
| ------------------------------------------------------------------------------------------ | ----------------- | ------------------------------------------------------- |
| [AuthController](BikeHaus.API/Controllers/AuthController.cs)                               | login open        | `/login`, `/change-password`, `/change-username`, `/me` |
| [BicyclesController](BikeHaus.API/Controllers/BicyclesController.cs)                       | reads public      | Pagination, busy-periods, publish toggles, gallery      |
| [CustomersController](BikeHaus.API/Controllers/CustomersController.cs)                     | auth              | CRUD + search                                           |
| [PurchasesController](BikeHaus.API/Controllers/PurchasesController.cs)                     | auth              | CRUD + document upload                                  |
| [SalesController](BikeHaus.API/Controllers/SalesController.cs)                             | auth              | CRUD + accessories + payments + signatures              |
| [ReturnsController](BikeHaus.API/Controllers/ReturnsController.cs)                         | auth              | Return processing                                       |
| [RentalsController](BikeHaus.API/Controllers/RentalsController.cs)                         | auth              | Contract CRUD + PDF                                     |
| [RentalBookingsController](BikeHaus.API/Controllers/RentalBookingsController.cs)           | auth              | Approve/cancel public bookings                          |
| [RentalAccessoriesController](BikeHaus.API/Controllers/RentalAccessoriesController.cs)     | auth              | Accessory catalog for rentals                           |
| [ReservationsController](BikeHaus.API/Controllers/ReservationsController.cs)               | auth              | Reservation workflow                                    |
| [CheckoutController](BikeHaus.API/Controllers/CheckoutController.cs)                       | **public**        | Public rental booking checkout (Mollie)                 |
| [PublicController](BikeHaus.API/Controllers/PublicController.cs)                           | **public**        | Public-facing data aggregation                          |
| [PublicRentalsController](BikeHaus.API/Controllers/PublicRentalsController.cs)             | **public**        | Rental availability/pricing                             |
| [HomepageAccessoriesController](BikeHaus.API/Controllers/HomepageAccessoriesController.cs) | reads public      | Shop accessory catalog                                  |
| [NeueFahrraederController](BikeHaus.API/Controllers/NeueFahrraederController.cs)           | reads public      | New bikes listings                                      |
| [RepairShowcaseController](BikeHaus.API/Controllers/RepairShowcaseController.cs)           | reads public      | Repair example gallery                                  |
| [RentalReviewsController](BikeHaus.API/Controllers/RentalReviewsController.cs)             | submit public     | Customer reviews + admin approval                       |
| [AccessoryCatalogController](BikeHaus.API/Controllers/AccessoryCatalogController.cs)       | auth              | Generic accessory catalog                               |
| [DocumentsController](BikeHaus.API/Controllers/DocumentsController.cs)                     | auth              | File uploads                                            |
| [DashboardController](BikeHaus.API/Controllers/DashboardController.cs)                     | auth              | Aggregate KPIs                                          |
| [StatisticsController](BikeHaus.API/Controllers/StatisticsController.cs)                   | auth              | Monthly/yearly analytics                                |
| [ExpensesController](BikeHaus.API/Controllers/ExpensesController.cs)                       | auth              | Expense tracking                                        |
| [InvoicesController](BikeHaus.API/Controllers/InvoicesController.cs)                       | auth              | Invoice CRUD                                            |
| [RenovationCostsController](BikeHaus.API/Controllers/RenovationCostsController.cs)         | auth              | Maintenance cost tracking                               |
| [ExportController](BikeHaus.API/Controllers/ExportController.cs)                           | auth              | Excel/CSV/PDF exports                                   |
| [ArchiveController](BikeHaus.API/Controllers/ArchiveController.cs)                         | auth              | Archived entities                                       |
| [SettingsController](BikeHaus.API/Controllers/SettingsController.cs)                       | auth + GET public | Shop config                                             |
| [BackupController](BikeHaus.API/Controllers/BackupController.cs)                           | auth              | DB + uploads backup                                     |
| [KleinanzeigenController](BikeHaus.API/Controllers/KleinanzeigenController.cs)             | auth              | Scraper control                                         |
| [EmailAccountsController](BikeHaus.API/Controllers/EmailAccountsController.cs)             | auth              | SMTP config                                             |
| WeatherForecastController                                                                  | demo              | Default template leftover — ignore                      |

### Domain — [BikeHaus.Domain/Entities/](BikeHaus.Domain/Entities/) (32 entities)

All inherit `BaseEntity` (Id, CreatedAt, UpdatedAt). Decimal cols use `decimal(18,2)`. Field names are German (Marke, Preis, Datum, Kaution, etc.).

**Core sales flow**: `Bicycle` → `Purchase` (intake from seller) → optional `Reservation` → `Sale` (with `SaleAccessory`, `SalePayment`, `Signature`) → optional `Return`.

**Rental flow (two parallel)**:

- **Public bookings**: `RentalBooking` ← `RentalBookingBike` (multi-bike) + `RentalBookingAccessory`. Status: Pending → Approved → (Cancelled). Approved admin-side becomes a `Rental`.
- **Formal contract**: `Rental` ← `RentalAccessoryItem`. Status: Active → Returned/Cancelled.

**Catalog tables (independent of inventory)**:

- `NeueFahrrad` + `NeueFahrradImage` — new-bike catalog (homepage).
- `HomepageAccessory` + `HomepageAccessoryImage` — accessory catalog (homepage).
- `RentalAccessory` — accessories available for rental.
- `AccessoryCatalog` — generic accessory master.
- `RepairShowcase` + `RepairShowcaseImage` — workshop gallery.
- `KleinanzeigenListing` + `KleinanzeigenImage` — scraped marketplace ads.

**Unique-indexed fields**: `Purchase.BelegNummer`, `Sale.BelegNummer`, `Return.BelegNummer`, `Rental.MietvertragNummer`, `RentalBooking.BuchungsNummer`, `Reservation.ReservierungsNummer`, `Invoice.RechnungsNummer`, `User.Username`, `KleinanzeigenListing.ExternalId`.

> `Bicycle.Rahmennummer` is **indexed but NOT unique** — `entity.HasIndex(e => e.Rahmennummer)` in [BikeHausDbContext.cs](BikeHaus.Infrastructure/Data/BikeHausDbContext.cs) has no `.IsUnique()`, and no migration adds one. Two bicycles can carry the same frame number, so nothing stops a duplicate record if the same bike is entered twice (e.g. via the rental form's quick-add). This file previously claimed the field was unique; it is not.

### Enums — [BikeHaus.Domain/Enums/](BikeHaus.Domain/Enums/)

- `BikeStatus`: Available, Sold, Reserved, Rented
- `BikeCondition`: Neu, Gebraucht
- `RentalStatus`: Active, Returned, Cancelled
- `RentalBookingStatus`: Pending, Approved, Cancelled
- `BikeConditionAtHandover`: SehrGut, Gut, Gebrauchsspuren
- `PaymentMethod`: Bar, PayPal, Karte, Überweisung
- `DocumentType`, `ReservationStatus`, `ReturnReason`, `SignatureType`

### Application layer — [BikeHaus.Application/](BikeHaus.Application/)

- **DTOs**: 31 files, all C# `record` types. Public-facing variants suffixed `PublicDto` (e.g. `PublicBicycleDto`, `PublicRentalBicycleDto`).
- **Mappings**: hand-written extension methods in [MappingExtensions.cs](BikeHaus.Application/Mappings/MappingExtensions.cs). **No AutoMapper.**
- **Pagination**: `PaginationParams` (Page, PageSize, Status, SearchTerm, Zustand, Fahrradtyp, Reifengroesse, Marke, IsRentable) → `PaginatedResult<T>`.
- **34 service interfaces** in `Interfaces/`; one implementation each (typically in `BikeHaus.Application/Services/` or `BikeHaus.Infrastructure/Services/`).

### Infrastructure — [BikeHaus.Infrastructure/](BikeHaus.Infrastructure/)

- **DbContext**: [BikeHausDbContext.cs](BikeHaus.Infrastructure/Data/BikeHausDbContext.cs), 33 DbSets.
- **Repositories**: generic `IRepository<T>` + 21 specific repos (e.g. `BicycleRepository` for paginated filtered queries). All auto-`SaveChangesAsync` per op.
- **Migrations**: 43 total. Latest: `20260514074811_FixRentalPriceCorruption`. Naming = `<UTC-timestamp>_<PascalCase>`.
- **External services**: `KleinanzeigenScraperService` (HTTP scraper), `MailcowMailboxProvisioningService` (mailbox auto-provision, gated by `MailboxProvisioning:Enabled`), `IndexNowService`, `GoogleReviewsService`, `SmtpEmailService` (MailKit), `PdfService`, `BackupService`.

### appsettings — [BikeHaus.API/appsettings.json](BikeHaus.API/appsettings.json)

- `ConnectionStrings:DefaultConnection` — SQLite, file `BikeHausFreiburg.db`.
- `Jwt:Key` — **must override via env var in prod**.
- `FileStorage:BasePath` — dev `uploads`, prod `/app/data/uploads`.
- `Mollie:ApiKey`, `IndexNow:ApiKey`, `GooglePlaces:ApiKey`, `Smtp:*`, `MailboxProvisioning:*` — all from env vars (`.env` loaded by docker-compose).
- Dev override [appsettings.Development.json](BikeHaus.API/appsettings.Development.json) uses Mollie test key.

---

## Admin SPA — [BikeHaus.Client/](BikeHaus.Client/)

**Angular 17.3, standalone, signals, custom SCSS.** No NgRx, no Material, no Tailwind.

**Routing** — [app.routes.ts](BikeHaus.Client/src/app/app.routes.ts): 28 lazy routes, all behind [authGuard](BikeHaus.Client/src/app/guards/auth.guard.ts). Token attached by [auth.interceptor.ts](BikeHaus.Client/src/app/interceptors/auth.interceptor.ts).

**Env**: dev `http://localhost:5196/api`, prod `/api` (relative, proxied by nginx).

**Page sections**:

- **Inventory**: `/bicycles`, `/bicycles/:id`, `/labels`
- **Purchases**: `/purchases`, `/purchases/new`, `/purchases/missing`, `/purchases/edit/:id`
- **Sales**: `/sales`, `/sales/new`, `/sales/edit/:id`
- **Returns**: `/returns`, `/returns/new`
- **Customers**: `/customers`
- **Rentals**: `/rentals`, `/rentals/new`, `/rentals/edit/:id`, `/rentals/:id`
- **Rental Bookings (public-incoming)**: `/rental-bookings`, `/rental-bookings/:id`
- **Catalogs**: `/neue-fahrraeder`, `/mietfahrraeder`, `/homepage-accessories`, `/rental-accessories`
- **Operations**: `/parts`, `/expenses`, `/invoices`, `/renovation-costs`, `/rental-reviews`
- **Admin**: `/settings`, `/archive`, `/statistics`, `/export`
- **Auth**: `/login` (only unguarded)

**All models** in single file: [models.ts](BikeHaus.Client/src/app/models/models.ts).

**Services**: in `src/app/services/` — one per backend controller (`bicycle.service.ts`, `rental.service.ts`, `purchase.service.ts`, etc.) plus utility services (`theme`, `notification`, `dialog`, `translation`).

---

## Public site — [BikeHaus.Homepage/](BikeHaus.Homepage/)

**Angular 17.3 + SSR** via `@angular/ssr` 17.3.17 + Express. Image opt via `sharp`. Custom SCSS, no UI libs.

**Routing**: All public routes are `/:lang/...`. Lang guard validates against `SUPPORTED_LANGUAGES`, sets `TranslationService.setLanguage()`. Root `''` redirects to `/de` (DEFAULT_LANGUAGE).

**i18n — 8 languages, NO JSON files**:

- Full support (incl. blog): `de` (default), `en`, `fr`, `tr`
- Machine-generated translation overrides: `es`, `it`, `ar`, `ru`
- RTL handled for `ar`
- Translations live in [translation.service.ts](BikeHaus.Homepage/src/app/services/translation.service.ts) + auto-generated [translation-overrides.ts](BikeHaus.Homepage/src/app/services/translation-overrides.ts)
- Config: [language-config.ts](BikeHaus.Homepage/src/app/services/language-config.ts) — `SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE`, `LOCALE_BY_LANGUAGE`, `OG_LOCALE_BY_LANGUAGE`

**SEO-aware slug aliases** (handled in [server.ts](BikeHaus.Homepage/server.ts)):

- `/en/fahrradverleih` → `/en/bike-rental` (301)
- `/fr/fahrradverleih` → `/fr/location-velo` (301)
- `www.` → apex (301)

**Pages** (under `:lang/`):
| Slug (DE) | Slug variants | Component |
|---|---|---|
| ``| — | [home](BikeHaus.Homepage/src/app/pages/home/home.component.ts) |
|`showroom`, `showroom/:id`, `showroom/danke`| — | Used bike catalog + detail + thank-you |
|`zubehoer`, `zubehoer/:id`| — | Accessory catalog + detail |
|`neue-fahrraeder`, `neue-fahrraeder/:id`| — | New bike catalog + detail |
|`fahrradverleih`| EN:`bike-rental`, FR: `location-velo`| Rental booking page |
|`ratgeber`, `ratgeber/:slug`| EN:`guide`, `guide/:slug`| Blog index + article |
|`about`, `contact`, `faq`, `garantie`, `impressum`, `datenschutz`| — | Static info pages |
|`fahrrad-:city` | — | City-specific local SEO landing pages |

**Prerendering** ([prerender-routes.txt](BikeHaus.Homepage/prerender-routes.txt)): ~98 static routes generated at build time.

**SSR cache**: `Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=3600`.

**Env**: dev `http://localhost:5196/api/public`, prod `https://api.bikehausfreiburg.com/api/public`.

**Services**:

- [api.service.ts](BikeHaus.Homepage/src/app/services/api.service.ts) — single service for all public endpoints
- [seo.service.ts](BikeHaus.Homepage/src/app/services/seo.service.ts) — Title/Meta, og:tags, hreflang
- [shop-info.service.ts](BikeHaus.Homepage/src/app/services/shop-info.service.ts)
- Static content: [blog.data.ts](BikeHaus.Homepage/src/app/services/blog.data.ts), [city-landing.data.ts](BikeHaus.Homepage/src/app/services/city-landing.data.ts)

---

## Infrastructure & deploy

### docker-compose ([docker-compose.yml](docker-compose.yml)) — 5 services

| Service    | Build                                                        | Port host:container | Notes                                                                                                  |
| ---------- | ------------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------ |
| `bikehaus` | root [Dockerfile](Dockerfile)                                | 5000:5000           | API + Playwright Chromium; volume `bikehaus-data` for `/app/data`                                      |
| `client`   | [BikeHaus.Client/Dockerfile](BikeHaus.Client/Dockerfile)     | internal 80         | Angular admin → nginx alpine                                                                           |
| `homepage` | [BikeHaus.Homepage/Dockerfile](BikeHaus.Homepage/Dockerfile) | 4000:4000           | Node SSR (prebuilt dist expected)                                                                      |
| `nginx`    | `nginx:alpine`                                               | 80, 443             | Reverse proxy + TLS; mounts [nginx/nginx.conf](nginx/nginx.conf) + certbot volumes + `./homepage-dist`; **reloads itself every 6h** to pick up renewed certs |
| `certbot`  | `certbot/certbot`                                            | —                   | Auto-renew loop every 12h, `restart: unless-stopped`                                                   |

`.env` at root provides: `JWT_SECRET_KEY`, `INDEXNOW_API_KEY`, `GOOGLE_PLACES_API_KEY`, `SMTP_*`.

### nginx ([nginx/nginx.conf](nginx/nginx.conf))

- **Upstreams**: `bikehaus_api → bikehaus:5000`, `bikehaus_client → client:80`, `homepage_ssr → homepage:4000`.
- **Server blocks (443)**:
  - `bikehausfreiburg.com` → SSR homepage; serves `/sitemap.xml`, `/robots.txt`, `/llms.txt` from static dist; proxies `/sitemap-products.xml` to API; legacy redirects (`/galerie → /de/showroom`, `/kontakt → /de/contact`).
  - `www.bikehausfreiburg.com` → 301 to apex.
  - `admin.bikehausfreiburg.com` → `/api/*` to API (rate limit 10r/s, burst 20), `/` to admin SPA.
  - `api.bikehausfreiburg.com` → API directly.
  - `mail.bikehausfreiburg.com` → Mailcow on `host.docker.internal:8444` (no buffering, 3600s timeout).
- TLS via Let's Encrypt for all subdomains; HTTP→HTTPS redirect; `client_max_body_size 50M` (mail: unlimited).

### Build pipeline

- **Root [Dockerfile](Dockerfile)**: 3-stage. Playwright cache → `dotnet publish` linux-x64 self-contained → `dotnet/aspnet:9.0` runtime with ~25 system libs for Chromium. Healthcheck on `/api/settings`.
- **[BikeHaus.Client/Dockerfile](BikeHaus.Client/Dockerfile)**: `node:20-alpine` → `ng build --configuration production` → `nginx:alpine` serving `dist/bike-haus.client/browser`. 1y cache for hashed assets, no-cache for `index.html`.
- **[BikeHaus.Homepage/Dockerfile](BikeHaus.Homepage/Dockerfile)**: Runtime-only `node:20-alpine`. **Expects prebuilt `dist/`** (CI builds it). Entrypoint `node dist/bike-haus.homepage/server/server.mjs`.

### Deploy scripts — [deploy/](deploy/)

- [deploy.sh](deploy/deploy.sh) — main deploy: build bikehaus + homepage images, recreate containers, sync homepage dist to `./homepage-dist/browser` for nginx, restart nginx, health-check.
- [server-setup.sh](deploy/server-setup.sh) — first-time VPS bootstrap (Docker, ufw 22/80/443, dirs).
- [setup-ssl.sh](deploy/setup-ssl.sh) — idempotent Let's Encrypt bootstrap/repair for all subdomains (apex, www, admin, api, mail). Safe to re-run; no `--force-renewal`.
- [ssl-status.sh](deploy/ssl-status.sh) — TLS health report: what each host actually serves in the handshake, expiry, SAN coverage, ACME reachability. Exit 1 = broken, 2 = renewal overdue.

TLS is also watched daily by [.github/workflows/ssl-ops.yml](.github/workflows/ssl-ops.yml) (monitor + auto-repair + manual `diagnose`/`reload`/`renew`/`reissue`/`bootstrap`).

### Windows installer — [build-installer.bat](build-installer.bat)

Builds: Angular client → `dotnet publish` win-x64 self-contained → copy Angular dist to `publish/wwwroot` → create `publish/uploads/{image,screenshot}` → `electron-builder --win --x64` → output in `dist-electron/`.

### Electron — [electron/main.js](electron/main.js)

Spawns bundled `dotnet BikeHaus.API.dll` on `localhost:5196`, opens `BrowserWindow` pointing at it. Log file at `userData/bikehaus.log`. NSIS one-click installer, desktop shortcut.

### Chrome extension — [chrome-extension-bulk-edit/manifest.json](chrome-extension-bulk-edit/manifest.json)

MV3. Permissions: storage, tabs, scripting, alarms. Host perms: kleinanzeigen.de + api.bikehausfreiburg.com + localhost. Bulk-edits Kleinanzeigen listing descriptions; syncs with BikeHaus API.

### CLI utilities

- [CreateTestDb/](CreateTestDb/) — seed test database.
- [ResetPw/](ResetPw/) — reset admin password (writes hash to `Users` table).
- [KleinSync/](KleinSync/) — manual Kleinanzeigen sync (mirror of background service).

---

## Domain glossary (DE / EN / TR)

The codebase uses **German field/entity names**. Use this when generating code or interpreting properties.

| German                        | English                | Türkçe               |
| ----------------------------- | ---------------------- | -------------------- |
| Fahrrad / Bicycle             | Bicycle                | Bisiklet             |
| Marke                         | Brand                  | Marka                |
| Modell                        | Model                  | Model                |
| Rahmennummer                  | Frame number           | Şase no              |
| Reifengröße                   | Tire size              | Lastik boyu          |
| Rahmengröße                   | Frame size             | Kadro boyu           |
| Farbe                         | Color                  | Renk                 |
| Zustand                       | Condition              | Durum                |
| Fahrradtyp / Art              | Bike type              | Bisiklet tipi        |
| Verkauf / Sale                | Sale                   | Satış                |
| Kauf / Purchase               | Purchase               | Alış                 |
| Rückgabe / Return             | Return                 | İade                 |
| Verleih / Vermietung / Rental | Rental                 | Kiralama             |
| Reservierung                  | Reservation            | Rezervasyon          |
| Buchung                       | Booking                | Rezervasyon (online) |
| Mietvertrag                   | Rental contract        | Kira sözleşmesi      |
| Kunde                         | Customer               | Müşteri              |
| Verkäufer                     | Seller                 | Satıcı               |
| Käufer                        | Buyer                  | Alıcı                |
| Preis                         | Price                  | Fiyat                |
| Tagespreis                    | Daily price            | Günlük fiyat         |
| Kaution                       | Deposit                | Depozito             |
| Rabatt                        | Discount               | İndirim              |
| Belegnummer                   | Receipt number         | Belge no             |
| Zahlungsart                   | Payment method         | Ödeme şekli          |
| Anzahlung                     | Down payment           | Ön ödeme             |
| Garantie                      | Warranty               | Garanti              |
| Zubehör                       | Accessory              | Aksesuar             |
| Lieferant                     | Supplier               | Tedarikçi            |
| Ausgabe                       | Expense                | Gider                |
| Rechnung                      | Invoice                | Fatura               |
| Steuernummer                  | Tax number             | Vergi no             |
| Öffnungszeiten                | Opening hours          | Çalışma saatleri     |
| Verlustgebühr                 | Loss fee               | Kayıp ücreti         |
| Übergabe                      | Handover               | Teslim               |
| Unterschrift                  | Signature              | İmza                 |
| Mietfahrrad                   | Rental bike            | Kiralık bisiklet     |
| Neufahrrad                    | New bike               | Yeni bisiklet        |
| Renovierungskosten            | Renovation/repair cost | Bakım maliyeti       |

---

## Conventions

1. **Language**: code identifiers and DB columns are **German**. User-facing strings are translated client-side via `TranslationService`. Comments may be German or English — match surrounding code.
2. **DTOs are records**: prefer `public record FooDto(...)` over classes. Add `Create`/`Update`/`Public` suffix for variants.
3. **Mapping**: extension methods on entity / DTO. No AutoMapper. Co-locate per entity in [MappingExtensions.cs](BikeHaus.Application/Mappings/MappingExtensions.cs).
4. **Pagination**: list endpoints expose both unpaginated `GET /` and `GET /paginated` (using `PaginationParams`). Always add the paginated variant for any new list-heavy entity.
5. **Auth**: every controller is `[Authorize]` by default; mark public reads with `[AllowAnonymous]`. Public catalog endpoints typically live under `/api/public*` controllers.
6. **Repositories**: simple CRUD via generic `Repository<T>`; complex queries (with joins, filters, paging) get a dedicated repository.
7. **Migrations**: name `<PascalCaseSummary>`. Always reference both `--project BikeHaus.Infrastructure` and `--startup-project BikeHaus.API` since the DbContext lives in Infrastructure but config in API.
8. **Angular components**: standalone, signal-based state, hand-rolled SCSS. Lazy-load every route. Auth-guard everything in Client; never in Homepage.
9. **Public-facing DTOs**: never expose internal IDs/notes/admin fields. Use `PublicXxxDto` projections.
10. **i18n**: never put hardcoded English/Turkish strings in Homepage templates. Add to `TranslationService.translations` and run the override generator if applicable.

---

## Known gotchas

1. **Two DB files**: `BikeHaus.API/BikeHausFreiburg.db` is the working SQLite (committed with `-shm`/`-wal` side files — tracked changes are normal). Root `test.db` is a local fixture; do not commit data changes.
2. **DB file is in repo**: `BikeHausFreiburg.db` is tracked; modifying it locally shows in `git status`. Real prod data lives in the docker volume `bikehaus-data`.
3. **Frame size index migration**: schema enforces `Bicycle.Rahmennummer` unique; importing data with duplicates breaks migration. Last incident: `20260514074811_FixRentalPriceCorruption` repaired earlier price corruption — don't reverse it.
4. **Homepage Dockerfile expects prebuilt `dist/`** — running `docker compose build homepage` without first running `npm run build` in `BikeHaus.Homepage/` will produce an empty image. CI does the build step.
5. **Mailcow & DKIM**: see memory `project_mailcow_dkim.md`. DKIM keys live where rspamd reads them, not where mailcow stores them — surprises possible.
6. **DMARC is `p=reject`** for outbound mail. Any new sending domain/subdomain needs SPF + DKIM aligned before sending or mail will be rejected.
7. **Background sync** scrapes Kleinanzeigen via Playwright/Chromium running inside the API container — the runtime image is heavy (~1.5 GB) because of this. Don't strip the system libs from the Dockerfile.
8. **Angular `serve:ssr:BikeHaus.Homepage`** runs the built server bundle. To dev SSR-aware code, build first; for plain SPA dev use `npm start`.
9. **Auto-migration on startup**: API runs `db.Database.Migrate()` at boot. A bad migration in `master` will brick prod boot — always test `dotnet ef database update` locally before committing.
10. **CORS in prod = `AllowAnyOrigin`** (see Program.cs). API access is gated by JWT, not CORS, so this is intentional, but be careful with cookie-based auth if you ever add it.
11. **JWT key**: must be ≥32 bytes. The default in appsettings is a placeholder — env var `Jwt__Key` (double underscore for nested config) overrides.
12. **Two parallel rental concepts**: `RentalBooking` (public, multi-bike, online flow) ≠ `Rental` (formal in-store contract). Approving a `RentalBooking` admin-side typically materializes into one or more `Rental` rows. Don't conflate them in queries/services.
13. **TLS certs live in nginx's memory, not on disk.** certbot renews inside its own container; nginx only re-reads the files on reload. The nginx service therefore runs a 6h self-reload loop (`command:` in docker-compose.yml) — don't remove it, or HTTPS silently dies the next time the in-memory cert expires. Adding a new `server_name` with a 443 block also means adding that host to `DOMAINS` in `deploy/setup-ssl.sh`; otherwise the host gets a wrong-name cert that HSTS (`includeSubDomains` on the apex) makes unbypassable. The reverse bites too: `mail.` was in the live certificate but missing from `DOMAINS`, so running the script would have dropped it. CI enforces the match (`nginx-config-check.yml`). Diagnose with `deploy/ssl-status.sh`, never with reflexive `--force-renewal` (Let's Encrypt: 5 duplicate certs/week).

---

## Recent context (2026-05-14)

- **Branch**: master, up-to-date with origin.
- **Uncommitted**: API `Program.cs`, reservation form (Client), fahrradverleih component (Homepage), new migration `20260514074811_FixRentalPriceCorruption`, EF model snapshot.
- **Recent commits**: rental form address fields, rental booking address columns, missing using directives fix, label additions for rental page.
- **Active initiative**: rental booking flow polish — see [RENTAL_BOOKING_FLOW.md](RENTAL_BOOKING_FLOW.md). 5-step UX: date → availability → bike detail → customer info → review.
- **SEO roadmap**: [SEO-OPTIMIZATION-PLAN.md](SEO-OPTIMIZATION-PLAN.md) (DE), [SEO-EN-FR-PLAN.md](SEO-EN-FR-PLAN.md) (EN/FR).
- **Self-hosted mail**: Mailcow on `mail.bikehausfreiburg.com`, proxied through nginx. DMARC `p=reject`; ongoing DKIM tuning.

---

## Where to find things

For a fast lookup table (entity → file, route → component, endpoint → controller), see [.claude/INDEX.md](.claude/INDEX.md).

For repeatable workflows (build, run, migrate, deploy), see [.claude/commands/](.claude/commands/) (slash commands).

For project memory across sessions, see [C:\Users\hamza\.claude\projects\d--projects-bikehausfreiburg\memory\MEMORY.md](file:///C:/Users/hamza/.claude/projects/d--projects-bikehausfreiburg/memory/MEMORY.md).
