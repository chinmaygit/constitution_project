# constitution

**Governance for AI-native product development** — where coding agents are not tools
that read docs, but first-class actors in the system that governs them. `constitution`
takes a product's vision (L0), the durable invariants that enforce it (L1), the
operational rules that implement those invariants (L2), and the dated decisions that
interpret all of it (L3) — and compiles that stack, on demand, into the exact briefing
an implementing agent runs for a given task (L4). The point of every layer: shrink the
gap between what a human intended and what the agent actually shipped, and make that
gap **checkable**.

```bash
npm install -g @chinmaygit/constitution-cli
cd your-product && constitution init
```

→ **[docs/quickstart.md](docs/quickstart.md)** for the ten-minute path.

## The layers (see `process/layers.md`)

| Layer | Holds | Velocity | Agent standing |
|-------|-------|----------|----------------|
| L0 | Preamble — product vision | rarely | read-only |
| L1 | Articles — durable, fitness-checked invariants | quarters | propose only |
| L2 | Statutes — operational/craft rules | weeks | draft + propose |
| L3 | Case law — ADRs, decisions in context | per decision | author, accrues |
| L4 | Compiled briefing handed to the implementing actor | every task | author + enforce |

A **firewall** sits between L1 and L2: agents own everything below it and may only
*petition* above it. Humans hold the sovereign pen on vision and invariants — and the
engine makes that a CI gate, not a hope: `constitution.lock.json` records the hash of
every ratified unit as a human accepted it, and `constitution firewall` fails the
build on any unaccepted drift. See [docs/firewall.md](docs/firewall.md).

## The three planes (see [docs/architecture.md](docs/architecture.md))

- **Law plane** — `CONSTITUTION.md`, statute homes, `decisions/`. Small, dense,
  durable; nothing about scale ever accumulates here.
- **Engine** — the `constitution` CLI: deterministic parse → audit → firewall gate →
  L4 compile pack → tone render → doctor. LLM judgment stays in the skills that
  consume engine output.
- **Ops plane** — `.constitution/` in each instance: delivery events, the Kanban
  board (`constitution board --html`), tone caches, the ratification queue. Volume
  lives here, references the law by id, and is deletable without touching legality.
  See [docs/ops.md](docs/ops.md).

## Reading the law in your tone

One canonical, ratified text per unit — ever. `constitution render F-II --tone plain`
is a derived view, cache-keyed by the canonical hash, stale by construction the moment
the law is amended. See [docs/tone.md](docs/tone.md).

## Self-healing, split by the firewall

`constitution doctor` fixes what it may (stale caches, version sync, scaffold gaps)
and drafts what it may not: above-firewall findings become proposals in
`.constitution/proposals/`, ruled on only by `constitution ratify` — interactive,
human, typed confirmation.

## The two-project model

```
constitution/  (this repo)        consumer products (DSAMind is the founding instance)
  defines L0–L4, the lifecycles,     adopt via `constitution init`, pin a version,
  the engine, and the templates      and DISCOVER rules by running experiments
        │                                         │
        └────────── adopt + pin @version ─────────┘
                  ◄────────────────
        promote proven *governing mechanisms* back up
        (domain rules stay in the product)
```

The framework grows **only** through evidence produced by live projects (`F-I`,
discovery before codification). Consumers and promoted mechanisms: [registry.md](registry.md).

## Self-hosting

This repo is governed by its own framework — `CONSTITUTION.md` here is an *instance*
of the spec in `process/` + `templates/`, the CI in `.github/workflows/governance.yml`
runs the engine's audit + firewall on it, and the engine's test suite parses this very
repo as its dogfood fixture. If the framework can't govern itself, it can't govern
anything.

## Repo map

- `CONSTITUTION.md` — the framework's own L0–L1 + amendments ledger
- `process/` — the spec: layers, amendment + experiment lifecycles, conflict resolution, the compiler
- `templates/` — copy-me templates (Article, Statute, ADR, experiment, compiled prompt)
- `decisions/` — the framework's own L3 case law
- `skills/` — the LLM-judgment skills (`define-preamble`, `harvest-articles`, `compile-prompt`, …)
- `cli/` — the engine + installer (`@chinmaygit/constitution-cli`; see `cli/README.md`)
- `docs/` — architecture, quickstart, firewall, tone, ops
- `registry.md` — consumers + promoted mechanisms · `BUILDLOG.md` — the overhaul's running log

Each of `skills/`, `templates/`, `decisions/`, `process/`, `cli/` declares its own L2
statutes in a nested `AGENTS.md` — see the root [AGENTS.md](AGENTS.md) governance map.
