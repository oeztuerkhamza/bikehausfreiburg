# E-Bike Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated, filterable E-Bike catalog (own entity) to the public homepage and admin panel, modeled on `NeueFahrrad`, then one-time import all feldmeier IDEAL e-bikes so the owner can edit them in admin.

**Architecture:** New `EBike` / `EBikeImage` EF entities mirroring `NeueFahrrad`, plus 5 e-bike-specific fields (motor brand, motor position, battery Wh, range km, torque Nm). Backend = copy of the NeueFahrrad service/repo/controller stack. Admin SPA + public homepage = copies of the NeueFahrrad components with an extra "Antrieb" section and extra filters. Data population is a one-time import (fetch ~20 feldmeier `/product-page` detail pages → seed via the admin API).

**Tech Stack:** ASP.NET Core (net8.0) + EF Core + SQLite; Angular 17.3 (admin SPA + SSR homepage); existing upload/image pipeline.

**Verification model:** No test project exists in this repo. Each task is verified by `dotnet build` / `dotnet ef`, or `ng build` / running the app and observing behavior — same as how NeueFahrrad was built. Commit after each task.

**Reference files to copy from (read these first):**
- `BikeHaus.Domain/Entities/NeueFahrrad.cs`, `NeueFahrradImage.cs`
- `BikeHaus.Application/DTOs/NeueFahrradDtos.cs`, `Mappings/MappingExtensions.cs`
- `BikeHaus.Application/Interfaces/INeueFahrradService.cs`, `Services/NeueFahrradService.cs`
- `BikeHaus.Domain/Interfaces/INeueFahrradRepository.cs`, `BikeHaus.Infrastructure/Repositories/NeueFahrradRepository.cs`
- `BikeHaus.Infrastructure/DependencyInjection.cs`, `Data/BikeHausDbContext.cs`
- `BikeHaus.API/Controllers/NeueFahraederController.cs`, `Controllers/PublicController.cs`
- `BikeHaus.Client/src/app/...` neue-fahrraeder pages, `neue-fahrrad.service.ts`, `models.ts`, `app.routes.ts`, `translation.service.ts`
- `BikeHaus.Homepage/src/app/...` neue-fahrraeder pages, `api.service.ts`, `app.routes.ts`, `translation.service.ts`, `prerender-routes.txt`

---

## Phase A — Backend

### Task 1: Domain entities

**Files:**
- Create: `BikeHaus.Domain/Entities/EBike.cs`
- Create: `BikeHaus.Domain/Entities/EBikeImage.cs`

- [ ] **Step 1:** Copy `NeueFahrrad.cs` → `EBike.cs`. Rename the class to `EBike`, rename the images nav-collection element type to `EBikeImage`, and add the 5 e-bike fields. The shared fields stay identical to `NeueFahrrad` (Titel req, Beschreibung, Preis req, PreisText, Kategorie, Marke, Modell, Farbe, Rahmengroesse, Reifengroesse, Gangschaltung, Zustand req default "Neu", Angebot, IsActive default true, CreatedAt, UpdatedAt). Add:

```csharp
public string? MotorMarke { get; set; }      // Bosch, Shimano, Yamaha...
public string? MotorPosition { get; set; }   // Mittelmotor / Heckmotor / Frontmotor
public int? AkkuKapazitaetWh { get; set; }   // battery capacity, Wh
public int? ReichweiteKm { get; set; }       // estimated range, km (often null)
public int? MotorLeistungNm { get; set; }    // torque, Nm
public List<EBikeImage> Images { get; set; } = new();
```

- [ ] **Step 2:** Copy `NeueFahrradImage.cs` → `EBikeImage.cs`. Rename class to `EBikeImage`, FK property `NeueFahrradId`→`EBikeId`, nav property type `NeueFahrrad`→`EBike` (named `EBike`). Keep `FilePath` (string, req) and `SortOrder` (int).

- [ ] **Step 3:** Build.

Run: `dotnet build BikeHausFreiburg.sln`
Expected: SUCCESS (entities compile; not yet wired into DbContext).

- [ ] **Step 4:** Commit.

```bash
git add BikeHaus.Domain/Entities/EBike.cs BikeHaus.Domain/Entities/EBikeImage.cs
git commit -m "feat(ebike): add EBike and EBikeImage domain entities"
```

---

### Task 2: DbContext + entity config + migration

**Files:**
- Modify: `BikeHaus.Infrastructure/Data/BikeHausDbContext.cs` (DbSets near line 26-27; config in `OnModelCreating` near the NeueFahrrad block ~453-483)
- Create (generated): `BikeHaus.Infrastructure/Migrations/<timestamp>_AddEBikes.cs`

- [ ] **Step 1:** Add DbSets next to the NeueFahrrad ones:

```csharp
public DbSet<EBike> EBikes => Set<EBike>();
public DbSet<EBikeImage> EBikeImages => Set<EBikeImage>();
```

- [ ] **Step 2:** In `OnModelCreating`, copy the NeueFahrrad `modelBuilder.Entity<NeueFahrrad>()` / `<NeueFahrradImage>()` blocks for `EBike` / `EBikeImage`. Keep the same max-lengths (Titel 500, Beschreibung 5000, Preis decimal(18,2), Kategorie 200, Marke 100, Modell 100, Farbe 150, Rahmengroesse 20, Reifengroesse 20, Gangschaltung 50, Zustand 20, FilePath 500). Indexes: `IsActive`, `Kategorie`, `Marke`, and additionally `MotorMarke`. Image: cascade delete on parent, FK on `EBikeId`. The new int? fields need no explicit config.

- [ ] **Step 3:** Create the migration.

Run:
```
dotnet ef migrations add AddEBikes --project BikeHaus.Infrastructure --startup-project BikeHaus.API
```
Expected: migration + snapshot generated, no errors.

- [ ] **Step 4:** Inspect the generated migration: confirm it only creates `EBikes` + `EBikeImages` tables and their indexes, and does NOT touch unrelated tables (especially nothing reversing `FixRentalPriceCorruption`).

- [ ] **Step 5:** Apply locally.

Run:
```
dotnet ef database update --project BikeHaus.Infrastructure --startup-project BikeHaus.API
```
Expected: applied; new tables exist.

- [ ] **Step 6:** Commit (include the modified working DB side-files only if normally tracked).

```bash
git add BikeHaus.Infrastructure/Data/BikeHausDbContext.cs BikeHaus.Infrastructure/Migrations/
git commit -m "feat(ebike): register EBike DbSets, config, and AddEBikes migration"
```

---

### Task 3: DTOs + mapping

**Files:**
- Create: `BikeHaus.Application/DTOs/EBikeDtos.cs`
- Modify: `BikeHaus.Application/Mappings/MappingExtensions.cs`

- [ ] **Step 1:** Copy `NeueFahrradDtos.cs` → `EBikeDtos.cs`. Define records `EBikeDto`, `EBikeCreateDto`, `EBikeUpdateDto`, `EBikeImageDto`, `EBikeCategoryDto`, plus a public projection `PublicEBikeDto`. Each non-image DTO includes the 5 new fields. `EBikeUpdateDto` adds `bool IsActive`. `PublicEBikeDto` excludes admin-only fields but keeps the spec fields + images. Mirror the exact field set of the NeueFahrrad equivalents otherwise.

- [ ] **Step 2:** In `MappingExtensions.cs`, add `ToDto`, `ToPublicDto`, `ToEntity` (create), and an `ApplyUpdate`/`ToEntity` (update) extension methods for `EBike`, co-located near the NeueFahrrad mappings, mapping all shared + new fields, and `Images` → `EBikeImageDto`.

- [ ] **Step 3:** Build.

Run: `dotnet build BikeHausFreiburg.sln`
Expected: SUCCESS.

- [ ] **Step 4:** Commit.

```bash
git add BikeHaus.Application/DTOs/EBikeDtos.cs BikeHaus.Application/Mappings/MappingExtensions.cs
git commit -m "feat(ebike): add EBike DTOs and mappings"
```

---

### Task 4: Repository

**Files:**
- Create: `BikeHaus.Domain/Interfaces/IEBikeRepository.cs`
- Create: `BikeHaus.Infrastructure/Repositories/EBikeRepository.cs`
- Modify: `BikeHaus.Infrastructure/DependencyInjection.cs`

- [ ] **Step 1:** Copy `INeueFahrradRepository.cs` → `IEBikeRepository.cs` (rename type args to `EBike`). Methods: `GetAllWithImagesAsync`, `GetAllActiveAsync`, `GetByCategoryAsync(string)`, `GetWithImagesAsync(int)`, `GetCategoriesAsync`.

- [ ] **Step 2:** Copy `NeueFahrradRepository.cs` → `EBikeRepository.cs`. Use `_context.EBikes`, `.Include(f => f.Images.OrderBy(i => i.SortOrder))`, `.OrderByDescending(f => f.CreatedAt)`, active filter `IsActive == true`.

- [ ] **Step 3:** In `DependencyInjection.cs`, register `services.AddScoped<IEBikeRepository, EBikeRepository>();` next to the NeueFahrrad registration.

- [ ] **Step 4:** Build.

Run: `dotnet build BikeHausFreiburg.sln`
Expected: SUCCESS.

- [ ] **Step 5:** Commit.

```bash
git add BikeHaus.Domain/Interfaces/IEBikeRepository.cs BikeHaus.Infrastructure/Repositories/EBikeRepository.cs BikeHaus.Infrastructure/DependencyInjection.cs
git commit -m "feat(ebike): add EBike repository + DI registration"
```

---

### Task 5: Service

**Files:**
- Create: `BikeHaus.Application/Interfaces/IEBikeService.cs`
- Create: `BikeHaus.Application/Services/EBikeService.cs`
- Modify: `BikeHaus.Infrastructure/DependencyInjection.cs` (or wherever NeueFahrradService is registered)

- [ ] **Step 1:** Copy `INeueFahrradService.cs` → `IEBikeService.cs`. Methods: `GetAllAsync`, `GetAllActiveAsync`, `GetByCategoryAsync`, `GetByIdAsync`, `CreateAsync(EBikeCreateDto)`, `UpdateAsync(int, EBikeUpdateDto)`, `DeleteAsync(int)`, `AddImageAsync(int, string, int)`, `DeleteImageAsync(int)`, `GetCategoriesAsync`. Add public-returning variants if NeueFahrrad has them (return `PublicEBikeDto` for public reads).

- [ ] **Step 2:** Copy `NeueFahrradService.cs` → `EBikeService.cs`, swap repository + DTO types, map all fields including the 5 new ones.

- [ ] **Step 3:** Register `services.AddScoped<IEBikeService, EBikeService>();` next to the NeueFahrrad service registration.

- [ ] **Step 4:** Build.

Run: `dotnet build BikeHausFreiburg.sln`
Expected: SUCCESS.

- [ ] **Step 5:** Commit.

```bash
git add BikeHaus.Application/Interfaces/IEBikeService.cs BikeHaus.Application/Services/EBikeService.cs BikeHaus.Infrastructure/DependencyInjection.cs
git commit -m "feat(ebike): add EBike service + DI registration"
```

---

### Task 6: Admin controller

**Files:**
- Create: `BikeHaus.API/Controllers/EBikesController.cs`

- [ ] **Step 1:** Copy `NeueFahraederController.cs` → `EBikesController.cs`. Set `[Route("api/e-bikes")]`, keep `[Authorize]`. Inject `IEBikeService`, `IWebHostEnvironment`, `IConfiguration`. Endpoints: `GET /`, `GET /{id}`, `GET /categories`, `POST /`, `PUT /{id}`, `DELETE /{id}`, `POST /{id}/images` (multipart `List<IFormFile>`), `DELETE /images/{imageId}`. Image storage path: `{basePath}/e-bikes/{id}/{guid}.ext`; stored relative path `/uploads/e-bikes/{id}/{filename}` (copy the NeueFahrrad path logic, just change the `neue-fahrraeder` segment to `e-bikes`).

- [ ] **Step 2:** Build.

Run: `dotnet build BikeHausFreiburg.sln`
Expected: SUCCESS.

- [ ] **Step 3:** Run the API and smoke-test with Swagger (dev).

Run: `dotnet run --project BikeHaus.API`
Expected: starts on http://localhost:5196; `/swagger` shows the `e-bikes` endpoints; `GET /api/e-bikes` returns `[]` (after login).

- [ ] **Step 4:** Commit.

```bash
git add BikeHaus.API/Controllers/EBikesController.cs
git commit -m "feat(ebike): add admin EBikesController (CRUD + image upload)"
```

---

### Task 7: Public endpoints

**Files:**
- Modify: `BikeHaus.API/Controllers/PublicController.cs` (add near the NeueFahrrad public block ~104-145)

- [ ] **Step 1:** Add `[AllowAnonymous]` GET endpoints returning `PublicEBikeDto`: `GET e-bikes`, `GET e-bikes/category/{category}`, `GET e-bikes/{id}`, `GET e-bikes/categories`. Delegate to `IEBikeService` public methods (active-only). Copy the NeueFahrrad public actions and swap the service/DTO.

- [ ] **Step 2:** Build + run; verify `GET http://localhost:5196/api/public/e-bikes` returns `[]` without auth.

Run: `dotnet build BikeHausFreiburg.sln` then `dotnet run --project BikeHaus.API`
Expected: 200 `[]`.

- [ ] **Step 3:** Commit.

```bash
git add BikeHaus.API/Controllers/PublicController.cs
git commit -m "feat(ebike): add public e-bike read endpoints"
```

---

## Phase B — Admin SPA (BikeHaus.Client)

### Task 8: Models + service

**Files:**
- Modify: `BikeHaus.Client/src/app/models/models.ts`
- Create: `BikeHaus.Client/src/app/services/e-bike.service.ts`

- [ ] **Step 1:** In `models.ts`, copy the `NeueFahrrad*` interface block to `EBike`, `EBikeCreate`, `EBikeUpdate`, `EBikeImage`, `EBikeCategory`, adding the 5 optional fields (`motorMarke?`, `motorPosition?`, `akkuKapazitaetWh?`, `reichweiteKm?`, `motorLeistungNm?`) to `EBike`/`EBikeCreate`/`EBikeUpdate`.

- [ ] **Step 2:** Copy `neue-fahrrad.service.ts` → `e-bike.service.ts`, base URL `${environment.apiUrl}/e-bikes`, methods `getAll/getById/getCategories/create/update/delete/uploadImages/deleteImage`.

- [ ] **Step 3:** Build the client.

Run: `cd BikeHaus.Client && npm run build` (or `ng build`)
Expected: SUCCESS.

- [ ] **Step 4:** Commit.

```bash
git add BikeHaus.Client/src/app/models/models.ts BikeHaus.Client/src/app/services/e-bike.service.ts
git commit -m "feat(ebike): admin models + e-bike service"
```

---

### Task 9: Admin list + form components + routes + nav

**Files:**
- Create: `BikeHaus.Client/src/app/pages/e-bikes/e-bike-list.component.ts` (+ template/styles as the NeueFahrrad file does it)
- Create: `BikeHaus.Client/src/app/pages/e-bikes/e-bike-form.component.ts`
- Modify: `BikeHaus.Client/src/app/app.routes.ts`
- Modify: admin nav/menu component (wherever the "Neue Fahrräder" link lives)
- Modify: `BikeHaus.Client/src/app/services/translation.service.ts`

- [ ] **Step 1:** Copy the neue-fahrraeder list component to `e-bike-list.component.ts`; swap service/model/route references (`/e-bikes`). Keep grid + search + category filter + edit/delete + active badge.

- [ ] **Step 2:** Copy the neue-fahrraeder form component to `e-bike-form.component.ts`; swap service/model/route. Set the `Kategorie` dropdown options to e-bike types: `E-City, E-Trekking, E-MTB, E-Lastenrad, E-Falt, Sonstige`. Add a new card **"Antrieb / Motor & Akku"** with inputs bound to: `motorMarke` (text), `motorPosition` (select: Mittelmotor/Heckmotor/Frontmotor), `akkuKapazitaetWh` (number), `reichweiteKm` (number), `motorLeistungNm` (number). Keep the create→redirect-to-edit→upload-images flow.

- [ ] **Step 3:** In `app.routes.ts`, add lazy routes behind `authGuard`: `/e-bikes`, `/e-bikes/new`, `/e-bikes/edit/:id`.

- [ ] **Step 4:** Add an "E-Bikes" link in the admin navigation next to "Neue Fahrräder".

- [ ] **Step 5:** Add the `eBike*` translation keys (German) used by the two components to `translation.service.ts`, plus the motor/position labels.

- [ ] **Step 6:** Build + run admin; create a sample e-bike with the new fields + an image.

Run: `cd BikeHaus.Client && npm start` (API also running)
Expected: `/e-bikes` lists items; form saves motor/battery fields; image upload works.

- [ ] **Step 7:** Commit.

```bash
git add BikeHaus.Client/src/app/pages/e-bikes BikeHaus.Client/src/app/app.routes.ts BikeHaus.Client/src/app/services/translation.service.ts
git commit -m "feat(ebike): admin list/form components, routes, nav, i18n"
```

---

## Phase C — Public homepage (BikeHaus.Homepage)

### Task 10: API service + models + routes + nav

**Files:**
- Modify: `BikeHaus.Homepage/src/app/services/api.service.ts`
- Modify: `BikeHaus.Homepage/src/app/models/models.ts`
- Modify: `BikeHaus.Homepage/src/app/app.routes.ts`
- Modify: homepage nav/menu component
- Modify: `BikeHaus.Homepage/prerender-routes.txt`

- [ ] **Step 1:** Add public `EBike` model(s) to homepage `models.ts` (mirror NeueFahrrad public model + 5 fields).

- [ ] **Step 2:** Add `getEBikes()`, `getEBikesByCategory(c)`, `getEBikeById(id)`, `getEBikeCategories()` to `api.service.ts` against `/api/public/e-bikes*` (copy NeueFahrrad methods, with the same catchError fallback for categories).

- [ ] **Step 3:** Add routes `/:lang/e-bikes` and `/:lang/e-bikes/:id` (copy the neue-fahrraeder route entries).

- [ ] **Step 4:** Add an "E-Bikes" menu item next to "Neue Fahrräder" (use a new i18n key).

- [ ] **Step 5:** Add the per-language `e-bikes` catalog routes to `prerender-routes.txt`.

- [ ] **Step 6:** Commit.

```bash
git add BikeHaus.Homepage/src/app/services/api.service.ts BikeHaus.Homepage/src/app/models/models.ts BikeHaus.Homepage/src/app/app.routes.ts BikeHaus.Homepage/prerender-routes.txt
git commit -m "feat(ebike): homepage api service, models, routes, nav, prerender"
```

---

### Task 11: Public catalog component (with filters)

**Files:**
- Create: `BikeHaus.Homepage/src/app/pages/e-bikes/e-bikes.component.ts` (+ card component, copied from `NeueBikeCardComponent`)

- [ ] **Step 1:** Copy the neue-fahrraeder catalog component to `e-bikes.component.ts`; swap api/model. Keep sidebar + grid + skeletons + sort + filter pills + result count + mobile toggle.

- [ ] **Step 2:** Extend the `computed()` filter pipeline and the sidebar UI with the e-bike filters: text search (titel/beschreibung/marke/modell), type (`kategorie`), `marke` select, `motorMarke` select, `motorPosition` select, `akkuKapazitaetWh` range (min/max), `reichweiteKm` range (min/max), price range, sort (newest/price-asc/price-desc/a-z). Select option lists are derived from the loaded dataset (distinct non-null values), same approach as the existing category derivation.

- [ ] **Step 3:** Build + run homepage; verify each filter narrows results.

Run: `cd BikeHaus.Homepage && npm start`
Expected: `/de/e-bikes` shows seeded bikes; every filter works.

- [ ] **Step 4:** Commit.

```bash
git add BikeHaus.Homepage/src/app/pages/e-bikes
git commit -m "feat(ebike): public e-bike catalog with filters"
```

---

### Task 12: Public detail component + SEO + i18n

**Files:**
- Create: `BikeHaus.Homepage/src/app/pages/e-bikes/e-bike-detail.component.ts`
- Modify: `BikeHaus.Homepage/src/app/services/translation.service.ts`
- Modify (regenerate): `BikeHaus.Homepage/src/app/services/translation-overrides.ts`

- [ ] **Step 1:** Copy the neue-fahrrad detail component to `e-bike-detail.component.ts`; swap api/model. Add spec rows for the e-bike fields (MotorMarke, MotorPosition, AkkuKapazitaetWh + " Wh", ReichweiteKm + " km", MotorLeistungNm + " Nm") in the sidebar, shown only when present. Keep gallery, price card (Angebot handling), WhatsApp + Maps CTAs.

- [ ] **Step 2:** Wire SEO via `seo.service.ts` (Title/Meta/og + hreflang) on both catalog and detail.

- [ ] **Step 3:** Add all e-bike translation keys (DE/EN/FR/TR) to `translation.service.ts`. Regenerate the machine overrides (es/it/ar/ru) using the project's override generator so no hardcoded strings remain.

- [ ] **Step 4:** Build with SSR + prerender to confirm nothing breaks.

Run: `cd BikeHaus.Homepage && npm run build`
Expected: SUCCESS (prerender includes `e-bikes` routes).

- [ ] **Step 5:** Commit.

```bash
git add BikeHaus.Homepage/src/app/pages/e-bikes BikeHaus.Homepage/src/app/services/translation.service.ts BikeHaus.Homepage/src/app/services/translation-overrides.ts
git commit -m "feat(ebike): public detail page, SEO, i18n"
```

---

## Phase D — One-time data import (feldmeier IDEAL e-bikes)

> This populates the catalog so the owner can edit. It is a one-time import, NOT a
> background scraper. A repeatable Playwright scraper can be a later, separate spec.

### Task 13: Extract the dataset

**Files:**
- Create: `scripts/ebike-import/feldmeier-ebikes.json` (the scraped dataset)

- [ ] **Step 1:** Enumerate all e-bike product URLs from `https://www.feldmeier-bike.com/shop` and `https://www.feldmeier-bike.com/ideal-e-bikes` (the `/product-page/<slug>` links). Keep only e-bikes (exclude accessories / non-e-bike products).

- [ ] **Step 2:** For each product detail page, extract: Titel, Marke (`IDEAL`), Modell, Preis, Beschreibung, MotorMarke + MotorPosition + MotorLeistungNm (parsed from the motor string, e.g. "BOSCH Performance Line CX … 100Nm" → Bosch / Mittelmotor / 100), AkkuKapazitaetWh (e.g. "800Wh" → 800), Rahmengroesse, Reifengroesse, Gangschaltung, Farbe, Zustand="Neu", Kategorie (map model line → E-City/E-Trekking/E-MTB…), and the product image URLs. Range usually absent → null. Write all rows to `feldmeier-ebikes.json`.

- [ ] **Step 3:** Commit the dataset.

```bash
git add scripts/ebike-import/feldmeier-ebikes.json
git commit -m "chore(ebike): extracted feldmeier IDEAL e-bike dataset"
```

---

### Task 14: Seed into the catalog

**Files:**
- Create: `scripts/ebike-import/import.ps1` (or a small `.http`/Node script)

- [ ] **Step 1:** Write a script that logs in to the admin API, then for each JSON row: `POST /api/e-bikes` (create), download each image URL and `POST /api/e-bikes/{id}/images`. Create them as `IsActive=false` initially so they don't appear on the live site until the owner reviews/edits them (owner can flip active per item).

- [ ] **Step 2:** Run the import against the local API.

Run: `pwsh scripts/ebike-import/import.ps1`
Expected: all e-bikes created with images; `GET /api/e-bikes` shows them.

- [ ] **Step 3:** Verify in admin (`/e-bikes`): every bike present with motor/battery fields + images, ready to edit. Verify the public catalog shows them once toggled active (filters work).

- [ ] **Step 4:** Commit the import script.

```bash
git add scripts/ebike-import/import.ps1
git commit -m "chore(ebike): one-time import script for feldmeier e-bikes"
```

---

## Self-Review notes

- **Spec coverage:** entity+fields (T1), DB+migration (T2), DTOs/mapping (T3), repo (T4), service (T5), admin controller (T6), public endpoints (T7), admin SPA (T8-9), homepage catalog+filters+detail+SEO+i18n (T10-12), import "çek hepsini" (T13-14). All spec sections mapped.
- **Naming consistency:** entity `EBike`/`EBikeImage`; FK `EBikeId`; routes `api/e-bikes`, `/e-bikes`, `/:lang/e-bikes`; upload segment `e-bikes`; fields `MotorMarke/MotorPosition/AkkuKapazitaetWh/ReichweiteKm/MotorLeistungNm` used identically across backend, DTOs, and both Angular model sets.
- **Imported bikes default to `IsActive=false`** so the public site isn't auto-populated before the owner reviews — matches "sonra ben edit yaparım".
