# E-Bike Catalog — Design Spec

**Date:** 2026-06-16
**Status:** Approved (Stage 1), Stage 2 deferred
**Author:** Hamza Öztürk + Claude

## Summary

Add a dedicated, separately-browsable **E-Bike** catalog to the public homepage,
modeled on the existing `NeueFahrrad` ("Neue Fahrräder" / new bikes) feature, but
as its own entity so we can store and filter e-bike-specific specs (motor, battery,
range, torque).

The work is split into two stages built in order:

- **Stage 1 (this spec):** the E-Bike catalog itself — entity + DB, admin CRUD,
  public catalog + detail pages with filtering, i18n, navigation.
- **Stage 2 (deferred, separate spec):** automatic import (scraping) of e-bikes
  from specific supplier sites into the Stage-1 catalog. Source confirmed:
  `feldmeier-bike.com` (IDEAL brand). See Appendix.

Why a separate entity (not reusing the existing `NeueFahrrad` "E-Bikes" category):
e-bikes need extra fields (motor / battery / range / torque) that `NeueFahrrad`
does not model, the catalog has its own page/navigation, and Stage-2 scraping
imports into a clean, dedicated table.

## Data model

Two new tables, mirroring `NeueFahrrad` / `NeueFahrradImage`.

### `EBike`
Shared fields (same semantics/limits as `NeueFahrrad`):
`Titel` (req), `Beschreibung`, `Preis` (req), `PreisText`, `Kategorie`, `Marke`,
`Modell`, `Farbe`, `Rahmengroesse`, `Reifengroesse`, `Gangschaltung`,
`Zustand` (req, default "Neu"), `Angebot`, `IsActive` (default true),
`CreatedAt`, `UpdatedAt`, navigation `Images`.

E-bike-specific fields:

| Field | Type | Meaning | Public filter |
| --- | --- | --- | --- |
| `MotorMarke` | string? | Motor brand (Bosch, Shimano, Yamaha…) | select (distinct values) |
| `MotorPosition` | string? | Mittelmotor / Heckmotor / Frontmotor | select |
| `AkkuKapazitaetWh` | int? | Battery capacity in Wh | range (min–max) |
| `ReichweiteKm` | int? | Estimated range in km (optional; not always available) | range (min–max) |
| `MotorLeistungNm` | int? | Torque in Nm (or power) | range (min–max) |

`Kategorie` here means e-bike **type**: `E-City`, `E-Trekking`, `E-MTB`,
`E-Lastenrad`, `E-Falt`, `Sonstige` (hardcoded options in the admin form, same
pattern as NeueFahrrad's category list).

### `EBikeImage`
`Id`, `EBikeId` (FK, cascade delete), `FilePath` (relative,
`/uploads/e-bikes/{id}/{guid}.ext`), `SortOrder`, navigation `EBike`.

### DbContext / migration
- `BikeHausDbContext`: add `DbSet<EBike> EBikes`, `DbSet<EBikeImage> EBikeImages`.
- `OnModelCreating`: same column max-lengths as NeueFahrrad; indexes on
  `IsActive`, `Kategorie`, `Marke`, `MotorMarke`; cascade delete on images.
- Migration name: `AddEBikes`. Test with `dotnet ef database update` locally
  before committing (auto-migration runs on API boot — a bad migration bricks prod).

## Backend (copy NeueFahrrad pattern)

- **Domain:** `BikeHaus.Domain/Entities/EBike.cs`, `EBikeImage.cs`.
- **DTOs:** `BikeHaus.Application/DTOs/EBikeDtos.cs` —
  `EBikeDto`, `EBikeCreateDto`, `EBikeUpdateDto` (adds `IsActive`),
  `EBikeImageDto`, `EBikeCategoryDto`. C# `record` types. Mapping extension
  methods in `MappingExtensions.cs`.
- **Repository:** `IEBikeRepository` (Domain) + `EBikeRepository`
  (Infrastructure): `GetAllWithImagesAsync`, `GetAllActiveAsync` (ordered by
  `CreatedAt` DESC), `GetByCategoryAsync`, `GetWithImagesAsync`,
  `GetCategoriesAsync`. Eager-load images ordered by `SortOrder`.
- **Service:** `IEBikeService` + `EBikeService` — CRUD, image add/delete,
  category aggregation. Public methods return only `IsActive == true`.
- **Admin controller:** `EBikesController` at `api/e-bikes`, `[Authorize]`.
  Endpoints (mirror NeueFahraederController):
  `GET /`, `GET /{id}`, `GET /categories`, `POST /`, `PUT /{id}`,
  `DELETE /{id}`, `POST /{id}/images` (multipart), `DELETE /images/{imageId}`.
  Image storage: `{basePath}/e-bikes/{id}/{guid}.ext`, store relative
  `/uploads/e-bikes/{id}/{filename}`.
- **Public endpoints:** add to `PublicController` (`api/public`, `[AllowAnonymous]`):
  `GET /e-bikes`, `GET /e-bikes/category/{category}`, `GET /e-bikes/{id}`,
  `GET /e-bikes/categories`. Use `PublicEBikeDto` projection that excludes admin
  fields (per convention #9). The public DTO still exposes the e-bike spec fields.

## Admin SPA (`BikeHaus.Client`)

- **Routes** (`app.routes.ts`, lazy, behind `authGuard`):
  `/e-bikes`, `/e-bikes/new`, `/e-bikes/edit/:id`.
- **Models** (`models.ts`): `EBike`, `EBikeCreate`, `EBikeUpdate`,
  `EBikeImage`, `EBikeCategory` — copy of NeueFahrrad interfaces + new fields.
- **Service:** `e-bike.service.ts` — copy of `neue-fahrrad.service.ts` against
  `api/e-bikes`.
- **List component:** grid + search (titel/marke/modell) + category filter +
  edit/delete + active/inactive badge. Copy of NeueFahrrad list.
- **Form component:** copy of NeueFahrrad form + a new section
  **"Antrieb / Motor & Akku"** with: MotorMarke, MotorPosition (select),
  AkkuKapazitaetWh, ReichweiteKm, MotorLeistungNm. Same image-gallery upload
  flow (create first → redirect to edit → upload images).
- **i18n:** add `eBike*` translation keys (German labels) in
  `translation.service.ts`.

## Public homepage (`BikeHaus.Homepage`)

- **Routes** (`app.routes.ts`): `/:lang/e-bikes` (catalog list),
  `/:lang/e-bikes/:id` (detail). Slug `e-bikes` for all languages for now
  (localizable later via the server.ts alias mechanism if desired).
- **Navigation:** add an **"E-Bikes"** menu item next to "Neue Fahrräder".
- **API service** (`api.service.ts`): `getEBikes()`, `getEBikesByCategory()`,
  `getEBikeById()`, `getEBikeCategories()` against `/api/public/e-bikes*`.
- **Catalog component:** sidebar + grid (copy NeueFahrrad catalog) with filters:
  - text search (titel, beschreibung, marke, modell)
  - type (`Kategorie`) checkbox/select
  - `Marke` select
  - `MotorMarke` select
  - `MotorPosition` select
  - `AkkuKapazitaetWh` range (min/max)
  - `ReichweiteKm` range (min/max)
  - price range (min/max)
  - sort: newest | price-asc | price-desc | a-z
  - active filter pills + result count + mobile filter toggle
  - all filtering client-side via signals/computed (same as NeueFahrrad)
- **Detail component:** gallery (main image + thumbnails + prev/next) + sticky
  spec sidebar including motor/battery/range/torque rows + price card (with
  Angebot/sale handling) + WhatsApp & Google Maps CTAs. Copy NeueFahrrad detail.
- **SEO:** `seo.service.ts` Title/Meta/og + hreflang for both routes; add the
  catalog route to `prerender-routes.txt` per language.
- **i18n:** add e-bike translation keys to `translation.service.ts`; regenerate
  `translation-overrides.ts` for machine-translated locales (es/it/ar/ru).
  Never hardcode strings in templates (convention #10).

## Testing / verification

1. `dotnet build` the solution; `dotnet ef database update` to apply `AddEBikes`.
2. Run API + admin SPA; create 2–3 sample e-bikes with images and spec fields.
3. Run homepage (`npm start`); verify `/de/e-bikes` lists them, each filter
   (type, brand, motor brand, motor position, battery range, range, price)
   narrows results correctly, and detail page renders all spec rows + CTAs.
4. Verify menu item and language switching work; check at least `de` and `en`.

## Out of scope (Stage 1)

- Scraping / automatic import (Stage 2).
- Pagination on the public catalog (NeueFahrrad does client-side filtering of
  the full active set; match that. Add `/paginated` only if the dataset grows).
- Localized slugs (`/e-bikes` everywhere for now).

## Appendix — Stage 2 (scraping) notes, for the next spec

- **Sources:** `https://www.feldmeier-bike.com/shop` (full shop) and
  `https://www.feldmeier-bike.com/ideal-e-bikes` (IDEAL e-bike listing).
  The shop contains non-e-bike products too → scraper must filter to e-bikes.
- **Site tech:** Wix Stores. Listing pages show name + price; full specs live on
  `/product-page/<slug>` detail pages, rendered in HTML (JS-driven site).
- **Approach:** reuse the existing Playwright/Chromium infrastructure in the API
  container (same as `KleinanzeigenScraperService`). Map detail-page fields to
  `EBike`: title→Titel, brand "IDEAL"→Marke, model→Modell, price→Preis,
  motor string→MotorMarke/MotorPosition/MotorLeistungNm, battery→AkkuKapazitaetWh,
  frame sizes→Rahmengroesse, wheels→Reifengroesse, gears→Gangschaltung,
  color→Farbe, images→EBikeImage. Range often absent → leave null.
- Likely modeled as an admin-triggered import + optional periodic background sync,
  with a dedupe key (e.g. source URL / external id) to avoid duplicates.
