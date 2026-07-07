<!-- Copy into a product's CONSTITUTION.md under "L1 — Articles". One Article per invariant. -->

### Article <N> — <short imperative name>
`status: PROPOSED | RATIFIED | SUPERSEDED` · `conformance: HOLDS | VIOLATED | UNVERIFIED` · `enforcement: UNGUARDED | AUDITED | GATED | STRUCTURAL` · `party: <a party named in the Preamble, e.g. User | Owner>`

- **Principle** — <the invariant, in one sentence; a constraint every feature must obey>.
- **Serves** — <which L0 line, e.g. P1>.
- **Fitness** — <a signal a machine could check: a grep, a SQL count, a lint rule. If a
  part is irreducibly a judgment call, say so and mark it prose-only.>
- **Enforcement** — <how the fitness is *kept* true, set by the audit as the **weakest rung
  over the fitness's parts**: `UNGUARDED` (author diligence only — `prompt-only`) · `AUDITED`
  (a periodic check detects after the fact) · `GATED` (lint/CI/hook prevents at a build step) ·
  `STRUCTURAL` (a type/schema constraint makes violation unexpressible). Name the mechanism, or
  its absence. `HOLDS + UNGUARDED` is mechanization debt — say so.>
- **Why** — <the reasoning; what goes wrong without it>.

<!--
Before adding this, run the inclusion test (process/layers.md). It is an Article only if
it passes ALL four: general · traces to L0 · falsifiable · survives a tech swap.
Fails "survives a tech swap" → it's a Statute (L2). Fails "falsifiable" → it's L0 prose.

Keep every bullet short and plain: one idea per sentence, no stacking a second qualifier
onto a first (an em-dash aside plus an "except" clause in the same bullet is exactly the
shape that got flagged — see F-II's own re-amendment history). A numbered list of related
facts is fine; a run-on sentence hiding inside one is not. `constitution audit` runs a
WARN-ONLY check for this (EXP-0001) — it never blocks, but a warning is a real signal.
-->
