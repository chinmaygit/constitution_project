# The constitution framework — Constitution

```
framework: constitution@0.4.0   (self-hosted)
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

Each Article carries two independent fields: **`status`** (legal force, the ratifier's
decision: `PROPOSED → RATIFIED → SUPERSEDED`) and **`conformance`** (whether the framework
itself satisfies the fitness signal now, the audit's finding: `HOLDS | VIOLATED |
UNVERIFIED`). Ratification is agreement; conformance is reality.

### Article F-I — Discovery before codification
`status: RATIFIED` · `conformance: HOLDS`

- **Principle** — No rule is added to this framework until it has been proven in at
  least one live project. DSAMind is the founding instance.
- **Serves** — P1.
- **Fitness** — every "promoted mechanism" row in [registry.md](registry.md) links to
  the originating experiment + ADR in a consumer project.
- **Why** — a framework written from imagination ossifies around guesses; one written
  from usage carries its evidence with it.

### Article F-II — One home per rule
`status: RATIFIED` · `conformance: HOLDS`

- **Principle** — Every governed rule lives in exactly one layer (L0–L4), and is never
  duplicated across layers, nor across the framework and an instance.
- **Serves** — P1.
- **Fitness** — no rule's text appears verbatim in two layer documents (audit check).

### Article F-III — Experiments are pre-registered
`status: RATIFIED` · `conformance: HOLDS`

- **Principle** — Every candidate rule declares its hypothesis, metric, and decision
  rule **before** it runs. The decision rule is frozen for the experiment's duration.
- **Serves** — P1.
- **Fitness** — every file in a consumer's `experiments/` has all three fields filled
  and a `pre-registered:` timestamp earlier than its `RUNNING` status.

### Article F-IV — No self-ratification above the firewall
`status: RATIFIED` · `conformance: HOLDS`

- **Principle** — Changes to L0 or L1 — in the framework **or** any instance — require a
  human ratifier. Agents may propose, gather evidence, and author/enforce L4, but may
  not promote a rule across the firewall alone.
- **Serves** — P1.
- **Fitness** — every L0/L1 amendment in the ledger below names a human ratifier.

### Article F-V — L0 is discovered, distilled, and human-held
`status: RATIFIED` · `conformance: HOLDS`

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
`status: RATIFIED` · `conformance: HOLDS`

- **Principle** — L1 Articles are *harvested from observed practice* (past decisions,
  ADRs, incidents, existing rules), never invented. Each must pass the inclusion test,
  trace to an L0 line, and declare `principle / serves / fitness / status / conformance`.
  An Article's `status` (legal force) is the ratifier's decision; its `conformance` is set
  by running the fitness signal against the live code. The two are independent — a
  `RATIFIED` Article may be `VIOLATED` (tracked debt). **Never mark `conformance: HOLDS`
  while the code violates the fitness signal.**
- **Serves** — P1.
- **Fitness** — every L1 Article carries the five fields; every `serves` resolves to a real
  L0 line; no Article is marked `conformance: HOLDS` while its fitness signal fails.
- **Why** — a constitution that *claims conformance* it doesn't have is fiction; separating
  agreement (status) from reality (conformance) keeps it honest without hiding debt.
- **Proven** — DSAMind's L1 was harvested and reality-checked by this process (2026-06-28).

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
  and the `define-preamble` skill (`.claude/skills/`).
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
