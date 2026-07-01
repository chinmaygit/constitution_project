---
name: derive-statutes
description: Derives the L2 Statutes each L1 Article needs to be enforceable in the product's actual stack — reusing existing statutes, proposing only the gaps, and surfacing Articles that have no operationalizing rule. Grounded in each Article's fitness signal and the live code, never invented. Use when a user wants to generate/derive the L2 ruleset from L1, check that every Article is operationalized, find under-enforced Articles, or scaffold rules from the constitution. Triggers - "generate L2 from L1", "derive the statutes for these articles", "which articles have no statutes", "what craft rules does this article need", "build the L2 ruleset". Do NOT use for - harvesting/naming existing rules as L2 (that is the bottom-up harvest in process/statutes.md), auditing L1 conformance against code (use audit-conformance), authoring L1 Articles (Step B), changing an Article's status/text (above the firewall), or inventing rules with no Article/L0 trace.
metadata:
  scope: project
  layer: L2
  enforces: F-VII
  version: "1.0.0"
---

# Derive L2 Statutes from L1 Articles (top-down)

The complement to the L2 harvest ([process/statutes.md](../../../process/statutes.md)). The
harvest names *existing* rules as statutes (bottom-up); this derives the statutes each **Article**
needs to be enforceable (top-down) and surfaces Articles that have none. Both serve Article
**F-VII**.

## The grounding rule (read first)

**Derive, don't invent.** A candidate statute must fall out of an Article's own `fitness` signal
applied to the *actual* stack — not from imagination. If you can't point to the Article line and
the code/stack fact a statute operationalizes, don't emit it. L2 is below the firewall (agents may
draft + propose statutes), but F-I still holds: statutes track real enforcement needs, not
speculation. **Reuse an existing statute before proposing a new one** (F-II — one home).

## Procedure

1. **Load the Articles.** Read each L1 Article: `principle`, `serves`, `fitness`, `conformance`.
2. **Load the existing L2.** Read the product's root `AGENT.md` governance map to find where L2 statutes live. Read those declared L2 homes and their `serves` back-links.
3. **For each Article, trace down.** Ask: *in this stack, what operational rules must hold for the
   `fitness` signal to be true?* Derive candidates from the fitness, not from scratch —
   - the stack bindings it depends on (which singleton, which service, which column),
   - the craft rules that keep it true across features,
   - the mechanism that could check it (a lint rule, a CI gate, a schema constraint).
4. **Match against existing statutes.** For each candidate:
   - **Already covered** → record (or fix) the existing statute's `serves` back-link to this
     Article. Do not duplicate.
   - **Gap** → draft a new statute `rule · serves: <Article> · enforced-by: <mechanism>` per
     [templates/statute.md](../../../templates/statute.md). Prefer a real mechanism; mark
     `prompt-only` and flag it as future tooling when none is feasible.
5. **Surface under-enforced Articles.** An Article whose `fitness` has **no** operationalizing
   statute and no mechanism is under-enforced — list it explicitly. (A prose-only, judgment-call
   fitness is allowed — say so rather than inventing a statute to fill the slot.)
6. **Check the inverse.** A candidate that is itself tech-durable *and* L0-tracing isn't a statute
   — it's an Article. Route it to the L1 flow (promotion), don't file it as L2.
7. **Present, then (on confirm) write.** Output the per-Article statute map + the gap list + the
   proposed drafts. L2 needs no ratification, but it is a shared contract — get a human nod, then
   write the drafts into the product's declared L2 statute homes (as named in the governance map),
   each annotated, and note prompt-only statutes as mechanization backlog.

## Output shape

One block per Article:

```
Article A4 — Mastery is tracked per pattern   (serves P1)
  fitness: rating updates key on Problem.patternId; no per-problem mastery store
  statutes:
    ✓ existing  "All DB access via the lib/db.ts singleton"      serves A4 · prompt-only
    + proposed  "Rating writes key on patternId, never problemId" serves A4 · prompt-only (lintable)
  verdict: operationalized
```

End with a roll-up: **operationalized** Articles · **under-enforced** (gaps) · **proposed drafts**
· **promotion candidates** (statutes that are really Articles).

## Hard rules

- **Derive from the Article's `fitness` + the real stack — never invent** (F-I; the grounding rule).
- **Reuse before proposing** — one home per rule (F-II); fix a missing `serves` back-link rather
  than writing a duplicate.
- **Every proposed statute carries `serves` (the Article) + `enforced-by`**
  (templates/statute.md). Prefer a mechanism; `prompt-only` is a flagged placeholder.
- **Propose statutes only — don't write product code and don't touch L1.** A tech-durable +
  L0-tracing candidate is an Article (promotion), not a Statute.
- **L2 is below the firewall** — draft and propose freely, but write into the product's docs only
  after a human nod (it is a shared contract).
