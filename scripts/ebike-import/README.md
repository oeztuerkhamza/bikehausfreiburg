# Feldmeier IDEAL E-Bike Dataset

One-time extraction (Phase D, Task 13) of all IDEAL brand e-bikes sold by
feldmeier-bike.com, for the E-Bike catalog feature.

## Source

- Listing: https://www.feldmeier-bike.com/ideal-e-bikes
- Shop page (checked, contains no IDEAL e-bikes — only Feldmeier FE house brand): https://www.feldmeier-bike.com/shop
- Detail pages: `https://www.feldmeier-bike.com/product-page/<slug>`

Site is a Wix store. Extraction date: unknown (not recorded).

## Output

- `feldmeier-ebikes.json` — array of e-bike objects (UTF-8, pretty-printed).

## Count

13 unique e-bikes.

The listing page showed ~20 entries, but many were duplicate slug variants
(e.g. `-1` suffixed pages) of the same product. Deduped by title + price,
keeping one canonical entry each. The canonical `sourceUrl` uses the clean
(non-suffixed) slug where one exists.

Breakdown by category:
- E-City (PRISMA / ORAMA): 10
- E-Trekking (FUTOUR): 3

## Skipped / 404

None. All 13 detail pages fetched successfully; no 404s or fetch failures.

## Field notes / commonly missing or derived values

- `reichweiteKm`: null for ALL bikes — the site never lists range.
- `motorPosition`: all set to "Mittelmotor". Every bike uses a Bosch
  Performance-line or Shimano STEPS mid-drive (crank/center motor), so this is
  accurate rather than a guess.
- `beschreibung`: the site has no prose description. Each value is a compiled
  spec summary built from the on-page spec strings (motor, battery, gears,
  tires, etc.). German umlauts were transliterated (ae/oe/ue/ss) for safety.
- `motorLeistungNm`: torque in Nm (NOT watts — all motors are 250W). Bosch CX
  = 100, PX = 90, Performance Line = 75; Shimano EP800 = 85, EP600 = 85,
  E6100 = 60.
- `kategorie`: PRISMA/ORAMA city/eSUV models -> "E-City"; FUTOUR trekking
  models -> "E-Trekking". No MTB models present.
- `rahmengroesse` / `reifengroesse`: some models offer both 27.5" and 29"
  wheel/frame configs; both are recorded where the page listed them.
- `imageUrls`: one product photo per bike. The site detail pages render a
  single main product image plus a shared 132x105 "related products" thumbnail
  (`ed1141_876049eb...`) that appears identically on every page — that shared
  thumbnail was excluded as it is not a product photo. Image URLs were rewritten
  to a high-resolution Wix fill form (`w_1480`). The owner can add more photos
  later.

All other fields (titel, marke, modell, preis, farbe, gangschaltung,
akkuKapazitaetWh) were present on every page. Accuracy was prioritized on
`titel` and `preis`. No specs were fabricated; absent values are null.

---

# Feldmeier FE (house-brand) E-Bike Dataset

One-time extraction of all **Feldmeier / FE** house-brand e-bikes (the shop's
own PEDELEC line, NON-IDEAL) sold by feldmeier-bike.com, for the E-Bike catalog
feature. Companion to the IDEAL dataset above.

## Source

- Listing: https://www.feldmeier-bike.com/shop  (page title "FE PEDELEC";
  Wix store, 2 pages, paginated via `?page=N`)
- FE category sub-pages exist (eCITY `/ecity-1`, eTREKKING `/etrekking`,
  eSUV `/esuv-1`, eMTB `/shop-3`) but the eCITY/eTREKKING/eSUV category pages
  actually list only IDEAL bikes; only the eMTB page and the main `/shop`
  (FE PEDELEC) page list FE bikes. The `/shop` page is the canonical FE list.
- Detail pages: `https://www.feldmeier-bike.com/product-page/<slug>`

Site is a Wix store; product pages are JS-rendered (scraped via Playwright).
Extraction date: unknown (not recorded).

## Output

- `feldmeier-fe-ebikes.json` — array of e-bike objects (UTF-8, pretty-printed),
  same schema as `feldmeier-ebikes.json`.

## Count

30 unique e-bikes. ALL are brand "Feldmeier" (FE house brand). **Zero IDEAL**
bikes are included (those are in the separate IDEAL dataset).

The `/shop` page exposed 34 product URLs across 2 pages; 4 were duplicate slug
variants (`-1`/`-4`/`-5` suffixes) of the same product. Deduped by title +
price, keeping one canonical entry each (clean non-suffixed slug where one
exists). Note: a few models genuinely repeat the same name at different prices
and are kept as distinct rows (e.g. FE 12T ECO at 2499 vs 2999; FE 29Mi at
4499 vs 3999; FE 20A ECO at 2999 vs 2499).

Breakdown by category:
- E-City   (Ai/A/C/Ci eSUV+eCITY models): 14
- E-Trekking (Si/Ti/T models):            10
- E-MTB    (Mi/M/Fi models):               6

Every listed FE product is a verified e-bike (each detail page lists a Bosch or
Shimano motor + battery Wh), so nothing was excluded as non-electric.

## Skipped / 404

None. All 30 canonical detail pages fetched successfully; no 404s.

## Field notes / commonly missing or derived values

- `reichweiteKm`: null for ALL 30 bikes — the site never lists range.
- `motorMarke`: present on every bike (Bosch on 28, Shimano on 2 — FE 14Ti and
  FE 25Ai use the SHIMANO EP600 mid-drive).
- `motorPosition`: all "Mittelmotor". Every FE bike uses a Bosch Performance/
  Active Line or Shimano EP600 mid-drive (crank/center motor) — accurate, not a
  guess.
- `motorLeistungNm`: torque in Nm (all motors 250W). Values taken verbatim from
  the spec table (Bosch CX Gen5 = 100, PX = 90, CX BES3 = 85, Performance Line
  BES3 = 75, BES2 = 65, Active Line Plus = 50; Shimano EP600 = 85).
- `beschreibung`: the site has no prose; each value is a compiled spec summary
  built from the on-page spec table (frame, motor, battery, fork, gears, brakes,
  tires). German umlauts transliterated (ae/oe/ue/ss) to match the IDEAL style.
- `kategorie`: mapped per the requested scheme — eCITY/eSUV -> "E-City",
  eTREKKING -> "E-Trekking", eMTB -> "E-MTB". The frame string ("eCITY",
  "eTREKKING", "eSUV", "eMTB", "Fully") on each detail page was used to classify.
- `rahmengroesse`: multiple frame heights are listed per model (e.g.
  "43cm / 46cm / 51cm"); all recorded.
- `reifengroesse`: derived from the frame/tire spec (27.5", 28", or 29").
- `imageUrls`: one product photo per bike (pre-`/v1/` Wix media form, always
  downloadable). Two shared graphics that appear on every product page (a header
  logo `ed1141_856f775c...png` and a related-products thumb `...876049eb...`)
  were excluded as they are not product photos.

All other fields (titel, marke, modell, preis, farbe, gangschaltung,
akkuKapazitaetWh) were present on every page. Accuracy was prioritized on
`titel` and `preis`. No specs were fabricated; absent values are null.
