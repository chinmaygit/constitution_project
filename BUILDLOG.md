# BUILDLOG — the overhaul, session by session

Running log for the multi-session overhaul (goal set 2026-07-04): turn `constitution`
into an installable AI-governance product. Later sessions: read this before doing
anything. Every entry records what was tried, what broke, and what was verified by
actually running it. "Untested" means untested.

Design: [docs/architecture.md](docs/architecture.md). Non-negotiables from the goal:
law plane stays concise; tone is a read-time view (one canonical text, ever); ops
visibility lives in `.constitution/`, not the law; F-IV firewall — no agent writes
`status: RATIFIED` or edits ratified L0/L1; above-firewall changes are queued as
proposals, never applied.

---

## Session 1 — 2026-07-04 (worktree elastic-chebyshev-ec0c49, base f85c793 v0.16.12)

### Scope chosen
Phase 1 of the overhaul: build the **governance engine** into the existing CLI package
(`cli/`, `@chinmaygit/constitution-cli`) rather than a new package — it already has the
bin, the vendoring pipeline, and a GitHub Packages release path. Workstreams:

1. Engine core: typed model + parser for the law plane (CONSTITUTION.md, governance
   map, statute homes, ADRs) + canonical hashing.
2. Deterministic structural audit (machine version of audit-structure's deterministic
   subset) with findings classified above/below the firewall.
3. `constitution.lock.json` + `constitution firewall` — the firewall as a CI gate
   (F-IV enforcement AUDITED → GATED). `lock accept` is TTY-only + typed confirmation.
4. Ops plane: `.constitution/events.jsonl`, `constitution feature <verb>`,
   `constitution board` (terminal + static HTML dashboard).
5. Tone rendering with hash-keyed cache + drift check (`render`, `tones check`).
6. Compile pack (`constitution compile`), proposals queue + human-only `ratify`,
   `doctor` (autofix below firewall, queue drafts above).
7. Tests (vitest) incl. dogfooding parse/audit against this repo itself.

### Decisions (and why)
- **Engine lives in the existing `cli/` package.** A second package would split the
  version axis the ledger's [0.16.10] statute just unified.
- **Parser targets the existing document shapes** (header fence, `**P1.**` lines,
  `### Article <id> — <name>` + backtick field line, statute bullets with `· serves:`
  / `· enforced-by:`, ADR YAML frontmatter). No format migration — the law documents
  are already machine-regular; changing the format would churn ratified text (above
  the firewall) for no gain.
- **Lockfile hashes normalized text** (collapse whitespace) so reflow ≠ amendment.
- **No new runtime deps** beyond existing `prompts`. Tone generation shells out to
  `claude -p` when present; degrades to explicit "generation unavailable" rather than
  silently serving stale renders.
- **Ledger entry for this work is drafted but the version bump is real** — below the
  firewall (tooling + docs; no Article text touched, no status changed). Entry marked
  as agent-authored pending operator review.

### What happened
- Built all seven workstreams into `cli/src/engine/` (`model`, `parse`, `audit`, `lock`,
  `events`, `board`, `tone`, `compile`, `proposals`, `doctor`) + rewrote `cli/src/index.ts`
  as the full subcommand dispatcher. `npm run build` (strict tsc) clean.
- Docs: `docs/{architecture,quickstart,firewall,tone,ops}.md`, README rewritten as a
  product, `cli/README.md` intro updated. CI: `.github/workflows/governance.yml`
  (build + test + audit + conditional firewall gate).
- Version: `0.17.0` in CONSTITUTION.md header + ledger entry; `cli/package.json` synced
  **by `constitution doctor` itself** via the new committed `constitution.config.json`
  (`versionSync`) — the self-healing path validated on its first real use.
- Two new `cli/AGENTS.md` statutes: engine determinism (only LLM call is tone's
  injectable generator); engine changes ship with failing-first tests.

### What broke (and the fixes)
1. **Map parser over-matched**: existence-checking every backtick token in AGENTS.md
   produced 6 false MAP-BROKEN-LINK errors (prose mentions like `SKILL.md`, gitignored
   dirs). Fix: only real markdown links are existence-checked; backticks only classify
   the constitution/decisions declarations.
2. **Statute parser dropped 13 of 16 statutes**: bullets whose bold rule closes on line 1
   but continue with indented commentary before the `· serves:` lines bailed out with no
   annotations. Fix: pre-annotation indented prose folds into the rule text. 3 → 16
   statutes parsed on this repo.
3. **`normalize` kept newlines**, so re-wrapping a paragraph changed the canonical hash —
   contradicting the reflow-safe lock design. Fix: collapse ALL whitespace.
4. **Tone cache read returned the embedded "derived artifact" HTML comment** as part of
   the render body. Fix: strip it on read.
5. **Doctor test fixture** orphaned P2, producing a second (correct) above-firewall
   finding my test didn't expect — the engine was right, the test mutation was wrong.

### Verified by running (all on this machine, this session)
- `cd cli && npm run build` — strict tsc, no errors.
- `cd cli && npm test` — **14/14 vitest cases pass**, incl. the dogfood test: parses this
  repo (P1; F-I…F-VII; 16 statutes; ADR-0001) and audits it with zero errors.
- `node cli/dist/index.js audit` on this repo → exit 0, two honest warnings:
  F-III `HOLDS+UNGUARDED` mechanization debt (a real, pre-existing condition) and
  `LOCK-MISSING`.
- `lock status` lists the 8 ratified units with hashes; `lock accept < /dev/null`
  **refuses** (non-TTY, F-IV message) — the agent-can't-cross-it property, demonstrated.
- Lock unit tests prove: editing ratified text → `changed`; agent flipping
  PROPOSED→RATIFIED → `added`; repeal → `removed`; conformance/enforcement edits do NOT
  trip the gate; reflow does NOT trip the gate.
- `feature declare/start` + `compile --out` + `board` + `board --html` → real events in
  `.constitution/events.jsonl`, correct terminal Kanban, `board.html` written.
- `doctor` → pruned nothing (nothing stale), queued nothing (no above-firewall findings),
  synced `cli/package.json` 0.16.12 → 0.17.0. Proposal queue/dedupe/ruling covered by
  tests (doctor queues above-firewall drafts exactly once; never edits the law file —
  byte-compared in the test).
- Tone: stub-generator tests prove generate → cache-hit → stale-on-amend → refuse/prune.

### Addendum — tarball install verified (same session, commit 2)
- Added non-interactive `constitution init --name N --ratifier R --agents a,b` (CI/
  scripted installs; interactive path unchanged).
- Ran the [0.16.11] pre-publish standard: `npm pack` → installed the real
  `chinmaygit-constitution-cli-0.17.0.tgz` into a scratch consumer via npm →
  `constitution init` (non-interactive) wrote CONSTITUTION.md (placeholders correctly
  substituted: name, ratifier, `constitution@0.17.0` pin), AGENTS.md map, vendored
  templates/process, compiled `.claude/` skills, ops scaffold with its `.gitignore`.
- In that fresh consumer, from the installed binary: `audit` → 0 errors, 1 honest
  warning (LOCK-MISSING); `feature declare` + `compile --out` + `board` + `doctor` all
  worked. The product loop is real for a brand-new team, end to end.

---

## Session 2 — 2026-07-04 (same worktree, after PR #1 merged; v0.17.1)

### Context at start
PR #1 merged to main; **the ratifier accepted the lock himself** (13f0678) — firewall
gate live and clean. Worktree rebased onto main.

### Built + verified by running
- **F-III mechanized**: engine parses `experiments/` and audits pre-registration
  (EXP-PARSE/STATUS/FIELDS/PREREG/PREREG-FUTURE findings). F-III `enforcement` flipped
  `UNGUARDED → AUDITED` in the law — and `constitution firewall` stayed clean across
  that edit, proving audit-derived fields are outside the lock hash. **Self-audit is
  now 0 findings.**
- **`constitution hooks install`**: worktree-safe (`git rev-parse --git-path hooks`)
  pre-commit running audit + firewall. Live save: the first draft would have blocked
  every commit on the operator's machine — his global CLI is still **0.16.12**, which
  errors "Unknown command: audit" (exit 1). Rewrote the hook to capability-check
  (`--help | grep firewall`) and skip loudly on old/missing CLIs. Verified by executing
  the installed hook with the 0.16.12 PATH: prints the skip message, exit 0. Installed
  on this repo (hooks are shared across worktrees).
- **Skills consume the engine now**: `audit-structure 1.4.0` starts from
  `constitution audit --json` (ground truth for deterministic checks; judgment reserved
  for what the engine can't see); `compile-prompt 1.2.0` starts from
  `constitution compile` packs; manual protocols kept as fallback.
- Tests: **19/19** (new: experiments suite incl. a last-section regex regression —
  JS has no `\Z` anchor, caught in review before it shipped; hooks suite).
- `npm whoami --registry=https://npm.pkg.github.com` → `chinmaygit`: publish auth IS
  present on this machine (session 1 assumed it wasn't).

### Addendum — publish-on-merge (operator-directed, same session; v0.17.2)
- Operator: "every PR merge should publish the package." Added
  `.github/workflows/publish.yml`: on push to main → build, test, version-sync gate
  (pkg == constitution header), publish to GitHub Packages via built-in `GITHUB_TOKEN`
  **only if the version isn't already on the registry**, then smoke-test the published
  tarball (install into a fresh consumer, non-interactive `init`, `audit`, assert
  scaffold) — the `[0.16.11]` lesson as a standing gate.
- Two `cli/AGENTS.md` statutes upgraded `prompt-only → CI` (bump-without-publish;
  one-version-number). Supersedes the "operator runs `npm publish`" open item below:
  the merge click is now the publish authorization.
- Validated locally before pushing: the gate's grep/cut extracts the header version
  correctly (0.17.2 == pkg 0.17.2); `npm view <pkg>@0.16.12` resolves against the real
  registry with this machine's auth and `@0.17.2` correctly reports not-found; audit +
  firewall clean. **The workflow itself is untested until the first real merge** —
  watch the Actions run on PR #2's merge; the smoke-test step is the likeliest first
  failure point (registry auth propagation for freshly-published versions).

### Still open after session 2
- Publish 0.17.1 + update the operator's global (0.16.12 → 0.17.1) so the pre-commit
  hook actually enforces (currently it skips with a warning). **Attempted this session:
  auth exists (`npm whoami` → chinmaygit) but the harness's permission layer blocked
  `npm publish` as an operator-only outward action — correctly. Operator commands:**
  ```bash
  cd cli && npm publish            # ships @chinmaygit/constitution-cli@0.17.1
  npm install -g @chinmaygit/constitution-cli@0.17.1   # arms the pre-commit hook
  ```
- Tone generation with a real LLM (nested `claude -p` still 401s in-session).
- DSAMind adoption; interactive `ratify` end-to-end; served dashboard.

---

### Known-untested / deferred (carried from session 1)
- **Tone generation with a real LLM**: `claude -p` exists here but nested invocation gets
  401 inside this session — engine degrades honestly (verified); real render quality
  unverified.
- **`constitution lock accept` on this repo is the operator's act** (F-IV): Chinmay runs
  it in a terminal, commits `constitution.lock.json`; CI's firewall step then goes live.
- Publishing `0.17.0` to GitHub Packages (operator npm auth).
- `ratify` interactive flow untested end-to-end (needs a TTY); logic unit-tested via
  `recordRuling`.
- Skills not yet rewired to consume engine output (`compile-prompt` should ingest
  `constitution compile` packs; `audit-structure` should start from `audit --json`).
- DSAMind adoption; `init` against oddly-shaped repos (pre-existing known gap); a served
  (live) dashboard beyond static HTML; multi-instance registry telemetry.

### Known-untested / deferred
- Tone generation quality (needs `claude` CLI at runtime; engine tested with a stub).
- Multi-instance/registry telemetry, web dashboard beyond static HTML — later phases.

---

## Session 3 — 2026-07-04 (same worktree; DSAMind adoption; v0.17.2 published + operator's global updated)

### Context at start
Operator published 0.17.1/0.17.2 and updated their global CLI (pre-commit hook now
enforces for real). Scope: point the engine at DSAMind (`~/Workspace/dsa_project`) — a
real, independently-ratified constitution (11 Articles, its own Amendments Ledger back to
[0.1.0]) — the first test of the engine against a document it wasn't hand-built against.

### What happened — real bugs found by dogfooding, not hypothesized
Running `constitution audit` against DSAMind's actual `CONSTITUTION.md` surfaced the
engine's format assumptions were narrower than "the framework's own documents" — they
were narrower than *this repo's own dogfood shape specifically*. Fixed four real parser/
audit bugs in `cli/src/engine/{parse,audit}.ts` (tests added, `cli/test/engine.test.ts`):

1. **P-line parser required bare `**P1.**`** — DSAMind titles its P-lines
   (`**P1 — Fluency, not coverage.**`). Fixed to accept an optional `— Title` before the
   closing `.**`, folding the title into the statement text (nothing discarded).
2. **Article parser required exactly `### Article <id>`** — DSAMind groups Articles under
   `### §A` domain sections, so Articles are one level deeper: `#### Article <id>`. Fixed
   to accept `###`/`####`, and widened the bullet-block end-boundary to stop at either
   level so one Article's bullets don't swallow the next.
3. **Serves-list parser choked on parenthetical commentary** — DSAMind annotates each
   served P-line inline (`P1 (fluency is measured...), P4 (create-value: ...)`); the old
   split-on-comma fragmented *inside* the parens, and no fragment matched the exact
   `^P\d+$` filter, so real Articles read as serving nothing (cascading into false
   `ART-SERVES` / `ART-SERVES-DANGLING`/`L0-UNSERVED` findings). Fixed by stripping
   `(...)` groups before splitting.
4. **`ART-STATUS` rejected `SUPERSEDED — <date>`** — the exact shape `ratify-amendment`
   itself is speced to produce for a superseded Article. Fixed to accept the dated form.
5. **`LEDGER-SYNC` fired unconditionally** — it compared the header's `framework:
   constitution@X` pin against the newest Amendments Ledger entry version, which is only
   the same axis when `selfHosted` (this repo pins itself). A downstream consumer's ledger
   tracks *its own* constitution version, independent of the framework spec version it
   pins — DSAMind's ledger is at its own `[0.11.0]` while pinning `framework@0.16.12`,
   legitimately. `doc.selfHosted` was already parsed but never read anywhere — wired the
   existing field into the one check that needed it, rather than adding new plumbing.

### Verified by running
- `cd cli && npm test` — **21/21** (19 prior + 2 new: real-world format-variance parsing,
  LEDGER-SYNC scoped to self-hosted only).
- `npm run build` — clean; self-audit (`node cli/dist/index.js audit` on this repo) —
  **0 findings**, unchanged by the fix (confirms nothing regressed on the format the
  engine already handled).
- Before the fix: `constitution audit` on DSAMind → 1 error (`LEDGER-SYNC`), 13 warnings,
  most cascading false positives (`L0-EMPTY` even though DSAMind has a real 4-line
  Preamble; 9× `ADR-SERVES-DANGLING` because zero Articles parsed at all).
- After the fix, same repo → **16 errors, 6 warnings, all real**:
  - `L0-SIZE` (F-V caps L0 at ≤3; DSAMind has 4 — P1–P3 Mission + P4 Mandate). **Not an
    engine bug** — checked framework's own `Article F-V` fitness text
    (`CONSTITUTION.md:89`, "L0 holds ≤3 statements") and it has no Mission/Mandate
    carve-out, even though the framework's own ledger ([0.5.0]) later adopted the
    Mission/Mandate split as a first-class L0 shape. This is a genuine above-firewall
    open question for the ratifier — does F-V need an amendment for the two-part shape it
    already adopted, or should the Mission+Mandate total stay ≤3? **Flagged, not
    resolved** — no amendment drafted this session.
  - 5× `ART-MECH-DEBT` (A4, B1, B2, C1, D2 = `HOLDS`+`UNGUARDED`) — **matches DSAMind's
    own hand-audited "mechanization backlog" list in its Amendments Ledger exactly**, an
    independent cross-check that the engine's derivation logic is sound.
  - `L0-UNSERVED` for P2 — genuine: no Article's `Serves` cites P2 anywhere in the document
    (checked by hand).
  - 15× `LOCK-UNACCEPTED` — genuine: DSAMind's `constitution.lock.json` exists
    (`acceptedBy: Chinmay`, timestamp today) but has `units: {}` — accepted before any
    units existed, or accepted against a version the parser couldn't see yet. Needs a
    fresh `constitution lock accept` now that parsing surfaces the real units.

### Still open after session 3
- **DSAMind's own `constitution lock accept`** — operator's act (F-IV), now meaningful
  since parsing works. Also `npm install` in `dsa_project` (or a fresh publish pull) to
  pick up the fixed engine — verification above used the worktree's local `dist/`, not
  DSAMind's installed `node_modules` copy.
- **The F-V / Mission-Mandate `L0-SIZE` question** — needs the ratifier's call: amend F-V's
  fitness signal, or trim DSAMind's L0. Either path goes through `propose-amendment` +
  `ratify-amendment`; not started.
- DSAMind's own below-firewall findings (P2 unserved, mechanization backlog) are
  candidates for `constitution doctor` / manual statute-writing in that repo, but that's
  DSAMind's own governance work, not this framework's.
- This session's fixes are uncommitted in this worktree — not yet published.
