# The constitution framework — Constitution

```
framework: constitution@0.1.0   (self-hosted)
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

### Article F-I — Discovery before codification
`status: RATIFIED`

- **Principle** — No rule is added to this framework until it has been proven in at
  least one live project. DSAMind is the founding instance.
- **Serves** — P1.
- **Fitness** — every "promoted mechanism" row in [registry.md](registry.md) links to
  the originating experiment + ADR in a consumer project.
- **Why** — a framework written from imagination ossifies around guesses; one written
  from usage carries its evidence with it.

### Article F-II — One home per rule
`status: RATIFIED`

- **Principle** — Every governed rule lives in exactly one layer (L0–L4), and is never
  duplicated across layers, nor across the framework and an instance.
- **Serves** — P1.
- **Fitness** — no rule's text appears verbatim in two layer documents (audit check).

### Article F-III — Experiments are pre-registered
`status: RATIFIED`

- **Principle** — Every candidate rule declares its hypothesis, metric, and decision
  rule **before** it runs. The decision rule is frozen for the experiment's duration.
- **Serves** — P1.
- **Fitness** — every file in a consumer's `experiments/` has all three fields filled
  and a `pre-registered:` timestamp earlier than its `RUNNING` status.

### Article F-IV — No self-ratification above the firewall
`status: RATIFIED`

- **Principle** — Changes to L0 or L1 — in the framework **or** any instance — require a
  human ratifier. Agents may propose, gather evidence, and author/enforce L4, but may
  not promote a rule across the firewall alone.
- **Serves** — P1.
- **Fitness** — every L0/L1 amendment in the ledger below names a human ratifier.

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

### [0.1.0] — 2026-06-28 — Founding draft (proposed)
- Bootstrapped the framework from the DSAMind governance discussion.
- Ratified F-I…F-IV and P1.
- **Bootstrap exemption:** F-I cannot apply to this founding commit — the framework
  cannot pre-prove its own first rules in a live project before it exists. This commit
  is the one permitted exception. The *first amendment after this* must arrive through a
  real DSAMind experiment, honoring F-I from then on.
