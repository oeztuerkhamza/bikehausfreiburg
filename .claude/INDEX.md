# Project File Index — Fast Lookup

Cross-reference tables. Use this before Grep/Glob for "where is X" questions. For architectural context, see [../CLAUDE.md](../CLAUDE.md).

---

## Domain entities → file

| Entity | File |
|---|---|
| Bicycle | [BikeHaus.Domain/Entities/Bicycle.cs](../BikeHaus.Domain/Entities/Bicycle.cs) |
| BicycleImage | [BikeHaus.Domain/Entities/BicycleImage.cs](../BikeHaus.Domain/Entities/BicycleImage.cs) |
| Customer | [BikeHaus.Domain/Entities/Customer.cs](../BikeHaus.Domain/Entities/Customer.cs) |
| Purchase | [BikeHaus.Domain/Entities/Purchase.cs](../BikeHaus.Domain/Entities/Purchase.cs) |
| Sale | [BikeHaus.Domain/Entities/Sale.cs](../BikeHaus.Domain/Entities/Sale.cs) |
| SaleAccessory | [BikeHaus.Domain/Entities/SaleAccessory.cs](../BikeHaus.Domain/Entities/SaleAccessory.cs) |
| SalePayment | [BikeHaus.Domain/Entities/SalePayment.cs](../BikeHaus.Domain/Entities/SalePayment.cs) |
| Return | [BikeHaus.Domain/Entities/Return.cs](../BikeHaus.Domain/Entities/Return.cs) |
| Reservation | [BikeHaus.Domain/Entities/Reservation.cs](../BikeHaus.Domain/Entities/Reservation.cs) |
| Rental | [BikeHaus.Domain/Entities/Rental.cs](../BikeHaus.Domain/Entities/Rental.cs) |
| RentalAccessory | [BikeHaus.Domain/Entities/RentalAccessory.cs](../BikeHaus.Domain/Entities/RentalAccessory.cs) |
| RentalAccessoryItem | [BikeHaus.Domain/Entities/RentalAccessoryItem.cs](../BikeHaus.Domain/Entities/RentalAccessoryItem.cs) |
| RentalBooking | [BikeHaus.Domain/Entities/RentalBooking.cs](../BikeHaus.Domain/Entities/RentalBooking.cs) |
| RentalBookingBike | [BikeHaus.Domain/Entities/RentalBookingBike.cs](../BikeHaus.Domain/Entities/RentalBookingBike.cs) |
| RentalBookingAccessory | [BikeHaus.Domain/Entities/RentalBookingAccessory.cs](../BikeHaus.Domain/Entities/RentalBookingAccessory.cs) |
| RentalReview | [BikeHaus.Domain/Entities/RentalReview.cs](../BikeHaus.Domain/Entities/RentalReview.cs) |
| Document | [BikeHaus.Domain/Entities/Document.cs](../BikeHaus.Domain/Entities/Document.cs) |
| Signature | [BikeHaus.Domain/Entities/Signature.cs](../BikeHaus.Domain/Entities/Signature.cs) |
| Expense | [BikeHaus.Domain/Entities/Expense.cs](../BikeHaus.Domain/Entities/Expense.cs) |
| Invoice | [BikeHaus.Domain/Entities/Invoice.cs](../BikeHaus.Domain/Entities/Invoice.cs) |
| RenovationCost | [BikeHaus.Domain/Entities/RenovationCost.cs](../BikeHaus.Domain/Entities/RenovationCost.cs) |
| User | [BikeHaus.Domain/Entities/User.cs](../BikeHaus.Domain/Entities/User.cs) |
| ShopSettings | [BikeHaus.Domain/Entities/ShopSettings.cs](../BikeHaus.Domain/Entities/ShopSettings.cs) |
| AccessoryCatalog | [BikeHaus.Domain/Entities/AccessoryCatalog.cs](../BikeHaus.Domain/Entities/AccessoryCatalog.cs) |
| NeueFahrrad | [BikeHaus.Domain/Entities/NeueFahrrad.cs](../BikeHaus.Domain/Entities/NeueFahrrad.cs) |
| NeueFahrradImage | [BikeHaus.Domain/Entities/NeueFahrradImage.cs](../BikeHaus.Domain/Entities/NeueFahrradImage.cs) |
| HomepageAccessory | [BikeHaus.Domain/Entities/HomepageAccessory.cs](../BikeHaus.Domain/Entities/HomepageAccessory.cs) |
| HomepageAccessoryImage | [BikeHaus.Domain/Entities/HomepageAccessoryImage.cs](../BikeHaus.Domain/Entities/HomepageAccessoryImage.cs) |
| RepairShowcase | [BikeHaus.Domain/Entities/RepairShowcase.cs](../BikeHaus.Domain/Entities/RepairShowcase.cs) |
| RepairShowcaseImage | [BikeHaus.Domain/Entities/RepairShowcaseImage.cs](../BikeHaus.Domain/Entities/RepairShowcaseImage.cs) |
| KleinanzeigenListing | [BikeHaus.Domain/Entities/KleinanzeigenListing.cs](../BikeHaus.Domain/Entities/KleinanzeigenListing.cs) |
| KleinanzeigenImage | [BikeHaus.Domain/Entities/KleinanzeigenImage.cs](../BikeHaus.Domain/Entities/KleinanzeigenImage.cs) |
| EmailAccount | [BikeHaus.Domain/Entities/EmailAccount.cs](../BikeHaus.Domain/Entities/EmailAccount.cs) |
| EmailLog | [BikeHaus.Domain/Entities/EmailLog.cs](../BikeHaus.Domain/Entities/EmailLog.cs) |

Enums: [BikeHaus.Domain/Enums/](../BikeHaus.Domain/Enums/) — BikeStatus, BikeCondition, RentalStatus, RentalBookingStatus, BikeConditionAtHandover, PaymentMethod, DocumentType, ReservationStatus, ReturnReason, SignatureType.

---

## API endpoint prefix → controller

Base: `/api/`

| Prefix | Controller |
|---|---|
| `auth/*` | [AuthController.cs](../BikeHaus.API/Controllers/AuthController.cs) |
| `bicycles/*` | [BicyclesController.cs](../BikeHaus.API/Controllers/BicyclesController.cs) |
| `customers/*` | [CustomersController.cs](../BikeHaus.API/Controllers/CustomersController.cs) |
| `purchases/*` | [PurchasesController.cs](../BikeHaus.API/Controllers/PurchasesController.cs) |
| `sales/*` | [SalesController.cs](../BikeHaus.API/Controllers/SalesController.cs) |
| `returns/*` | [ReturnsController.cs](../BikeHaus.API/Controllers/ReturnsController.cs) |
| `rentals/*` | [RentalsController.cs](../BikeHaus.API/Controllers/RentalsController.cs) |
| `rental-bookings/*` | [RentalBookingsController.cs](../BikeHaus.API/Controllers/RentalBookingsController.cs) |
| `rental-accessories/*` | [RentalAccessoriesController.cs](../BikeHaus.API/Controllers/RentalAccessoriesController.cs) |
| `rental-reviews/*` | [RentalReviewsController.cs](../BikeHaus.API/Controllers/RentalReviewsController.cs) |
| `reservations/*` | [ReservationsController.cs](../BikeHaus.API/Controllers/ReservationsController.cs) |
| `checkout/*` | [CheckoutController.cs](../BikeHaus.API/Controllers/CheckoutController.cs) |
| `public/*` | [PublicController.cs](../BikeHaus.API/Controllers/PublicController.cs) |
| `public-rentals/*` | [PublicRentalsController.cs](../BikeHaus.API/Controllers/PublicRentalsController.cs) |
| `homepage-accessories/*` | [HomepageAccessoriesController.cs](../BikeHaus.API/Controllers/HomepageAccessoriesController.cs) |
| `neue-fahrraeder/*` | [NeueFahrraederController.cs](../BikeHaus.API/Controllers/NeueFahrraederController.cs) |
| `repair-showcase/*` | [RepairShowcaseController.cs](../BikeHaus.API/Controllers/RepairShowcaseController.cs) |
| `accessories/*` | [AccessoryCatalogController.cs](../BikeHaus.API/Controllers/AccessoryCatalogController.cs) |
| `documents/*` | [DocumentsController.cs](../BikeHaus.API/Controllers/DocumentsController.cs) |
| `dashboard/*` | [DashboardController.cs](../BikeHaus.API/Controllers/DashboardController.cs) |
| `statistics/*` | [StatisticsController.cs](../BikeHaus.API/Controllers/StatisticsController.cs) |
| `expenses/*` | [ExpensesController.cs](../BikeHaus.API/Controllers/ExpensesController.cs) |
| `invoices/*` | [InvoicesController.cs](../BikeHaus.API/Controllers/InvoicesController.cs) |
| `renovation-costs/*` | [RenovationCostsController.cs](../BikeHaus.API/Controllers/RenovationCostsController.cs) |
| `export/*` | [ExportController.cs](../BikeHaus.API/Controllers/ExportController.cs) |
| `archive/*` | [ArchiveController.cs](../BikeHaus.API/Controllers/ArchiveController.cs) |
| `settings/*` | [SettingsController.cs](../BikeHaus.API/Controllers/SettingsController.cs) |
| `backup/*` | [BackupController.cs](../BikeHaus.API/Controllers/BackupController.cs) |
| `kleinanzeigen/*` | [KleinanzeigenController.cs](../BikeHaus.API/Controllers/KleinanzeigenController.cs) |
| `email-accounts/*` | [EmailAccountsController.cs](../BikeHaus.API/Controllers/EmailAccountsController.cs) |

---

## Service interface → impl location

All interfaces in [BikeHaus.Application/Interfaces/](../BikeHaus.Application/Interfaces/). Implementations split between [BikeHaus.Application/Services/](../BikeHaus.Application/Services/) and [BikeHaus.Infrastructure/Services/](../BikeHaus.Infrastructure/Services/).

| Interface | Likely location |
|---|---|
| IAuthService | Infrastructure (BCrypt + JWT) |
| IBicycleService, ICustomerService, IPurchaseService, ISaleService, IReturnService, IRentalService, IRentalBookingService, IRentalAccessoryService, IReservationService, IDashboardService, IStatisticsService | Application |
| IDocumentService, IFileStorageService, IBackupService | Infrastructure (disk I/O) |
| IKleinanzeigenService, IKleinanzeigenScraperService | Infrastructure (HTTP/Playwright) |
| IEmailService, IEmailAccountService, IMailboxProvisioningService | Infrastructure (SMTP/Mailcow API) |
| IIndexNowService, IGoogleReviewsService | Infrastructure (external HTTP) |
| IPdfService | Infrastructure |
| IExportService | Application or Infrastructure |
| IShopSettingsService, IAccessoryCatalogService, IExpenseService, IInvoiceService, INeueFahrradService, IHomepageAccessoryService, IRepairShowcaseService, IRenovationCostService, IRentalReviewService, IArchiveService | Application |

Authoritative wiring: [BikeHaus.Infrastructure/DependencyInjection.cs](../BikeHaus.Infrastructure/DependencyInjection.cs).

---

## Admin SPA route → component

Routes: [BikeHaus.Client/src/app/app.routes.ts](../BikeHaus.Client/src/app/app.routes.ts). All except `/login` behind [authGuard](../BikeHaus.Client/src/app/guards/auth.guard.ts).

| Route | Component folder |
|---|---|
| `/` (dashboard) | [pages/dashboard/](../BikeHaus.Client/src/app/pages/dashboard/) |
| `/login` | [pages/login/](../BikeHaus.Client/src/app/pages/login/) |
| `/bicycles`, `/bicycles/:id`, `/labels` | [pages/bicycles/](../BikeHaus.Client/src/app/pages/bicycles/) |
| `/purchases/*` | [pages/purchases/](../BikeHaus.Client/src/app/pages/purchases/) |
| `/sales/*` | [pages/sales/](../BikeHaus.Client/src/app/pages/sales/) |
| `/returns/*` | [pages/returns/](../BikeHaus.Client/src/app/pages/returns/) |
| `/customers` | [pages/customers/](../BikeHaus.Client/src/app/pages/customers/) |
| `/rentals/*` | [pages/rentals/](../BikeHaus.Client/src/app/pages/rentals/) |
| `/rental-bookings/*` | [pages/rental-bookings/](../BikeHaus.Client/src/app/pages/rental-bookings/) |
| `/neue-fahrraeder/*` | [pages/neue-fahrraeder/](../BikeHaus.Client/src/app/pages/neue-fahrraeder/) |
| `/mietfahrraeder/*` | [pages/mietfahrraeder/](../BikeHaus.Client/src/app/pages/mietfahrraeder/) |
| `/homepage-accessories/*` | [pages/homepage-accessories/](../BikeHaus.Client/src/app/pages/homepage-accessories/) |
| `/rental-accessories` | [pages/rental-accessories/](../BikeHaus.Client/src/app/pages/rental-accessories/) |
| `/parts` | [pages/parts/](../BikeHaus.Client/src/app/pages/parts/) |
| `/expenses` | [pages/expenses/](../BikeHaus.Client/src/app/pages/expenses/) |
| `/invoices` | [pages/invoices/](../BikeHaus.Client/src/app/pages/invoices/) |
| `/renovation-costs` | [pages/renovation-costs/](../BikeHaus.Client/src/app/pages/renovation-costs/) |
| `/rental-reviews` | [pages/rental-reviews/](../BikeHaus.Client/src/app/pages/rental-reviews/) |
| `/statistics` | [pages/statistics/](../BikeHaus.Client/src/app/pages/statistics/) |
| `/export` | [pages/export/](../BikeHaus.Client/src/app/pages/export/) |
| `/settings` | [pages/settings/](../BikeHaus.Client/src/app/pages/settings/) |
| `/archive` | [pages/archive/](../BikeHaus.Client/src/app/pages/archive/) |

Single models file: [src/app/models/models.ts](../BikeHaus.Client/src/app/models/models.ts).
Services (one per controller): [src/app/services/](../BikeHaus.Client/src/app/services/).

---

## Public site route → component

Routes: [BikeHaus.Homepage/src/app/app.routes.ts](../BikeHaus.Homepage/src/app/app.routes.ts). All under `/:lang/...` (langs: `de` default, `en`, `fr`, `tr`, `es`, `it`, `ar`, `ru`).

| Slug (DE base) | Aliases | Component |
|---|---|---|
| `` (home) | — | [pages/home/](../BikeHaus.Homepage/src/app/pages/home/) |
| `showroom`, `showroom/:id`, `showroom/danke` | — | [pages/showroom/](../BikeHaus.Homepage/src/app/pages/showroom/), [pages/showroom-detail/](../BikeHaus.Homepage/src/app/pages/showroom-detail/) |
| `zubehoer`, `zubehoer/:id` | — | [pages/zubehoer/](../BikeHaus.Homepage/src/app/pages/zubehoer/) |
| `neue-fahrraeder`, `neue-fahrraeder/:id` | — | [pages/neue-fahrraeder/](../BikeHaus.Homepage/src/app/pages/neue-fahrraeder/) |
| `fahrradverleih` | EN: `bike-rental`, FR: `location-velo` | [pages/fahrradverleih/](../BikeHaus.Homepage/src/app/pages/fahrradverleih/) |
| `ratgeber`, `ratgeber/:slug` | EN: `guide`, `guide/:slug` | [pages/ratgeber/](../BikeHaus.Homepage/src/app/pages/ratgeber/), [pages/ratgeber-detail/](../BikeHaus.Homepage/src/app/pages/ratgeber-detail/) |
| `about` | — | [pages/about/](../BikeHaus.Homepage/src/app/pages/about/) |
| `contact` | — | [pages/contact/](../BikeHaus.Homepage/src/app/pages/contact/) |
| `faq` | — | [pages/faq/](../BikeHaus.Homepage/src/app/pages/faq/) |
| `garantie` | — | [pages/garantie/](../BikeHaus.Homepage/src/app/pages/garantie/) |
| `impressum` | — | [pages/impressum/](../BikeHaus.Homepage/src/app/pages/impressum/) |
| `datenschutz` | — | [pages/datenschutz/](../BikeHaus.Homepage/src/app/pages/datenschutz/) |
| `fahrrad-:city` | — | [pages/fahrrad-stadt/](../BikeHaus.Homepage/src/app/pages/fahrrad-stadt/) |

SSR entry: [server.ts](../BikeHaus.Homepage/server.ts).
Prerender list: [prerender-routes.txt](../BikeHaus.Homepage/prerender-routes.txt).
Static content: [services/blog.data.ts](../BikeHaus.Homepage/src/app/services/blog.data.ts), [services/city-landing.data.ts](../BikeHaus.Homepage/src/app/services/city-landing.data.ts).
Translations: [services/translation.service.ts](../BikeHaus.Homepage/src/app/services/translation.service.ts), [services/translation-overrides.ts](../BikeHaus.Homepage/src/app/services/translation-overrides.ts).
Language config: [services/language-config.ts](../BikeHaus.Homepage/src/app/services/language-config.ts).

---

## Configuration & key files

| Concern | File |
|---|---|
| API config (defaults) | [BikeHaus.API/appsettings.json](../BikeHaus.API/appsettings.json) |
| API config (dev) | [BikeHaus.API/appsettings.Development.json](../BikeHaus.API/appsettings.Development.json) |
| Admin SPA env (dev) | [BikeHaus.Client/src/environments/environment.ts](../BikeHaus.Client/src/environments/environment.ts) |
| Admin SPA env (prod) | [BikeHaus.Client/src/environments/environment.prod.ts](../BikeHaus.Client/src/environments/environment.prod.ts) |
| Public site env (dev) | [BikeHaus.Homepage/src/environments/environment.ts](../BikeHaus.Homepage/src/environments/environment.ts) |
| Public site env (prod) | [BikeHaus.Homepage/src/environments/environment.prod.ts](../BikeHaus.Homepage/src/environments/environment.prod.ts) |
| Solution | [BikeHausFreiburg.sln](../BikeHausFreiburg.sln) |
| Docker orchestration | [docker-compose.yml](../docker-compose.yml) |
| API Dockerfile (multi-stage) | [Dockerfile](../Dockerfile) |
| Admin Dockerfile | [BikeHaus.Client/Dockerfile](../BikeHaus.Client/Dockerfile) |
| Homepage Dockerfile | [BikeHaus.Homepage/Dockerfile](../BikeHaus.Homepage/Dockerfile) |
| nginx reverse proxy | [nginx/nginx.conf](../nginx/nginx.conf) |
| Windows installer | [build-installer.bat](../build-installer.bat) |
| Electron entry | [electron/main.js](../electron/main.js) |
| Chrome ext manifest | [chrome-extension-bulk-edit/manifest.json](../chrome-extension-bulk-edit/manifest.json) |
| Infrastructure DI | [BikeHaus.Infrastructure/DependencyInjection.cs](../BikeHaus.Infrastructure/DependencyInjection.cs) |
| DbContext | [BikeHaus.Infrastructure/Data/BikeHausDbContext.cs](../BikeHaus.Infrastructure/Data/BikeHausDbContext.cs) |
| Migrations | [BikeHaus.Infrastructure/Migrations/](../BikeHaus.Infrastructure/Migrations/) |
| Mapping extensions | [BikeHaus.Application/Mappings/MappingExtensions.cs](../BikeHaus.Application/Mappings/MappingExtensions.cs) |
| Pagination types | [BikeHaus.Application/DTOs/PaginatedResult.cs](../BikeHaus.Application/DTOs/PaginatedResult.cs) |
| Auth guard (Client) | [BikeHaus.Client/src/app/guards/auth.guard.ts](../BikeHaus.Client/src/app/guards/auth.guard.ts) |
| Auth interceptor (Client) | [BikeHaus.Client/src/app/interceptors/auth.interceptor.ts](../BikeHaus.Client/src/app/interceptors/auth.interceptor.ts) |
| Deploy script | [deploy/deploy.sh](../deploy/deploy.sh) |
| VPS bootstrap | [deploy/server-setup.sh](../deploy/server-setup.sh) |
| SSL cert bootstrap | [deploy/setup-ssl.sh](../deploy/setup-ssl.sh) |

---

## Root-level docs

- [RENTAL_BOOKING_FLOW.md](../RENTAL_BOOKING_FLOW.md) — 5-step rental booking UX
- [SEO-OPTIMIZATION-PLAN.md](../SEO-OPTIMIZATION-PLAN.md) — German SEO plan
- [SEO-EN-FR-PLAN.md](../SEO-EN-FR-PLAN.md) — EN/FR SEO plan
- [BikeHaus.Homepage/COMPLETE_HOMEPAGE_REDESIGN.md](../BikeHaus.Homepage/COMPLETE_HOMEPAGE_REDESIGN.md)
- [BikeHaus.Homepage/FIGMA_MOCKUP_SPEC.md](../BikeHaus.Homepage/FIGMA_MOCKUP_SPEC.md)
- [BikeHaus.Homepage/HERO_DESIGN_GUIDE.md](../BikeHaus.Homepage/HERO_DESIGN_GUIDE.md)
- [BikeHaus.Homepage/IMPLEMENTATION_TESTING_GUIDE.md](../BikeHaus.Homepage/IMPLEMENTATION_TESTING_GUIDE.md)
- [BikeHaus.Homepage/PROJECT_COMPLETE_SUMMARY.md](../BikeHaus.Homepage/PROJECT_COMPLETE_SUMMARY.md)
