---
id: 0002
title: Three version axes, three homes — ledger, adopted-spec pin, installed tooling
status: proposed
date: 2026-07-05
supersedes: []
superseded_by: []
serves: [F-II]
amends: [F-II]
trigger: certiorari
---

## Question of law
F-II requires "one home per rule," and already names one worked example (a versioned
package manager installation satisfies it — ADR-0001). Auditing DSAMind (`dsa_project`)
this session surfaced a gap ADR-0001 didn't cover: a *version number* is itself a governed
fact, and this framework was conflating three distinct ones under an implicit assumption
that they're all "the same number":

1. An instance's **own Amendments Ledger version** (DSAMind's is at `[0.11.0]`) — the
   product's own constitution's version, incrementing with its own amendments.
2. The **framework spec version it has deliberately adopted** — `CONSTITUTION.md`'s header
   `framework: constitution@X.Y.Z` pin. A ratified conformance claim: which spec features
   (e.g. the `enforcement` axis) the instance has actually adopted. Deliberately allowed to
   lag — never auto-bumped past what's adopted (this is already the operative convention,
   stated in the `sync-operator` skill, but was never codified in L1 until now).
3. The **framework tooling actually installed** — for a consumer, the
   `@chinmaygit/constitution-cli` version in its own package manifest (`package.json`); for
   this repo, its own `cli/package.json` (already kept in lockstep via `versionSync`,
   because this repo is `self-hosted` — axes 1 and 2 and 3 collapse to one number here by
   construction, which is precisely what made the conflation invisible until a real
   consumer surfaced it).

The engine's `LEDGER-SYNC` check compared axis 2 against axis 1 unconditionally, so it flagged
DSAMind's honest, correct state (pin `0.16.12`, ledger `[0.11.0]` — two different, both-valid
numbers) as an error. Fixed in code (`cli/src/engine/audit.ts`, gated on `doc.selfHosted`) the
same day this ADR was drafted, but the fix is a mechanical patch until F-II's principle
actually says these are three homes, not one — otherwise the same conflation resurfaces the
next time someone builds against this framework without having read the commit that fixed it.

A second, related question was raised in the same discussion but is **not** ruled on here:
should skill invocations or `constitution doctor` automatically check whether an instance's
installed tooling (axis 3) is current, and run a migration for a below-firewall scaffold
change when it isn't? See "Consequences — deferred" below; no mechanism exists yet to rule on.

## Ruling
Amend Article F-II's `Principle` and `Fitness` to name all three version axes and assign each
exactly one home, so that no engine check, skill, or human ever again compares two of them as
if they were one. Drafted text (the change is additive — nothing existing is retired, so
nothing is superseded):

**Principle — append:**
> A version number is itself a governed fact, and this rule applies to it as much as to any
> other: an instance's own Amendments Ledger version, the framework spec version it has
> deliberately adopted (the `CONSTITUTION.md` header pin — a ratified conformance claim,
> never auto-bumped past what the instance has actually adopted), and the framework tooling
> version actually installed (the instance's own package manifest, e.g. `package.json`) are
> three distinct facts. Each has exactly one home. A self-hosted instance is the one case
> where axes legitimately collapse to a single number by construction (the framework pins
> itself) — everywhere else, all three are read independently and never compared to each
> other as if drift between them were an error.

**Fitness — append:**
> An instance's ledger version, its header framework-pin, and its installed tooling version
> are never checked against each other as if they were one axis, except for a `self-hosted`
> instance (where the pin and the ledger are the same number by construction, and tooling
> version-sync is a declared, explicit target — see `constitution.config.json`'s
> `versionSync`). Verified by the `audit-structure` skill and mechanically by `constitution
> audit`'s `LEDGER-SYNC` check.

**Why — new bullet:**
> Conflating these axes produces exactly the false alarm this framework shipped once:
> comparing a consumer's adopted-spec pin to its own ledger version as if the numbers should
> match, when a downstream product's ledger legitimately runs on its own numbering
> independent of which framework spec version it targets. Naming three homes instead of one
> silent, assumed one keeps each fact honest about what it actually claims — and keeps the
> next engine check from re-deriving the same bug by hand.

**Proven — new bullet:**
> Found 2026-07-04/05 auditing DSAMind (`dsa_project`): `LEDGER-SYNC` compared its header pin
> (`constitution@0.16.12`, an adopted-spec claim) against its own Amendments Ledger's newest
> entry (`[0.11.0]`, DSAMind's own document version) and flagged two legitimately independent,
> correct values as an error. Fixed in code same-day (`cli/src/engine/audit.ts`, gated on the
> already-parsed-but-previously-unused `doc.selfHosted` field); this amendment codifies the
> distinction in law so the next engine change can't silently re-conflate it.

## Constitutional impact
Extends Article F-II (`serves: [F-II]`, `amends: [F-II]`). Purely additive — the existing
principle ("every governed rule lives in exactly one layer... never duplicated") and fitness
are unchanged and remain true; this names a new instance of the same rule (a version number is
a rule too) that wasn't explicit before. Nothing is superseded; no forward-link note is needed.

## Consequences
- **Positive** — closes the exact gap that produced a real false-positive finding this
  session; gives the engine, skills, and any future contributor one place (F-II) to check
  before writing a new version-comparison. Registry.md (F-I's fitness signal) should gain a
  row once ratified, citing this ADR as the DSAMind-proven mechanism.
- **Negative / accepted trade-off** — none identified; this narrows an ambiguity, it doesn't
  add new obligations to any consumer (no consumer's `CONSTITUTION.md` needs to change).
- **Deferred, not ruled on here** — the operator separately proposed that skill invocations
  (or `constitution doctor`) should check axis 3 (installed tooling) is current and run a
  migration script for below-firewall scaffold changes "when necessary." Not included in this
  ruling because no concrete mechanism exists yet to evaluate: open questions include (a)
  what "check is current" means without a silent network call on every skill run, (b) whether
  `doctor` should merely *report* tooling drift (consistent with this framework's existing
  "propose, don't enact" discipline for anything above the firewall) or actually invoke `npm
  install`/`npm update` unattended (a supply-chain-trust question, not a version-tracking one),
  and (c) where per-version migration steps would live (a `migrations/` directory keyed by
  version range, run from `constitution doctor`, is the natural extension of doctor's existing
  `versionSync` mechanism, but is unbuilt). This is follow-up engineering work, not an
  amendment — once a mechanism exists, its catch-rate/friction is a genuine hypothesis and
  belongs in a pre-registered experiment (F-III), not agreement-only like this ADR.

## Alternatives considered
- **Fold this into F-VII instead of F-II.** Rejected — F-VII governs L2 statute discipline
  (operational/craft rules implementing the stack); a version-tracking invariant is about the
  framework's own governed facts, squarely F-II's "one home" territory, not an L2 concern.
- **A brand-new Article (e.g. "F-VIII — version axes").** Considered, since the three-axis
  distinction is a self-contained invariant. Rejected in favor of extending F-II: it already
  covers "one home per rule" in general and was already amended once (ADR-0001) for the
  closely related "package-managed distribution" question; a second narrow Article would
  fragment one concern across two homes — the opposite of what F-II itself is for. (Flagged
  to the ratifier: if this reasoning doesn't hold, the right redirect is `harvest-articles`,
  not a bigger amendment here — this skill doesn't harvest brand-new Articles from scratch.)
- **No agreement-only path; pre-register an experiment instead.** Rejected for *this* ADR's
  scope (naming the three axes and stopping the false-positive) — there's no catch-rate or
  friction-cost hypothesis to measure; it's a factual clarification of what already-adopted
  practice (`sync-operator`'s "never bump a consumer's pin past what it has adopted") actually
  means, evidenced by a bug this session already found and fixed in code. The deferred
  auto-check/auto-migrate proposal is exactly the kind of candidate that *would* need
  measurement, once it has a concrete mechanism to measure — see Consequences above.
