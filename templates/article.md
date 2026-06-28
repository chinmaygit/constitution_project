<!-- Copy into a product's CONSTITUTION.md under "L1 — Articles". One Article per invariant. -->

### Article <N> — <short imperative name>
`status: PROPOSED | RATIFIED | SUPERSEDED` · `conformance: HOLDS | VIOLATED | UNVERIFIED`

- **Principle** — <the invariant, in one sentence; a constraint every feature must obey>.
- **Serves** — <which L0 line, e.g. P1>.
- **Fitness** — <a signal a machine could check: a grep, a SQL count, a lint rule. If a
  part is irreducibly a judgment call, say so and mark it prose-only.>
- **Why** — <the reasoning; what goes wrong without it>.

<!--
Before adding this, run the inclusion test (process/layers.md). It is an Article only if
it passes ALL four: general · traces to L0 · falsifiable · survives a tech swap.
Fails "survives a tech swap" → it's a Statute (L2). Fails "falsifiable" → it's L0 prose.
-->
