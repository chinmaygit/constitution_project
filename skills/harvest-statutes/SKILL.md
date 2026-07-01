---
name: harvest-statutes
description: Harvests L2 Statutes from where they already live — a product's `AGENT.md`, `CLAUDE.md`, and agent-specific config files — naming and structuring rules that already exist, never inventing or relocating them (F-II). This is the bottom-up harvest of `process/statutes.md`, the complement to `derive-statutes`'s top-down (from-ratified-L1) direction. For each existing rule: confirms it fails the L1 inclusion test, annotates it `rule · serves · enforced-by · why` per `templates/statute.md`, catches orphans (a statute serving nothing real is either dead or evidence of a missing Article), and writes it into the product's declared L2 statute home(s). Use when a product has real, working AGENT.md/CLAUDE.md rules that have never been named as L2, or wants to retrofit governance structure onto an existing, ungoverned codebase's conventions. Triggers - "harvest our statutes", "name our AGENT.md rules as L2", "structure our existing rules", "retrofit L2 onto this repo", "annotate our craft rules", "what L2 do we already have". Do NOT use for - deriving L2 top-down from already-ratified L1 (use `derive-statutes`), authoring L1 Articles (a candidate that passes all four inclusion-test criteria routes there — use `harvest-articles`), the ongoing/recurring audit of L2 for drift after the initial harvest (the framework ships no such skill on purpose — process/statutes.md's own Maintenance section names this as project-owned tooling, e.g. DSAMind's own governance-sweep skill), or writing the actual lint/CI mechanism behind an `enforced-by` tag (that's ordinary implementation work, not this skill).
metadata:
  scope: project
  layer: L2
  enforces: F-VII
  version: "1.0.0"
---

# Harvest a product's L2 Statutes from where they already live

The bottom-up harvest of [process/statutes.md](../../process/statutes.md) — the complement to
`derive-statutes`'s top-down direction (which starts from ratified L1 and asks what each
Article needs; this starts from a product's existing `AGENT.md`/`CLAUDE.md`/agent-config rules
and names what's already true). Both serve Article **F-VII**. Already proven once: DSAMind's
own L2 was harvested this way from its `AGENTS.md`/`CLAUDE.md` — 15 statutes annotated, an F-II
duplicate consolidated, the L1/L2 boundary confirmed clean (`CONSTITUTION.md` ledger `[0.7.0]`).

## What it does NOT do

It doesn't invent statutes — a product with no written-down rules yet gets **zero** output,
honestly (same discipline as `harvest-articles`'s "zero candidates is valid"). It doesn't audit
L2 for drift over time after the harvest — `process/statutes.md` is explicit that the framework
ships no such skill on purpose; L2 moves too fast (weeks) for a periodic constitutional audit
and is instead the consuming product's own job (its CI gates + its own governance-sweep
tooling). This skill does the **one-time (or additive) naming and structuring** — not ongoing
maintenance.

## The firewall rule (read first)

**L2 is below the firewall — you may write, not just propose.** Unlike L0/L1, a statute change
lands as an ordinary reviewed commit, not a ratified amendment (F-IV only gates L0/L1). You
still get a human nod before writing (it's a shared contract), but there is no `status`/
`conformance` ledger to satisfy. The one above-firewall exception: if a "statute" you're
harvesting actually looks like a domain invariant (it would pass all four L1 inclusion-test
criteria), that's not yours to file here — surface it as a promotion candidate to
`harvest-articles` and the ratifier.

## Procedure

1. **Harvest from where rules already live — never a blank page.** Read the product's
   `AGENT.md`, `CLAUDE.md`, and any agent-specific config (`.cursorrules`,
   `copilot-instructions.md`, nested `CLAUDE.md`/`AGENTS.md` files per its governance map). The
   job is to *name* rules that already exist as L2 and structure them — not invent new ones, not
   relocate them to a different home (F-II). If none of these exist yet, or contain nothing but
   already-annotated statutes, **report zero candidates** — that's a valid, honest result.

2. **Filter each candidate through the L1 inclusion test — same four criteria as
   `harvest-articles`, opposite default.** general · traces to L0 · falsifiable · survives a
   tech swap. A rule that **fails any one** is a statute candidate (proceed to step 3). A rule
   that **passes all four** isn't L2 at all — it's a promotion candidate: name it in the report
   and route it to `harvest-articles`, don't annotate it here.

3. **Annotate each survivor** `rule · serves · enforced-by · why` per
   [templates/statute.md](../../templates/statute.md):
   - `serves` — the L1 Article it operationalizes (cite the id), the L0 line it serves via a
     tech choice, or explicitly `"general craft (no L0 trace)"`.
   - `enforced-by` — `lint` / `CI` / `hook` / `prompt-only`. Prefer a real mechanism if one
     already exists in the repo; only fall back to `prompt-only` when none does, and flag it as
     mechanization backlog (don't build the mechanism yourself — that's separate work).

4. **Catch orphans and duplicates:**
   - A statute whose `serves` resolves to nothing real is either **dead** (no craft
     justification either — propose deleting it) or **evidence of a missing Article** (it reads
     like a domain invariant that should trace to L0 but nothing does yet — surface it to the
     ratifier / `harvest-articles`, don't file it as `serves: general craft` just to make it fit).
   - The same rule's text appearing in two homes (a duplicate, or a restatement) is an F-II
     violation — consolidate to one home, note which one and why.

5. **Write.** Annotated statutes go into the product's **declared L2 statute home(s)** — read
   its root `AGENT.md` governance map first; never guess a location or invent a new one. Get a
   human nod (ordinary review, not ratification), then write. Note every `prompt-only` statute
   explicitly as mechanization backlog in the report — don't silently leave it unflagged.

## Output shape

```
ANNOTATED (N)
  "<rule, imperative>"   source: <file:line>
                          serves: <Article-id | "general craft (no L0 trace)">
                          enforced-by: <lint | CI | hook | prompt-only>
                          written to: <declared L2 home>

PROMOTION CANDIDATES (N)
  "<rule>"                passes all four L1 criteria → route to harvest-articles, not filed here

ORPHANS — DEAD (N)
  "<rule>"                serves nothing real, no craft justification → propose deletion

ORPHANS — MISSING ARTICLE (N)
  "<rule>"                reads as a domain invariant but nothing traces it to L0 → surface to
                          harvest-articles / the ratifier

DUPLICATES CONSOLIDATED (N)
  "<rule>"                found in <N> homes → kept at <home>, F-II fix noted

MECHANIZATION BACKLOG (N)
  "<rule>"                enforced-by: prompt-only, no mechanism exists yet

ZERO CANDIDATES
  (state plainly when there's nothing written down yet — do not fabricate)
```

## Hard rules

- **Never invent a statute with no real source.** Harvest from `AGENT.md`/`CLAUDE.md`/agent
  configs that already exist — zero written-down rules means zero output, not filler ones.
- **Never relocate a rule to a new home while naming it** (F-II) — annotate it where it already
  lives unless consolidating an actual duplicate.
- **A candidate that passes all four L1 inclusion-test criteria is not filed here** — route it
  to `harvest-articles` as a promotion candidate.
- **An orphan statute is either deleted (dead) or escalated (missing Article) — never left
  silently `serves: general craft` to avoid the harder call.**
- **You may write L2 directly** (below the firewall) but still get a human nod first — this
  isn't unreviewed.
- **Don't build the `enforced-by` mechanism.** Name it as backlog; implementing a lint/CI/hook
  is separate work this skill doesn't do.
- **Don't audit L2 for drift after the harvest.** That's the product's own recurring job, not a
  framework skill — see `process/statutes.md`'s Maintenance section.
- **Every candidate cites its source exactly** — `file:line`, no verdict from memory.
