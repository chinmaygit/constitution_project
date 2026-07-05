---
name: audit-structure
description: Audits the internal/referential integrity of the whole L0–L4 governance system — the constitution itself, not the code. Checks every cross-layer reference resolves (serves/amends/supersedes/party), every layer traces up (Articles→L0, statutes→Article/L0, ADRs→law), nothing is orphaned or duplicated across layers (F-II), the firewall and the status/conformance/enforcement fields are intact, the framework pin/version/ledger are consistent, and — the headline — flags any rule living OUTSIDE the layers (ungoverned); and verifies the product's **governance map** — the root `AGENTS.md` entry-point index — resolves its declared L2 statute homes. Read-only: reports + proposes, never auto-fixes. Use when a user wants to audit/lint/health-check the constitution, find drift between layers, find orphaned or ungoverned rules, check that everything traces up, or verify the governance graph is connected. Triggers - "audit the constitution", "check for drift", "is the constitution consistent", "find orphaned/ungoverned rules", "anything outside the layers", "does everything trace up", "lint the governance", "audit the governance map", "is the index complete". Do NOT use for - auditing whether code satisfies L1 fitness (use audit-conformance), deriving missing statutes (use derive-statutes), or a consumer's own doc-bloat/staleness sweep (that's a project-level skill the consumer owns, not this framework audit).
metadata:
  scope: project
  layer: cross-cutting
  enforces: F-II
  version: "1.4.2"
---

# Audit the constitution's structural integrity (L0–L4)

The governance system is a graph: **L0 ← L1 ← L2 ← L3**, plus the firewall and the framework pin.
This skill checks that graph is **connected and consistent** — every reference resolves, every
layer traces up, nothing is orphaned, duplicated, or living *outside* a layer. It audits the
**constitution**, not the code (that is `audit-conformance`). It is the audit check Article
**F-II** names in its fitness.

## What it does NOT do

Read-only. It reports findings and proposes fixes; it never edits the constitution — L0/L1 fixes
are above the firewall (F-IV). It does not check code-vs-fitness (`audit-conformance`) or derive
statutes (`derive-statutes`). To actually close a finding this audit reports, use
`reconcile-findings` — it consumes this skill's output and applies what's below the firewall.

## Step 0 — run the deterministic engine first

If the `constitution` CLI ≥ 0.17.0 is available (on PATH, or `node cli/dist/index.js`
in the framework repo itself), start with:

```bash
constitution audit --json
```

That is the engine's deterministic subset of this audit — reference resolution, field
legality, L0 size/coverage, ledger/version sync, statute annotations, ADR frontmatter
+ forward links, experiment pre-registration (F-III), and lock/firewall drift (F-IV)
— already classified `above`/`below` the firewall by what the fix touches. **Treat its
output as ground truth for those checks; do not re-derive them by hand.** Your added
value is everything the engine cannot judge: semantic duplication (the same rule
*paraphrased* in two homes — the engine only compares text), ungoverned rules hiding
in prose, whether a `party:` tag matches the Preamble's named parties in meaning,
INDEX-vs-files completeness, and whether a reference that *resolves* still *means*
what the citing text claims. If the CLI is unavailable, run the full manual protocol
below.

## The checks

**1. Trace-up — every layer resolves to the one above:**
- Every L1 Article's `serves` → a real L0 line. A non-empty `serves` that resolves to nothing is an **orphan Article**.
- Every L0 line is served by ≥1 Article (the vision is fully covered — F-V). An unserved P-line → flag.
- Every L2 statute's `serves` → a real Article or L0 line, or an explicit "general craft". Else **orphan statute**.
- Every L3 ADR's `serves` → a real L0/L1/L2 id; `amends` → a real Article.
- Every `party:` tag → a party named in the Preamble.

**2. Reference integrity:**
- ADR `supersedes` / `superseded_by` → real ADR ids; every `status: superseded` ADR has a forward link; the INDEX matches the files (no ADR missing from the index; no index row without a file).
- Every cross-link (`[[name]]`, `§ref`, relative file link) resolves to a real target.

**3. One home — no duplication (F-II):**
- No rule's text appears verbatim in two layer documents (an Article restated as a statute; the same rule in two different files).

**4. Field & firewall integrity:**
- Every Article carries all required fields: `status`, `conformance`, `enforcement`, `party`, `serves`, `fitness`.
- Every L0/L1 amendment in the ledger names a human ratifier (F-IV).
- The instance's framework pin (`constitution@X`) matches `registry.md`. **Only in the
  framework's own self-hosted repo** (header marked `(self-hosted)`) does the header pin
  also have to match the latest ledger entry and the latest tag (F-II) — in any other
  instance the pin (the framework spec it adopted) and the ledger (its own product
  version) are legitimately independent axes and must **not** be compared this way
  (ADR-0002; see `cli/AGENTS.md`'s `LEDGER-SYNC` statute for the mechanized version of
  this same check).

**5. Anything OUTSIDE the layers (the headline):**
- A rule in the declared L2 statute homes that no layer claims — not tagged L2, no `serves`, not an Article, not an ADR. **Ungoverned rule** → either annotate it as a statute or delete it.

**6. Governance map — the entry-point index resolves (discoverability):**
- The product's **root `AGENTS.md`** declares a **governance map** naming where L0/L1 live (the constitution doc), where L3 lives (the ADR directory), and the L2 convention. **No map at all** → one finding (the product should add one), not one-per-home.
- Every location the map names **resolves** — the constitution doc, the ADR directory, and the declared L2 statute homes exist. A map entry pointing at nothing → `map-drift` (stale).
- **This audit's own cross-check** (not compile-prompt's job — see Procedure step 1): an independent disk scan finds a `{AGENT,CLAUDE,AGENTS}.md` the map does **not** declare, excluding generated/installed-artifact dirs (`.claude/`, `.agents/`, `.cursor/`, `node_modules/`, `dist/`, `.git/`) → **map-gap** (an undeclared L2 home — invisible to compile-prompt and every skill that trusts the map, until this audit catches it).

**7. Promotion / demotion signals (informational, not errors):**
- A pile of ADRs all `serves`-ing one Article → **amendment candidate** (case law climbing to L1).
- A statute that passes all four L1 tests → **promotion candidate**.
- An Article that is tech-coupled (would die in a tech swap) → **demotion candidate**.
- A `RATIFIED` Article that is non-`STRUCTURAL` — especially `HOLDS` + `UNGUARDED` — → **mechanization candidate** (the invariant holds, but nothing guards it; needs a statute + a gate to climb the enforcement ladder). The set of these is the **mechanization backlog**.

## Procedure

1. **Build the graph.** Parse L0 (P-lines), L1 (Articles + fields), L2 (statutes + `serves`), L3
   (ADRs + `serves`/`supersedes`), the Preamble parties, the registry pin, the version + tag.
   **Start from the root `AGENTS.md` governance map** — this is what `compile-prompt` and every
   other skill trust at day-to-day speed, with no scanning. **Then, only in this audit, cross-check
   it against an independent scan** of the tree (e.g. `find . -iname 'AGENTS.md' -o -iname
   'CLAUDE.md' -o -iname 'AGENTS.md'`, excluding `.claude/`, `.agents/`, `.cursor/`,
   `node_modules/`, `dist/`, `.git/`, **and anything `git check-ignore` reports** — a hardcoded
   name list misses a repo's own generated/vendored copies under other names (e.g. this repo's
   own `cli/skills/`, `cli/templates/`, `cli/process/` — gitignored build artifacts per
   `cli/AGENTS.md`, not `dist/`-named but the same kind of thing)) to catch a home that exists on
   disk but isn't declared. This scan is this skill's job alone — the periodic safety net, not a
   per-task cost every skill pays.
2. **Run the checks** above. For each finding, record the exact location and what's broken.
3. **Classify** each: `broken-ref` · `orphan` · `duplication` · `ungoverned` · `map-gap` ·
   `map-drift` · `field-gap` · `pin/version drift` · `promotion/demotion signal`.
4. **Report.** A grouped list; each finding gets a one-line proposed fix and which side of the
   firewall it sits on (conformance/L2 fixes an agent may apply on a nod; L0/L1/status fixes are
   proposed to the ratifier and run the amendment lifecycle).
5. **Don't fix.** Hand the report back.

## Output shape

```
BROKEN REFS (1)
  L1 A5.serves → P9        no P9 in Preamble (did you mean P1?)
ORPHANS (1)
  Statute "X" serves nothing real → annotate or delete
ONE-HOME (0)              ✓
UNGOVERNED (1)
  AGENTS.md "<rule>"       not tagged L2, no serves → claim or cut
MAP (1)
  <nested>/AGENTS.md       statute home declared in map but file not found → map-drift
FIELD/FIREWALL (0)        ✓
DRIFT (1)
  registry pin @0.4.0  vs  instance header @0.5.0 → reconcile
SIGNALS
  amend: A1 (3 ADRs) · promote: none · demote: none · mechanize: A3, A4, B1, B2 (HOLDS+UNGUARDED)
```

## Hard rules

- **Read-only.** Report and propose; never edit the constitution. L0/L1 fixes are above the firewall (F-IV).
- **Every finding cites an exact location** — `file:line` or an id. No verdict from memory.
- **Distinguish a real break from a healthy signal** — a broken `serves` is an error; "3 ADRs on A1" is an amendment signal, not a bug.
- **`serves: []` is valid** for a pure-infra ADR or a general-craft statute — not an orphan. An orphan is a *non-empty* `serves` that resolves to nothing.
- **The map is what every OTHER skill trusts for L2 discovery** — `compile-prompt` and day-to-day
  work read the map only, never scanning the disk. **This skill alone also runs an independent
  disk scan**, as the periodic safety net that catches an undeclared home before it goes silently
  ungoverned. Do not hardcode filenames elsewhere — this scan lives here, once. A missing map is
  **one** finding.
