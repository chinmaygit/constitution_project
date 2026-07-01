# Governance Map — L2 (this folder)

L2 statutes for **how this repo's own case law is authored and tracked** — the rulings
themselves are L3 (the files in this folder); this file governs the paperwork around them.

<!-- Statute shape: ../templates/statute.md -->

- **This `decisions/` directory holds the framework's OWN L3** (its evolution as a piece
  of tooling) — never a consumer product's case law, which lives in that product's own
  `decisions/`.
  · serves: general craft (repo-boundary clarity)
  · enforced-by: prompt-only
  · why: mixing framework case law with a consumer's product decisions in one directory
    breaks one-home for both.

- **Copy [../templates/adr.md](../templates/adr.md) for a new ADR. Never delete one** —
  supersede it with a forward link (`superseded_by` on the old, `supersedes` on the new),
  and update [INDEX.md](INDEX.md)'s table in the same commit.
  · serves: F-II, the L3 definition in [../process/layers.md](../process/layers.md)
  · enforced-by: prompt-only (`audit-structure`'s reference-integrity check verifies the
    INDEX matches the files present)
  · why: case law that can silently vanish or go stale defeats the point of keeping it.
