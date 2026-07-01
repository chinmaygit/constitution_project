# Governance Map — L2 (this folder)

L2 statutes for **how a template file in this folder is authored** — not the content of
any layer (that's `process/`'s job to define; this folder's job is to hand out a
fill-in-the-blank starting point shaped exactly like it).

<!-- Statute shape: statute.md (this folder) -->

- **A template's shape mirrors its layer's definition in `process/` exactly** —
  `adr.md` mirrors the L3 fields in [../process/layers.md](../process/layers.md) and
  [../process/conflict-resolution.md](../process/conflict-resolution.md); `statute.md`
  mirrors the harvest shape in [../process/statutes.md](../process/statutes.md);
  `article.md` mirrors L1's required fields. If the process doc's shape changes, the
  template changes in the same commit.
  · serves: F-II
  · enforced-by: prompt-only
  · why: a stale template teaches the old shape to every new consumer that copies it —
    the drift is invisible until someone compares the two by hand.

- **A template holds placeholders and an explanatory HTML comment header only** — never
  real content from this repo's own constitution, decisions, or skills.
  · serves: general craft
  · enforced-by: prompt-only
  · why: templates are copied verbatim into consumer repos; real framework-repo
    specifics leaking into one ships this repo's internals into every product that
    adopts the framework.
