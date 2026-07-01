# Governance Map

- **Constitution (L0/L1)**: `CONSTITUTION.md`
- **Case Law (L3)**: `decisions/`
- **Skills/Process/Templates (this repo's own tooling)**: `skills/`, `process/`, `templates/`
  at the repo root are the **source of truth** — edit here, then release (version bump + tag).

## Source vs. installed artifacts

This repo dogfoods its own CLI: running `constitution install` here (as anywhere) writes
compiled, agent-specific copies into `.claude/skills/`, `.agents/skills/`, and `.cursor/rules/`.

- **Edit**: `skills/`, `process/`, `templates/` — these are git-tracked and versioned.
- **Never edit**: `.claude/`, `.agents/`, `.cursor/` — gitignored, generated, and overwritten on
  every install/upgrade. Treat them like a `dist/` folder. If content there looks stale or wrong,
  fix the source in `skills/` and re-run the CLI — don't hand-patch the copy.

A consumer project (e.g. a product adopting this framework) never has its own `skills/`; its
L2 statutes live wherever *its* governance map says (see `process/statutes.md`). The
source-vs-installed-artifact split above is specific to this repo, since it is both the
framework *and* a CLI consumer of itself.

*This file serves as the entry-point index for the audit-structure and compile-prompt skills.*
