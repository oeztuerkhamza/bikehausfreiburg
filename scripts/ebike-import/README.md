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
