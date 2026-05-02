# Google Search Console: Deep Analysis Reference

This reference is for interpreting GSC data correctly and extracting maximum insight from it. Read this when running Workflow 1 in the main SKILL.md.

## Table of contents

1. The four core metrics (and the subtle ways they mislead)
2. CTR benchmarks by position
3. Sample size — when GSC numbers lie
4. Identifying CTR opportunities
5. Identifying ranking opportunities (positions 4–15)
6. Detecting query cannibalization
7. Branded vs. non-branded analysis
8. Detecting algorithm updates and seasonality
9. The Pages report vs. the Queries report
10. Common GSC export formats

---

## 1. The four core metrics

GSC gives you four numbers. Each has a gotcha.

**Clicks** — how many times users clicked through to your site from Google search results. Straightforward, but excludes Discover, Images (unless filtered), and Knowledge Panel impressions where the user got their answer without clicking.

**Impressions** — how many times one of your URLs appeared in someone's search results. *Caveat:* an impression counts even if the user had to scroll to see your link. So 1000 impressions doesn't mean 1000 people *saw* your listing — many never scrolled that far.

**CTR (Click-Through Rate)** — Clicks ÷ Impressions. Useful, but compare against the **expected CTR for the average position**, not against an absolute target. CTR at position 8 should be much lower than CTR at position 2.

**Average Position** — the average rank of your URL across all impressions. Critical caveat: **this is averaged over impressions, not over searches**. If your page ranked at position 1 once and position 20 ten times, your "average position" is ~18.3 — but you really *can* rank #1 sometimes. Always look at distribution, not just the mean. Also: GSC counts position 1 as the highest organic result, ignoring ads but counting featured snippets, People Also Ask, etc.

---

## 2. CTR benchmarks by position

Use these as rough expected-CTR baselines when diagnosing whether a query is underperforming. Numbers vary by industry, query type (informational vs. transactional), SERP features (featured snippets, ads, etc.), and over time. Treat them as orientation, not gospel.

| Position | Typical CTR (informational) | Typical CTR (transactional/branded) |
|---------|----------------------------|------------------------------------|
| 1       | 28–35%                     | 35–50%                             |
| 2       | 15–20%                     | 18–25%                             |
| 3       | 10–13%                     | 12–17%                             |
| 4       | 7–9%                       | 8–11%                              |
| 5       | 5–6%                       | 6–8%                               |
| 6       | 3.5–4.5%                   | 4–6%                               |
| 7       | 2.5–3.5%                   | 3–4.5%                             |
| 8       | 2–3%                       | 2.5–3.5%                           |
| 9       | 1.5–2.5%                   | 2–3%                               |
| 10      | 1.2–2%                     | 1.5–2.5%                           |
| 11–20   | 0.4–1.5%                   | 0.5–1.5%                           |
| 21+     | <0.5%                      | <0.5%                              |

**Flag a CTR opportunity** when actual CTR is meaningfully below the lower bound for the average position — and the query has at least 100 impressions over the period. With <100 impressions, statistical noise dominates.

**Note:** if a query has a featured snippet held by another site, your CTR will be depressed at any position. Same if the SERP has heavy ads, shopping carousels, or AI Overviews.

---

## 3. Sample size — when GSC numbers lie

GSC anonymizes queries that didn't get many searches. Many "0 click, 5 impression" queries you see are real but statistically meaningless. Rules of thumb:

- **<10 impressions**: ignore the CTR. Could be 0% or 100% with no meaning.
- **10–100 impressions**: directional only. Don't make decisions on a single query at this volume.
- **100–1000 impressions**: reliable enough to act on, especially over 28+ days.
- **>1000 impressions**: high confidence; even small CTR gaps matter.

When recommending action, weight queries by impressions × CTR-gap, not by CTR-gap alone. A query at 0% CTR with 12 impressions is noise; a query at 1.2% CTR (vs 8% expected) with 4000 impressions is a goldmine.

---

## 4. Identifying CTR opportunities

A CTR opportunity is a query where ranking is fine but clicks are low. The fix is almost always **meta title and description**. Sometimes also: structured data (so the SERP listing is richer), brand recognition, or the listing being out of place for the search intent.

**Algorithm to find them in a Queries CSV:**

1. For each query, look up the expected CTR for its average position.
2. Compute `gap = expected_ctr - actual_ctr`.
3. Compute `recoverable_clicks = gap × impressions`.
4. Rank queries by `recoverable_clicks`, descending.
5. Filter to queries with `impressions >= 100` and `gap > 0`.

The top of this list = the queries where rewriting meta tags has the highest payoff. Hand these to Workflow 2.

---

## 5. Identifying ranking opportunities (positions 4–15)

Queries already ranking on page 1 (positions 1–10) or near it (11–15) are the cheapest to push higher. They've already passed Google's threshold for "this page is relevant"; they just need a nudge — better content, more internal links, more authoritative backlinks, or fresher information.

**Don't waste effort on queries at position 30+** unless the page itself is genuinely strong — those usually need fundamental work.

**Algorithm:**

1. Filter to queries with `4 <= position <= 15` and `impressions >= 100`.
2. Compute `potential_clicks_at_pos_3 = impressions × ctr_at_position_3`.
3. Compute `lift = potential_clicks_at_pos_3 - current_clicks`.
4. Rank by `lift`, descending.

The top of this list = queries where moving up the SERP would unlock the most clicks. These typically need on-page work (Workflow 3) plus content depth.

---

## 6. Detecting query cannibalization

Cannibalization = two or more pages on your site competing for the same query. Symptoms in GSC:

- The same query appears with multiple landing pages in the Pages-with-Queries view
- Position fluctuates wildly (Google can't decide which page is the right answer)
- Neither page reaches its potential

**To detect from a CSV:** if you have both Pages and Queries dimensions, group by query and count distinct pages. Any query with 2+ pages and meaningful impressions on both is a candidate.

**Fixes (pick one):**

- **Consolidate** — merge the pages, 301-redirect the weaker one
- **Differentiate** — rewrite each to target a clearly different sub-intent
- **Canonicalize** — if duplication is intentional (e.g., category pages), use `rel=canonical` to point Google at the primary

---

## 7. Branded vs. non-branded analysis

Always split queries into two buckets:

- **Branded** — queries containing the brand name or close variants (typos, abbreviations, etc.)
- **Non-branded** — everything else

Branded traffic measures *brand awareness and direct demand*. Non-branded traffic measures *SEO performance*. They respond to very different tactics. A site with growing total clicks but flat non-branded clicks is growing because of brand-building, not SEO — and vice versa.

For local businesses, also segment by **local-intent queries** (containing the city/neighborhood/region name) vs. **generic** queries.

---

## 8. Detecting algorithm updates and seasonality

If the user reports a sudden traffic drop, check:

1. **Date of the drop.** Cross-reference against known Google updates (core updates, spam updates, helpful content updates). Public trackers maintain dated lists.
2. **Drop pattern.** Did it hit:
   - All queries proportionally? → likely a sitewide signal (manual action, technical issue, core update)
   - Specific page types? → core update or content quality signal
   - Specific queries? → SERP layout change (AI Overview, featured snippet stolen, new competitor)
3. **Seasonality.** Many businesses have predictable cycles (e.g., bike retailers: spring spike, winter dip). Compare year-over-year, not just month-over-month.

If GSC data spans <3 months, year-over-year comparison isn't possible — note this to the user.

---

## 9. The Pages report vs. the Queries report

These two reports answer different questions:

- **Queries report** answers: "What are people searching for that brings them to my site?" → use for content strategy, meta optimization, intent analysis.
- **Pages report** answers: "Which of my pages get traffic?" → use for content auditing, identifying winners to scale and losers to improve or kill.

**The crossing is where insight lives.** GSC's UI lets you click into a page and see its queries (or vice versa). Exports of this combined view are the most powerful — but Google often samples or aggregates them, so totals may not match.

---

## 10. Common GSC export formats

GSC exports usually arrive as one of these:

- **Single CSV** — one dimension (e.g., queries-only). Headers: `Query, Clicks, Impressions, CTR, Position`.
- **ZIP from "Export" → "Performance on Search results"** — contains: `Queries.csv`, `Pages.csv`, `Countries.csv`, `Devices.csv`, `Dates.csv`, `Search appearance.csv`, `Filters.csv`. Always unzip first and inspect what's there.
- **Google Sheets export** — same data as CSV but with formatting; export to CSV before analyzing.
- **Looker Studio / BigQuery export** — bigger and more flexible, with full date dimensions. Same logic applies.

CTR in CSV exports is usually a string like `"4.5%"` — strip the `%` and divide by 100 before computing.
Position is a float like `5.32` — averages are usable but lose distribution info.

---

## A note on confidence

Even with perfect analysis, SEO recommendations are probabilistic. A "high-confidence opportunity" might still not pay off because of competitor moves, algorithm shifts, or factors invisible to GSC. Always frame recommendations as "based on this data, the highest-EV move is X" rather than "doing X will get you Y clicks". Set expectations honestly — that's what builds trust over multiple conversations.
