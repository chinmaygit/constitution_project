# The constitution framework — Constitution

```
framework: constitution@0.16.4   (self-hosted)
ratifier:  Chinmay
```

This document governs the development of the constitution framework **itself**. It is
written using the framework it defines: the spec lives in `process/` and `templates/`;
this file is an *instance* of that spec, applied to the framework's own evolution.

- Layers are defined in [process/layers.md](process/layers.md).
- Rules change per [process/amendment-lifecycle.md](process/amendment-lifecycle.md).
- Candidate rules are measured per [process/experiment-lifecycle.md](process/experiment-lifecycle.md)
  before they appear here.

---

## L0 — Preamble (vision)

**P1.** A governance framework must **emerge from live practice, never speculation.**
It stays product-agnostic: it defines *how to govern*, never *what a specific product
is*. Domain rules belong to the projects that adopt it.

---

## L1 — Articles (meta-invariants)

Each Article carries three independent fields: **`status`** (legal force, the ratifier's
decision: `PROPOSED → RATIFIED → SUPERSEDED`), **`conformance`** (whether the framework
itself satisfies the fitness signal now, the audit's finding: `HOLDS | VIOLATED |
UNVERIFIED`), and **`enforcement`** (how durably that conformance is held, derived by the audit
from the serving guards: `UNGUARDED | AUDITED | GATED | STRUCTURAL`, weakest → strongest).
Ratification is agreement; conformance is reality; enforcement is reality's half-life —
`HOLDS + UNGUARDED` is true-but-fragile, flagged as mechanization debt.

### Article F-I — Discovery before codification
`status: RATIFIED` · `conformance: HOLDS` · `enforcement: AUDITED` · `party: N/A`

- **Principle** — No rule is added to this framework until it has been proven in at
  least one live project. DSAMind is the founding instance.
- **Serves** — P1.
- **Fitness** — every "promoted mechanism" row in [registry.md](registry.md) links to
  the originating experiment + ADR in a consumer project.
- **Why** — a framework written from imagination ossifies around guesses; one written
  from usage carries its evidence with it.

### Article F-II — One home per rule
`status: RATIFIED` · `conformance: HOLDS` · `enforcement: AUDITED` · `party: N/A`

- **Principle** — Every governed rule lives in exactly one layer (L0–L4), and is never
  duplicated across layers, nor across the framework and an instance. A versioned 
  package manager installation (e.g., via a CLI) satisfies this rule: the package is the 
  single home, and the files it writes to the instance are its read-only build artifacts.
- **Serves** — P1.
- **Fitness** — no rule's text appears verbatim in two layer documents; every cross-layer
  reference (`serves` / `amends` / `supersedes` / `party`) resolves and every layer traces up;
  no rule lives outside a layer. Verified by the `audit-structure` skill.

### Article F-III — Experiments are pre-registered
`status: RATIFIED` · `conformance: HOLDS` · `enforcement: UNGUARDED` · `party: N/A`

- **Principle** — Every candidate rule declares its hypothesis, metric, and decision
  rule **before** it runs. The decision rule is frozen for the experiment's duration.
- **Serves** — P1.
- **Fitness** — every file in a consumer's `experiments/` has all three fields filled
  and a `pre-registered:` timestamp earlier than its `RUNNING` status.

### Article F-IV — No self-ratification above the firewall
`status: RATIFIED` · `conformance: HOLDS` · `enforcement: AUDITED` · `party: N/A`

- **Principle** — Changes to L0 or L1 — in the framework **or** any instance — require a
  human ratifier. Agents may propose, gather evidence, and author/enforce L4, but may
  not promote a rule across the firewall alone.
- **Serves** — P1.
- **Fitness** — every L0/L1 amendment traces to a human ratifier. The document's standing
  header `ratifier:` line satisfies this for the whole ledger; an individual entry may restate
  it inline (several do, for emphasis) but is not required to. What the check actually verifies
  is that the header names a real person — an unset or placeholder ratifier is the violation.

### Article F-V — L0 is discovered, distilled, and human-held
`status: RATIFIED` · `conformance: HOLDS` · `enforcement: AUDITED` · `party: N/A`

- **Principle** — A product's L0 (Preamble) is the *minimal* set of identity-defining
  statements, discovered from the product's reason to exist and distilled until removing
  any one would change what the product *is*. L0 is human-authored and human-ratified, and
  is deliberately **not** bound to a fitness function.
- **Serves** — P1.
- **Fitness** — L0 holds ≤3 statements; no fitness signal is attached directly to an L0
  line; every L1 Article's `serves` resolves to an L0 line (the vision is fully covered).
- **Why** — the vision encodes intent only the founder holds: an agent may help phrase it
  but cannot originate it, and a machine cannot check identity.
- **Proven** — DSAMind's L0 (P1–P3) was defined by this process and ratified (2026-06-28).
  Process: [process/defining-l0-l1.md](process/defining-l0-l1.md); questions:
  [process/l0-elicitation.md](process/l0-elicitation.md); skill: `define-preamble`.

### Article F-VI — L1 is harvested, tested, and reality-checked
`status: RATIFIED` · `conformance: HOLDS` · `enforcement: AUDITED` · `party: N/A`

- **Principle** — L1 Articles are *harvested from observed practice* (past decisions,
  ADRs, incidents, existing rules), never invented. Each must pass the inclusion test,
  trace to an L0 line, and declare `principle / serves / fitness / status / conformance /
  enforcement`. An Article's `status` (legal force) is the ratifier's decision; its
  `conformance` is set by running the fitness signal against the live code, and its
  `enforcement` (how durably that conformance is held) is derived from the guards that serve it.
  Status and conformance are independent — a `RATIFIED` Article may be `VIOLATED` (tracked debt).
  **Never mark `conformance: HOLDS` while the code violates the fitness signal**, and never let
  `HOLDS + UNGUARDED` pass as durable health.
- **Serves** — P1.
- **Fitness** — every L1 Article carries the six fields; every `serves` resolves to a real
  L0 line; no Article is marked `conformance: HOLDS` while its fitness signal fails.
- **Why** — a constitution that *claims conformance* it doesn't have is fiction; separating
  agreement (status) from reality (conformance) keeps it honest without hiding debt.
- **Proven** — DSAMind's L1 was harvested and reality-checked by this process (2026-06-28).
  Process: [process/defining-l0-l1.md](process/defining-l0-l1.md); the *recurring* reality-check
  (re-running the fitness signals after code changes) is the `audit-conformance` skill.

### Article F-VII — Statutes implement the stack, traced and mechanized
`status: RATIFIED` · `conformance: HOLDS` · `enforcement: AUDITED` · `party: N/A`

- **Principle** — L2 Statutes are operational/craft rules that *fail* L1's inclusion test (a
  tech swap would rewrite them, *or* they don't trace to an L0 line). They live wherever the product's Governance Map specifies (typically `AGENT.md`, `CLAUDE.md`, or nested files) — **named, not relocated** (F-II). Each **traces up** to
  the L1 Article it operationalizes (or explicitly states it is a general craft standard), and is **enforced by a mechanism** (lint / CI / hook), not a conformance ledger. They cross the firewall only by
  promotion (L2→L1, ratified) or demotion (L1→L2).
- **Serves** — P1.
- **Fitness** — the framework ships an L2 spec (`process/statutes.md`, `templates/statute.md`,
  layers §L2), and at least one consumer has harvested its L2 by it — every Statute annotated
  `serves` + `enforced-by`, no rule duplicated across layers (F-II), and no Statute that passes
  all four L1 tests (those promote, not file).
- **Why** — without trace-up, L2 decays into an unaccountable junk drawer; without `enforced-by`,
  statutes are wishes. Naming statutes where they already live (not relocating) preserves one home.
- **Proven** — DSAMind's L2 was harvested from its `AGENTS.md` / `CLAUDE.md` by
  `process/statutes.md` (2026-06-29): 15 engineering statutes annotated, an F-II duplicate
  consolidated, stale statutes (Category/Mode) fixed, and the L1/L2 boundary confirmed clean.
  See [registry.md](registry.md). Harvest how-to: `process/statutes.md`; the top-down counterpart
  (deriving the statutes each Article needs, and finding under-enforced Articles) is the
  `derive-statutes` skill.

---

## Conflict resolution

When articles collide, apply this order (see [process/conflict-resolution.md](process/conflict-resolution.md)):

```
evidence > framework/instance integrity > one-home-per-rule > simplicity > automation > convenience
```

If the order is silent or genuinely tied, **escalate to the human ratifier** (the
certiorari move). The resolution becomes an ADR in `decisions/`; a recurring escalation
on the same Article is the signal that the Article itself needs amending.

---

## Amendments Ledger

Superseded clauses are never deleted — they are kept here with a forward link and the
ADR that justified the change.

### [0.16.4] — 2026-07-01 — `constitution-upgrade` renamed to `sync-operator`
- Ahead of adding five new skills (`harvest-articles`, `harvest-statutes`,
  `reconcile-findings`, `propose-amendment`, `ratify-amendment` — see the brainstorm below),
  fixed the one existing skill name that broke the set's verb-noun convention:
  `constitution-upgrade` (noun-verb) → `sync-operator` (verb-noun, and names its audience —
  it serves the operator, not a product repo; the CLI does that).
- **Checked first whether this was a below-the-firewall rename**: grepped every reference.
  None are inside ratified L1 Article text (F-II/F-VI/F-VII name `audit-structure`,
  `audit-conformance`, and `derive-statutes` this way, not this skill) — so this is craft,
  not an amendment to the invariants those Articles name.
- Updated: the skill's own frontmatter + bootstrap command, `README.md`, `cli/README.md`,
  `skills/AGENT.md`, and the operator's global symlink (`~/.claude/skills/sync-operator`).
  **Deliberately left unchanged**: this ledger's own `[0.16.1]`/`[0.16.3]` entries and
  `decisions/0001-package-managed-distribution.md` — both are dated record of events that
  happened while the skill was still named `constitution-upgrade`; rewriting them to say
  `sync-operator` would misrepresent what was true at the time.
- The other four existing skill names (`audit-structure`, `audit-conformance`,
  `derive-statutes`, `define-preamble`, `compile-prompt`) are unchanged — already
  verb-noun, already clear, and renaming them would mean amending the Articles that name
  them for a label change alone. Deferred unless a real reason to touch those Articles
  shows up on its own.
- No new Article; below the firewall. Ratifier: Chinmay.

### [0.16.3] — 2026-07-01 — CLI representation: verdict is docs, not promotion
- **Brainstorm item 3**: is the CLI "underrepresented" in the constitution? Checked the
  constitutional layer first — F-II's principle already names package-managed installation as
  a valid single home, ADR-0001 is the ruling, `cli/AGENT.md` (`[0.16.2]`) is its L2. That
  layer was already adequate. **Not promoting the CLI to its own Article** — one ADR is not
  the "pile of ADRs on one rule" signal `audit-structure` looks for (F-I, discovery before
  codification: not enough live mileage yet to codify).
- The actual gap was human-facing: `README.md`'s "Repo map" never listed `skills/` or `cli/` at
  all, and its "Consuming the framework" section still described the pre-ADR-0001 world —
  manually vendoring templates, no mention the CLI exists. Fixed:
  - **New `cli/README.md`** — the package's own front door (usage, status: unpublished, what
    it is *not* — the operator path is `constitution-upgrade`, not this).
  - **Root `README.md`** — Repo map now lists `skills/` and `cli/`; "Consuming the framework"
    now points at the CLI + ADR-0001 instead of the stale manual-vendor steps.
  - **`constitution-upgrade`** (`1.1.0` → `1.1.1`) — its "Installing into a product repo"
    section no longer restates the CLI's invocation; points at `cli/README.md` instead
    (tightens F-II — one home for "how to run the installer" was starting to drift to two).
- No new Article; below the firewall (documentation + one skill's own pointer). Ratifier:
  Chinmay.
- Still open: `registry.md`'s stale DSAMind pin (unrelated to this item, not touched).

### [0.16.2] — 2026-07-01 — L2 homes declared per folder; audit-structure's map cross-check restored
- **L2 discovery blocker (brainstorm items 1+2 on the framework's own backlog):** the map-only
  design (`[0.16.0]`) traded away the old glob-fallback safety net; and the CLI (`cli/`) had no
  declared L2 home at all. Both fixed without re-coupling day-to-day work to disk-scanning:
  - **New nested `AGENT.md` files declare L2 for every folder that has its own authoring craft**
    — `skills/AGENT.md`, `templates/AGENT.md`, `decisions/AGENT.md`, `process/AGENT.md`,
    `cli/AGENT.md`. Each is harvested from conventions already observably true across that
    folder's files (F-II — named, not invented), following the shape `process/statutes.md`
    prescribes. `cli/AGENT.md` closes the CLI's L2 gap directly.
  - **Root `AGENT.md`'s governance map now lists all five nested homes explicitly**, replacing
    the single vague "skills/process/templates" bullet — satisfies `audit-structure` check 6
    (every declared location must resolve).
  - **`decisions/INDEX.md`** no longer duplicates its own authoring rules in prose (they'd drifted
    into a near-restatement of `process/layers.md`'s L3 section) — trimmed to a pointer at
    `decisions/AGENT.md` (F-II).
  - **`audit-structure` gets back its independent disk-scan cross-check** (checks 6, Procedure
    step 1, Hard rules; `1.2.0` → `1.3.0`) — but scoped correctly this time: `compile-prompt` and
    every other skill still trust the map only, at full speed, no scanning. Only `audit-structure`,
    the periodic safety net, also scans the tree and flags an undeclared home as `map-gap`. This
    restores the pre-`[0.16.0]` safety property (an undeclared statute home can't go silently
    invisible forever) without re-imposing its cost on routine work.
- No new Article; below the firewall (L2 declarations + one audit skill's own procedure).
  Ratifier: Chinmay.
- Open, deliberately not touched here: `registry.md`'s stale DSAMind pin; the CLI's
  under-representation at L1 (a promotion-candidate question, not yet enough case-law mileage);
  the skills/ architecture rehaul itself (a separate, larger brainstorm).

### [0.16.1] — 2026-07-01 — audit-structure findings, reconciled
- Ran `audit-structure` against this repo (self-hosted) and worked the findings:
  - **`AGENT.md`** now documents this repo's own source-vs-installed-artifact split — `skills/`,
    `process/`, `templates/` are edited here; `.claude/`, `.agents/`, `.cursor/` are CLI-generated,
    gitignored, never hand-edited. This is specific to this repo dogfooding its own CLI; a normal
    consumer project has no such split (it never has its own `skills/` to confuse with the install).
  - **`compile-prompt`** step 2/3 no longer claim a disk-scan guarantee the map-only design (0.16.0)
    doesn't provide. It now says plainly: no fallback scan, the map is the sole source, an
    incidentally-noticed undeclared home is FRICTION to report, not silently include or drop.
  - **`constitution-upgrade`** no longer states "symlinks, never copies" as an absolute F-II rule
    (it directly contradicted ADR-0001's ruling, which the ADR itself said supersedes this skill's
    enforcement). Rescoped: this skill serves the *operator's* own global environment (symlinks are
    right there — you're working against the live source); installing into a *product repo* is the
    CLI's job (`cli/`), using package-managed copies per ADR-0001. Different consumers, both correct.
  - **Tags**: `v0.16.0` now points at the commit that carried it (0.15.0/0.15.1/0.16.0 had shipped
    with no tag since v0.14.0; not re-tagging the two intermediate versions separately since they
    were never independently the tip).
  - **ADR-0001**: `status: proposed` → `accepted` (its ruling was already fully implemented and
    treated as settled — the record now matches).
  - **F-IV fitness tightened**: the document's standing header `ratifier:` line satisfies "names a
    human ratifier" for the whole ledger; an entry may restate it inline but isn't required to.
    Resolves an ambiguity the audit surfaced — `[0.16.0]` (and historically `[0.3.0]`) never
    violated F-IV under this now-explicit reading. Ratifier: Chinmay.
- No new Article; no status change beyond the F-IV wording clarification above.

### [0.16.0] — 2026-07-01 — Agent-Agnostic Architecture
- **Amended Article F-VII** to clarify that L2 Statutes live wherever the product's Governance Map specifies (typically `AGENT.md`, `CLAUDE.md`, or nested files). The framework itself no longer hardcodes any L2 discovery globs, reading the convention dynamically from the map. This maintains F-II compliance while natively supporting any agent.
- **Why:** To make the constitution natively support Cursor, Antigravity, Claude, and Copilot, rather than relying exclusively on `CLAUDE.md`. The root governance map is now standardly named `AGENT.md`.

### [0.15.1] — 2026-07-01 — Re-audit Conformance
- **Audit:** Ran `audit-conformance` against the codebase following the 0.15.0 package management amendment.
- **Findings:**
  - F-I through F-VII all maintain `conformance: HOLDS`.
  - F-IV holds: The 0.15.0 ledger entry correctly names a human ratifier (Chinmay).
  - F-III remains `UNGUARDED` (mechanization backlog).
- **Result:** No conformance flips. All Articles hold.

### [0.15.0] — 2026-07-01 — Package-Managed Distribution satisfies F-II
- **Amended Article F-II** to clarify that a package-managed CLI installation satisfies the "one home per rule" invariant. 
- **Why:** To enable a gstack-style CLI distribution. Symlinks are no longer the exclusive way to prevent drift; instead, the CLI and package version will act as the source of truth, treating generated files as read-only build artifacts.
- **ADR:** [0001-package-managed-distribution](decisions/0001-package-managed-distribution.md).
- Ratifier: Chinmay.

### [0.14.0] — 2026-06-30 — Third axis: `enforcement` (how durably an invariant is kept)
- Added a **third Article axis, `enforcement`** (`UNGUARDED | AUDITED | GATED | STRUCTURAL`,
  weakest → strongest), alongside `status` (is it law?) and `conformance` (is it true now?). It
  answers *how is it kept true?* — the durability of the conformance. **Derived, not declared:** the
  audit rolls it up from the `enforced-by` of the serving L2 statutes, taking the **weakest rung
  over the fitness's sub-claims** (an invariant is only as strong as its softest guard).
- **Why it earned an axis:** the #116/#112 case (DSAMind) exposed the trap — A1 was
  `RATIFIED + HOLDS` yet nothing *prevented* a bad `patternId`; the green `HOLDS` hid the fragility.
  `HOLDS + UNGUARDED` is true-but-fragile and is now flagged as **mechanization debt**; the
  `RATIFIED` + non-`STRUCTURAL` set is the **mechanization backlog**. Enforcement also bounds how far
  to trust `HOLDS` and how often to re-audit (`STRUCTURAL` needs none; `UNGUARDED` needs vigilance).
- **Wired through:** the Article template (`templates/article.md`) and `layers.md` §L1 carry the
  field + the ladder + the weakest-link rule; **`audit-conformance` v1.1.0** now derives + writes
  `enforcement` and gained a companion honesty rule (never let `HOLDS + UNGUARDED` read as durable
  health); **`audit-structure` v1.2.0** requires the field and emits the mechanization backlog.
- **Self-hosted:** the framework's own F-Articles are backfilled — F-I/F-II/F-IV/F-V/F-VI/F-VII are
  `AUDITED` (a skill checks them when run), F-III is `UNGUARDED` (no experiment tooling exists yet —
  the framework's own backlog item). Extends F-VI's reality-check and F-VII's mechanization to L1.
  No new Article; an L1-schema amendment ratified by Chinmay.

### [0.13.0] — 2026-06-30 — `audit-structure` enforces the governance map (discoverability)
- Extended the `audit-structure` skill (→ v1.1.0) with a **governance-map check** (new check 6): the
  product's root `CLAUDE.md` must declare an entry-point **governance map** (where L0/L1 live, where
  L3 lives, the L2 convention), and the `audit-structure` / `compile-prompt` skills **parse it**, or
  warn if missing. The map acts as an index; the truth is the code. The audit skill parses the map (or
  nothing) and **lists every discovered statute home** — the glob of all `*/CLAUDE.md` + `AGENTS.md`
  carrying `serves`-tagged statutes. If a home is discovered but absent from the map, it flags a `map-gap` (a silent home). This is the structural
  counterpart to the `compile-prompt` discovery fix [0.12.0]: the compiler discovers by glob, the
  audit guarantees the human-facing index stays complete. No map at all → one finding, not one-per-home.
- The glob is the source of truth for L2 homes; the map is the index, checked against it.
- Genericized the one consumer name left in the skill's description (machinery names no consumer).
  No new Article; F-II's discoverability fitness now has an explicit map check; no status change.

### [0.12.0] — 2026-06-30 — `compile-prompt` hardened: deterministic discovery + negative invariants
- Hardened the `compile-prompt` skill (→ v1.1.0) after the first headless compile tests (Haiku 4.5
  and Sonnet 4.6 run **cold** against a consumer, no operator context). Three procedural fixes:
  - **Deterministic L2 discovery.** Replaced "read root + nested `CLAUDE.md`/`AGENTS.md`" (a
    black box to the compiler) with a strict glob constraint: an agent must first parse the root
    `CLAUDE.md` **governance map** (constitution path, ADR dir, L2 convention), then **glob all
    `CLAUDE.md`/`AGENTS.md`** for statute homes. Glob is the floor; the map is the index. The test
    caught a strict reader nearly skipping a nested statute home.
  - **Negative-invariants step.** The compiler now scans every `RATIFIED` Article for ones the task
    could *break* (not just implement) and tags them MUST NOT BREAK — relevance is not the test,
    **reachability** is. (A cheaper model had dropped a must-not-break invariant by reasoning it
    wasn't "about" the feature.)
  - **No invented conventions.** A definition-of-done assertion may never tell the actor to invent
    an unspecified convention; an unpinned convention is a FRICTION gap for the ratifier.
- **Consumer-blind machinery.** Purged all consumer-specific names/paths/examples from the skill
  doc — executable machinery names no consumer; worked examples are placeholder-shaped. Design/
  process docs and `registry.md` may still name the live lab (the coupling is one-directional).
- Recorded the discovery decision in `process/compiler.md`. No new Article; no status change.

### [0.11.0] — 2026-06-30 — `compile-prompt` skill (the L4 compile step)
- Built the **`compile-prompt`** skill (`skills/`): the L4 compile step — `L4 =
  compile(task, L0..L3)`. Given an owner's task it locates the governing slice (the L0 line it
  serves, the `RATIFIED` Articles, the matched L2 statutes, the precedent ADRs) and emits one
  provenance-tagged briefing ending in a definition of done = the fitness assertions CI runs. This
  is the **front door for day-to-day work**: the owner states a task; the compiler reaches down for
  the law; the audits and amendments are maintenance of the machine the compiler runs on.
- Two v1 decisions, recorded in `process/compiler.md`: **compile-only handoff** (emit the artifact,
  stop — a separate actor session implements it) and the **certiorari STOP** (a task that serves an
  L0 line no Article enforces, or collides with two Articles, is not compiled — the skill stops and
  escalates to the ratifier, F-IV). Selection defaults to **strategy 2** (L0 always + all RATIFIED
  L1 + task-matched L2/L3); strategy 3 stays a pre-registered F-III experiment.
- Updated `layers.md` §L4 (selection no longer "being designed") and `compiler.md` (open question
  narrowed to the selection-strategy experiment). **No new Article**: an L4-governing Article is
  deferred until a live task proves the loop (F-I — discovery before codification), mirroring how
  F-VIII (govern L3) is deferred. No status change.

### [0.10.0] — 2026-06-29 — `audit-structure` skill (constitution integrity)
- Added the `audit-structure` skill (`skills/`): a read-only structural audit of the whole
  L0–L4 governance graph — every cross-layer reference resolves (`serves`/`amends`/`supersedes`/
  `party`), every layer traces up, nothing is orphaned, duplicated, or living **outside** a layer
  (ungoverned), the firewall + two-axis fields are intact, and the pin/version/ledger are
  consistent. It audits the *constitution*, not the code — the complement to `audit-conformance`.
- This is the audit check **F-II** already named in its fitness; F-II's fitness is reworded to
  reference the skill and broadened to referential integrity + the no-rule-outside-a-layer check.
- Completes the audit set: `audit-conformance` (L1↔code), `derive-statutes` (L1→L2),
  `audit-structure` (the constitution's own integrity). No new Article; no status change.

### [0.9.0] — 2026-06-29 — L3 case-law structure and triggers
- Refined the ADR into **case law**: `templates/adr.md` now carries `serves` (the L0/L1/L2 ids it
  interprets), `superseded_by` (forward link — never delete, supersede), `amends` (the PROMOTE
  hook), and `trigger` (architectural · stack-invariant · migration · **certiorari**); body gains
  **Question of law → Ruling → Constitutional impact**.
- Named the **certiorari trigger** explicitly: a collision between Articles or a gap the law
  doesn't cover → the agent STOPS and escalates; the ruling becomes an ADR; recurring ADRs on one
  Article climb to an amendment. Refreshed the `conflict-resolution.md` worked example (A1) and the
  `layers.md` §L3 definition.
- Surfaced by DSAMind: its 10 ADRs predate the constitution and cite no Article — they were
  architecture notes, not case law. The structure change + a serves-backfill is the live proof; a
  governing Article (F-VIII candidate) is deferred until that proof holds (F-I).

### [0.8.0] — 2026-06-29 — `derive-statutes` skill (top-down L1 → L2)
- Added the `derive-statutes` skill (`skills/`): for each L1 Article, derives the L2
  Statutes needed to make its fitness signal enforceable in the actual stack, reuses existing
  statutes (F-II), proposes only the gaps, and surfaces **under-enforced Articles** (fitness with
  no operationalizing statute). The top-down complement to `process/statutes.md`'s bottom-up
  harvest; both serve F-VII. Referenced from F-VII's "Proven" note.
- Grounded by F-I: a candidate must fall out of an Article's `fitness` applied to real code — it
  derives, never invents. L2 is below the firewall, so the skill drafts/proposes; a human nod
  precedes writing into the product's `CLAUDE.md` / `AGENTS.md`. No new Article; no status change.

### [0.7.0] — 2026-06-29 — Article F-VII ratified (L2 statute discipline)
- **F-VII graduates to `RATIFIED` (`conformance: HOLDS`).** The L2 statute model — fail L1's
  inclusion test, live in `CLAUDE.md` / `AGENTS.md` (named, not relocated), trace up, enforce by
  mechanism, cross the firewall only by promotion/demotion — is now a ratified framework Article,
  not just a process spec. Ratifier: Chinmay.
- **Proven by a live DSAMind L2 harvest** (the F-I requirement): the existing `AGENTS.md` /
  `CLAUDE.md` rules were annotated `serves` + `enforced-by`, an F-II duplicate was consolidated,
  stale statutes (Category/Mode) fixed, and the L1/L2 boundary confirmed clean (no promotion or
  demotion candidates). Moved from in-flight to a promoted mechanism in `registry.md`.

### [0.6.0] — 2026-06-29 — L2 (Statutes) process and template
- Defined the L2 layer's operating model: Statutes are the operational/craft rules that **fail
  L1's inclusion test** (a tech swap would rewrite them, *or* they don't trace to an L0 line).
  They live in the product's existing `CLAUDE.md` / `AGENTS.md` (named, not relocated — F-II),
  **trace up** to an Article or L0 line, are **enforced by mechanism** (lint / CI / hook) rather
  than a conformance ledger, and cross the firewall only by **promotion/demotion** (F-IV).
- Expanded `process/layers.md` §L2; added `process/statutes.md` (the harvest how-to) and
  `templates/statute.md` (annotated shape: `rule · serves · enforced-by · why`).
- **No framework Article added.** The governing meta-rule for L2 (an F-VII candidate) is
  deferred until a live DSAMind L2 harvest proves it — honoring F-I (discovery before
  codification), the same path F-V/F-VI took. Tracked as an in-flight proof in `registry.md`.

### [0.5.0] — 2026-06-29 — `audit-conformance` skill (recurring L1 reality-check)
- Added the `audit-conformance` skill (`skills/`): runs each L1 Article's fitness
  signal against the live codebase and sets `conformance` (HOLDS / VIOLATED / UNVERIFIED) with
  evidence — the **recurring** half of F-VI, complementing the one-time Step B harvest. It
  writes only the conformance axis (below the firewall) and *proposes* anything touching
  `status` or an Article's text (F-IV).
- Surfaced by a real DSAMind re-audit: after #112 landed the patternId fixes, the audit caught
  that 5 catalog patterns were unregistered in the canonical taxonomy — so A1 could not honestly
  HOLD — and A1/A5 were flipped to HOLDS only once the code actually conformed. The framework
  improving through use (P1).
- No new Article and no status change: the skill operationalizes the already-ratified F-VI, and
  is referenced from F-VI's "Proven" note.

### [0.4.0] — 2026-06-28 — Parties, Mission/Mandate, Grow/Monetize elicitation
- Product Preambles now have two halves: a **Mission** (Solution + Value, to the users) and a
  **Mandate** (Grow + Monetize, of the owner). Articles gain a **`party:`** field tagging which
  governed party they protect.
- The L0 elicitation protocol now first asks **who the parties are** (commonly owner + users)
  and covers all four dimensions — **Solution, Value, Grow, Monetize** — adding Grow and
  Monetize questions. Updated `process/l0-elicitation.md`, `templates/article.md`,
  `process/layers.md`, and the `define-preamble` skill.
- Surfaced by DSAMind: its first preamble had a Mission but no Mandate; the founder flagged
  "we make money." The framework improving through use (P1).
- The framework's **own** Preamble stays single — it is a governance tool, not a commercial
  product; Mission/Mandate + `party:` apply to product instances.

### [0.3.0] — 2026-06-28 — Two-axis status; F-V/F-VI ratified
- Split Article `status` into two independent axes: `status` (legal force) and `conformance`
  (does the code satisfy the fitness signal now). Reworded F-VI's honesty rule to attach to
  `conformance`, not `status` — a `RATIFIED` Article may be `VIOLATED` (tracked debt). Retired
  the `PROVISIONAL` status. Updated `templates/article.md`, `process/layers.md`,
  `process/defining-l0-l1.md`.
- **F-V and F-VI graduate to `RATIFIED`** (conformance `HOLDS`): both were proven by DSAMind
  defining its L0 and L1 ground-up via the process (the founding live proof required by F-I).
- Surfaced by a real DSAMind question ("does RATIFIED mean implemented?") — the framework
  improving through use, which is P1.

### [0.2.0] — 2026-06-28 — Process of defining L0 and L1 (proposed)
- Added Article F-V (L0 is discovered, distilled, human-held) and Article F-VI (L1 is
  harvested, tested, reality-checked), both `PROVISIONAL`.
- These are the framework's first articles to enter through the amendment lifecycle rather
  than the bootstrap exemption: they are being proven *now* by defining DSAMind's L0 and L1
  from the ground up (branch `docs/dsamind-constitution`). They graduate to `RATIFIED` when
  that build completes and the process holds. This honors F-I going forward.
- Operational how-to: [process/defining-l0-l1.md](process/defining-l0-l1.md).
- Added the L0 elicitation protocol ([process/l0-elicitation.md](process/l0-elicitation.md))
  and the `define-preamble` skill (`skills/`).
- **L0 half proven:** DSAMind's Preamble (P1–P3) was produced by the protocol and ratified;
  the run fed back two protocol refinements (Q3 sharpened, Q8 forced to an order). F-V's L0
  half is eligible to graduate; F-VI stays `PROVISIONAL` pending the L1 harvest (Step B).

### [0.1.0] — 2026-06-28 — Founding draft (proposed)
- Bootstrapped the framework from the DSAMind governance discussion.
- Ratified F-I…F-IV and P1.
- **Bootstrap exemption:** F-I cannot apply to this founding commit — the framework
  cannot pre-prove its own first rules in a live project before it exists. This commit
  is the one permitted exception. The *first amendment after this* must arrive through a
  real DSAMind experiment, honoring F-I from then on.
