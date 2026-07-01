# constitution

A framework for governing software development in the AI era — where coding agents
are not tools that read docs, but **first-class actors in the system that governs them**.

This repo defines *how to govern* a product's evolution. It does not contain any one
product's rules. Those live in the products that adopt it.

## The two-project model

```
constitution/  (this repo)        DSAMind  (the founding instance + live lab)
  defines L0–L4, the amendment       adopts the templates + process,
  + experiment lifecycles, the       pins a framework version, and
  compiler, and the templates        DISCOVERS rules by running experiments
        │                                         │
        │  adopt + pin @version                   │
        └────────────────────────►────────────────┘
                                  ◄────────────────
                  promote proven *governing mechanisms* back up
                  (domain rules stay in the product)
```

The framework grows **only** through evidence produced by live projects — that is its
first article (`F-I`, discovery before codification). DSAMind is the founding instance.

## The layers (see `process/layers.md`)

| Layer | Holds | Velocity | Agent standing |
|-------|-------|----------|----------------|
| L0 | Preamble — product vision | rarely | read-only |
| L1 | Articles — durable, fitness-checked invariants | quarters | propose only |
| L2 | Statutes — operational/craft rules | weeks | draft + propose |
| L3 | Case law — ADRs, decisions in context | per decision | author, accrues |
| L4 | Compiled briefing handed to the implementing actor | every task | author + enforce |

A firewall sits between L1 and L2: agents own everything below it and may only
*petition* above it. Humans hold the sovereign pen on vision and invariants.

## Self-hosting

This repo is governed by its own framework. `CONSTITUTION.md` is an *instance* of the
spec in `process/` and `templates/`, applied to the framework's own development.
If the framework can't govern itself, it can't govern anything.

## Repo map

- `CONSTITUTION.md` — the framework's own L0–L1 (self-hosted) + amendments ledger
- `process/` — the spec: layer definitions, amendment + experiment lifecycles, conflict resolution, the L4 compiler
- `templates/` — copy-me templates: Article, Experiment, ADR, compiled prompt
- `decisions/` — the framework's own ADRs (its L3 case law)
- `skills/` — the operational skills (`compile-prompt`, `audit-structure`, `audit-conformance`, `define-preamble`, `derive-statutes`, `constitution-upgrade`) — how day-to-day work actually happens
- `cli/` — `constitution-cli`, the package-managed installer that scaffolds this framework into a product repo (see `cli/README.md`)
- `registry.md` — which projects use the framework, and which mechanisms were promoted from where

Each of `skills/`, `templates/`, `decisions/`, `process/`, and `cli/` declares its own L2
authoring statutes in a nested `AGENT.md` — see the root [AGENT.md](AGENT.md) governance map.

## Consuming the framework (from a product repo)

The framework installs via its CLI (`cli/`), per
[ADR-0001](decisions/0001-package-managed-distribution.md) — never by hand-vendoring
templates. See [`cli/README.md`](cli/README.md) for the exact steps (it's local-only
today, not yet published to a registry).

Pin the version you've adopted in your product's `CONSTITUTION.md` header
(`framework: constitution@X.Y.Z`) and track it in [registry.md](registry.md). Bump the
pin only once you've actually adopted the newer spec — never ahead of adoption (see
`skills/constitution-upgrade`).
