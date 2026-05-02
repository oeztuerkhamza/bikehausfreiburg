# SEO Optimizer for Claude Code (VS Code)

This bundle contains a **skill** and a **subagent** for SEO work in Claude Code, designed to run locally in VS Code.

- **Skill** (`skills/seo-optimizer/`) — comprehensive SEO knowledge base: GSC analysis, meta optimization, on-page audits, local SEO, multilingual SEO, keyword research, plus a working Python script that analyzes GSC CSV/ZIP exports.
- **Subagent** (`agents/seo-strategist.md`) — a specialized agent that automatically takes over SEO-related tasks, runs in its own context window, and uses the skill above.

You can install both, or just the skill if you don't want a separate agent.

---

## Prerequisites

1. **Claude Code installed.** If you don't have it yet:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
   You'll also need Node.js 18+ and an Anthropic API key configured. See the [official docs](https://docs.claude.com/en/docs/claude-code/overview) for the full setup.

2. **VS Code with the Claude Code extension** (optional but recommended) — install from the VS Code marketplace, search for "Claude Code".

3. **Python 3.8+** — required to run the GSC analysis script. The script uses only the standard library, so no `pip install` needed.

---

## Installation

You have two scopes to choose from:

| Scope | Where to put files | When to use |
|-------|-------------------|-------------|
| **Project-level** | `<your-project>/.claude/` | The skill is only for one project. Can be committed to git so your team shares it. |
| **Personal-level** | `~/.claude/` (home directory) | The skill is available across all your projects. Recommended for SEO work since you'll likely use it on multiple sites. |

Project-level wins on name conflicts.

### Option A — Personal install (recommended for SEO)

Copy both directories into your home `~/.claude/`:

```bash
# From the directory where you extracted this bundle:
mkdir -p ~/.claude/skills ~/.claude/agents
cp -r skills/seo-optimizer ~/.claude/skills/
cp agents/seo-strategist.md ~/.claude/agents/
```

### Option B — Project install

From the root of your project:

```bash
mkdir -p .claude/skills .claude/agents
cp -r path/to/this-bundle/skills/seo-optimizer .claude/skills/
cp path/to/this-bundle/agents/seo-strategist.md .claude/agents/
```

If you commit `.claude/` to git, your teammates inherit the skill and agent automatically.

### Verify installation

In VS Code, open Claude Code and run:

```
/agents
```

You should see `seo-strategist` listed. Then run:

```
/skills
```

(Or whichever command your Claude Code version uses to list skills — varies by version. The skill should appear in the list of available skills.)

---

## Using it

### Auto-delegation (recommended)

Once installed, Claude Code automatically delegates SEO tasks to the agent based on its `description` field. Just talk normally:

- *"My click-through rate is dropping in Search Console, here's the CSV — what's going on?"*
- *"Rewrite the meta title for `https://example.com/products/foo` to improve CTR."*
- *"Audit this page for SEO: [URL]. Target query is 'best running shoes'."*
- *"What keywords should I target for a yoga studio in Hamburg?"*

Claude Code recognizes these as SEO tasks and routes them to the `seo-strategist` agent, which has the skill preloaded.

### Explicit invocation

If auto-delegation doesn't trigger (rare), you can call the agent directly:

```
Use the seo-strategist agent to analyze this GSC export
```

### Running the GSC script manually

Without the agent, you can also use the script directly from the terminal:

```bash
python ~/.claude/skills/seo-optimizer/scripts/analyze_gsc.py path/to/Queries.csv -o report.md
```

Useful flags:
- `-o <file>` — write to file instead of stdout
- `--brand <token>` — force a brand token (skips auto-detection)
- `--min-impressions <N>` — threshold for considering a query (default 100)

---

## What's in the skill

```
skills/seo-optimizer/
├── SKILL.md                       Main instructions — Claude reads this first
├── README.md                      Skill-level overview
├── references/
│   ├── gsc-analysis.md            CTR benchmarks by position, sample-size rules,
│   │                              cannibalization detection, branded-vs-non-branded
│   ├── meta-optimization.md       Title/description formulas, power words,
│   │                              language-specific notes (German included),
│   │                              SERP-feature optimization, 3-variant deliverable
│   ├── content-audit.md           On-page checklist, schema templates (LocalBusiness,
│   │                              Product, Article, FAQPage, BreadcrumbList),
│   │                              Core Web Vitals, technical hygiene
│   ├── local-seo.md               Google Business Profile, NAP consistency,
│   │                              citations, reviews, local content, map-pack ranking
│   ├── multilingual-seo.md        ccTLD vs subfolder, hreflang, German-market specifics
│   └── keyword-research.md        Intent classification, long-tail strategy,
│                                  free tools, gap analysis, mapping to pages
└── scripts/
    └── analyze_gsc.py             GSC CSV/ZIP analyzer — finds CTR opportunities,
                                   ranking opportunities, cannibalization,
                                   branded share, top performers
```

---

## Customizing the agent

The agent is a plain markdown file with YAML frontmatter at `agents/seo-strategist.md`. Edit it freely:

- **`tools`** — which Claude Code tools the agent can use. Currently: `Read, Write, Edit, Grep, Glob, Bash, WebFetch, WebSearch`. Remove what you don't want it to have access to.
- **`model`** — currently set to `sonnet`. Change to `opus` for hardest tasks (more expensive) or `haiku` for cheapest. `inherit` uses whatever model your main session uses.
- **`description`** — controls auto-delegation. The more specific phrases you include here, the more reliably Claude Code routes SEO tasks to this agent.
- **System prompt body** (everything after the frontmatter) — your agent's "personality" and operating instructions. Tweak as you build up a feel for what works.

After editing, the changes take effect on the next agent invocation — no restart needed.

---

## Troubleshooting

**The agent isn't being auto-delegated.**
- Check that `description` in `agents/seo-strategist.md` matches the kind of queries you're sending. Claude Code uses this field to decide when to route.
- Try explicit invocation: `Use the seo-strategist agent to ...`
- Run `/agents` in Claude Code to confirm the agent is loaded.

**The skill isn't loading inside the agent.**
- Verify the skill is at `~/.claude/skills/seo-optimizer/` (or `.claude/skills/seo-optimizer/` for project).
- Verify `SKILL.md` exists at the top of that folder.
- The agent's frontmatter must include `skills:` with `seo-optimizer` as a list item — it does by default; don't remove that.

**The Python script fails.**
- Confirm Python 3.8+: `python --version`
- Confirm you're pointing at a real GSC export (CSV or ZIP from *Performance → Search results → Export*).
- For ZIP exports: the script unzips automatically and reads each CSV inside. If your ZIP contains nothing the script recognizes, it will say so.

---

## Notes

- The skill operates in English but can analyze content in any language. The German market is specifically covered in `references/multilingual-seo.md` since the skill was originally built for that audience.
- All recommendations are framed as probabilistic. SEO is never a guarantee — anyone who tells you otherwise is selling something.
- The script is intentionally conservative: low-impression queries are filtered out to avoid drawing conclusions from noise. For very small sites, lower `--min-impressions` to see more.
