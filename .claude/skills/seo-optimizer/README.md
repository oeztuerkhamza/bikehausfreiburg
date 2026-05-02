# SEO Performance Optimizer — Skill for Claude

A comprehensive SEO assistant skill covering Google Search Console (GSC) data analysis, meta title and description optimization, on-page content audits, local SEO, multilingual SEO, and keyword research.

## Quick start

Once installed in Claude, the skill triggers automatically when you mention SEO, search rankings, GSC, meta tags, organic traffic, or related topics. You can also explicitly invoke it: "use the SEO optimizer skill to..."

### Typical workflows

**Workflow 1 — Analyze your Search Console data**
1. In Google Search Console, go to *Performance → Search results*.
2. Click *Export* → *Download CSV* (or *Download* for the full ZIP with multiple dimensions).
3. Upload the file to Claude and say something like *"analyze this GSC export and tell me where the biggest opportunities are."*
4. Claude will run `scripts/analyze_gsc.py` and discuss the findings with you.

**Workflow 2 — Rewrite a meta title or description**
- *"My page about mountain bikes ranks well but no one clicks. Current title is 'Mountain Bikes - Bikehaus Freiburg'. Help me rewrite it."*
- Claude will produce 3 labeled variants (Direct / Benefit-led / Specificity) with character counts.

**Workflow 3 — Audit a page**
- *"Audit https://example.com/page-url for SEO. Target query is 'best mountain bike for beginners'."*
- Claude will work through the on-page checklist and return a prioritized fix list.

## File structure

```
seo-optimizer/
├── SKILL.md                          ← Main instructions Claude loads first
├── README.md                         ← This file
├── references/
│   ├── gsc-analysis.md               ← Deep GSC interpretation
│   ├── meta-optimization.md          ← Title/description formulas
│   ├── content-audit.md              ← On-page audit checklist
│   ├── local-seo.md                  ← Local SEO playbook
│   ├── multilingual-seo.md           ← International + German market
│   └── keyword-research.md           ← Keyword research methodology
└── scripts/
    └── analyze_gsc.py                ← GSC CSV/ZIP analyzer
```

## Running the GSC analyzer manually

If you want to run the script outside of Claude:

```bash
python scripts/analyze_gsc.py path/to/Queries.csv --output report.md

# Options:
#   --output / -o      Write to a file instead of stdout
#   --brand            Force a brand token (skips auto-detection)
#   --min-impressions  Threshold for queries to consider (default 100)
```

The script handles single CSVs and ZIP exports, supports both English and German GSC headers, and requires only the Python 3.8+ standard library.

## Notes

- The skill operates in English but can analyze content in any language. References include German-market specifics for users targeting that audience.
- All recommendations are framed as probabilistic — SEO is never a guarantee.
- The script is conservative: it filters by minimum impressions to avoid drawing conclusions from statistical noise.
