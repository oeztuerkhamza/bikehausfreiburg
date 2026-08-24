<!-- Erzeugt am 2026-08-24 durch einen Mehr-Agenten-Audit (6 Dimensionen, jede
Feststellung von einem zweiten Agenten gegengeprueft). 44 Feststellungen haben
die Pruefung ueberstanden: 9 hoch, 21 mittel, 14 niedrig.

Stichprobenartig zusaetzlich von Hand verifiziert und bestaetigt:
  * home.component.ts enthaelt sieben erfundene Testimonials (Thomas M., Sandra K., ...)
  * index.html LocalBusiness meldet Mo-Sa pauschal 13:00-17:00
  * alternateName enthaelt "Bike Repair/Workshop Freiburg" und "Atelier de velos"
  * sitemap-products.xml: 592 <loc>, davon 0 mit "showroom"
  * /de/showroom liefert live 37x image:"" und 3x price:0
  * /de/impressum zitiert weiterhin RStV Paragraph 55 (seit 11/2020 aufgehoben)
  * 133 von 175 Gebrauchtraedern ohne Foto (76 %)
  * 174 von 175 Anzeigentexten: "Wir nehmen keine E-Bikes an, warten oder verkaufen sie"
    - bei gleichzeitig 50 zum Verkauf stehenden E-Bikes
  * Primaerer Button auf /de/showroom/{id} ist "Auf Kleinanzeigen ansehen"
    (dofollow, ohne rel=nofollow); "Jetzt kaufen" kommt nirgends vor
-->

# Bike Haus Freiburg — SEO Action Plan

**Bottom line for the owner:** the website's technical foundation is genuinely good (server-rendered, 12 languages, structured data, city pages, prerendering). What is holding the shop back is not "more SEO" — it is (1) a handful of outright *wrong* facts published on the site, some of which carry legal risk in Germany, (2) a few small bugs that hide your used-bike stock from Google entirely, and (3) off-page work that only you can do. The single biggest untapped lever is **not code at all**: 133 of your 175 used bikes are listed with **no photograph**, and 174 of 175 listing texts tell the reader "we do not sell e-bikes" while your site simultaneously sells 50 e-bikes.

Read Section 0 first. It is not optimisation — it is risk.

---

## Section 0 — Correctness and legal risk (do these regardless of SEO)

These five are wrong facts published on a live commercial German website. Two of them are plausibly *abmahnfähig*. Fix them before anything on the growth list.

### 0.1 Seven invented customer testimonials on the homepage ⚠️ **UWG §5 risk**
**What:** The homepage server-renders seven fabricated testimonials with invented names ("Thomas M.", "Sandra K.", "Michael W."…) under the heading "Über 500 zufriedene Kunden in Freiburg vertrauen uns". Your real reviews (4.9 stars, 174 reviews) are only fetched in the visitor's browser, so Google's first crawl, every AI crawler, and every no-JavaScript visitor sees only the invented ones.
**Why it matters here:** Fabricated testimonials on a commercial site are misleading advertising under UWG §5. Separately, you own a genuinely excellent 4.9/174 rating that is invisible to search engines and AI assistants.
**First step:** Delete `testimonialsByLanguage` and the fallback branch in `BikeHaus.Homepage/src/app/pages/home/home.component.ts:3176-3215` and `:1121`. Fetch `/api/public/google-reviews` during server-rendering and pass it through TransferState. If the call fails, render nothing — an empty section beats invented quotes. The API already caches for 24 h (`GoogleReviewsService.cs:97`), so this costs no Google quota.
**Also:** either substantiate "Über 500 zufriedene Kunden" or drop it.
**Effort:** ~half a day dev. **Effect:** removes a legal exposure and turns a real 4.9/174 into something Google and ChatGPT can quote.
**Keep intact:** the existing guard at `home.component.ts:3411-3419` that suppresses `aggregateRating` when no real reviews are loaded. Never emit a rating that isn't real.

### 0.2 Your opening hours are published six different ways, and the machine-readable one is wrong ⚠️
**What:** Six mutually contradictory sets are live:

| Where | What it says |
|---|---|
| LocalBusiness JSON-LD, on **every** page (`src/index.html:236-249`) | Mo–Sa flat 13:00–17:00 |
| noscript block, on every page (`src/index.html:544`) | Mo–Sa 13:00–17:00 |
| Contact page body | Mo–Do 11:00–17:00, Fr 11–13 & 15–17, Sa 11:30–17:00 |
| Contact page meta description | Mo–Do 13–17, Fr 11–13 & 15–**18**, Sa 11:30–17 |
| `llms.txt:70-78` | Mo–Do 13–17, Fr 11–13 & 15–17, Sa 11:30–17 |
| Scraped text on 174 showroom pages | Mo/Di/Do 11–17:30, **Mi 14:00**–17:30, Fr 11–13 & 15–**18**, Sa 11:30–17 |

Two of these disagree about **when you open on Wednesday** and **when you close on Friday**.
**Why it matters here:** the JSON-LD is what Google, Gemini and AI assistants read to answer "is Bike Haus open now?". A customer can be sent to a closed door. Hours/NAP consistency between site and Google Business Profile is also a documented local-pack quality signal.
**First step — this is an owner decision, not a dev one:** tell your developer the one true schedule. Note that `SEO-OFFPAGE-CHECKLIST.md:32-41` is *not* an authority — it is a transcription of your Kleinanzeigen ad, and it contradicts your own contact page.
Then: one exported constant, and derive everything from it — `index.html:236-249`, `home.component.ts:3486-3500` (Wednesday needs its own entry and Friday needs two entries; the current flat block cannot express either), contact/about templates, the contact meta description, `llms.txt`, `llms-full.txt`, and the 8 strings in `city-landing.data.ts`. Then make Google Business Profile byte-identical.
**Effort:** 5 minutes from you, ~2 h dev. **Effect:** high — this is the most consequential wrong fact on the site.

### 0.3 Three bikes are advertised at "0 EUR" in your structured data ⚠️ **PAngV risk**
**What:** The showroom hub's product markup defaults missing values instead of omitting them (`showroom.component.ts:1700` and `:1703`). Live result: 37 of 50 products carry an invalid empty image, and three price-on-request bikes ("14 zoll woom 2 fahrrad", "16 zoll woom 3 fahrrad", "24, 26, 27,5, 28 und 29 Zoll Bulls, Cube Ghost Fahrrad") are published to Google with `price: 0`.
**Why it matters here:** a 0 EUR price statement has no place in German price advertising. Your own codebase already treats this as a bug — `showroom-detail.component.ts:1461-1463` carries the comment that price 0 triggers a Search Console error and guards against it. The hub was simply never updated.
**First step:** spread conditionally instead of defaulting (`...(imgUrl ? { image: imgUrl } : {})`), and gate the entire offer block on `listing.price > 0`, copying the guard that already exists at `showroom-detail.component.ts:1463`.
**Effort:** ~1 h. **Effect:** removes an invalid price claim and makes your main sales page's markup valid instead of broken.

### 0.4 The Impressum names no human, and cites a law repealed in 2020 ⚠️
**What:** `/de/impressum` gives only the trade name and address under §5 TMG — no operator name. The content-responsibility block cites **§55 Abs. 2 RStV**, superseded by the MStV in November 2020.
**Why it matters here:** a §5 TMG block without the operator's name and a citation to a repealed statute are classic *Abmahnung* triggers in Germany. It is also the clearest E-E-A-T weakness on the site — an anonymous shop asking strangers for a cash deposit.
**First step:** add your full name under §5 TMG; replace the RStV citation with **§18 Abs. 2 MStV**.
**Effort:** 15 minutes. **Effect:** closes a legal exposure; supports Section D.3 below.

### 0.5 The site markets itself as a "Reparatur"/"Werkstatt" business — against your own constraint ⚠️
**What:** Your LocalBusiness structured data, served on every page, lists **"Bike Repair Freiburg", "Bike Workshop Freiburg", "Réparation de vélos Freiburg", "Atelier de vélos Freiburg"** among 69 `alternateName` aliases (`src/index.html:146`, entries at `:178,180,190,192,206,208`). Plus:
- `translation.service.ts:1168` (live on `/de/garantie`): "Reparaturen im Garantiefall dürfen ausschließlich durch Bike Haus Freiburg durchgeführt werden."
- `translation.service.ts:1376`: "Für Reparaturen kontaktieren Sie uns bitte vorab"
- `rental-category-content.ts:356`: "Pannensets oder **Reparaturservice** unterwegs auf Anfrage"

**Why it matters here:** this is your hard wording constraint (no formal Ausbildung), and the site currently declares itself a repair shop in machine-readable data.
**First step:** delete the six repair/workshop/atelier `alternateName` entries. Trimming that 69-entry alias array down to a handful of genuine name variants is worth doing anyway — it reads as keyword stuffing. Reword the three strings to "Service- und Wartungsarbeiten…", "Für Service und Wartung kontaktieren Sie uns…", "Pannenset auf Anfrage".
**Leave alone:** `translation.service.ts:1117` ("Keine Haftung für Reparaturen") and `fahrradverleih.component.ts:129` ("Reparaturkosten trägt der Mieter") — these *disclaim* liability for repairs you don't perform, which is the opposite of the problem. If you add a CI check for this wording, scope it to marketing and schema files only, or it will block legitimate legal copy.
**Effort:** ~1 h. **Effect:** compliance. SEO effect is small (`alternateName` is a weak signal) — do it for the constraint, not the rankings.

---

## Section A — Developer quick wins (a day or two total, best return on the list)

Ordered by return. Every one is a small, contained change.

### A.1 Your used-bike pages are in **no sitemap at all** — 2-line fix 🔥
**What:** The dynamic product sitemap builds showroom URLs from the wrong database table. `PublicController.cs:377` calls `_bicycleService.GetPublishedOnWebsiteAsync()`, which returns an empty array in production (`/api/public/gebrauchte-fahrraeder` → `[]`), while your live showroom is powered by Kleinanzeigen listings (`/api/public/listings` → 175 items). Result: `sitemap-products.xml` contains 592 URLs and **zero** showroom pages. The identical bug at `PublicController.cs:553` means new stock is never pushed to IndexNow (Bing/Yandex) either.
**Why it matters here:** used-bike stock turns over in weeks. Sitemaps and IndexNow are precisely the mechanisms that shorten the time between "bike goes online" and "bike is findable on Google". ~700 URLs (175 bikes × 4 languages) are missing from both.
**First step:** swap the source to `_kleinanzeigenService.GetAllActiveListingsAsync()` — already injected at `PublicController.cs:12`, and it is the exact call `/listings` uses at `:53`. Emit `/:lang/showroom/{id}` for de/en/fr/tr, and add `x-default → /de/showroom/{id}`. Apply the same swap at `:553`.
**Effort:** ~1 h. **Effect:** high — this is the largest and most commercially important set of sales URLs on the site.

### A.2 Canonical URLs leak tracking parameters — 1-line fix
**What:** `seo.service.ts:91` builds the canonical from the full router URL including query string. Any `gclid`, `fbclid` or `utm_*` arriving from an ad, a Facebook share or a newsletter turns a product page into a self-canonicalising duplicate whose canonical contradicts the clean hreflang tags on the same response. Affects `/showroom/{id}`, `/neue-fahrraeder/{id}` and `/mietfahrraeder/{id}`.
**Why it matters here:** this is exactly where paid and social traffic lands.
**First step:** `const canonicalUrl = BASE_URL + url.split('?')[0].split('#')[0];` — the clean-path value is already computed one line above at `:84`.
**Effort:** 10 minutes. **Effect:** medium, and free.

### A.3 Product images in the new-bike markup all 404 — 1-line fix
**What:** `neue-fahrraeder.component.ts:1087` builds `${apiBase}/uploads/${bike.images[0].filePath}`, but `filePath` already starts with `/uploads/`. All 12 product entries carry a doubled path that returns 404. The correct version is two files away at `e-bikes.component.ts:1495`.
**First step:** drop the literal `/uploads/`. While there, add `itemCondition: NewCondition` (the whole catalogue is new — verified) and `.trim()` the brand (currently publishes `"Prophete "` with a trailing space).
**Effort:** 20 minutes. **Effect:** medium — highest-ticket sales category, zero risk.

### A.4 The first image on three catalogue pages is set to load *last*
**What:** `bike-card`, `e-bike-card` and `neue-bike-card` hardcode `loading="lazy"` on every image. Live: `/de/showroom`, `/de/e-bikes` and `/de/neue-fahrraeder` have **zero** eager images and zero `fetchpriority`. Your rental hub already does it right (`mietfahrraeder.component.ts:317-318`).
**Why it matters here:** these hubs have no hero image, so the first product photo *is* the Largest Contentful Paint element — and its download is deliberately deferred. That is a documented few-hundred-millisecond mobile penalty.
**First step:** add an `index` input to the three card components and bind `[attr.fetchpriority]="i === 0 ? 'high' : null"` plus `[loading]`. **Set eager only for `i === 0`, not `i < 4`** — until B.3 lands, those first images are 650–740 KB each and eager-loading four of them pulls ~2.6 MB into the critical path.
**Effort:** ~1 h. **Effect:** cheapest performance win available. It multiplies B.3; it does not replace it.

### A.5 Three of your eight local pages have no link anywhere on the site
**What:** `city-landing.data.ts` defines 8 local landing pages. The footer (`footer.component.ts:78-92`) links only the five *outlying towns*. The three **Freiburg district** pages — Wiehre, Herdern, Stühlinger — have no internal link anywhere in the application. These are dense residential districts, i.e. the three with the most realistic local demand. The eight pages also never link to each other.
**First step:** split the footer "Standorte" column into "Freiburg Stadtteile" (Wiehre, Herdern, Stühlinger) and "Region" (the five towns), adding translation keys for all 8 languages. Then render an "Auch in Ihrer Nähe" block from the existing array so the eight pages cross-link.
**Effort:** ~2 h. **Effect:** medium — three fully written pages currently rank below their content quality.

### A.6 New-bike page promises inventory it does not have
**What:** `/de/neue-fahrraeder` has `<title>Neue Fahrräder kaufen Freiburg | City, E-Bike, Trekking</title>` and a meta description promising "City, Trekking, Mountain & E-Bikes". The actual 24 items are **21 Kinderfahrräder**, 1 Damenrad, 1 Herrenrad, 1 Rennrad. Not one of the promised types.
**First step:** rewrite title and description to lead with Kinderfahrräder.
**Effort:** 15 minutes. **Effect:** stops misdirecting the queries the page attracts; sets up C.2.

### A.7 Small indexation-hygiene bundle (do all in one sitting)
| Item | Fix | File |
|---|---|---|
| Thank-you page is indexable | set `robots: noindex, follow` (restore on destroy, as the rental flow already does) | `pages/showroom/order-success.component.ts` |
| Empty accessory catalogue is indexable and submitted | `noindex, follow` when the item list is empty (reusable guard for any catalogue that empties) | Zubehör component |
| Wrong-language rental-catalogue slugs self-canonicalise | assign `canonical.href`, copying the pattern three branches away at `:215-225` | `seo.service.ts:175-192` and `:194-212` |
| admin.bikehausfreiburg.com serves 200 HTML for every path, incl. `/robots.txt` | add `location = /robots.txt { return 200 "User-agent: *\nDisallow: /\n"; }` + `X-Robots-Tag "noindex, nofollow" always;` — **repeat the header inside `location /api/public/gallery-image/` at `:207`**, nginx drops inherited `add_header` in any location with its own | `nginx/nginx.conf:186-240` |
| Retired `/de/erinnerungen` still submitted | delete the sitemap block. **Do not redirect it** — every surviving "memories" page is Norwegian, Danish, Dutch or Polish | `src/sitemap.xml` |

**Effort:** ~3 h combined. **Effect:** individually low, collectively worth one sitting.

---

## Section B — Bigger developer jobs, ranked by return

### B.1 Your product pages send buyers to Kleinanzeigen, and your own checkout can never appear 🔥
**What:** On every used-bike detail page the visually dominant button (`btn-primary`) is an outbound `target="_blank"` **dofollow** link to kleinanzeigen.de (`showroom-detail.component.ts:196-217`). The on-site checkout button is gated on `isBikeHausBike()`, which requires the listing id to start with `bike-` (`:1208-1210`) — and **no code path anywhere in the solution can ever produce such an id** (checked every `ExternalId =` assignment: `KleinanzeigenService.cs:143,260`, `KleinanzeigenScraperService.cs:74,246,329` — all copy the numeric ad id). It is unreachable dead code. All 175 pages confirm: 0 occurrences of "Jetzt kaufen".
**Why it matters here:** 175 pages that rank for "gebrauchtes Fahrrad Freiburg" send their most prominent click to a marketplace where the buyer sees your competitors. You also hand 175 dofollow links of link equity to Kleinanzeigen.
**First step (low effort, do this alone first):** demote the Kleinanzeigen anchor to a secondary text link, add `rel="nofollow"`, and promote the existing WhatsApp enquiry box — which already prefills title and price — into the primary slot. Rename its heading from "Verkäufer kontaktieren" to "Bike Haus kontaktieren" (it currently reads as if you were a private seller).
**Then decide separately:** delete the dead checkout branch, or build the backend for it. Note there is currently **no public reservation or enquiry endpoint** (`PublicController.cs` has none, `ReservationsController.cs` has no `[AllowAnonymous]`), so a "Probefahrt anfragen" flow is new API work, not a template change.
**Effort:** ~3 h for the CTA half; days for the checkout. **Effect:** high — largest sales-funnel gain available without writing new content.

### B.2 174 of your 175 product pages say you don't sell e-bikes 🔥
**What:** Each showroom detail page renders the scraped Kleinanzeigen description verbatim, and 174 of 175 contain: *"Bitte haben Sie Verständnis: Wir nehmen keine E-Bikes an, warten oder verkaufen sie."* Meanwhile `/api/public/e-bikes` returns **50 e-bikes** (Feldmeier 32, IDEAL 16, Conway 2) and your Google Business Profile description advertises IDEAL and Feldmeier e-bikes.
**Why it matters here:** an AI Overview or ChatGPT answer grounded on any of those 174 pages will tell the searcher you do not sell e-bikes — your highest-margin category. Independently, 174 near-identical blocks of marketing boilerplate in the main content of your largest page type is a real duplicate-content liability.
**First step:** strip the boilerplate before rendering — cut everything from the "BIKE HAUS FREIBURG ⭐" banner onward, keeping only the bike-specific text. Better long-term: an editable on-site description field per listing.
**Owner decision needed:** if a limitation genuinely applies (no e-bike trade-in? e-bikes outside the Service/Wartung offer?), tell your developer the exact scope so it can be stated **once**, in your own words, on the right page — not as scraped text on 174 product pages. Keep it within the Service/Wartung wording.
**Effort:** ~half a day. **Effect:** high.

### B.3 Every catalogue and product photo is served at ~7× the size needed
**What:** No image resizing exists anywhere. `/api/public/gallery-image/{path}` (`PublicController.cs:331-356`) returns the raw file with no width parameter; uploads are stored at up to 2048 px (`FileStorageService.cs:16-17`); cards are 260–300 px wide. No `srcset`, no `<picture>`, no WebP negotiation anywhere in the codebase. Measured: the rental hub's LCP image is 361 KB (1538×2048), the first new-bike card is **649 KB** (2048×1421), and gallery images run to 1.4 MB.
**Why it matters here:** the single largest genuine Core Web Vitals lever on the site. On mobile 4G that is a multi-second delay on exactly the pages targeting "Fahrrad kaufen/mieten Freiburg".
*(Note: the headline "21–28 MB per page" figures are misleading — everything below the fold is lazy-loaded and usually never fetched. The real problem is the **one** first-viewport image on each page.)*
**First step:** accept `?w=` on `GetGalleryImage` and resize with SixLabors.ImageSharp (already available via `BikeHaus.Infrastructure.csproj:23`), caching variants on disk keyed by path+width, emitting WebP when the browser accepts it. **Size that cache deliberately** — your uploads volume was already bulk-shrunk once and an unbounded variant cache will re-grow it. Then have the four card components request `?w=400` with a `srcset`. For Kleinanzeigen-hosted images, rewrite the `rule=` suffix into a srcset of `$_72.AUTO` (40 KB) / `$_20.AUTO` (95 KB) instead of the fixed `$_59.AUTO` (132 KB).
**Effort:** high — 2–3 days. **Effect:** high. Prioritise the first-viewport image on each hub and detail page; that is where the measurable win is.

### B.4 Sold bikes leave behind indexable empty pages
**What:** `/de/showroom/99999999` returns HTTP 200, `robots: index, follow`, a self-referencing canonical, and no error message anywhere in the page. The detail components swallow the failure silently (`showroom-detail.component.ts:1273` and `:1285`, both `error: () => this.loading.set(false)`), and `server.ts` has no 404 handling at all.
**Why it matters here:** with stock turning over in weeks, every sold bike leaves an indexable empty page behind, and any inbound link to it is wasted instead of routed back to your catalogue. A customer clicking an old link gets a blank page.
**First step (this half is 80% of the value):** in `showroom-detail`, `mietfahrrad-detail` and `neue-fahrrad-detail`, replace the silent error handlers with one that sets `robots: noindex, follow` and renders "Dieses Rad ist nicht mehr verfügbar" with a link back to the catalogue. Copy the tag-restore-on-destroy pattern the rental booking components already use.
**Optional second half:** real 404 status codes from `server.ts`. Much more work, much less value.
**Effort:** ~half a day for part one. **Effect:** medium.
*(Note: the catch-all route is less harmful than it looks — `/de/gibt-es-nicht-xyz` already canonicalises to `/de`, so it self-deduplicates.)*

### B.5 Put your reviews on the pages that sell
**What:** `/de/showroom`, `/de/neue-fahrraeder`, `/de/e-bikes`, `/de/mietfahrraeder` and all three rental category pages contain **zero** occurrences of "Bewertung", "Sterne" or any rating. Someone arriving from "gebrauchtes Fahrrad Freiburg" never learns you have 174 reviews at 4.9.
**Depends on 0.1 being done first** — without server-side review fetching this helps only hydrated humans.
**First step:** extract the review strip into a shared component fed by the same TransferState payload, and place it on the seven commercial pages. On `/de/fahrradverleih`, also emit `review: [...]` nodes on the existing Service node (`fahrradverleih.component.ts:5167`) — the review text is already in the server-rendered HTML — skipping entries whose body is empty or a single word (several are "Good" or blank).
**Do NOT** emit a second `aggregateRating` on those pages. Self-hosted reviews of your own business are ineligible for star rich results, and duplicating the node risks a review-snippet manual action. Expect entity/AI comprehension and on-page conversion, **not** stars in Google.
**Effort:** ~1 day. **Effect:** medium.

### B.6 Nine languages get German or English pages that claim to be localised
Three separate instances of the same pattern. **Do the cheap noindex fix, not the expensive translation.**

| Page family | Symptom | Fix |
|---|---|---|
| Rental category pages | Routes exist in 12 languages, content in 3. `/tr/bisiklet-kiralama/e-bike-mieten-freiburg` and 26 others return 200 with a **German** page. Each also emits 9 hreflang tags pointing at those URLs. | Restrict the generated route in `app.routes.ts:17-42` to de/en/fr so the rest 404. Add an explicit rental-category branch to `SeoService` emitting only de/en/fr + x-default. Derive `og:locale` from `OG_LOCALE_BY_LANGUAGE` instead of the hardcoded ternary at `rental-category.component.ts:585-587`. |
| Service page | All 8 machine-translated languages serve the **complete English** page at `/xx/service`, indexable, and 4 of them are prerendered into the build. | When `SERVICE_CONTENT` has no entry for the language, set `noindex, follow` and drop that language from hreflang. Remove `/es/service`, `/it/service`, `/ar/service`, `/ru/service` from `prerender-routes.txt`. |
| Blog / Ratgeber | 88 URLs (8 languages × 11 articles) are live, indexable, self-canonical, serving the German source text with no self-referencing hreflang. | When `article.translations[lang]` is missing, emit `noindex, follow`, skip the schema, and drop the article from that language's listing. **Do not** simply widen `BLOG_HREFLANG_LANGUAGES` — that would enrol 88 pages of German text as if they were 8 real localisations, which is a *stronger* duplicate signal than the current omission. |

**Also fix:** `src/sitemap.xml:197` points the Turkish version of your rental guide at `/tr/ratgeber/fahrradverleih-freiburg-guide`, which is an **empty page**. The real Turkish article is at `/tr/ratgeber/bike-rental-freiburg-guide`.
**Effort:** ~1 day total. **Effect:** medium.

### B.7 Russian and Arabic rental-catalogue pages render in English
**What:** `/ru/mietfahrraeder` and `/ar/mietfahrraeder` serve `<title>Rental Bikes Freiburg…</title>` and `<h1>Bikes to rent in Freiburg.</h1>` under `<html lang="ru">`, because the ar and ru translation blocks are 99 keys short (510 vs 607) and `TranslationService` falls back to English key-by-key (`translation.service.ts:6378-6391`). Only 6.9% of the Russian page is actually Cyrillic.
**First step:** hand-add the missing keys to `translation-overrides.generated.ts` — **there is no generator script**, treat this file like the hand-maintained sitemap. Scope to the funnel first: `rentalCatalogMetaTitle`, `rentalCatalogMetaDescription`, `rentalCatalogTitle`, `rentalCatalogLabel`, then `rentalLink*` / `rentalForm*`.
**Note:** the existing Dutch homepage title contains "reparatie" — worth a separate wording review under 0.5.
**Effort:** ~2 h. **Effect:** medium but bounded — Russian/Arabic demand for Freiburg bike rental is thin.

### B.8 Sitemap correctness pass (do the correct half, skip the exhaustive half)
**Do:**
- Delete the 5 `/xx/fahrradverleih` entries that all 301-redirect (tr, es, it, ar, ru) and replace them with the real localised slugs from `RENTAL_SLUG_BY_LANGUAGE`. Also fix every `xhtml:link` that points at those redirects — including inside the `/de/fahrradverleih` block at `src/sitemap.xml:289-302`, which is your **priority 0.95** URL.
- Add `<loc>` entries for the four rental catalogue hubs and the nine localised rental hubs (`/no/sykkelutleie`, `/da/cykeludlejning`, `/nl/fietsverhuur`, `/pl/wypozyczalnia-rowerow`, etc.) — all live, all 200, none listed.
- Delete `/de/erinnerungen` (see A.7).
- Add the missing `x-default` to the 50 blocks that lack it (only 33 of 83 have one).
- Add a CI check mirroring `.github/workflows/nginx-config-check.yml` that fails when a `prerender-routes.txt` entry has no matching `<loc>`. **This guard is worth more than the one-time edit** — it is what stops the file drifting again.

**Skip** the full 12-language `xhtml:link` expansion of all 83 blocks (~300 hand-written lines) — see Section E.
**Effort:** ~half a day + the CI guard. **Effect:** medium.

### B.9 Halve the showroom page weight
**What:** `/de/showroom` is a 1.05 MB document, 584 KB of which is inlined JSON — the full unprojected listings payload (`PublicController.cs:50-55`), including 371 KB of Kleinanzeigen description text and 137 KB of image metadata for 794 images when the grid renders one per card.
**Careful:** the descriptions back your on-page **search box** (`showroom.component.ts:1446`) and `images.length` backs the **photo-count badge** (`bike-card.component.ts:55,70`). Deleting either field silently breaks a feature.
**First step:** add `listings/summary` returning id, externalId, title, price, priceText, category, **imageCount**, and the first image URL — plus either a truncated description (first ~200 chars, still cuts ~300 KB) or a deliberate decision to search titles only.
**Effort:** ~1 day. **Effect:** medium — page 1.05 MB → ~0.5–0.7 MB. Real, but the dominant cost on that page is still the image bytes (B.3).

### B.10 Entity and page-identity cleanup (schema polish — lowest of this section)
- Every one of the 153 prerendered routes ships the **same hardcoded WebPage node** claiming to be the German home page (`src/index.html:331-364`). Move it into `SeoService` next to the canonical it already computes.
- City landing pages redefine `url` and narrow `areaServed` on the canonical `#organization` id (`fahrrad-stadt.component.ts:471`, `:486`) across 64 URLs. Make them bare references plus page-specific relations.
- **Higher priority within this item:** the rental page's provider node (`fahrradverleih.component.ts:5197-5215`) declares a *completely different opening-hours set* for the same `#organization` id as the sitewide node in the same document. Delete it — the hours belong in one place only (see 0.2).
- Use `@type: Place` not `City` for Wiehre, Herdern and Stühlinger — they are Freiburg districts.
- Delete the duplicate id-less Organization node (`index.html:453-479`), merging its `contactPoint` into the main node; add `@id: ".../#website"` to the WebSite node at `:369` so the existing `isPartOf` reference resolves.
- Delete the obsolete German `<noscript>` block (`index.html:481-579`). SSR already serves complete localised HTML; today no-JS visitors get a full-screen German overlay stacked *on top of* the real page. **Do not sell this as an "H1 fix"** — Google renders JavaScript, where noscript content is inert. The justification is removing German boilerplate from what non-rendering AI crawlers read on ~100 non-German URLs, and fixing the no-JS double render.
- e-bike detail Product node lacks `url`, `@id` and `priceValidUntil` that the other two templates have, and publishes `"Ideal "` with a trailing space (`e-bike-detail.component.ts:1011-1047`).

**Effort:** ~1 day for all. **Effect:** low-to-medium. Do it when someone is already in these files.

---

## Section C — Content work (developer builds, owner supplies the facts)

### C.1 Rental category pages for the segments you actually own 🔥
**What:** You have three rental category pages: **ebike, trekking, kinder**. Your fleet is 73 bikes:

| Type | Units | Has a landing page? |
|---|---|---|
| E-Bike | 19 | ✅ |
| **Cityrad** | **17** | ❌ |
| **Gravelbike** | **11** | ❌ |
| **MTB** | **10** | ❌ |
| Kinderanhänger (Thule/Croozer/Qeridoo) | **5** | ❌ |
| Kinderrad | 3 | ✅ |
| **Rennrad** | **3** | ❌ |
| Trekkingrad | 2 | ✅ |

38 of 73 units — over half the fleet — have no keyword-targeted entry point, while segments with 2 and 3 units each got a full page. Nothing on the site targets *mountainbike mieten freiburg*, *gravelbike mieten freiburg*, *rennrad mieten freiburg*, *cityrad mieten freiburg* or *fahrradanhänger mieten freiburg* (zero grep hits).
**Bonus bug:** `rental-category-content.ts:645` tells customers Kinderanhänger are "auf Anfrage gegen Aufpreis verfügbar" — you own five outright.
**First step:** add 4–5 entries to `RENTAL_CATEGORIES` on the existing proven template with DE/EN/FR slugs. Give MTB and Gravel Schwarzwald/Dreisamtal tour intent and link them to the tours already in `bike-tours.data.ts` (`:124` Schauinsland, `:114` Glottertal, `:104` Kaiserstuhl). The Anhänger page should name the brands actually in stock. Add slugs to `src/sitemap.xml` by hand. They appear automatically in the "Mehr entdecken" block on `/fahrradverleih`.
**Constraints:** quote only per-day prices the booking catalogue will actually honour; never "Reparatur"/"Werkstatt".
**Effort:** ~2 days. **Effect:** **high** — the largest addressable rental-traffic gap, on a proven, reusable template.

### C.2 A kids-bike sales page 🔥
**What:** Roughly **99–122 of ~193 bikes for sale are Kinderfahrräder** — 101 of 169 used, 21 of 24 new — by far your deepest category. There is no page targeting "kinderfahrrad kaufen freiburg". Category filters on `/showroom` and `/neue-fahrraeder` are pure client-side state with no URL parameter (`showroom.component.ts:1323`, `:1434`), so no filtered view is crawlable, linkable or shareable. `e-bikes` is the **only** bike-type sales landing page on the entire site.
**Why it matters here:** "kinderfahrrad kaufen freiburg" and its size variants ("20 zoll kinderfahrrad freiburg") are high-intent local queries with recurring demand — kids outgrow bikes yearly. Today those searches can only land on a generic 169-item grid whose H1 says nothing about kids.
**First step:** add `/:lang/kinderfahrrad` (EN `kids-bikes`, FR `velos-enfants`) modelled on the e-bikes page. H1 "Kinderfahrrad kaufen in Freiburg", server-rendered intro on sizing by Zoll (14/16/20/24) and Körpergröße, the brands actually stocked (woom 22, Bikestar 14, Pyro 30, Cube 33, Bulls 28), and the warranty distinction **exactly as you already state it** — 2 Jahre Garantie on new, 3 Monate Garantie + 3 Tage Rückgaberecht on used. Add a `KIDS_FAQ` to `category-faq.data.ts` in de/en/fr/tr. Link to the existing Ratgeber article `kinderfahrrad-groesse` and to the rental page `kinderfahrrad-mieten-freiburg`.
**Housekeeping while building:** 23 of the 101 bikes your site labels "Kinder-Fahrräder" are 26"+ adult frames (one is a 29" Bulls in size 51). Scope the new page to ≤24" so the copy matches what is on it.
**Effort:** ~2 days. **Effect:** high.

### C.3 Give the two main sales hubs something to say
**What:** `/de/showroom` goes H1 → "169 Fahrräder verfügbar" → filter list. No sentence at all. `/de/e-bikes` adds six words. Each page has exactly one meaningful H2 — "Häufige Fragen" — and the 175/57 H3s are product tiles whose text repeats across every listing page.
**First step:** ~150 words of server-rendered intro below each H1, plus two or three real H2 sections below the grid.
- Showroom: "Gebrauchtfahrräder aus Freiburg — geprüft und mit Garantie" (technische **Prüfung**, 3 Monate Garantie, 3 Tage Rückgaberecht, Probefahrt ohne Termin, ab ca. 180 €) / "Welche Fahrradtypen wir gebraucht führen" / "Fahrradankauf: Wir kaufen Ihr gebrauchtes Rad".
- E-Bikes: "E-Bike-Beratung in Freiburg" (Mittelmotor Bosch/Shimano, Akku 504–625 Wh, Reichweite bis 120 km, Marken IDEAL/Feldmeier/CONWAY) / "E-Bike für Freiburg und den Schwarzwald wählen".

Copy every number straight from the existing `SHOWROOM_FAQ` / `EBIKE_FAQ` and the live facets so the page cannot contradict itself. Keep "ab ca. 180 €" phrasing exactly. Describe pre-sale checks as **Prüfung/Service/Wartung** only.
**Also for `/neue-fahrraeder`:** ~150 words on fabrikneu + 2 Jahre Geschäftsgarantie + the Zoll range actually stocked, and a `NEUE_FAHRRAEDER_FAQ`. **Do not** write a "kostenloser Erst-Check" or any free-inspection claim — no such offer exists.
**Effort:** ~1 day. **Effect:** medium — incremental lift on pages that already have authority.

### C.4 Connect your two revenue lines
**What:** No sales page links to the rental side in content, and vice versa. `/de/showroom`, `/de/e-bikes` and `/de/neue-fahrraeder` each have exactly 2 links to `/de/fahrradverleih` — the header and footer, identical to every other page. Your 11 Ratgeber articles are reachable in-content almost only from product detail pages.
**First step:** an "Erst mieten, dann kaufen" block on the three sales hubs linking to the matching rental category (e-bikes → `fahrradverleih/e-bike-mieten-freiburg`), mirrored back from `rental-category.component.ts` and `mietfahrraeder.component.ts`. Your rental FAQ already tells customers a rental bike can be bought afterwards, so this has genuine user value. Then port the working "Ratgeber & Tipps" block from `showroom-detail.component.ts:353` to the three hubs.
**Effort:** ~half a day. **Effect:** medium.

---

## Section D — Owner-only work (this is where the remaining headroom is)

Be clear-eyed: the site is roughly 90% of the way there technically. Almost everything in Sections A–C is worth a few percent each. **The items below are where a small Freiburg bike shop actually wins local search**, and no developer can do them for you.

### D.1 Photograph your used bikes 🔥 (biggest single lever on this list)
**133 of your 175 used bikes have no photograph at all.** That is why 37 of 50 products on your main sales page ship an empty image field, why those bikes cannot appear in Google Images or Google's product results, and — far more importantly — why they are much harder to sell. A used bike with no photo is close to unsellable online at any price.
**First step:** phone camera, consistent background, three shots per bike (full side, drivetrain, any wear). Batch 20 a week. Prioritise the highest-value stock and the Kinderfahrräder (your deepest category — see C.2).
**Effort:** ongoing, a few hours a week. **Effect:** the highest of anything in this document.

### D.2 Confirm your opening hours — this blocks other work
See 0.2. Nothing in the codebase establishes which of the six sets is true, and the file some agents treat as canonical (`SEO-OFFPAGE-CHECKLIST.md:32-41`) is just a transcript of your Kleinanzeigen ad that contradicts your own contact page.
**Do not register with directories (D.5) until this is settled** — otherwise you will cement the wrong hours in a dozen places at once.
**Effort:** 5 minutes. **Blocking.**

### D.3 Put a face and a name on the business
Your About page — the page whose entire job is trust — contains **zero content photographs**. Its only images are your logo twice and a language flag. Meanwhile **nine real photographs of your shop already sit in the repo** (`src/assets/shop/shop-1..9`), used only on the homepage. The human quote is attributed to "Die Familie hinter Bike Haus".
**First step:** (a) your full name in the Impressum (see 0.4); (b) a named owner section on About with a real photo and a short first-person account — how long you have worked with bikes, which languages you speak, what you check before selling a used bike; (c) put those nine shop photos on the page as a premises gallery; (d) set `founder` in the LocalBusiness data and change its `image` from the logo to a real storefront photo.
**Three factual corrections needed while you are there:**
- Founding year is published as **2021** in one place and **2020** in two others (`translation.service.ts:1403`, `:1416`, `:2213`). Which is it?
- Your About page names **Victoria** and **Xtract** as brands you carry. Your catalogues stock neither. They stock **Prophete, Feldmeier and IDEAL**, which the page never mentions — and "IDEAL E-Bike Freiburg" is exactly the kind of query you want to own.
**Effort:** an afternoon. **Effect:** medium-high — this is the classic low-trust profile for a shop asking strangers for a cash deposit.

### D.4 Decide about click-to-call
There is **no `tel:` link anywhere on the public site**. The number appears as plain text on the Impressum and contact page. The two components that build a `tel:` href read it from `shopInfo().telefon`, which the live API returns as **null** — so the links are suppressed by their own guard.
**This is a decision, not a bug:** that number is your WhatsApp mobile line. Enabling click-to-call changes what lands on it.
**If yes:** fill the Telefon field in admin Settings, then render `<a href="tel:+4915566300011">` in header/footer, contact, Impressum, and next to the WhatsApp button on the three detail templates and the rental hub. Keep the displayed format byte-identical to `+49 155 6630 0011` so your NAP stays consistent.
**Effort:** 10 minutes from you + ~2 h dev. **Effect:** medium — local-intent mobile searchers call.

### D.5 Claim the free local listings (in this order)
Your `SEO-OFFPAGE-CHECKLIST.md` has **1 of 66 boxes ticked**. Your LocalBusiness `sameAs` contains only five URLs: Google Maps, Instagram, Facebook, WhatsApp, Kleinanzeigen. Nothing corroborates the business anywhere else on the web.
**Order:**
1. **Bing Places** — free, feeds Copilot local answers.
2. **Apple Business Connect** — free, feeds Siri and Apple Maps.
3. Gelbe Seiten, Das Örtliche, 11880 — using the byte-identical NAP block from checklist §4b.

Add each resulting profile URL to `sameAs` in `src/index.html:292-298`.
**Effort:** ~2 h total. **Effect:** medium — cheap corroborating citations for both Google and AI assistants.

### D.6 Google Business Profile and review velocity
Your 4.9/174 is a genuine asset. Two things:
- Make GBP hours **byte-identical** to whatever you settle in D.2.
- Keep reviews coming. Ask every rental customer at handback and every bike buyer at pickup. Review recency and velocity are real local-pack signals, and unlike everything else on this list they compound.

**Do not** ask your developer to add star ratings to Google results — Google does not show stars for a business marking up reviews of itself. The value of B.5 is on-page trust and AI comprehension, not SERP stars.

### D.7 Decide the e-bike policy wording (blocks B.2)
Tell your developer exactly what is true: do you take e-bikes in trade? Are e-bikes excluded from your Service/Wartung offer? It needs to be stated once, in your own words, on the right page — not scraped onto 174 product pages while your site sells 50 e-bikes.

---

## Section E — Do NOT do these (and why)

| Item | Why skip it |
|---|---|
| **Create a Wikidata entity** (checklist §3) | Wikidata's notability policy requires independent published sources. Items created for small local businesses citing only their own website are routinely deleted. You would do the work and lose it — and a Q-ID hard-coded into `sameAs` that later 404s is worse than no Q-ID. Only revisit if a newspaper writes about you. |
| **Expand all 83 sitemap blocks to 12-language hreflang** (~300 hand-written lines) | Your pages already emit complete, reciprocal hreflang in their own HTML head — which is the signal Google actually consumes. This is hand-copying for zero ranking effect. Do the correctness half in B.8 and stop. |
| **`hasMerchantReturnPolicy` / `shippingDetails` on offers** | These feed Google's merchant-listing experiences, which in practice need a Merchant Center feed you don't have. Worse, `OfferShippingDetails` expects a shipping rate and delivery time — inventing those for a pickup-only shop would be publishing false information. Add `availableDeliveryMethod: OnSitePickup` if anything. And **never** encode "3 Arbeitstage" as `merchantReturnDays: 3` — that field counts calendar days and would misstate your policy. |
| **Paginate or virtualise the showroom grid** | "Excessive DOM size" is a Lighthouse diagnostic, not a ranking metric. More importantly: because your product sitemap is broken (A.1), those 169 in-page links are currently the **only** crawl path to your used-bike pages. Hiding 145 of them behind a "Mehr anzeigen" button today would be an active regression. Revisit only after A.1 ships. |
| **Add `trackBy` to the showroom grid** | Checked and refuted — object identity is already preserved through the filter chain, so Angular already reuses the DOM nodes. Zero measurable effect. |
| **Split the 12-language translation dictionary out of the JS bundle** | Genuinely correct (it would halve ~1 MB of eagerly-parsed JavaScript), but it is 2–3 days of risky refactoring across SSR and prerendering for an indirect payoff. **Do B.3 first** — images dominate the critical path. Revisit only if performance is still a problem afterwards. |
| **Enable Brotli compression in nginx** | Real but small: ~32 KB saved on a page whose critical path is a 361–649 KB image. Do it only if someone is already editing `nginx/nginx.conf` (and skip `brotli_static` — the build emits no `.br` files, so the directive would do nothing). While in there, collapse the duplicated `Cache-Control` headers. |
| **301-redirect `/de/erinnerungen`** | Every surviving "memories" page is Norwegian, Danish, Dutch or Polish. A German URL would land visitors on a Dutch page. Just delete the sitemap line. |
| **Translate all 88 blog article variants, or widen blog hreflang to 12 languages** | Widening hreflang would enrol 88 pages of German text as if they were 8 genuine localisations — a *stronger* duplicate signal than the current omission. Noindex them instead (B.6). |
| **Expect the `<noscript>` deletion to fix "duplicate H1s"** | Googlebot renders JavaScript, where noscript content is inert. Delete the block for the no-JS double-render and the AI-crawler input, not for headings. |

---

## Section F — Sequencing and the decisions only you can make

**Four decisions block developer work. None takes more than five minutes:**

| Decision | Blocks | Detail |
|---|---|---|
| **Which opening hours are true?** | 0.2, B.10, D.5, D.6 | Six published variants disagree on Wednesday opening and Friday closing |
| **What is your actual e-bike policy?** | B.2 | Trade-in? Service/Wartung? Say it once, correctly |
| **Do you want voice calls on the WhatsApp number?** | D.4 | Enabling click-to-call changes what lands on that phone |
| **Founding year: 2020 or 2021?** | D.3 | Published both ways today |

**Dependency order worth respecting:**
- 0.1 (server-render reviews) **before** B.5 (review strip on money pages) — otherwise the strip helps nobody but already-loaded visitors.
- A.1 (product sitemap) **before** any showroom pagination — the in-page links are currently the only crawl path.
- D.2 (hours) **before** D.5 (directories) — otherwise you cement the wrong hours in a dozen places.
- A.4 (eager LCP image) is cheap now but only pays fully **after** B.3 (image resizing).

**A suggested first two weeks:** Section 0 in full (~1.5 days), then A.1–A.7 (~1.5 days), then B.1's low-effort half and B.2 (~1 day). That is roughly four developer-days covering every legal risk, every quick win, and the two biggest funnel problems. Meanwhile you start D.1 (photographs) — which will outperform all of it.