# Rental Booking: Dedicated Page + Mobile UX Fixes — Design

**Date:** 2026-06-10 · **Status:** Approved
**Source:** Mobile user-testing feedback (owner, Turkish). Booking flow is embedded mid-page on the dense `/fahrradverleih` SEO landing page; step transitions restore absolute `scrollY`, landing users on unrelated sections (Hinweis, reviews). Browser back exits the page and loses all state. Calendar selection is nearly invisible (18%-opacity background). Bike cards have no visible select button.

## Decision

Move the booking flow to a **dedicated page** (Approach A), entered via prominent CTA buttons on the landing page. The booking page contains *only* the flow — no FAQ, reviews, or note banners.

## Design

### 1. Routing

New routes registered **before** the `:category` routes (first-match-wins):

| Languages | Path |
|---|---|
| de, tr, es, it, ar, ru | `/:lang/fahrradverleih/buchen` |
| en | `/en/bike-rental/booking` |
| fr | `/fr/location-velo/reservation` |

A small helper returns the booking path per language (used by all CTAs).
Page is `noindex, follow`; excluded from sitemap and prerender routes.

### 2. New page component

`rental-booking-page.component.ts` — thin shell: compact heading, back link to the rental landing page, hosts `<app-rental-booking-steps>`, sets SEO meta (title + robots noindex).

### 3. Step ↔ browser history (`rental-booking-steps.component.ts`)

- Each step change writes `?step=N` via `router.navigate` (pushState).
- `queryParams` subscription handles back/forward: browser back = one step back, state preserved in the live component.
- Deep link with `?step=N` but missing prerequisite state → snap to step 1 (`replaceUrl`).
- SSR-safe: history wiring browser-only.

### 4. Scroll behavior

- Remove the `scrollY`-preservation hack in `goToStep()`; on step change scroll to top of the flow (below sticky navbar).
- Step indicator becomes **sticky** on mobile so the process flow stays visible at all times.

### 5. Calendar selection visibility

- `is-start` / `is-end`: solid accent background + white text (was 18%-opacity gradient).
- `in-range`: clearly visible band.
- Persistent selected-range summary under the calendar ("12.06 → 14.06 · 2 Tage").

### 6. Bike selection

Explicit "Auswählen" button on each bike card (card click still works; button is the visible affordance).

### 7. Landing + category pages

- `fahrradverleih.component.ts`: embedded `booking-panel` section replaced by a CTA card; hero CTA navigates to the booking route instead of scrolling.
- `rental-category.component.ts`: both `fragment="booking-panel"` links → routerLink to the booking page.

### 8. i18n

New keys (CTA title/text/button, select-bike button, booking page title) added to `translation.service.ts` for de/en/fr/tr; es/it/ar/ru via the existing override generator.

## Error handling

- Invalid/missing `?step` → step 1.
- Existing per-step validation and API error messages unchanged.

## Verification

Playwright on dev server, 390px mobile viewport: full booking flow, back-button mid-flow (one step back, state intact), calendar end-date visibility, no scroll jumps to unrelated content.
