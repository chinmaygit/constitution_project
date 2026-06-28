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
- `registry.md` — which projects use the framework, and which mechanisms were promoted from where

## Consuming the framework (from a product repo)

1. Pin a version in your product's `CONSTITUTION.md` header: `framework: constitution@0.1.0`.
2. Vendor the templates you use into your repo (no submodules — keep it a loose dependency).
3. When this repo bumps, pull the new templates in a normal PR.
