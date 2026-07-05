---
id: 0002
title: Three version numbers, three homes
status: proposed
date: 2026-07-05
supersedes: []
superseded_by: []
serves: [F-II]
amends: [F-II]
trigger: certiorari
---

## Question of law
A product has three different version numbers. We were treating two of them as one.

1. **Its own constitution version** — the product's Amendments Ledger (DSAMind is at `[0.11.0]`).
2. **The framework spec version it adopted** — the `framework: constitution@X.Y.Z` pin in
   its `CONSTITUTION.md` header. Ratified by a human. Allowed to lag behind the latest spec.
3. **The framework tooling it has installed** — the CLI version in its own `package.json`.

Today's bug: the engine's `LEDGER-SYNC` check compared #2 to #1 and treated any mismatch as
an error. But #1 and #2 don't have to match — a product's own version number has nothing to
do with which framework spec it adopted. Already fixed in code
(`cli/src/engine/audit.ts`). This ADR writes the rule into F-II so it isn't lost.

Not decided here: should skills auto-check that #3 is current, and auto-run a migration when
it isn't? No such mechanism exists yet, so there's nothing to rule on. See Consequences.

## Ruling
Extend Article F-II ("one home per rule"): a version number is a rule too, and each of the
three numbers above gets exactly one home. Nothing existing changes — this only adds text.

**Add to Principle:**
> A version number is a governed fact. Three exist, each with one home: the instance's own
> Amendments Ledger version, the framework spec version it has adopted (the header pin — a
> ratified claim, never bumped ahead of what's actually adopted), and the framework tooling
> installed (the instance's own package manifest). These are never compared to each other as
> if they were the same number — except in this framework's own repo, where the pin and the
> ledger are the same number on purpose.

**Add to Fitness:**
> No check treats the ledger version, the header pin, and the installed tooling version as
> one axis, except for this framework's own self-hosted repo.

## Constitutional impact
Adds two sentences to F-II's Principle and Fitness. Nothing is removed or superseded.

## Consequences
- **Positive** — stops today's false alarm (DSAMind's correct version numbers were flagged
  as an error) from happening again.
- **Negative** — none.
- **Not decided here** — auto-checking installed tooling and auto-running migrations. No
  mechanism exists yet to build on, so it's follow-up engineering work, not part of this
  amendment. If a mechanism gets built later, whether it actually helps is worth measuring
  then (F-III), not assumed now.

## Alternatives considered
- **New Article instead of extending F-II** — rejected. This is a version of "one home per
  rule," which is what F-II already covers.
- **Measure this instead of just ratifying it** — rejected. There's no hypothesis to test,
  just a fact to state clearly.
