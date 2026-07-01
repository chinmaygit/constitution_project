# The L4 compiler

`L4 = compile( task, L0..L3 )` — the implementing agent receives a focused briefing, not
the whole governance corpus. This document is the spec for that compile step.

```
inputs   task description  +  L0–L3 (the source)
output   one compiled prompt (templates/compiled-prompt.md), every line provenance-tagged
         back to the rule it came from ([L0·P1], [L1·Art III], [L2·S3], [L3·ADR-0010])
```

The compiled prompt ends with a **definition of done** = the fitness assertions the output
must pass. Those same assertions run independently in CI.

## Decided (v1) — the `compile-prompt` skill

The compile step is implemented as the **`compile-prompt`** skill
(`skills/compile-prompt/`). Two settled choices:

- **Compile-only handoff.** The skill emits the briefing artifact and stops; a *separate*
  actor session implements it. Keeping compile and build apart keeps the provenance trail
  clean and the briefing auditable.
- **Certiorari STOP.** A task that serves an L0 line **no Article enforces**, or that
  collides with two Articles, is not compiled — the skill STOPS and escalates to the
  ratifier (F-IV). The compiler never fabricates governance to make a task fit; that gap is
  the signal the constitution must grow.
- **Selection = strategy 2** (below): L0 always, all `RATIFIED` L1, plus task-matched L2/L3.
- **Deterministic discovery.** The compiler never relies on being *told* which files hold L2. It
  bootstraps from the product's root `AGENT.md` (the **governance map**: constitution path, ADR
  dir, L2 convention) to dynamically discover statute homes — the map is
  the source of truth, not a hardcoded glob. A
  statute home not reachable from the map is FRICTION. *(Surfaced by the first headless compile
  test, where a strict reader nearly missed a nested statute home.)*
- **Negative invariants + no invented conventions.** The compiler tags not just the Articles a task
  *implements* but every `RATIFIED` Article its write path could *break* (reachability, not
  relevance); and a definition-of-done assertion may never instruct the actor to invent an unpinned
  convention — that is a FRICTION gap for the ratifier.

## Open design question — selection strategy (F-III experiment)

*Which* slices of L0–L3 to pull for a given task is the one judgment call still open as an
experiment:

- pull too little → the actor violates an invariant nobody mentioned.
- pull too much → you've shipped the whole constitution again, and relevance is lost.

Candidate selection strategies to test against DSAMind tasks:

1. **Tag-match** — each rule is tagged (e.g. `schema`, `ai-review`, `payments`); the task
   declares tags; pull the intersection. Cheap, deterministic, but brittle on phrasing.
2. **Always-include + relevant** — L0 always; all `RATIFIED` L1; plus L2/L3 matched to the
   task surface. Safe, slightly verbose.
3. **Agent-selected with audit** — an agent picks the slices and the audit later checks
   whether any *unincluded* rule was violated, feeding selection back as an experiment.

Per F-III, the choice between these is itself an experiment: pre-register a metric
(e.g. invariant-violations-per-PR vs. prompt length) and let DSAMind decide. Until then,
default to strategy 2 (safe over clever).
