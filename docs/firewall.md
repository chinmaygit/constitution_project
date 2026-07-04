# The firewall, mechanized

Article F-IV: no agent writes `status: RATIFIED` or edits ratified L0/L1 text.
Historically that was enforced by audit (a skill notices after the fact). The engine
upgrades it to a **gate**.

## The lock

`constitution.lock.json`, committed at the instance root, records the canonical hash
of every ratified unit (each L0 line, each `RATIFIED` Article) plus who accepted it
and when. Canonical hashing collapses whitespace: re-wrapping a paragraph changes
nothing; changing a word changes the hash. An Article's hash covers its ratified
substance (name, party, status, Principle, Serves, Fitness, Why) and **excludes**
`conformance` and `enforcement` — those are audit outputs, set below the firewall,
and must never trip the gate.

## The two human-only commands

- `constitution lock accept` — records current ratified text as the baseline.
- `constitution ratify <id>` — rules on a queued proposal.

Both refuse to run without an interactive TTY and a typed confirmation. An agent in a
pipe gets: *"requires an interactive human session (F-IV)"*. This is not a guarantee a
hostile agent can't fake a TTY — it is a guarantee a well-behaved agent can't cross
the firewall *by accident*, and that CI can prove nobody crossed it unnoticed.

## The gate

`constitution firewall` (CI, pre-commit) re-hashes ratified units against the lock:

- **changed** — ratified text differs from what the ratifier accepted;
- **added** — a unit is `RATIFIED` but was never accepted (e.g. an agent flipped
  `PROPOSED → RATIFIED`);
- **removed** — an accepted unit is no longer ratified/present (unaccepted repeal).

Any of the three fails the build. The only exits: revert the law-plane change, or the
ratifier re-runs `lock accept` after reviewing it.

## Everything below is automatable

`constitution doctor` fixes below-firewall findings unattended and queues drafts
(`.constitution/proposals/`, `status: PROPOSED`) for anything whose fix touches
ratified substance. The classification is by **what the fix touches**, not the
finding's category — the same discipline as the `reconcile-findings` skill, in code.
