# Multilingual & International SEO Reference

Read this when the site targets non-English audiences or multiple countries/languages. Particular attention to German-market specifics in section 6, since this skill was originally built for a German audience.

## Table of contents

1. URL structure: ccTLD, subdomain, or subfolder?
2. hreflang implementation
3. Translation vs. localization
4. Currency, units, and date formats
5. Local search engines that aren't Google
6. The German market — specific notes
7. Country-targeting in Search Console
8. Common multilingual SEO mistakes

---

## 1. URL structure: ccTLD, subdomain, or subfolder?

Three main options, each with tradeoffs:

### Option A: Country-code TLDs (`example.de`, `example.fr`)

- **Pros:** strongest signal of local relevance; users trust local domains; clearest geo-targeting
- **Cons:** expensive (separate domains, separate SEO authority for each), legal/registration requirements vary

Best for: enterprises serious about each market with budget and team to maintain separate sites.

### Option B: Subdomains (`de.example.com`, `fr.example.com`)

- **Pros:** clean separation, easier to manage than ccTLDs
- **Cons:** Google sometimes treats subdomains as separate sites, splitting authority; weaker geo signal than ccTLD

Best for: international sites with content that genuinely diverges between markets.

### Option C: Subfolders (`example.com/de/`, `example.com/fr/`)

- **Pros:** consolidates SEO authority on one domain; easiest to manage; shared backlinks benefit all variants
- **Cons:** weaker geo signal than ccTLD; risk of language-detection mistakes by Google

Best for: most small-to-mid businesses. Default recommendation unless there's a specific reason otherwise.

**For a single-language local business** (like a German-only site for a Freiburg shop), this question doesn't apply — just use a `.de` domain or a `.com` with a single language.

---

## 2. hreflang implementation

`hreflang` tags tell Google which language and region each URL targets. Required when you have alternate-language or alternate-region versions of a page.

### Where to put them

Three options, pick one:

1. **HTML `<head>`** — works for all pages, easy to maintain per-page:
   ```html
   <link rel="alternate" hreflang="de" href="https://example.com/de/" />
   <link rel="alternate" hreflang="en" href="https://example.com/en/" />
   <link rel="alternate" hreflang="x-default" href="https://example.com/" />
   ```

2. **HTTP headers** — for non-HTML files (PDFs, etc.)

3. **XML sitemap** — best for large sites; centralizes management

### Rules

- **Reciprocal:** every page must reference every alternate, including itself.
- **Self-referencing:** the German page must include an hreflang for `de` pointing to itself.
- **Language code only OR language-region:** use `de` (any German speaker), `de-DE` (German speaker in Germany), `de-AT` (Austrian), `de-CH` (Swiss German). Don't mix arbitrarily.
- **`x-default`:** the fallback page when no language matches the user. Almost always recommended.

### Common errors

- Missing self-reference (very common; breaks the whole tag set)
- Using region without language (`hreflang="DE"` is wrong; must be `de-DE`)
- Linking to non-canonical URLs
- Mismatched language codes (`hreflang="de"` on a page that's actually French)

---

## 3. Translation vs. localization

**Translation** = converting words from one language to another.
**Localization** = adapting content to a culture, market, and search behavior.

For SEO, **localization is mandatory**. Examples:

- A German-language blog post about "best Christmas gifts" should reference customs, holidays, and product availability that match Germany — not directly translate a US-centric article.
- Search behavior differs: Germans often use compound nouns ("Mountainbikehelm") while English speakers use modifiers ("mountain bike helmet"). Translate the keyword research, not just the content.
- Currency, units (km vs. miles), date format (DD.MM.YYYY in Germany), legal references (DSGVO, not GDPR), and even color associations differ.
- Voice and formality differ: German-language B2B content often uses formal "Sie" by default; B2C may use "du" — research the niche before deciding.

**Don't use auto-translation as the final step.** Machine translation has improved dramatically but still misses idiom, intent, and tone. Use it to draft; have a native speaker finalize.

---

## 4. Currency, units, and date formats

Visible details that signal localization to both users and search engines:

| Element | Germany (de-DE) | UK (en-GB) | US (en-US) |
|---------|----------------|-----------|-----------|
| Currency | € (after value: `49,99 €`) | £ (before: `£49.99`) | $ (before: `$49.99`) |
| Decimal separator | comma (`49,99`) | period (`49.99`) | period (`49.99`) |
| Thousands separator | period (`1.000`) | comma (`1,000`) | comma (`1,000`) |
| Date format | `02.05.2026` | `02/05/2026` or `2 May 2026` | `05/02/2026` |
| Distance | km, m | mi (some km) | mi |
| Phone | `+49 761 123 4567` | `+44 20 1234 5678` | `+1 415 123 4567` |

Schema markup (`Product`, `LocalBusiness`, etc.) accepts these natively when set in the right locale.

---

## 5. Local search engines that aren't Google

Google dominates most markets, but not all. Note relevant exceptions:

- **China:** Baidu (~70% share), Sogou, 360 Search. Different SEO entirely; Google is largely blocked.
- **Russia:** Yandex (~50% share). Has its own SEO ecosystem, particularly for the .ru market.
- **South Korea:** Naver dominates many query types. Different ranking signals (own ecosystem of blogs, Q&A).
- **Japan:** Google leads, but Yahoo Japan (powered by Google but with different UI) has its own user base.
- **Czech Republic:** Seznam.cz still meaningful (~20%).

For German-speaking markets (DE/AT/CH), Google holds 90%+ share. Bing matters at the margins (5–10%) — Bing Places submission is worth the 30 minutes it takes.

---

## 6. The German market — specific notes

### Search behavior

- German users skew older and more privacy-conscious than US averages. They use longer, more specific queries.
- Mobile-vs-desktop split is closer to 50/50 than the US (more desktop usage).
- Branded queries are sticky — customers research a brand more deeply before buying.

### Language characteristics

- **Compound nouns** are the norm. Plan content around "Mountainbikehelm" not "Mountainbike Helm" (though both occur). Check actual search volumes for both forms.
- **Formal vs informal "you"** — `Sie` is the default for most B2B and many B2C. `du` is normal for sports, lifestyle, and youth-targeted niches. The bike retail niche tends toward `du` in friendly content, `Sie` in official communications.
- **Capitalization rules** — all nouns are capitalized in German. Don't lowercase them in titles to "look more like English."
- **Umlauts (ä, ö, ü) and ß** — display correctly in modern SERPs and URLs. Don't replace with "ae", "oe", "ue", "ss" in URLs unless legacy content forces it. Modern URL slugs handle umlauts fine in most CMSes.

### Legal and trust signals (matter for SEO indirectly)

- **Impressum** is legally required for any German website with any commercial purpose. Missing one looks unprofessional and may trigger trust signals downward.
- **Datenschutzerklärung** (privacy policy) and cookie consent are required by GDPR (DSGVO).
- **AGB** (Allgemeine Geschäftsbedingungen / terms and conditions) for any ecommerce.
- A footer with full company info (legal name, registration, VAT ID, contact) is standard and trust-positive.

### Local search

- Region-specific phrasing matters: "in Freiburg", "Freiburg im Breisgau", "Freiburg i. Br." may all be searched. Check GSC for which forms appear.
- Public transit mentions (Straßenbahn lines, S-Bahn stations) help users orient and add hyperlocal signals.
- Local newspapers (Badische Zeitung for Freiburg) are valuable backlink sources.

### Reviews

- Google reviews dominate, but Trusted Shops is a major German-specific trust signal for ecommerce. The Trusted Shops badge displayed in SERPs (via review snippets) significantly lifts CTR.
- Negative reviews are common and frank — Germans expect honest exchanges, not glowing PR. Respond accordingly.

---

## 7. Country-targeting in Search Console

GSC lets you set a target country for a property (under International Targeting → Country). Use this when:

- Your site is on a generic TLD (`.com`, `.org`) but targets a specific country
- You don't use a ccTLD

Don't set a target country if:

- You use a ccTLD (it's automatic)
- Your site genuinely targets multiple countries (then use hreflang per page instead)

For multi-country sites: don't set a country in Search Console; configure hreflang properly and let Google interpret per-URL.

---

## 8. Common multilingual SEO mistakes

- **Auto-translating with no review.** Generates content that ranks for nothing because no one searches in those translated terms.
- **Same content, different URL prefix, no hreflang.** Google sees duplicates and picks one to show, ignoring the others.
- **Translating but keeping URLs in English** (`/de/best-bikes/`). Confusing for users; mild signal mismatch. Better: localize URL slugs too where the CMS allows (`/de/beste-fahrraeder/`).
- **Using IP-based redirects** that send the user to the "right" version automatically. Breaks Google's crawler (which crawls from US IPs and gets the wrong content). Never auto-redirect based on IP — show a country/language picker instead.
- **One generic homepage in English** for a multi-language site. The homepage is highest-equity; localize it.
- **Forgetting that GBP is per-location, not per-language.** A German GBP will show whatever language is set, regardless of the searcher's language.
