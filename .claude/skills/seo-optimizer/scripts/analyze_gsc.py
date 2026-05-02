#!/usr/bin/env python3
"""
analyze_gsc.py — Google Search Console performance analyzer.

Reads a CSV (or ZIP) export from GSC and produces a markdown report
identifying:

  - CTR opportunities (queries with below-benchmark CTR for their position)
  - Ranking opportunities (queries at positions 4–15 that could push higher)
  - Possible cannibalization (queries served by multiple URLs)
  - Branded vs. non-branded traffic split
  - Top performers and decliners (if a date dimension is available)

Usage:
    python analyze_gsc.py <input> [options]

Examples:
    python analyze_gsc.py Queries.csv --output report.md
    python analyze_gsc.py "Performance on Search results.zip"
    python analyze_gsc.py Queries.csv --brand "bikehaus" --min-impressions 50

The script handles:
    - Single CSV (Queries-only or Pages-only export)
    - ZIP from GSC's "Export → Performance on Search results" containing
      multiple CSVs (Queries.csv, Pages.csv, Dates.csv, etc.)
    - Both English and German GSC export header variants

Dependencies: only Python 3.8+ standard library (no pandas required).
"""

import argparse
import csv
import io
import os
import re
import sys
import zipfile
from collections import defaultdict
from pathlib import Path

# --------------------------------------------------------------------------
# CTR benchmarks by position. Lower bound of "informational" range from
# references/gsc-analysis.md. Used to flag CTR underperformance.
# --------------------------------------------------------------------------
EXPECTED_CTR = {
    1: 0.28, 2: 0.15, 3: 0.10, 4: 0.07, 5: 0.05,
    6: 0.035, 7: 0.025, 8: 0.02, 9: 0.015, 10: 0.012,
}
# For positions 11+, use a decay curve.
def expected_ctr(position: float) -> float:
    """Return expected CTR for a given average position."""
    if position is None or position <= 0:
        return 0.0
    pos_int = int(round(position))
    if pos_int <= 10:
        return EXPECTED_CTR[max(1, pos_int)]
    if pos_int <= 20:
        return 0.008
    if pos_int <= 30:
        return 0.004
    return 0.002

# Header aliases (English + German)
HEADER_ALIASES = {
    "query":       ["query", "queries", "suchanfrage", "suchanfragen", "top queries", "häufigste suchanfragen"],
    "page":        ["page", "pages", "landing page", "url", "seite", "seiten", "top pages", "häufigste seiten"],
    "clicks":      ["clicks", "klicks"],
    "impressions": ["impressions", "impressionen"],
    "ctr":         ["ctr", "click-through rate", "klickrate"],
    "position":    ["position", "average position", "durchschn. position", "durchschnittliche position"],
    "date":        ["date", "datum"],
}

def normalize_header(h: str) -> str:
    """Map a raw CSV header to a canonical key (query, clicks, etc.)."""
    h_clean = h.strip().lower().lstrip("\ufeff")  # strip BOM if present
    for canonical, aliases in HEADER_ALIASES.items():
        if h_clean in aliases:
            return canonical
    return h_clean

def parse_ctr(value: str) -> float:
    """Convert '4.5%' or '4,5%' or 0.045 to 0.045."""
    if value is None:
        return 0.0
    raw = str(value).strip()
    had_percent = "%" in raw
    v = raw.replace("%", "").replace(",", ".")
    try:
        f = float(v)
    except ValueError:
        return 0.0
    # If the source string had '%', the number is a percentage (e.g., 0.71 → 0.0071).
    # If not, it's likely already a fraction (e.g., 0.045) — but if it's > 1 it must be a percentage.
    if had_percent:
        return f / 100
    return f / 100 if f > 1 else f

def parse_float(value: str) -> float:
    if value is None:
        return 0.0
    v = str(value).strip().replace(",", ".")
    try:
        return float(v)
    except ValueError:
        return 0.0

def parse_int(value: str) -> int:
    if value is None:
        return 0
    v = str(value).strip().replace(",", "").replace(".", "")
    try:
        return int(v)
    except ValueError:
        try:
            return int(float(v))
        except ValueError:
            return 0

# --------------------------------------------------------------------------
# Reading inputs
# --------------------------------------------------------------------------
def read_csv_text(text: str):
    """Return list[dict] with canonical keys."""
    reader = csv.reader(io.StringIO(text))
    try:
        raw_headers = next(reader)
    except StopIteration:
        return []
    headers = [normalize_header(h) for h in raw_headers]
    rows = []
    for raw_row in reader:
        if not raw_row:
            continue
        row = dict(zip(headers, raw_row))
        rows.append(row)
    return rows

def read_input(path: str) -> dict:
    """Return dict of {category_name: list_of_rows}.

    Categories: 'queries', 'pages', 'dates', 'countries', 'devices',
                'search_appearance', 'queries_pages' (combined), or 'unknown'
    """
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Input not found: {path}")

    if p.suffix.lower() == ".zip":
        return read_zip(p)
    if p.suffix.lower() in (".csv", ".tsv", ".txt"):
        return read_single_csv(p)
    raise ValueError(f"Unsupported file type: {p.suffix}")

def read_zip(p: Path) -> dict:
    out = {}
    with zipfile.ZipFile(p) as z:
        for name in z.namelist():
            if not name.lower().endswith(".csv"):
                continue
            with z.open(name) as f:
                # GSC uses UTF-8 with BOM
                text = f.read().decode("utf-8-sig", errors="replace")
            rows = read_csv_text(text)
            category = classify_csv(name, rows)
            out[category] = rows
    return out

def read_single_csv(p: Path) -> dict:
    text = p.read_text(encoding="utf-8-sig", errors="replace")
    rows = read_csv_text(text)
    category = classify_csv(p.name, rows)
    return {category: rows}

def classify_csv(filename: str, rows: list) -> str:
    """Decide whether a CSV is queries, pages, dates, etc."""
    lname = filename.lower()
    if "quer" in lname or "suchanfrag" in lname:
        return "queries"
    if "page" in lname or "seite" in lname:
        return "pages"
    if "date" in lname or "datum" in lname:
        return "dates"
    if "countr" in lname or "land" in lname:
        return "countries"
    if "device" in lname or "ger\u00e4t" in lname:
        return "devices"
    if "search appearance" in lname or "darstellung" in lname:
        return "search_appearance"
    if "filter" in lname:
        return "filters"
    # Fallback: classify by columns
    if not rows:
        return "unknown"
    keys = set(rows[0].keys())
    if "query" in keys and "page" in keys:
        return "queries_pages"
    if "query" in keys:
        return "queries"
    if "page" in keys:
        return "pages"
    return "unknown"

# --------------------------------------------------------------------------
# Analysis
# --------------------------------------------------------------------------
def normalize_query_rows(rows: list) -> list:
    out = []
    for r in rows:
        q = (r.get("query") or "").strip()
        if not q:
            continue
        out.append({
            "query": q,
            "clicks": parse_int(r.get("clicks", 0)),
            "impressions": parse_int(r.get("impressions", 0)),
            "ctr": parse_ctr(r.get("ctr", "0%")),
            "position": parse_float(r.get("position", 0)),
            "page": (r.get("page") or "").strip() or None,
        })
    return out

def normalize_page_rows(rows: list) -> list:
    out = []
    for r in rows:
        p = (r.get("page") or "").strip()
        if not p:
            continue
        out.append({
            "page": p,
            "clicks": parse_int(r.get("clicks", 0)),
            "impressions": parse_int(r.get("impressions", 0)),
            "ctr": parse_ctr(r.get("ctr", "0%")),
            "position": parse_float(r.get("position", 0)),
        })
    return out

def detect_brand(query_rows: list) -> str:
    """Heuristic: brand tokens appear disproportionately in very high-CTR queries.
    Branded searches almost always show CTR > 30% because the user is looking
    for that specific business. Generic local terms like the city name appear
    in many queries with mixed CTR."""
    high_ctr_token_clicks = defaultdict(int)
    all_token_clicks = defaultdict(int)
    for r in query_rows:
        tokens = re.findall(r"[a-zäöüß]+", r["query"].lower())
        for t in tokens:
            if len(t) <= 3:
                continue
            all_token_clicks[t] += r["clicks"]
            if r["ctr"] >= 0.30 and r["clicks"] >= 2:
                high_ctr_token_clicks[t] += r["clicks"]
    # Prefer tokens that show up in the high-CTR set with meaningful clicks
    if high_ctr_token_clicks:
        sorted_high = sorted(high_ctr_token_clicks.items(), key=lambda x: -x[1])
        candidate = sorted_high[0]
        if candidate[1] >= 5:
            return candidate[0]
    # Fall back to overall click leader, but only if dominance is clear
    if not all_token_clicks:
        return ""
    sorted_tokens = sorted(all_token_clicks.items(), key=lambda x: -x[1])
    top = sorted_tokens[0]
    second = sorted_tokens[1] if len(sorted_tokens) > 1 else ("", 0)
    if top[1] >= max(20, second[1] * 2):
        return top[0]
    return ""

def is_branded(query: str, brand: str) -> bool:
    if not brand:
        return False
    return brand in query.lower()

def find_ctr_opportunities(query_rows: list, min_impressions: int = 100) -> list:
    """Queries ranking decently but underperforming on CTR."""
    opps = []
    for r in query_rows:
        if r["impressions"] < min_impressions:
            continue
        if r["position"] <= 0 or r["position"] > 20:
            continue
        exp = expected_ctr(r["position"])
        gap = exp - r["ctr"]
        if gap <= 0:
            continue
        recoverable = gap * r["impressions"]
        if recoverable < 1:
            continue
        opps.append({
            **r,
            "expected_ctr": exp,
            "ctr_gap": gap,
            "recoverable_clicks": recoverable,
        })
    opps.sort(key=lambda x: -x["recoverable_clicks"])
    return opps

def find_ranking_opportunities(query_rows: list, min_impressions: int = 100) -> list:
    """Queries at positions 4–15 with potential to climb."""
    opps = []
    target_ctr_pos3 = expected_ctr(3)
    for r in query_rows:
        if r["impressions"] < min_impressions:
            continue
        if not (4 <= r["position"] <= 15):
            continue
        potential = target_ctr_pos3 * r["impressions"]
        lift = potential - r["clicks"]
        if lift <= 0:
            continue
        opps.append({**r, "potential_clicks_at_pos3": potential, "lift": lift})
    opps.sort(key=lambda x: -x["lift"])
    return opps

def find_cannibalization(query_pages_rows: list, min_impressions: int = 50) -> list:
    """Queries served by multiple distinct URLs."""
    by_query = defaultdict(list)
    for r in query_pages_rows:
        if not r.get("page"):
            continue
        by_query[r["query"]].append(r)
    cannibal = []
    for query, entries in by_query.items():
        pages = {e["page"] for e in entries if e["impressions"] >= 5}
        if len(pages) < 2:
            continue
        total_imp = sum(e["impressions"] for e in entries)
        if total_imp < min_impressions:
            continue
        cannibal.append({
            "query": query,
            "pages": sorted(pages),
            "total_impressions": total_imp,
            "total_clicks": sum(e["clicks"] for e in entries),
        })
    cannibal.sort(key=lambda x: -x["total_impressions"])
    return cannibal

def branded_split(query_rows: list, brand: str) -> dict:
    branded_clicks = sum(r["clicks"] for r in query_rows if is_branded(r["query"], brand))
    nonbranded_clicks = sum(r["clicks"] for r in query_rows if not is_branded(r["query"], brand))
    branded_imp = sum(r["impressions"] for r in query_rows if is_branded(r["query"], brand))
    nonbranded_imp = sum(r["impressions"] for r in query_rows if not is_branded(r["query"], brand))
    total_clicks = branded_clicks + nonbranded_clicks
    return {
        "brand": brand,
        "branded_clicks": branded_clicks,
        "nonbranded_clicks": nonbranded_clicks,
        "branded_impressions": branded_imp,
        "nonbranded_impressions": nonbranded_imp,
        "branded_share": (branded_clicks / total_clicks) if total_clicks else 0,
    }

# --------------------------------------------------------------------------
# Report rendering
# --------------------------------------------------------------------------
def fmt_pct(x: float) -> str:
    return f"{x*100:.1f}%"

def fmt_num(x: float) -> str:
    if x is None:
        return "—"
    if isinstance(x, float):
        return f"{x:,.1f}"
    return f"{x:,}"

def render_report(data: dict, brand: str, min_impressions: int) -> str:
    queries = data.get("queries", [])
    pages = data.get("pages", [])
    qpages = data.get("queries_pages", []) or [r for r in queries if r.get("page")]

    lines = []
    lines.append("# Google Search Console — Performance Analysis\n")
    lines.append(f"_Generated by `analyze_gsc.py`. Min-impressions threshold: {min_impressions}._\n")

    # ---------- Summary ----------
    if queries:
        total_clicks = sum(r["clicks"] for r in queries)
        total_imp = sum(r["impressions"] for r in queries)
        avg_ctr = (total_clicks / total_imp) if total_imp else 0
        lines.append("## Summary\n")
        lines.append(f"- **Total clicks:** {fmt_num(total_clicks)}")
        lines.append(f"- **Total impressions:** {fmt_num(total_imp)}")
        lines.append(f"- **Overall CTR:** {fmt_pct(avg_ctr)}")
        lines.append(f"- **Distinct queries analyzed:** {fmt_num(len(queries))}")
        if brand:
            split = branded_split(queries, brand)
            lines.append(f"- **Detected brand token:** `{brand}`")
            lines.append(f"- **Branded share of clicks:** {fmt_pct(split['branded_share'])} "
                        f"({fmt_num(split['branded_clicks'])} branded vs. "
                        f"{fmt_num(split['nonbranded_clicks'])} non-branded)")
        lines.append("")

    # ---------- CTR opportunities ----------
    if queries:
        ctr_opps = find_ctr_opportunities(queries, min_impressions)
        lines.append("## 🎯 CTR opportunities — meta-tag rewrites likely to lift clicks\n")
        if not ctr_opps:
            lines.append("_No queries above the impression threshold are clearly underperforming on CTR._\n")
        else:
            lines.append("Queries already ranking decently but earning fewer clicks than the position would predict. "
                         "Rewriting meta titles/descriptions for the page serving these queries usually yields the fastest payoff.\n")
            lines.append("| Query | Pos | Impressions | CTR | Expected | Recoverable clicks |")
            lines.append("|---|---|---|---|---|---|")
            for r in ctr_opps[:15]:
                lines.append(f"| {r['query']} | {r['position']:.1f} | {fmt_num(r['impressions'])} | "
                             f"{fmt_pct(r['ctr'])} | {fmt_pct(r['expected_ctr'])} | "
                             f"{fmt_num(r['recoverable_clicks'])} |")
            lines.append("")
            lines.append("_Recoverable clicks_ = (expected CTR for position − actual CTR) × impressions. "
                         "These are the clicks you'd plausibly recover if the listing achieved benchmark CTR.\n")

    # ---------- Ranking opportunities ----------
    if queries:
        rank_opps = find_ranking_opportunities(queries, min_impressions)
        lines.append("## 📈 Ranking opportunities — push position 4–15 toward top 3\n")
        if not rank_opps:
            lines.append("_No queries currently sit in the position 4–15 sweet spot above the impression threshold._\n")
        else:
            lines.append("Queries already on (or near) page 1. Pushing them up unlocks disproportionate click gains. "
                         "Tactics: improve content depth, build internal links to the ranking page, earn fresh backlinks, "
                         "ensure technical health.\n")
            lines.append("| Query | Pos | Impressions | Current clicks | Potential @ pos 3 | Lift |")
            lines.append("|---|---|---|---|---|---|")
            for r in rank_opps[:15]:
                lines.append(f"| {r['query']} | {r['position']:.1f} | {fmt_num(r['impressions'])} | "
                             f"{fmt_num(r['clicks'])} | {fmt_num(r['potential_clicks_at_pos3'])} | "
                             f"{fmt_num(r['lift'])} |")
            lines.append("")

    # ---------- Cannibalization ----------
    if qpages:
        cannibals = find_cannibalization(qpages)
        if cannibals:
            lines.append("## ⚠️  Possible cannibalization — same query, multiple pages\n")
            lines.append("These queries are served by 2+ different URLs on your site. Pick one canonical page per query: "
                         "consolidate via 301, differentiate intent, or add `rel=canonical`.\n")
            lines.append("| Query | URLs serving it | Total impressions |")
            lines.append("|---|---|---|")
            for c in cannibals[:10]:
                pages_str = "<br>".join(c["pages"][:3])
                if len(c["pages"]) > 3:
                    pages_str += f"<br>(+{len(c['pages']) - 3} more)"
                lines.append(f"| {c['query']} | {pages_str} | {fmt_num(c['total_impressions'])} |")
            lines.append("")

    # ---------- Top performers ----------
    if queries:
        top = sorted(queries, key=lambda r: -r["clicks"])[:10]
        if top and top[0]["clicks"] > 0:
            lines.append("## 🏆 Top performing queries\n")
            lines.append("| Query | Clicks | Impressions | CTR | Pos |")
            lines.append("|---|---|---|---|---|")
            for r in top:
                lines.append(f"| {r['query']} | {fmt_num(r['clicks'])} | {fmt_num(r['impressions'])} | "
                             f"{fmt_pct(r['ctr'])} | {r['position']:.1f} |")
            lines.append("")

    # ---------- Top pages ----------
    if pages:
        top_pages = sorted(pages, key=lambda r: -r["clicks"])[:10]
        if top_pages and top_pages[0]["clicks"] > 0:
            lines.append("## 📄 Top performing pages\n")
            lines.append("| Page | Clicks | Impressions | CTR | Pos |")
            lines.append("|---|---|---|---|---|")
            for r in top_pages:
                page_short = r["page"]
                if len(page_short) > 60:
                    page_short = page_short[:57] + "..."
                lines.append(f"| {page_short} | {fmt_num(r['clicks'])} | {fmt_num(r['impressions'])} | "
                             f"{fmt_pct(r['ctr'])} | {r['position']:.1f} |")
            lines.append("")

    # ---------- Recommendations ----------
    lines.append("## 🛠️  Recommended next actions\n")
    lines.append("Ordered by expected ROI:\n")
    if queries:
        ctr_opps = find_ctr_opportunities(queries, min_impressions)
        rank_opps = find_ranking_opportunities(queries, min_impressions)
        action_num = 1
        if ctr_opps:
            top_q = ctr_opps[0]
            lines.append(f"{action_num}. **Rewrite meta tags for the page targeting `{top_q['query']}`.** "
                         f"It ranks at position {top_q['position']:.1f} (good) but earns {fmt_pct(top_q['ctr'])} CTR "
                         f"vs. ~{fmt_pct(top_q['expected_ctr'])} expected. Recovering this gap could mean "
                         f"~{fmt_num(top_q['recoverable_clicks'])} extra clicks/period at current impression volume. "
                         f"See `references/meta-optimization.md` in this skill for the rewrite playbook.")
            action_num += 1
        if rank_opps:
            top_r = rank_opps[0]
            lines.append(f"{action_num}. **Push the page targeting `{top_r['query']}` from position "
                         f"{top_r['position']:.1f} into the top 3.** Lift potential: ~{fmt_num(top_r['lift'])} "
                         f"additional clicks. Run a content audit on that page (see `references/content-audit.md`) "
                         f"and identify gaps vs. the current top-3 results.")
            action_num += 1
        if qpages:
            cannibals = find_cannibalization(qpages)
            if cannibals:
                top_c = cannibals[0]
                lines.append(f"{action_num}. **Resolve cannibalization on `{top_c['query']}`.** "
                             f"{len(top_c['pages'])} URLs are competing for this query, splitting authority. "
                             f"Choose one canonical target page and consolidate the others.")
                action_num += 1
        if action_num == 1:
            lines.append("- _No high-confidence actions surfaced above the impression threshold. "
                         "Try lowering `--min-impressions` (e.g., to 30) for early-stage sites with low traffic._")
    lines.append("")
    lines.append("---")
    lines.append("_For deeper interpretation guidance, refer to `references/gsc-analysis.md`._")
    return "\n".join(lines)

# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Analyze a Google Search Console export.")
    parser.add_argument("input", help="Path to GSC CSV or ZIP export")
    parser.add_argument("--output", "-o", default=None,
                        help="Output markdown report (default: prints to stdout)")
    parser.add_argument("--brand", default=None,
                        help="Brand token to detect branded vs. non-branded queries (default: auto-detect)")
    parser.add_argument("--min-impressions", type=int, default=100,
                        help="Minimum impressions to consider a query (default: 100)")
    args = parser.parse_args()

    try:
        raw = read_input(args.input)
    except (FileNotFoundError, ValueError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Normalize categories
    data = {}
    if "queries" in raw:
        data["queries"] = normalize_query_rows(raw["queries"])
    if "pages" in raw:
        data["pages"] = normalize_page_rows(raw["pages"])
    if "queries_pages" in raw:
        data["queries_pages"] = normalize_query_rows(raw["queries_pages"])

    if not data:
        print("Error: no recognizable Queries or Pages data found in the input.", file=sys.stderr)
        sys.exit(1)

    # Brand detection
    brand = args.brand
    if not brand and "queries" in data:
        brand = detect_brand(data["queries"])

    report = render_report(data, brand or "", args.min_impressions)

    if args.output:
        Path(args.output).write_text(report, encoding="utf-8")
        print(f"Report written to {args.output}")
    else:
        print(report)

if __name__ == "__main__":
    main()
