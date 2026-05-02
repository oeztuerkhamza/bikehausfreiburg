---
name: seo-optimizer
description: Comprehensive SEO performance optimization for websites, with deep support for Google Search Console (GSC) data analysis, meta title and description rewriting, on-page content audits, technical SEO checks, and local SEO playbooks. Use this skill whenever the user mentions SEO, search rankings, organic traffic, Google Search Console, GSC, search visibility, click-through rate (CTR), meta titles, meta descriptions, on-page optimization, keyword research, schema markup, local SEO, Google Business Profile, or asks why their site is losing clicks/rankings. Also trigger when the user uploads a CSV from Search Console, asks "why are my clicks dropping", asks for a meta title/description rewrite, or wants a page audited for SEO. Trigger even when the user uses informal phrasing like "improve my Google rankings", "why aren't people clicking", or "make my page rank higher" — they want this skill.
---

# SEO Performance Optimizer

This skill helps users diagnose and improve organic search performance across three core workflows: **(1) Google Search Console data analysis**, **(2) meta title & description optimization**, and **(3) on-page content audits**. Cross-cutting playbooks for **local SEO**, **multilingual/international SEO**, and **keyword research** are available as reference files.

---

## How to use this skill

When the user asks for SEO help, identify which workflow fits and follow the corresponding section below. Most real conversations span more than one workflow — for example, a CSV analysis often surfaces meta-tag opportunities, which then leads to rewriting. Move between workflows as needed.

**Decision tree:**

| User signal | Workflow |
|---|---|
| Uploads CSV from Search Console, mentions "GSC export", asks "what's wrong with my traffic" | **Workflow 1: GSC Analysis** |
| Provides a URL, current title/description, or asks "rewrite my meta tags" / "improve my CTR" | **Workflow 2: Meta Optimization** |
| Provides a URL or page content and asks "audit this page", "why doesn't this rank", "is this page SEO-friendly" | **Workflow 3: Page Audit** |
| Asks about Google Business Profile, "near me" rankings, map pack, or has a brick-and-mortar business | **Read** `references/local-seo.md` and apply alongside the other workflows |
| Site is non-English or targets multiple countries | **Read** `references/multilingual-seo.md` |
| Asks for keyword ideas, competitor keywords, or content gap analysis | **Read** `references/keyword-research.md` |

---

## Workflow 1: Google Search Console Analysis

**Trigger:** user uploads a CSV (Queries, Pages, or "Performance on Search results" export from GSC), pastes GSC numbers, or asks why clicks/impressions/positions changed.

**Steps:**

1. **Read the file**. GSC exports come as CSV or as a ZIP containing multiple CSVs (Queries.csv, Pages.csv, Countries.csv, Devices.csv, Dates.csv, Search appearance.csv, Filters.csv). If it's a ZIP, unzip first. Identify which files are present.

2. **Run the analysis script** at `scripts/analyze_gsc.py`. This script:
   - Calculates each query's CTR vs. expected CTR for its average position (using industry benchmarks)
   - Flags **CTR opportunities** (queries ranking decently but underperforming on clicks → likely meta-tag problem)
   - Flags **easy wins** (queries at positions 4–15 — these can realistically reach top 3 with effort)
   - Detects **branded vs. non-branded** traffic split
   - Finds **query clusters** (similar queries that could share a single optimized page)
   - Surfaces **declining queries** if a date dimension is present
   
   Run it like this:
   ```bash
   python scripts/analyze_gsc.py <path-to-csv-or-zip> --output report.md
   ```
   
   For full script options, read `scripts/analyze_gsc.py` directly.

3. **Read the generated report** and discuss findings with the user. Always lead with the highest-impact opportunities. A useful structure:
   - Top 3 CTR opportunities (estimated extra clicks/month if CTR rises to benchmark)
   - Top 3 ranking opportunities (queries at positions 4–15 worth pushing up)
   - Any cannibalization (same query has multiple competing pages)
   - Suggested next actions, ranked by ROI

4. **Bridge to other workflows.** CTR opportunities almost always lead into Workflow 2 (meta rewrites). Ranking opportunities lead into Workflow 3 (on-page audits) plus content/backlink work.

For deeper interpretation guidance — including how to read Position metrics correctly, how to handle small sample sizes, and how to spot algorithm updates — read `references/gsc-analysis.md`.

---

## Workflow 2: Meta Title & Description Optimization

**Trigger:** user provides a URL, a current title/description, or asks for meta-tag rewrites. Also use this after Workflow 1 surfaces CTR opportunities.

**Core principles:**

- **Title tag**: ~50–60 characters (Google truncates around 580 pixels — this is roughly 60 chars but varies by character width). Front-load the primary keyword. Include a brand suffix only if the brand has equity.
- **Meta description**: ~150–160 characters. Not a direct ranking factor, but a major CTR driver. Must include the primary keyword (Google bolds matched terms in SERP) and a clear value proposition or CTA.
- **Match search intent**. A query like "best mountain bike under 1500" wants a comparison/guide, not a product page. The title should reflect that intent.
- **Avoid duplication**. Every page on the site needs a unique title and description.

**Steps:**

1. **Understand the page's purpose and primary keyword.** Ask the user (or infer from the page) what the target query is.

2. **Diagnose the current meta tags** if provided:
   - Length within limits?
   - Primary keyword present and front-loaded?
   - Distinct from sibling pages?
   - Compelling — does it answer "why click this result instead of the others"?

3. **Generate 3 variants** with different angles. Label each:
   - **"Direct"** — keyword + clear description of what's on the page
   - **"Benefit-led"** — leads with the user's outcome ("Save 30% on...", "Find your perfect...")
   - **"Curiosity/specificity"** — uses numbers, year, or a hook ("12 ways to...", "2026 guide to...")

4. **Show character counts** for every variant so the user can see they fit.

5. **Recommend one** with a one-sentence rationale, but let the user pick.

For full title/description formulas, power-word lists, language-specific guidance (German, Spanish, etc.), and SERP feature optimization (FAQ schema, How-To, etc.), read `references/meta-optimization.md`.

---

## Workflow 3: On-Page Content Audit

**Trigger:** user asks for a page to be audited, optimized, or ranks poorly despite "good content".

**Steps:**

1. **Get the page content.** Ideally the user provides the URL (use `web_fetch`) or pastes the content. Without the actual page, audits are guesses.

2. **Run through the audit checklist below.** Note issues as you go; don't dump every minor flaw — prioritize the top 5–7 problems by impact.

3. **Produce a prioritized fix list** with effort/impact tags (Quick Win, Medium, Heavy Lift).

**The audit checklist (top-level):**

- **Search intent match.** Does the page answer the query the user is targeting? If the query is informational and the page is transactional, that's the #1 problem.
- **Title & H1 alignment.** They should be related but not identical. Both must contain the primary keyword.
- **Heading hierarchy.** One H1, logical H2/H3 structure. No skipped levels (H1 → H3 with no H2).
- **Content depth.** Compare word count and topical coverage to top-3 ranking pages. Thin content rarely ranks for competitive queries.
- **E-E-A-T signals.** Author bylines, expertise indicators, citations, last-updated dates, real photos.
- **Internal linking.** Does the page have at least 3 contextual internal links pointing to it? Does it link out to relevant supporting pages?
- **Image SEO.** Descriptive filenames, alt text with keywords (naturally), modern formats (WebP/AVIF), lazy loading.
- **Schema markup.** Article, Product, LocalBusiness, FAQPage, Breadcrumb — apply whichever fits.
- **Page experience.** Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1), mobile-friendliness, HTTPS.
- **CTAs and conversion clarity.** Even ranking #1 is wasted if the page doesn't convert.

For the deep-dive checklist with specific tools, threshold values, and code examples (schema JSON-LD, etc.), read `references/content-audit.md`.

---

## Cross-cutting reference files

Read these when the situation calls for it — they extend the three core workflows:

- `references/gsc-analysis.md` — Deep interpretation of GSC metrics, CTR benchmarks by position, sample-size warnings, algorithm-update detection
- `references/meta-optimization.md` — Title/description formulas, power words, character-count specifics by language, SERP-feature optimization
- `references/content-audit.md` — Full on-page checklist with thresholds, schema templates, Core Web Vitals troubleshooting
- `references/local-seo.md` — Google Business Profile optimization, NAP consistency, local citations, review strategy, "near me" ranking factors. **Read this whenever the user has a physical location or local service area.**
- `references/multilingual-seo.md` — hreflang, ccTLD vs subfolder, translation vs localization, German-market specifics. **Read when the site targets non-English audiences.**
- `references/keyword-research.md` — Intent classification, long-tail strategy, competitor gap analysis, free tools that don't require paid SEO platforms

---

## Output style

- Lead with the **highest-impact finding**, not the easiest one to spot.
- Quantify whenever possible: "This change could recover ~12 clicks/month at current impression volume" beats "this would help CTR".
- For every recommendation, state **what to do**, **why it matters**, and **how to verify** it worked (which GSC metric to watch, over what timeframe).
- Avoid jargon dumps. The user may be a small business owner, not an SEO professional. Brief term explanations are fine.
- When proposing meta tags, content edits, or schema markup, **always show the actual text or code** — don't just describe it abstractly.

---

## Things to avoid

- **Don't promise rankings.** SEO is probabilistic. Use language like "this typically improves..." or "based on the patterns in your data...".
- **Don't recommend tactics from the 2010s.** Exact-match keyword density, meta keyword tag, article spinning, link directories — all dead or harmful. Modern SEO is intent + quality + technical health.
- **Don't optimize for Google over users.** Every recommendation should also make the page better for the human visitor.
- **Don't fabricate metrics.** If a CSV doesn't contain a date dimension, you can't compute trends. Say so.
