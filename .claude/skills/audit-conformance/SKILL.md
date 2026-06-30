---
name: audit-conformance
description: Audits a product's L1 Articles against its live codebase and sets each Article's `conformance` field honestly (HOLDS / VIOLATED / UNVERIFIED) AND derives its `enforcement` (UNGUARDED / AUDITED / GATED / STRUCTURAL — how durably the invariant is kept true) with evidence — the recurring reality-check half of F-VI. Use when a user wants to re-audit, reality-check, or reconcile a constitution against the code after changes land; when asked "does the code still satisfy the constitution", "are the Articles still holding", "re-audit conformance", "L1 codebase audit", "check the constitution against the code", "which Articles are violated"; or after a feature/refactor that may have moved code toward or away from an Article. Do NOT use for - authoring new Articles or the first harvest (that is Step B, a separate flow), changing an Article's `status`/principle/`serves` or adding/removing Articles (above the firewall — propose via the amendment lifecycle), defining L0 (use `define-preamble`), or fixing product code (the audit reports; remediation is separate work a human authorizes).
metadata:
  scope: project
  layer: L1
  enforces: F-VI
  version: "1.1.0"
---

# Audit L1 conformance against the codebase

Run each L1 Article's **fitness signal** against the live code and set its `conformance`
honestly. This is the *recurring* reality-check of Article **F-VI** — the same discipline as
Step B step 5 of [process/defining-l0-l1.md](../../../process/defining-l0-l1.md), run again
whenever code may have drifted. The harvest (Step B) authors Articles; this skill keeps their
conformance axis true over time.

## The firewall rule (read first)

**You own `conformance`; you do not own `status`.** Conformance is the audit's *finding* —
below the firewall, yours to write. `status`, `principle`, `serves`, and the set of Articles
are *legal force* — above the firewall, the ratifier's (Article **F-IV**). You may **propose**
a status change, a reworded principle, or a new Article; you may **never** enact one. A
`RATIFIED` Article you find `VIOLATED` is legitimate **tracked debt**, not an error to hide.

## Procedure

1. **Locate.** Find the product's `CONSTITUTION.md` and the codebase root. Read every L1
   Article and pull out its `fitness` line and current `conformance` value.

2. **Derive a check per Article.** Reduce each `fitness` line to the cheapest *decisive*
   machine check — a grep, a schema/`@unique` lookup, a SQL/`count`, a lint rule, a unit test,
   a type-check. If `fitness` is explicitly prose-only (a human/AI judgment), there is no
   mechanical check — that Article is a candidate for `UNVERIFIED`.

3. **Run it and record evidence.** Execute the check against live code. Capture the proof:
   the command and its result, or `file:line`. **No verdict from memory** — every verdict
   cites what you ran. Beware checks that silently under-match (e.g. a regex that skips ids
   with digits); confirm the check actually covers the population it claims to.

4. **Classify conformance, then derive enforcement.**
   *Conformance* (is it true now?):
   - **HOLDS** — the signal passes against live code, with evidence.
   - **VIOLATED** — the signal fails; record the *specific* gap and where (the file, the
     missing column, the wrong constant).
   - **UNVERIFIED** — the signal is prose-only or could not be run. Do not guess a verdict.

   *Enforcement* (how durably is it kept? — roll up from the `enforced-by` of the L2 statutes
   that serve the Article, taking the **weakest rung over the fitness's sub-claims**; an invariant
   is only as strong as its softest guard):
   - **STRUCTURAL** — a type/schema constraint makes violation unexpressible (`NOT NULL`,
     `@@unique`, a branded type). `HOLDS` is then guaranteed; needs no recurring audit.
   - **GATED** — a continuous machine guard *prevents* it at a build/CI step (lint, CI, hook,
     a CI-run test).
   - **AUDITED** — a periodic check *detects* it after the fact (a runnable audit/eval not wired
     to block); violations can ship until the next sweep.
   - **UNGUARDED** — nothing prevents it; held by author diligence only (`prompt-only`). `HOLDS`
     here is a snapshot, not a guarantee.
   Cite the mechanism, or its absence. A `RATIFIED + HOLDS + UNGUARDED` Article is **mechanization
   debt** — flag it; the remedy is a new statute + a gate (a promotion up the ladder), not a code fix.

5. **Honesty gate (F-VI).** **Never mark `conformance: HOLDS` while the signal fails.** When
   code and Article disagree, that disagreement *is* the finding — surface it. Companion rule for
   the durability axis: **never let `HOLDS + UNGUARDED` pass as durable health** — record the
   enforcement honestly so the fragility is visible, not hidden behind a green conformance.

6. **Catch drift in both directions:**
   - *Code behind the Article* → the Article is binding and the code breaks it → `VIOLATED`
     (tracked debt). You may write this.
   - *Code past the Article* → the code moved on and the Article's prose is now stale (e.g.
     "20-pattern taxonomy" when the code has 25; a fitness referencing a renamed field). The
     conformance may still HOLD, but the **text** needs an amendment — that is above the
     firewall. Update the conformance note, and **propose** the prose fix; do not silently
     rewrite the principle.

7. **Sort findings by owner before acting:**
   - **conformance flips** (HOLDS↔VIOLATED↔UNVERIFIED) → write them.
   - **status / principle / new-or-retired Articles** → escalate to the ratifier (F-IV);
     route through [amendment-lifecycle.md](../../../process/amendment-lifecycle.md).
   - **issues that aren't L1 at all** (a craft rule, a one-off bug) → route to L2 or the
     project's issue tracker, not the constitution.

8. **Write the result.** Update the `conformance` **and `enforcement`** fields in
   `CONSTITUTION.md`, refresh each changed note with its evidence, and add a dated **Amendments
   Ledger** entry summarizing the re-audit: which Articles flipped conformance, which moved up or
   down the enforcement ladder, the evidence, and what remains `VIOLATED` (debt) or `UNGUARDED`
   (mechanization backlog). Bump the constitution doc version.

9. **Remediation is separate.** The audit's deliverable is *honest conformance + a gap list*.
   Fixing product code so a `VIOLATED` Article holds is follow-up work the human greenlights
   (it may become an L4 task). Do not fold a code fix into the audit unless explicitly asked.

10. **Feed back (F-I).** If a run shows the process is missing something (a fitness line that
    can't be checked as written, a recurring kind of drift), note it so the process improves —
    the framework getting sharper through use.

## Hard rules

- **Never write `conformance: HOLDS` while the fitness signal fails** (F-VI's honesty rule).
- **Derive `enforcement` from the serving statutes' `enforced-by`, weakest-link** — never assert
  it. `RATIFIED + HOLDS + UNGUARDED` is mechanization debt to flag, not hide behind a green axis.
- **Never change `status`, `principle`, `serves`, or the set of Articles** — propose only
  (F-IV, above the firewall).
- **Every verdict cites evidence** — a command + result or `file:line`, never recall.
- **`UNVERIFIED` is an honest verdict.** Prefer it to a guess when a signal is prose-only or
  uncheckable.
- **Report code that has moved *past* an Article as a proposed amendment**, not a silent edit
  to the principle.
- **Do not fix product code as part of the audit** unless asked — the audit reports; the fix
  is separate, human-authorized work.
- **End with a dated ledger entry** naming what was re-audited and what stays as tracked debt.
