# Governance Map — L2 (this folder)

L2 statutes for **how a skill in this repo is authored and versioned** — not what any
individual skill's own procedure says (that's the skill's content, not governed here).

<!-- Statute shape: ../templates/statute.md -->

- **Every `SKILL.md`'s frontmatter carries `name`, `description` (with "Use when…",
  "Triggers -", and "Do NOT use for -" disambiguating it from every sibling skill), and
  `metadata.{scope, layer, enforces, version}`.**
  · serves: F-II
  · enforced-by: prompt-only
  · why: the description is the dispatch mechanism — an ambiguous or overlapping one
    collides two skills into the same job, which is the one-home rule failing at the
    point of use.

- **A skill's instructions end with a `## Hard rules` section** — the non-negotiable
  constraints, stated as bullets, kept separate from the numbered procedure above it.
  · serves: general craft
  · enforced-by: prompt-only
  · why: procedures get skimmed under task pressure; a rules section at the bottom is
    the part an agent re-checks before acting.

- **An audit/compile skill states explicitly what it does NOT do** — which sibling skill
  owns the adjacent job, and that it never edits L0/L1 unless that is its named purpose.
  · serves: F-IV
  · enforced-by: prompt-only
  · why: a read-only skill that silently starts writing above the firewall bypasses
    ratification without anyone deciding it should.

- **`metadata.version` bumps on any change to the procedure or hard rules** (not on
  wording/typo fixes).
  · serves: general craft
  · enforced-by: prompt-only
  · why: `sync-operator`'s drift-check and this repo's own release ledger both
    rely on the version actually reflecting a behavior change.

How these skills reach an operator vs. a product repo (symlink vs. package-managed copy)
is governed by `sync-operator/SKILL.md` and ADR-0001 — not restated here (F-II).
