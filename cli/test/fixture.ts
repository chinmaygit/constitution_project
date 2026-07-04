// Builds a minimal, well-formed instance in a temp dir for engine tests.

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export const MINI_CONSTITUTION = `# Acme Constitution

\`\`\`
framework: constitution@1.2.3
ratifier:  Ada Lovelace
\`\`\`

## L0 — Preamble (vision)

**P1.** Acme exists to make widgets trustworthy.

**P2.** Widgets ship only when proven to work.

## L1 — Articles

### Article A1 — Widgets are verified
\`status: RATIFIED\` · \`conformance: HOLDS\` · \`enforcement: GATED\` · \`party: User\`

- **Principle** — Every widget passes verification before it ships.
- **Serves** — P1.
- **Fitness** — CI runs the verify suite on every widget build.
- **Why** — unverified widgets break user trust.

### Article A2 — No silent failures
\`status: PROPOSED\` · \`conformance: UNVERIFIED\` · \`enforcement: UNGUARDED\` · \`party: User\`

- **Principle** — Failures are always surfaced to the user.
- **Serves** — P2.
- **Fitness** — grep for empty catch blocks returns zero matches.

---

## Amendments Ledger

### [1.2.3] — 2026-07-01 — founding ratification
- Founding entry. Ratifier: Ada Lovelace.
`;

export const MINI_MAP = `# Governance Map

- **Constitution (L0/L1)**: \`CONSTITUTION.md\`
- **Case Law (L3)**: \`decisions/\`
- **Statutes (L2)**: Managed in this \`AGENTS.md\` file.

## L2 — Statutes

- **All widget checks run through the single verify entrypoint.**
  · serves: A1
  · enforced-by: CI
  · why: two entrypoints drift apart silently.

*This file serves as the entry-point index.*
`;

export const MINI_ADR = `---
id: 0001
title: Verification runs pre-merge, not post-deploy
status: accepted
date: 2026-06-01
supersedes: []
superseded_by: []
serves: [A1]
amends: []
trigger: architectural
---

## Question of law
When must verification run?

## Ruling
Pre-merge, always.
`;

export function makeInstanceDir(mutate?: { constitution?: (s: string) => string; map?: (s: string) => string }): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'constitution-test-'));
  fs.writeFileSync(path.join(dir, 'CONSTITUTION.md'), mutate?.constitution?.(MINI_CONSTITUTION) ?? MINI_CONSTITUTION);
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), mutate?.map?.(MINI_MAP) ?? MINI_MAP);
  fs.mkdirSync(path.join(dir, 'decisions'));
  fs.writeFileSync(path.join(dir, 'decisions', '0001-verify-pre-merge.md'), MINI_ADR);
  return dir;
}
