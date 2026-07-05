# Governance Map

- **Constitution (L0/L1)**: `CONSTITUTION.md`
- **Case Law (L3)**: `decisions/`
- **Statutes (L2)** — declared per folder, nearest the files they govern:
  - [skills/AGENTS.md](skills/AGENTS.md) — how a `SKILL.md` is authored/versioned
  - [templates/AGENTS.md](templates/AGENTS.md) — how a template file is authored
  - [decisions/AGENTS.md](decisions/AGENTS.md) — how this repo's own case law is tracked
  - [process/AGENTS.md](process/AGENTS.md) — how a process/ doc is authored
  - [cli/AGENTS.md](cli/AGENTS.md) — TypeScript conventions for `constitution-cli`
- `skills/`, `process/`, `templates/`, `decisions/`, `cli/` at the repo root are the
  **source of truth** for this repo's own tooling — edit here, then release (version bump
  + tag).

## Source vs. installed artifacts

This repo dogfoods its own CLI: running `constitution install` here (as anywhere) writes
compiled, agent-specific copies into `.claude/skills/`, `.agents/skills/`, and `.cursor/rules/`.

- **Edit**: `skills/`, `process/`, `templates/`, `decisions/`, `cli/` — these are git-tracked and versioned.
- **Never edit**: `.claude/`, `.agents/`, `.cursor/` — gitignored, generated, and overwritten on
  every install/upgrade. Treat them like a `dist/` folder. If content there looks stale or wrong,
  fix the source in `skills/` and re-run the CLI — don't hand-patch the copy.

A consumer project (e.g. a product adopting this framework) never has its own `skills/`; its
L2 statutes live wherever *its* governance map says (see `process/statutes.md`). The
source-vs-installed-artifact split above is specific to this repo, since it is both the
framework *and* a CLI consumer of itself.

**Ratifying an amendment in this repo's own `CONSTITUTION.md`** also bumps the header
`framework: constitution@X.Y.Z (self-hosted)` pin to the same number as the new ledger
entry — F-II requires the pin and the ledger to be one axis here, and nowhere else
(ADR-0002; see `cli/AGENTS.md`'s `LEDGER-SYNC` statute for the mechanized check, and
`skills/audit-structure`'s self-hosted-conditional check). This is repo-specific and
does not belong in `skills/ratify-amendment/SKILL.md`, which is vendored into every
consumer — no consumer is self-hosted, so that step would be dead weight in every
installed copy.

*This file serves as the entry-point index for the audit-structure and compile-prompt skills.*
