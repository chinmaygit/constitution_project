# Layers — L0 to L4

The framework sorts every governed rule into one of five layers. Authority and
amendment-velocity are **inversely correlated with permanence**: the higher a rule
sits, the slower it changes and the less an agent may touch it.

```
L0  Preamble        product vision / north star      rarely     read-only
L1  Articles        durable invariants, fitness-checked  quarters   propose only
─── firewall ──────────────────────────────────────────────────────────────────
L2  Statutes        operational / craft rules        weeks      draft + propose
L3  Case law        ADRs — decisions in context      per case   author, accrues
L4  Compiled prompt the briefing handed to the actor every task author + enforce
```

A **firewall** sits between L1 and L2. Agents own everything below it (author case law,
draft statutes, write and run the compiled prompt's fitness checks) and may only
*petition* above it. A human holds the pen on L0 and L1.

---

## L0 — Preamble

The *why*. One or two statements that define what the product **is**. Everything in
every layer below must trace to an L0 line. This is the only layer a fitness function
cannot check — it is the thing the fitness functions exist to serve.

Keep it small. If you can't fit the vision on a few lines, it isn't a vision yet.

A product's Preamble has two halves: a **Mission** (Solution + Value — what the product is and
the value it creates for users) and a **Mandate** (Grow + Monetize — how the platform grows and
gets paid). It also names the **parties** the constitution governs (commonly the owner + its
users), which become each Article's `party` tag. See [l0-elicitation.md](l0-elicitation.md).

## L1 — Articles

The small set of **domain invariants** that enforce the vision, written so a machine can
check them. Each Article carries: the principle, the L0 line it serves, a fitness signal,
a `status` (legal force) and a `conformance` (code reality) — see below.

**An Article is a domain invariant** — a constraint on what the product *means* that
every feature must obey. The inclusion test (must pass all four):

1. **General** — constrains many features, not one.
2. **Traces to L0** — you can draw the line to the vision.
3. **Falsifiable** — a single check could prove it violated.
4. **Survives a tech swap** — replacing a library doesn't touch it. *(This is the L1/L2 line.)*

An Article is **not** a feature (a thing you build), **not** a statute (L2 craft rule),
and **not** a per-feature rule (those live in feature specs, below L2). When a future
library could invalidate the rule, it's a statute, not an Article.

Each Article carries three fields. **`party`** is which governed party it protects (named in
the Preamble — commonly User or Owner). **`status`** is its legal force, set by the
ratifier (`PROPOSED → RATIFIED → SUPERSEDED`); **`conformance`** is whether the live code
satisfies the fitness signal right now, set by the audit (`HOLDS | VIOLATED | UNVERIFIED`).
Ratification is agreement; conformance is reality. A `RATIFIED` + `VIOLATED` Article is law
the code currently breaks — tracked debt, surfaced not hidden. `RATIFIED` does **not** mean
"implemented"; `conformance: HOLDS` does.

## L2 — Statutes

The operational hard rules — *how* you build, not *what* you are. Home of a product's
`CLAUDE.md` / `AGENTS.md` rules. Agents may draft these; they change in weeks. A rule a
new library could rewrite belongs here.

## L3 — Case law

ADRs: dated decisions that *interpret* the layers above for a specific situation. They
accrete forever and are never deleted, only superseded with a forward link. A resolved
conflict-escalation becomes an ADR; a stack of ADRs on one Article is the evidence that
the Article itself needs amending (see `conflict-resolution.md`).

## L4 — Compiled prompt

You do not hand-write L4. It is **compiled on demand**:

```
L4 = compile( task, L0..L3 )  →  the exact instruction prompt the actor receives
```

L0–L3 are source; L4 is the emitted binary the implementing agent runs. The compiler
selects only the slices of each layer that touch the task and emits a focused briefing,
ending with a **definition of done** = the fitness assertions the output must pass. Those
same assertions also run independently in CI: prompt-time guidance, commit-time
enforcement. See `compiler.md` (selection logic is still being designed). Template:
[../templates/compiled-prompt.md](../templates/compiled-prompt.md).
