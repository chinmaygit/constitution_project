# The constitution framework — Constitution

```
framework: constitution@0.17.6   (self-hosted)
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
`status: RATIFIED` · `conformance: VIOLATED` · `enforcement: AUDITED` · `party: N/A`

- **Principle** — No rule is added to this framework until it has been proven in at
  least one live project. DSAMind is the founding instance.
- **Serves** — P1.
- **Fitness** — every "promoted mechanism" row in [registry.md](registry.md) links to
  the originating experiment + ADR in a consumer project.
- **Why** — a framework written from imagination ossifies around guesses; one written
  from usage carries its evidence with it.
- **Conformance note (2026-07-05 re-audit)** — VIOLATED. [registry.md](registry.md)'s two
  promoted-mechanism rows (F-V/F-VI, F-VII) cite ledger version ranges and doc sections
  only — neither names an experiment file nor an ADR id. No `experiments/` directory
  exists anywhere, in this repo or DSAMind; no promotion has ever gone through F-III's
  pre-registered path. Tracked debt, not fixed as part of this audit — see
  `audit-conformance` run, same session as ADR-0003.

### Article F-II — One home per rule
`status: RATIFIED` · `conformance: HOLDS` · `enforcement: AUDITED` · `party: N/A`

- **Principle** — Every governed rule lives in exactly one layer (L0–L4), and is never
  duplicated across layers, nor across the framework and an instance. A versioned 
  package manager installation (e.g., via a CLI) satisfies this rule: the package is the 
  single home, and the files it writes to the instance are its read-only build artifacts.
  A version number is a governed fact too, and three exist, each with exactly one home:
  1. the instance's own Amendments Ledger version,
  2. the framework spec version it has adopted (the header pin — a ratified claim, never
     bumped ahead of what's actually adopted),
  3. the framework tooling installed (the instance's own package manifest).

  These three are never compared as one axis, with one exception: in the framework's own
  self-hosted repo, axis 1 and axis 2 are the same number by design. Axis 3 is never folded
  into that collapse, even here.
- **Serves** — P1.
- **Fitness** — no rule's text appears verbatim in two layer documents; every cross-layer
  reference (`serves` / `amends` / `supersedes` / `party`) resolves and every layer traces up;
  no rule lives outside a layer. No check treats axis 1 and axis 2 as the same number for any
  instance except the framework's own self-hosted repo; no check ever treats axis 3 as the
  same number as either of the others, anywhere. Verified by the `audit-structure` skill.

### Article F-III — Experiments are pre-registered
`status: RATIFIED` · `conformance: HOLDS` · `enforcement: AUDITED` · `party: N/A`

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
  tech swap would rewrite them, *or* they don't trace to an L0 line). They live wherever the product's Governance Map specifies (typically `AGENTS.md`, `CLAUDE.md`, or nested files) — **named, not relocated** (F-II). Each **traces up** to
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

### [0.17.6] — 2026-07-06 — Governance prose clarity: WARN-ONLY checks (EXP-0001)
- **What changed:** `constitution audit` gained three WARN-ONLY findings
  (`PROSE-SENTENCE-LEN`, `PROSE-STACKED-QUALIFIER`, `LEDGER-LENGTH`) checking
  Article/Statute/ADR prose and Ledger entry length. Never blocks; a pre-registered
  F-III experiment (`experiments/EXP-0001-governance-prose-clarity.md`) governs
  promotion.
- **Why:** F-II's own text got denser with every amendment (ADR-0002, ADR-0003); this
  framework's law should catch exactly this kind of drift on itself, not just on the
  products it governs.
- **ADR:** none — below the firewall throughout (new engine checks, a new experiment
  file, template guidance; no Article text or status touched).

### [0.17.5] — 2026-07-05 — Re-audit Conformance
- **Audit:** Ran `audit-conformance` against all seven Articles, same session as ADR-0003.
- **Findings:**
  - **F-I flips `HOLDS` → `VIOLATED`.** `registry.md`'s two promoted-mechanism rows cite
    ledger ranges and doc sections, not an experiment file + ADR id, as the fitness text
    requires. No `experiments/` directory exists anywhere (this repo or DSAMind); no
    promotion has ever used F-III's pre-registered path. Tracked debt — not remediated
    here (human declined the fitness-amendment option this session; left as-is).
  - F-II through F-VII all maintain `conformance: HOLDS`, `enforcement: AUDITED`.
  - F-III holds only vacuously — zero experiment files exist to check against; the
    mechanism has never actually been exercised.
  - F-VI's own fitness ("no Article marked HOLDS while its fitness fails") was itself
    unmet before this pass, because of F-I's stale label — fixed by the F-I flip above.
- **Result:** One conformance flip (F-I). No `status` changes; nothing above the firewall.

### [0.17.4] — 2026-07-05 — Ratified by Chinmay: Article F-II's version-axis clause tightened (ADR-0003)
- **Ratified by Chinmay, 2026-07-05**, per [ADR-0003](decisions/0003-tighten-version-axis-clause.md).
- `derive-statutes`, run against F-II this session, found `[0.17.3]`'s two added sentences
  disagreed on scope: Principle's self-hosted exception named two axes (pin + ledger);
  Fitness listed all three before the same "except," reading like it covered all three. That
  ambiguity had already produced a wrong statute (`cli/AGENTS.md` claimed the tooling axis
  collapses too, citing F-II) — fixed in the same session, pending this ADR.
- **Article F-II — Principle and Fitness rewritten** (`status: RATIFIED`, unchanged), as a
  numbered 3-axis list with the self-hosted exception scoped to axes 1+2 only in both
  clauses. No behavior change — code and the statute already assumed this reading.
- `[0.17.3]` **SUPERSEDED — 2026-07-05 → ADR-0003.** The two sentences it added to
  Principle:
  > A version number is a governed fact too. Three exist, each with one home: the
  > instance's own Amendments Ledger version, the framework spec version it has adopted
  > (the header pin — a ratified claim, never bumped ahead of what's actually adopted), and
  > the framework tooling installed (the instance's own package manifest). These are never
  > compared to each other as if they were the same number — except in this framework's own
  > repo, where the pin and the ledger are the same number on purpose.

  And the one sentence it added to Fitness:
  > No check treats the ledger version, the header pin, and the installed tooling version
  > as one axis, except for this framework's own self-hosted repo.
- Agreement-only — no pre-registered experiment. Wording-only fix; the ambiguity itself was
  the evidence.
- Above the firewall — F-II's `status` did not change (already `RATIFIED`); its Principle
  and Fitness text did, transcribed per `ratify-amendment`.
- Self-hosted repo: header pin bumped to `0.17.4` alongside this ledger entry (F-II's own
  pin↔ledger collapse, per this repo's root `AGENTS.md`).

### [0.17.3] — 2026-07-05 — Ratified by Chinmay: Article F-II extended — three version numbers, three homes
- **Ratified by Chinmay, 2026-07-05**, per [ADR-0002](decisions/0002-version-axis-separation.md).
- Found auditing DSAMind (`dsa_project`): the engine's `LEDGER-SYNC` check compared a
  consumer's adopted-spec header pin against its own Amendments Ledger version and flagged
  a real, correct mismatch as an error. Those are two different, legitimately independent
  numbers. Fixed in code the same day (`cli/src/engine/audit.ts`); this entry writes the
  distinction into law so it isn't lost.
- **Article F-II — Principle and Fitness extended** (`status: RATIFIED`, unchanged). Names
  three version facts, each with exactly one home: an instance's own Amendments Ledger
  version, the framework spec version it has adopted (the header pin — a ratified claim,
  never bumped ahead of what's adopted), and the framework tooling installed (the instance's
  own package manifest, e.g. `package.json`). Purely additive — nothing existing changed or
  was superseded, no forward link needed.
- Agreement-only — no pre-registered experiment. There was no catch-rate or friction
  hypothesis to measure, just a fact to state clearly.
- **Not part of this amendment**: whether skills should auto-check installed tooling is
  current and auto-run migrations when it isn't. No mechanism exists yet to rule on; left
  as open follow-up work (see ADR-0002's Consequences).
- Above the firewall — F-II's `status` did not change (already `RATIFIED`); its Principle
  and Fitness text did, transcribed per `ratify-amendment`.

### [0.17.2] — 2026-07-04 — Publish-on-merge: every merge to main ships the package (operator-directed)
- Operator directive: "every PR merge should publish the package." New
  `.github/workflows/publish.yml`: on push to main — build (vendor + strict tsc), test,
  **gate** (fail if `cli/package.json` ≠ this header's version), **publish** to GitHub
  Packages via the built-in `GITHUB_TOKEN` (`packages: write`) *only if that version isn't
  already on the registry* (a merge with no bump publishes nothing and passes), then
  **smoke-test the published tarball**: install it into a fresh consumer, run the
  non-interactive `init` + `audit`, assert the scaffold exists — the `[0.16.11]` lesson
  ("a clean tarball listing isn't proof the tool works") as a standing gate.
- Two `cli/AGENTS.md` statutes upgraded `prompt-only → CI` accordingly: "don't bump
  without publishing" and "one version number for the whole repo" — both now GATED by
  the workflow rather than the publisher's memory.
- This also closes session 2's "publish 0.17.1" open item by superseding it: the manual
  `npm publish` the harness rightly blocked an agent from running is now a repo-owned CI
  act that fires on the operator's own merge click — the merge *is* the authorization.
- Below the firewall (workflow + L2 annotations + version bump). Authored on operator
  instruction; entry pending review with the PR. `cli/package.json` → `0.17.2` via doctor.

### [0.17.1] — 2026-07-04 — F-III mechanized; the firewall reaches the commit; skills consume the engine
- **Overhaul session 2** (BUILDLOG.md updated). PR #1 (0.17.0) was merged and the ratifier
  personally accepted the lock (`constitution.lock.json`, commit 13f0678) — `constitution
  firewall` now runs clean against it; the F-IV gate is live in CI.
- **F-III mechanized**: the engine now parses `experiments/` (per `templates/experiment.md`)
  and audits pre-registration deterministically — any experiment at/past PRE-REGISTERED with
  an empty/placeholder Hypothesis, Metric, or Decision rule, a missing/invalid/future
  `pre-registered` date while RUNNING+, or an illegal status is an error (`EXP-*` findings).
  Accordingly F-III's `enforcement` flips `UNGUARDED → AUDITED` — an audit-derived field,
  below the firewall by design, and verified: `constitution firewall` stayed clean across the
  edit (the lock hashes ratified substance only). The self-audit now reports **0 findings**.
- **`constitution hooks install`**: a worktree-safe pre-commit hook running audit + firewall
  locally — the gate moves from CI-only to commit-time. Idempotent (marker line), refuses to
  clobber a foreign hook without `--force`, skips gracefully (with a loud message) when the
  PATH CLI is missing or predates 0.17.0 — that last case was caught live: the operator's
  global was still 0.16.12 and the first hook draft would have blocked every commit with
  "Unknown command". Installed on this repo; verified both skip paths by executing the hook.
- **Skills now consume the engine** instead of re-deriving structure from prose:
  `audit-structure` (`1.3.2 → 1.4.0`) starts from `constitution audit --json` as ground truth
  for the deterministic checks and spends its judgment only where the engine can't
  (semantic duplication, ungoverned prose rules, meaning-level reference checks);
  `compile-prompt` (`1.1.2 → 1.2.0`) starts from `constitution compile` packs (complete
  canonical law, guaranteed current) and keeps the manual discovery protocol as fallback.
- Engine suite now **19 vitest cases** (experiments parsing/auditing incl. a last-section
  regex regression the review caught before it shipped; hook install/idempotence/refusal).
- Below the firewall throughout: the only law-plane text edit is F-III's `enforcement`
  field, which the constitution itself defines as set-by-audit. Authored autonomously;
  entry pending operator review. `cli/package.json` → `0.17.1` via `constitution doctor`.

### [0.17.0] — 2026-07-04 — The governance engine: the CLI becomes the product's deterministic core
- **Overhaul session 1** (see `BUILDLOG.md` + `docs/architecture.md` for the full record and
  design). The CLI grows from installer to engine — everything below is deterministic code in
  `cli/src/engine/`, tested (`cli/test/`, 14 vitest cases incl. a dogfood test that parses and
  audits this very repo) and wired into CI (`.github/workflows/governance.yml`).
- **Three-plane architecture made physical**: law plane (this file, statute homes, `decisions/`
  — unchanged format, now machine-parsed), engine (the CLI), ops plane (`.constitution/` —
  events, tone cache, proposal queue, compiles, board; volume lives there, never here).
- **The firewall becomes a gate** (F-IV enforcement path AUDITED → GATED once adopted):
  `constitution.lock.json` records canonical hashes of ratified L0/L1 units, written only by
  `constitution lock accept` (interactive TTY + typed confirmation — refuses agents/pipes,
  verified); `constitution firewall` fails CI on changed/added/removed ratified units.
  **The lock is not yet accepted** — that is the ratifier's own act, pending.
- **`constitution audit`** — deterministic structural audit (refs resolve, layers trace up,
  fields legal, ledger/version sync, lock drift), findings classified by what the FIX touches
  (above/below firewall). Ran clean on this repo: 0 errors, 2 honest warnings (F-III
  mechanization debt; lock missing).
- **`constitution doctor`** — self-healing below the firewall (prunes stale tone renders,
  version-syncs `constitution.config.json` targets, repairs ops scaffold); above-firewall
  findings are DRAFTED into `.constitution/proposals/` and wait for `constitution ratify`
  (human-only, interactive) — never applied.
- **Tone as a view** (`constitution render <unit> --tone plain|casual|formal`): one canonical
  text ever; renders are derived artifacts cache-keyed by canonical hash + transform version,
  stale by construction on amendment; `tones check` detects, doctor prunes. LLM generation via
  `claude -p` (untested end-to-end in-session — no nested auth; stub-tested).
- **Ops visibility** (`constitution feature <verb>`, `constitution board [--html]`): Kanban
  over `.constitution/events.jsonl` (Declared → Compiled → Building → Validating → Shipped)
  plus a governance-health strip; reads the law by id, stores nothing in it.
- **`constitution compile "<task>" [--out]`** — emits the deterministic L4 compile pack (all
  ratified canonical units + statute/ADR indexes + the briefing contract); judgment stays in
  the `compile-prompt` skill, which now compiles over guaranteed-complete, current law.
- Docs rewritten as a product (`README.md`, `docs/`); two new `cli/AGENTS.md` statutes
  (engine determinism; failing-first engine tests). Statute parser fix along the way: bullets
  whose bold rule closes before indented commentary were silently dropped (3 → 16 statutes
  parsed here).
- **Below the firewall throughout** — no Article text, status, or L0 line touched; the parser
  targets the existing document shapes. Authored autonomously per the standing overhaul goal;
  entry pending the operator's review. `cli/package.json` → `0.17.0` (sync statute holding).
  Not yet published to GitHub Packages (operator's npm auth required).

### [0.16.12] — 2026-07-01 — `AGENT.md` → `AGENTS.md` (amends F-VII); scaffold reads real templates
- **`AGENT.md` renamed to `AGENTS.md` everywhere** — singular was wrong. `AGENTS.md` (plural)
  is the actual cross-tool convention; DSAMind itself already has a real one (its own
  `CLAUDE.md` references "this file + `AGENTS.md`"), and every other place in this framework
  already said "agents" plural (`.agents/skills/`, the audience itself) — only this one file
  name broke from that. Confirmed the hard way: the CLI would have written a third,
  colliding governance file into DSAMind alongside its real `CLAUDE.md` and `AGENTS.md`.
- **This is an amendment, not a free rename**: F-VII's own Principle text named `AGENT.md`
  directly ("typically `AGENT.md`, `CLAUDE.md`, or nested files") — fixed to `AGENTS.md`.
  Tellingly, F-VII's own **Proven** note two lines below had *already* been saying
  `AGENTS.md` correctly (quoting DSAMind's real file) — the Article was internally
  inconsistent with its own evidence before this fix.
- Renamed all 6 files (root + `skills/`, `templates/`, `decisions/`, `process/`, `cli/`) and
  every live cross-reference across `README.md`, `cli/README.md`, `decisions/INDEX.md`,
  `process/{statutes,layers,compiler,defining-l0-l1}.md`, and 6 skill files
  (`harvest-articles` `1.0.1→1.0.2`, `audit-structure` `1.3.1→1.3.2`, `compile-prompt`
  `1.1.1→1.1.2`, `reconcile-findings` `1.0.0→1.0.1`, `derive-statutes` `1.0.2→1.0.3`,
  `harvest-statutes` `1.0.0→1.0.1`). Historical ledger entries before this one are left
  saying `AGENT.md` deliberately — dated record of what was true when written, same
  discipline as the `sync-operator` rename in `[0.16.4]`.
- **Second, unrelated fix bundled in**: `cli/src/scaffold.ts` hardcoded the shape of
  `CONSTITUTION.md` and `AGENTS.md`'s governance-map block as inline template literals — a
  second, silently-drifting home for what `templates/article.md` and this Article already
  define. Added `templates/constitution.md` and `templates/governance-map.md` (real
  templates, `<PLACEHOLDER>` substitution, the same HTML-comment convention every other
  template uses); `scaffold.ts` now reads and fills them instead of hand-writing the
  content. New statute in `cli/AGENTS.md`: never hardcode a file's shape in `scaffold.ts`
  when a template can own it.
- **CLI now asks for a project name** (`constitution init`'s first prompt, defaults to the
  target directory's name) and uses it in the generated `CONSTITUTION.md` title — was
  previously always the generic "# Constitution".
- Verified via the same standard from `[0.16.11]`: called `scaffoldFramework` directly
  against empty and pre-existing-`AGENTS.md` scratch targets, confirmed both the
  fresh-write and safe-append paths produce correct, placeholder-substituted output.
- No new Article; F-VII amended (a wording fix, not a new invariant — status/conformance
  unchanged). Ratifier: Chinmay.

### [0.16.11] — 2026-07-01 — First real cross-repo install (DSAMind) found two live bugs; fixed
- `0.16.10` installed and ran, but **compiled zero skills into any target repo** — confirmed
  by the first real install into a repo that wasn't this one (DSAMind). Exactly the F-I
  discovery loop: a bug invisible in self-hosted testing, caught the moment a live project
  used it.
- **Root cause**: `agents.ts`/`scaffold.ts` read `skills/`/`templates`/`process/` as
  siblings of `cli/` — true in this git checkout, false in any installed package, since
  `files: ["dist"]` never packaged them (npm can't reach outside the package root).
  `scaffold.ts` printed a `console.warn` for it; `agents.ts` failed silently.
- **Second bug found while fixing the first**: `agents.ts`'s link-rewriter for compiled
  skill copies still matched the old broken `../../../process/` pattern this ledger's own
  `[0.16.5]` entry had already corrected to `../../process/` — would have silently stopped
  rewriting any cross-links even after the packaging fix landed.
- **Fix**: `cli/scripts/vendor.js` (new) copies `skills/`/`templates/`/`process/` into
  `cli/` at build time (`prebuild`/`prepack`); `agents.ts`/`scaffold.ts` now read from that
  vendored copy; the link-rewriter regex corrected to match current link depth; `files`
  updated to include the vendored dirs; `cli/.gitignore` ignores them (build artifact,
  same status as `dist/` — source stays at the repo root).
- **`constitution init`, a real subcommand** (was: any invocation, including `--version`,
  unconditionally launched the interactive scaffold — confirmed the hard way, it launched
  against DSAMind's real root when checking the bin resolved). Bare `constitution`,
  `--help`, or an unrecognized command now print usage; only `init` scaffolds;
  `--version`/`-v` actually prints the version.
- **Verification tightened**: `npm pack --dry-run` alone had already passed for `0.16.9`/
  `0.16.10` and still missed this — a clean tarball listing isn't proof the tool *works*.
  This fix was verified by installing the packed tarball into a scratch directory and
  running the real scaffold + compile functions against an empty target, confirming every
  agent format actually populated. That's now the standard pre-publish check, not
  `npm pack --dry-run` alone.
- **Known gap, not fixed here**: `init` still unconditionally writes a fresh
  `CONSTITUTION.md`/`AGENT.md` at the target root — it produced confusing duplicate stub
  files in DSAMind (real constitution: `decisions/CONSTITUTION.md`; real governance map:
  inside root `CLAUDE.md`). Documented in `cli/README.md` as a known limitation; DSAMind's
  own stray files are the operator's to clean up (in progress, outside this session).
  Making `init` detect an existing constitution in a non-default location is real future
  work, scoped separately — this entry fixes the reported bug (skills not copying), not
  the scaffold-assumption gap.
- `cli/package.json` → `0.16.11`, matching this header (the sync statute from `[0.16.10]`
  holding). No new Article; below the firewall. Ratifier: Chinmay.

### [0.16.10] — 2026-07-01 — CLI package version synced to the framework version
- Caught before anything left this machine: `cli/package.json` was still `1.0.0` while
  `CONSTITUTION.md` was at `0.16.9` — two independently-numbered axes for one self-hosted
  repo, exactly the confusion flagged (but not fixed) in `[0.16.9]`'s own compiled brief.
  Ratifier corrected this directly, before the GitHub push completed.
- **Policy, now a statute** (`cli/AGENT.md`): the CLI package's `version` always equals this
  repo's `CONSTITUTION.md` header version. One number for the whole repo. A future version
  bump that updates one without the other is the bug.
- `cli/package.json` → `0.16.10`; rebuilt and re-verified via `npm pack --dry-run`
  (tarball now correctly reads `@chinmaygit/constitution-cli@0.16.10`).
- No new Article; below the firewall. Ratifier: Chinmay.

### [0.16.9] — 2026-07-01 — `constitution-cli` released to GitHub Packages
- Ran `compile-prompt` on this repo with the task "make `constitution-cli` release-ready" —
  the first real end-to-end use of the framework's own L4 compiler on itself, not on DSAMind.
  It placed cleanly under **F-II** (already ratified: "a versioned package manager
  installation... satisfies this rule") with **ADR-0001** as precedent, and correctly
  surfaced three unpinned conventions as FRICTION rather than guessing: registry choice,
  package name vs. ADR-0001's own `create-constitution` precedent text, and license.
  Ratifier resolved all three: **GitHub Packages**, **keep `constitution-cli`** (as
  `@chinmaygit/constitution-cli` — the scope is GitHub Packages' mandatory requirement, not
  a naming choice), **MIT**.
- **This repo now has a GitHub remote** (`chinmaygit/constitution_project`) — the first time
  since founding. `cli/AGENT.md`'s "not published to npm" statute is rewritten to describe
  the real published state instead of a standing prohibition; `cli/README.md`'s install
  instructions are now real, not aspirational.
- `cli/package.json` gained the metadata a registry actually needs (`license`, `repository`,
  `homepage`, `bugs`, `author`, `files` allowlist, `publishConfig` pointed at
  `npm.pkg.github.com`) — verified via a clean `npm run build` and `npm pack --dry-run`
  (6 files, 5.5kB, no `src/`/`node_modules`/`test-run` leakage) before publishing.
- Added `LICENSE` (MIT) at the repo root and inside `cli/` (npm only auto-includes a LICENSE
  found in the package root, which is `cli/`, not the git repo root).
- **Motivation, on the record**: this is explicit groundwork for DSAMind to adopt the
  framework as a real package dependency instead of the manual cross-repo workflow this
  session used throughout (symlinked skills, hand-copied AGENT.md sections) — reducing
  cross-project friction was the stated reason for doing this now rather than later.
- No new Article; below the firewall (infra/release decision, same weight as ADR-0001's own
  original ruling — no new ADR filed, this is an instance of it, not a new question of law).
  Ratifier: Chinmay.

### [0.16.8] — 2026-07-01 — Two new skills: `propose-amendment` + `ratify-amendment` — the amendment lifecycle, operationalized
- Last two of the five new skills from the skills-rehaul brainstorm — the redirected "Bill
  draft / Bill pass" idea, pointed at where that metaphor actually fits:
  `process/amendment-lifecycle.md`'s `PROPOSE → WARN-ONLY → EVIDENCE → RATIFY` pipeline (and,
  where real measurement is warranted, `process/experiment-lifecycle.md`'s
  `DRAFT → PRE-REGISTERED → RUNNING → MEASURED → GRADUATED`), which had zero tooling despite
  being fully specified prose with its own literal PROPOSE/RATIFY vocabulary.
- **`propose-amendment`** (new, `1.0.0`): formalizes a candidate change to *already-ratified*
  L0/L1 law — not a brand-new Article from scratch (`harvest-articles`'s job), but a promotion,
  a demotion, stale Article text, a new L0 line, or a certiorari ruling. Drafts the before/after
  text, authors the ADR every L1 change ships with, and judges whether the candidate needs a
  pre-registered experiment (a real hypothesis about catch-rate/friction) or just the ratifier's
  agreement — never writes `status: RATIFIED` either way.
- **`ratify-amendment`** (new, `1.0.0`): the highest-consequence write in the framework, and
  written to know it. Its precondition is not optional: an explicit, attributable human decision
  already in hand — quoted, not inferred. Only after that does it mechanically flip
  `status: RATIFIED`, mark superseded text (never deleted, always forward-linked), finalize the
  ADR, archive the graduated experiment as evidence, and write the ledger entry naming the
  ratifier (F-IV). It reports a pre-registered decision rule's actual verdict honestly — even a
  `REJECT` the human overrides — rather than let the record imply cleaner evidence than existed.
- **F-I evidence for this pair, too**: every entry in this ledger from `[0.16.1]` onward is a
  small hand-run instance of propose-then-ratify (draft the change, say why, get a nod, write it
  down) — this is a proven shape scaled to the formal L0/L1 case, not a speculative addition.
- Cross-wired `harvest-articles`'s closing step (`1.0.0` → `1.0.1`) to hand its drafts to these
  two rather than ending ambiguously at "the ratifier decides."
- **This closes the five-skill rehaul** (`harvest-articles` `[0.16.5]`, `harvest-statutes`
  `[0.16.6]`, `reconcile-findings` `[0.16.7]`, this pair `[0.16.8]`), alongside the
  `sync-operator` rename (`[0.16.4]`) done ahead of it. Ten skills total, every one of them now
  either newly proven-by-codification or already proven-by-history before it existed.
- No new Article; below the firewall (two new skills + a cross-reference). Ratifier: Chinmay.

### [0.16.7] — 2026-07-01 — New skill: `reconcile-findings` (closes what an audit reports)
- Third of five new skills from the skills-rehaul brainstorm — the one with the strongest F-I
  evidence of all of them: `[0.16.1]` through `[0.16.6]` in this ledger **are** six hand-run
  instances of exactly this procedure. This skill codifies an already-repeated practice.
- `skills/reconcile-findings/SKILL.md` (new, `1.0.0`): consumes `audit-structure`'s (always
  read-only) and `audit-conformance`'s findings and actually closes them. Its core discipline —
  and the sharpest thing any of the five new skills does — is classifying **by what the fix
  touches, not by the finding's category**: the same finding type (`broken-ref`, `orphan`,
  `duplication`, `field-gap`) can be below the firewall (a dead link, a map gap, a stale
  version number — fix and batch) or above it (anything editing an Article's `principle` /
  `serves` / `fitness` / `status` / `party`, or a Preamble line — draft it, ask the ratifier,
  never write). Gets this wrong in the permissive direction and it silently amends the
  constitution without ratification — named explicitly as the worst failure mode it can have.
- Routes what isn't its job: spec-adoption pin drift → `sync-operator`; an ungoverned rule
  that's really a domain invariant → `harvest-articles`; craft-rule annotation → reuses
  `harvest-statutes`'s method rather than reinventing it. Explicitly never touches product code
  — a `VIOLATED` Article's remediation stays separate, human-authorized work, same boundary
  `audit-conformance` already draws for itself.
- Cross-wired: `audit-structure` (`1.3.0` → `1.3.1`) now points to it as "how to actually close
  a finding I reported."
- No new Article; below the firewall. Ratifier: Chinmay.

### [0.16.6] — 2026-07-01 — New skill: `harvest-statutes` (the L2 harvest, operationalized)
- Second of five new skills from the skills-rehaul brainstorm. Closes the last "referenced but
  unbuilt" gap: `process/statutes.md`'s bottom-up harvest (name existing `AGENT.md`/`CLAUDE.md`
  rules as L2, structure them) was pointed at by `derive-statutes`'s own "Do NOT use for" line
  but had no skill of its own.
- `skills/harvest-statutes/SKILL.md` (new, `1.0.0`): harvests from what already exists only
  (never invents), filters through the same four-criteria L1 inclusion test `harvest-articles`
  uses (opposite default — fails routes here, passes routes there), annotates
  `rule · serves · enforced-by · why` per `templates/statute.md`, catches orphans (dead vs.
  evidence of a missing Article) and duplicates (F-II), and — unlike `harvest-articles` — **may
  write L2 directly**, since L2 sits below the firewall (F-IV only gates L0/L1).
- **Deliberately scoped out ongoing L2 drift auditing** — `process/statutes.md`'s own
  Maintenance section says the framework ships no such skill on purpose (L2 moves in weeks; a
  periodic constitutional audit is the wrong cadence). That stays project-owned tooling (e.g.
  DSAMind's own governance-sweep skill). This skill is the one-time-or-additive harvest only.
- **F-I evidence already exists** here too: DSAMind's own L2 was harvested this way by hand
  (ledger `[0.7.0]`) — 15 statutes annotated, an F-II duplicate consolidated. Codifying a proven
  process, not a speculative one.
- Cross-wired `derive-statutes`'s body text to name this skill alongside `process/statutes.md`.
- No new Article; below the firewall. Ratifier: Chinmay.

### [0.16.5] — 2026-07-01 — New skill: `harvest-articles` (Step B, operationalized)
- First of five new skills from the skills-rehaul brainstorm. Closes the gap flagged during
  that brainstorm: `process/defining-l0-l1.md`'s Step B (author L1 Articles) was referenced
  by name in two other skills' "Do NOT use for" lists but had no skill of its own — a product
  could define L0 and derive L2-from-ratified-L1, but could not author L1 for the first time
  without hand-executing prose.
- `skills/harvest-articles/SKILL.md` (new, `1.0.0`): harvests candidate Articles from real
  sources only (ADRs, a pattern repeated across features, an incident, or the domain-invariant
  subset of an existing `AGENT.md`/`CLAUDE.md`) — never invents to fill a quota; a project
  with no real decision history yet gets zero candidates, honestly. Filters through the L1
  inclusion test, drafts survivors per `templates/article.md`, reality-checks conformance by
  reusing `audit-conformance`'s method, and proposes `status: PROPOSED` only — it can never
  write `RATIFIED` (F-IV; mirrors `audit-conformance`'s own status/conformance split).
- **F-I evidence for this skill already exists**: DSAMind's own L1 was built ground-up by
  hand-executing this exact procedure (`registry.md`'s "Promoted mechanisms" row for F-V/F-VI,
  ledger `[0.2.0]`–`[0.3.0]`). This skill codifies a process already proven once, not a
  speculative one.
- **Cross-wired the other five skills** that reference this step: `audit-conformance`,
  `define-preamble`, `derive-statutes` now point at `harvest-articles` by name instead of the
  vague "Step B, a separate flow." `derive-statutes` still points at `process/statutes.md`'s
  prose for the L2 harvest — that gap closes next (`harvest-statutes`).
- **Found and fixed an unrelated, pre-existing bug while wiring this up**: `audit-conformance`,
  `compile-prompt`, `define-preamble`, and `derive-statutes` all linked to `process/`/`templates/`
  with one extra `../` (e.g. `../../../process/compiler.md` from a file two levels deep, not
  three) — six broken relative links, resolving to nothing, that `audit-structure`'s own
  reference-integrity check should have caught and never did. Fixed all six; verified every
  cross-link in `skills/` now resolves on disk.
- No new Article; below the firewall (a new skill + reference fixes). Ratifier: Chinmay.

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
