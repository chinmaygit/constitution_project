---
name: harvest-articles
description: Authors a product's first L1 Articles — or adds to an existing set — by harvesting candidates from real sources (existing ADRs, a choice repeated across many features, an incident that traced to a missing rule, or the domain-invariant subset of an existing AGENT.md/CLAUDE.md), never from a blank page. Filters each through the L1 inclusion test (general · traces to L0 · falsifiable · survives a tech swap), drafts survivors as principle/serves/fitness/enforcement (`templates/article.md`), reality-checks their conformance against live code, and proposes `status: PROPOSED` for the ratifier. This is Step B of `process/defining-l0-l1.md` (Articles F-V/F-VI). Use when a product has a ratified L0 but no L1 yet (bootstrap), or has grown and wants to harvest new Article candidates from what's actually been decided (retrofit). Triggers - "define our Articles", "harvest L1", "what are our domain invariants", "bootstrap L1", "author the constitution's Articles", "find Articles in our existing rules", "Step B", "retrofit governance onto this codebase". Do NOT use for - defining L0 (use `define-preamble` — this skill requires a ratified L0 first and stops without one), the recurring conformance re-check of Articles that are already `RATIFIED` (use `audit-conformance`), deriving L2 statutes from already-ratified L1 (use `derive-statutes`, the top-down counterpart), harvesting L2 craft rules directly (use `harvest-statutes` — a candidate that fails this skill's inclusion test on "survives a tech swap" is routed there, not drafted here), or setting `status: RATIFIED` (above the firewall — this skill proposes, the ratifier decides).
metadata:
  scope: project
  layer: L1
  enforces: F-V, F-VI
  version: "1.0.0"
---

# Harvest a product's L1 Articles from what's actually true

Step B of [process/defining-l0-l1.md](../../process/defining-l0-l1.md) — the operational
how-to behind Articles F-V and F-VI. It authors L1 the same way F-VI requires: **harvested,
tested, reality-checked** — never invented. It runs after L0 exists (Step A, `define-preamble`)
and serves both a project bootstrapping its first constitution and one retrofitting governance
onto years of existing, ungoverned decisions — the harvest sources differ, the discipline
doesn't.

## What it does NOT do

It doesn't invent candidates to fill a quota — a project with no real decision history yet
gets **zero** Article candidates, honestly, not fabricated ones (F-I applies recursively:
no rule is codified before it's been proven in practice). It doesn't set `status: RATIFIED`
— only the ratifier does. It doesn't re-derive L2 from L1 (`derive-statutes`) or re-check an
already-`RATIFIED` Article's conformance over time (`audit-conformance`) — this skill is the
*first* harvest (or an addition to it), not the recurring maintenance of either direction.

## The firewall rule (read first)

**You may draft; you may not enact.** Every field on a candidate Article — principle, serves,
fitness, enforcement — is yours to draft and propose, with `status: PROPOSED`. **You may never
write `status: RATIFIED`.** That is the ratifier's decision alone (F-IV, and F-V's "a human
authors and ratifies it — an agent may help phrase, never originate"). A drafted Article that
the live code already violates is still worth proposing — `RATIFIED + VIOLATED` is legitimate
tracked debt once ratified; a candidate is allowed to be `PROPOSED + VIOLATED` before that.

## Procedure

1. **Prerequisite: L0 exists and is ratified.** Read the product's `CONSTITUTION.md`. If there
   is no ratified Preamble, **stop** and hand off to `define-preamble` — an Article with
   nothing to trace to isn't an Article, it's a guess.

2. **Harvest candidates from real sources — never a blank page.** Look at what's actually
   there, and cite it exactly:
   - **Existing ADRs / decisions** (`decisions/` or the product's equivalent) — a ruling that
     recurs across ≥2 ADRs is a strong candidate.
   - **A choice made the same way across many features** — grep/read the code for a pattern
     enforced consistently (e.g. every DB call routes through one singleton); cite the files.
   - **An incident or bug whose postmortem traced to "no rule stopped this."**
   - **Existing `AGENT.md` / `CLAUDE.md` rules that are domain invariants** — not craft. A rule
     that would survive swapping the framework/library but not swapping the product's *meaning*
     is the L1 candidate; a rule that's really about *how* you build (tech-coupled) is L2 —
     don't draft it here, note it for `harvest-statutes`.
   If none of these turn up anything real, **report zero candidates.** That is a valid, honest
   result for a project too young to have contested anything yet — not a failure to fix by
   inventing one.

3. **Filter each candidate through the inclusion test — all four, no exceptions:**
   general · traces to L0 · falsifiable · survives a tech swap. Record the per-criterion
   verdict for every candidate, pass or fail. A fail **routes** the candidate, it doesn't
   silently drop it:
   - Fails *survives a tech swap* → an L2 statute candidate. Name it in the report; hand off
     to `harvest-statutes` to actually annotate it (don't draft it as an Article, don't
     annotate it as a statute yourself — one job per skill).
   - Fails *traces to L0* → either L0 is incomplete (surface the gap to the ratifier) or the
     rule isn't constitutional — it belongs in a feature spec, not here.
   - Fails *falsifiable* → L0-adjacent prose, or cut.

4. **Draft survivors** as principle / serves / fitness / enforcement / why, per
   [templates/article.md](../../templates/article.md). `fitness` must reduce to a machine
   check or be explicitly marked prose-only (mirror `audit-conformance`'s own distinction —
   don't invent a fitness signal that can't actually run). Set `status: PROPOSED`.

5. **Reality-check conformance now, once drafted.** Run the fitness signal against the live
   code and set `conformance` (`HOLDS` / `VIOLATED` / `UNVERIFIED`) with evidence — reuse
   `audit-conformance`'s method for deriving and running the check; don't reimplement that
   logic here. A `VIOLATED` draft is not disqualified — it's tracked debt the ratifier decides
   whether to accept knowingly.

6. **Order against collisions.** If a new candidate could collide with another candidate or an
   existing Article, note where it sits in `process/conflict-resolution.md`'s priority order;
   flag a genuine tie to the ratifier rather than guessing.

7. **Keep L1 small.** For each survivor, ask: would a real feature ever actually violate this?
   A true-but-uncontested statement doesn't need constitutional protection — cut it, or note
   it as L0-adjacent color instead.

8. **Report.** One list: source harvested from → inclusion-test verdict per criterion → where
   it landed (drafted Article / routed to L2 / routed to an L0 gap / cut, with why). Hand the
   drafted Articles to the ratifier for the `PROPOSED → RATIFIED` decision — this skill's job
   ends at the proposal.

## Output shape

```
DRAFTED (N)
  "<principle>"        harvested: <ADR-0003 / git: app/api/**/*.ts, 6 files, same pattern /
                        AGENT.md:41>
                        inclusion: general ✓ · traces P2 ✓ · falsifiable ✓ · tech-swap-survives ✓
                        status: PROPOSED · conformance: HOLDS (evidence: <cmd or file:line>)

ROUTED TO L2 (N)
  "<rule>"              fails tech-swap-survives → candidate for harvest-statutes

L0 GAP SURFACED (N)
  "<rule>"              no P-line covers this — propose an L0 addition, or cut

CUT (N)
  "<rule>"              true but uncontested — no feature would actually violate it

ZERO CANDIDATES
  (state plainly when there's no real decision history yet — do not fabricate)
```

## Hard rules

- **Never write `status: RATIFIED`.** Draft and propose only — the ratifier decides (F-IV).
- **Never invent a candidate with no real source.** Harvest from ADRs, recurring code patterns,
  incidents, or existing rules — a blank page produces zero candidates, not filler ones (F-I).
- **Every candidate cites its harvest source exactly** — a file:line, an ADR id, a commit, or
  the specific pattern observed and where. No verdict from memory.
- **A failed inclusion-test criterion routes the candidate; it never just disappears.** Say
  where it went — L2, an L0 gap, a feature spec, or cut-with-reason.
- **Reuse `audit-conformance`'s method for running fitness checks** — don't reimplement
  check-deriving logic here.
- **Requires a ratified L0 first.** Stop and hand off to `define-preamble` if there isn't one.
- **Zero candidates is a valid result.** A young project with no contested decisions yet should
  get an honest empty report, not a fabricated L1.
