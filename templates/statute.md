<!-- Copy into a product's CLAUDE.md / AGENTS.md L2 section. One entry per statute. The
     statute layer is operational craft — keep entries terse and imperative. -->

- **<rule, imperative — e.g. "All DB access via the Prisma singleton">**
  · serves: <the L1 Article it operationalizes (e.g. A4), OR the L0 line it serves via a tech
    choice, OR "general craft (no L0 trace)">
  · enforced-by: <lint | CI | hook | prompt-only>
  · why: <one clause — what goes wrong without it>

<!--
A line is a Statute (L2), not an Article (L1), when it FAILS L1's inclusion test:
a tech swap would rewrite it, OR it does not trace to an L0 line. If it passes all four
L1 tests (general · traces to L0 · falsifiable · survives a tech swap), it is a promotion
candidate — route it through the amendment lifecycle, do not file it here.
Prefer a real `enforced-by` mechanism; `prompt-only` is a placeholder pending tooling.
-->
