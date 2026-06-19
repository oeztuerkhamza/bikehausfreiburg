# Bike Tours landing page (`/fahrradtouren`) — Design

**Date:** 2026-06-19
**Status:** Approved
**Area:** BikeHaus.Homepage (public Angular 17 SSR site)

## Goal

Create a multilingual "Fahrradtouren" (bike tours) landing page that showcases the best
cycling routes in and around Freiburg, with custom illustrations, and funnels visitors to the
bike-rental page. Secondary goal: strengthen the site's bike-rental SEO so Bike Haus Freiburg
ranks first for rental + tour search intent.

## Decisions (from brainstorming)

- **Structure:** One rich landing page (not index+detail, not blog articles).
- **Images:** Custom on-brand inline SVG illustrations (zero licensing risk, swappable later).
- **Languages:** All 8 fully translated (de/en/fr/tr/es/it/ar/ru), RTL for `ar`.

## Routes (researched)

Seven tours spanning every difficulty and rider type, each mapped to a rental bike category so
the page funnels into rentals:

| # | id | Tour | Difficulty | Rental match |
|---|----|------|-----------|--------------|
| 1 | dreisamtal | Dreisamtal-Radweg (river path) | easy | city / trekking |
| 2 | opfinger-see | Opfinger See & Mooswald loop | easy | city |
| 3 | tuniberg | Tuniberg vineyard loop | easy–moderate | e-bike / trekking |
| 4 | kaiserstuhl | Kaiserstuhl wine tour | moderate | e-bike |
| 5 | glottertal | Glottertal & Dreisam loop | moderate | e-bike / trekking |
| 6 | schauinsland | Schauinsland climb (1,284 m) | hard | road / e-mtb |
| 7 | breisach | Freiburg → Breisach am Rhein | moderate (distance) | e-bike / trekking |

Per-route facts (distance, elevation, duration, highlights, verified external link) are sourced
from a parallel research workflow (komoot / outdooractive / visit.freiburg.de). Numbers are
realistic approximations; descriptions use real place names.

## Page layout

1. **Hero** — title, subtitle, badges (7 routes · all levels · Schwarzwald & Kaiserstuhl).
2. **Intro** — Freiburg as a cycling city + how Bike Haus rentals fit.
3. **Tour cards (7)** — custom SVG illustration, stat row (distance / elevation / duration /
   difficulty), description, highlights, "best for" + recommended Bike Haus rental bike, external
   route link. Each card also links to the rental page.
4. **Practical tips** — when to go, what to bring, where to start, safety/e-bike note.
5. **Final CTA** → rental booking page (the core ask).

## Technical design

- **Data file** `services/bike-tours.data.ts`: language-neutral route facts (id, distanceKm,
  elevationGainM, durationText, difficulty, svgId, recommendedBike, externalUrl) stored once;
  translatable per-route text + page chrome in an 8-language map
  `Record<Language, BikeToursTranslation>` — all hand-written. Mirrors `city-landing.data.ts`
  / `blog.data.ts` conventions but is fully populated for all 8 languages (no en fallback).
- **Component** `pages/bike-tours/bike-tours.component.ts` — standalone, signals, inline SCSS,
  mirrors `fahrrad-stadt.component.ts`. Reads data file, sets title/description synchronously
  (prerender-safe), injects schema.org.
- **SVGs** — 7 original terrain illustrations in `assets/tours/` (river, lake, vineyard,
  wine-hills, forest-valley, mountain-climb, Rhine), referenced by `svgId`. Inline in the
  component for crispness + theming, or as `.svg` assets. Decision: ship as standalone
  `.svg` files referenced by `<img>` for cacheability + prerender simplicity.
- **Routing** (`app.routes.ts`): register `fahrradtouren`, `bike-tours`, `circuits-velo` under
  `:lang`, each loading `BikeToursComponent` (every alias available under every lang, matching
  the rental/service convention).
- **SEO service** (`seo.service.ts`): add a tours block — `TOURS_SEGMENTS`/`getToursPath()` —
  that consolidates the canonical onto the per-language slug and emits hreflang for all 8 langs
  + x-default (`/de/fahrradtouren`).
- **Nav + footer**: add `bikeToursNav` link (path `fahrradtouren`, same slug for all langs like
  `fahrradverleih`). New key `bikeToursNav` in the `Translations` interface + de/en/fr/tr
  (`TRANSLATIONS`) + es/it/ar/ru (`translation-overrides.generated.ts`).
- **schema.org**: `ItemList` of `TouristTrip` (one per route) + `BreadcrumbList`; keep the
  existing `LocalBusiness` identity consistent with city pages.
- **Prerender** (`prerender-routes.txt`): add `/<lang>/<tours-slug>` for all 8 languages.
- **Language switcher**: works unchanged — it swaps the lang segment; non-canonical slugs
  (e.g. `/en/fahrradtouren`) still resolve and the SEO service consolidates the canonical.

## SEO (out-rank competitors for rentals)

- Tours page targets transactional long-tail ("Fahrrad mieten für Schauinsland",
  "E-Bike mieten Kaiserstuhl Tour", etc.) and links every route to the rental page.
- Reciprocal link: add a "tours" link from the rental page ("not sure which bike? see our tours").
- Apply competitive-research findings to the rental page meta/schema/FAQ where high-ROI.
- **Cannibalization guard:** an informational blog article `radfahren-freiburg-routen-guide`
  already exists. The tours page is the *commercial route directory* (transactional intent);
  it links to the blog guide rather than duplicating it.

## Out of scope

Per-route detail pages, live GPX/interactive maps, API/DB backing (page is fully static),
real photography (SVG now; owner swaps later).

## Verification

- `npm run build` in BikeHaus.Homepage (SSR + prerender) succeeds; new routes prerender.
- Adversarial review: all 8 languages complete (no missing keys / English leakage), RTL correct
  for `ar`, schema valid, external links resolve, internal links correct, no cannibalization.
