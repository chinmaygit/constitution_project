# Governance Map — L2 (this folder)

L2 statutes for **how a process/ doc is authored and changes** — not the content of the
process itself (that's what each doc defines; this file governs the doc-writing craft
around it).

<!-- Statute shape: ../templates/statute.md -->

- **Every process/ doc is linked from at least one other governed artifact** —
  `CONSTITUTION.md`, a skill's `metadata.enforces`, or another process/ doc. An unlinked
  doc is orphaned prose with no governance weight, not spec.
  · serves: F-II
  · enforced-by: prompt-only (a mechanization candidate — `audit-structure`'s
    reference-integrity check could be extended to flag this)
  · why: an orphaned process doc can drift silently away from the skills/Articles that
    were supposed to implement what it describes.

- **A process/ doc changes by ordinary PR** — it documents mechanism, not L0/L1 content —
  **except** when the change redefines a layer's required fields or shape (e.g. adding an
  Article axis). That is itself an L1 amendment: it lands with the matching
  `CONSTITUTION.md` ledger entry and a human ratifier, in the same commit (precedent:
  ledger `[0.14.0]` added the `enforcement` axis to `CONSTITUTION.md` and
  [layers.md](layers.md) together).
  · serves: F-IV
  · enforced-by: prompt-only
  · why: letting a process doc silently redefine what "Article" or "Statute" means would
    let an agent unilaterally amend L1 by editing its footnotes instead of its text.
