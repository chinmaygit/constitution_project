# Experiment lifecycle

An **experiment is a candidate rule under measurement.** It lives *outside* L1 — in a
consumer project's `experiments/` registry (the lab notebook) — until it graduates.
L1 only ever contains ratified law.

The governing discipline is **pre-registration** (Article F-III): the hypothesis,
metric, and decision rule are frozen *before* the experiment runs, so results can't move
the goalposts.

## States

```
DRAFT
  → PRE-REGISTERED      hypothesis + metric + decision rule frozen; timestamp recorded
    → RUNNING (shadow)  the candidate's fitness signal evaluates in warn-only mode —
                        it is logged but does NOT block PRs or change UX yet
      → MEASURED        the sample/duration target is reached
        ├─ GRADUATED    decision rule met → becomes an L1 amendment + an ADR;
        │               the experiment file is archived as the evidence packet
        ├─ REJECTED     decision rule not met → archived with the reason
        └─ ITERATE      promising but inconclusive → spawn vN+1 with a revised design
```

## What "warn-only / shadow" means

A new rule never blocks anything on day one. Its fitness check runs and accumulates
evidence (catch rate, false-positive rate, friction cost) while the product behaves as if
the rule weren't there. A rule earns its enforcement by its track record — the
feature-flag pattern applied to law. Only at `GRADUATED` does the check become blocking.

## Graduation outputs (three at once)

1. The candidate Article flips to `status: RATIFIED` in the product's `CONSTITUTION.md`.
2. An ADR (L3) records the *why* — context, the evidence, alternatives considered.
3. The experiment file is archived (kept, not deleted) as the amendment's evidence packet.

Rejected and iterated experiments are kept too: they are the record of what was tried and
why it didn't hold.

## Then: does it climb to the framework?

Graduation lands a rule in the *product's* L1. Ask the promotion-gate question: is what
graduated a **domain rule** or a **governing mechanism**?

- domain rule (e.g. "one pattern per problem") → stays in the product.
- governing mechanism (e.g. "experiments must be pre-registered") → propose it to this
  framework, where it runs the framework's *own* experiment + amendment process before it
  becomes a meta-Article. Self-hosting all the way down.

Template: [../templates/experiment.md](../templates/experiment.md).
