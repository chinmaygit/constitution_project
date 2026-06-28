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

## Open design question (deciding as we go)

The compiler is the one governed component whose internals are not yet settled, because
*which* slices of L0–L3 to pull for a given task is a judgment call:

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
