---
name: define-preamble
description: Defines a product's L0 Preamble (the constitutional vision) by running the framework's finite L0 elicitation protocol, distilling the answers into ≤3 identity statements, stress-testing them, and writing the ratified Preamble into the product's CONSTITUTION.md. Use when a user wants to define, draft, bootstrap, or solidify a product's vision, preamble, north star, or L0 — or start a constitution from the ground up. Triggers - "define the preamble", "define L0", "what's our vision", "bootstrap the constitution", "solidify the north star", "start a constitution for X". Do NOT use for - defining L1 Articles (use `harvest-articles`, which requires this skill to run first), editing an already-ratified Preamble (that is an amendment - use the amendment lifecycle), or product/marketing copy.
metadata:
  scope: project
  layer: L0
  enforces: F-V
  version: "1.0.1"
---

# Define a product's Preamble (L0)

Run the framework's Step A ([process/defining-l0-l1.md](../../process/defining-l0-l1.md))
to produce a product's L0. The durable principle is Article **F-V**; the question set is
the [L0 elicitation protocol](../../process/l0-elicitation.md).

## The firewall rule (read first)

**L0 is human-held. You may help phrase; you may never originate.** The founder supplies
the identity claims; your job is to distill, stress-test, and record — then wait for an
explicit human ratification before anything is written as L0.

## Procedure

1. **Elicit.** Run the L0 elicitation protocol's questions in order — start by naming the
   **parties** (commonly owner + users), then cover **Solution, Value, Grow, Monetize**. Ask
   conversationally; don't dump them all at once.

2. **Read the signals** while answers come in:
   - If the core-unit and durability questions converge on the same answer, flag it — that
     claim is almost certainly L0.
   - If the tie-breaker answer names two values instead of an order, push for the order
     (means vs. end, and the fallback when forced).
   - Keep Grow/Monetize answers as the **Mandate** (owner-facing), distinct from the Mission.

3. **Distill candidates.** Compose Q1–3 into candidate statements; sharpen each with Q4–5.
   Phrase them crisply and declaratively, founder's voice, not yours.

4. **Filter to L0.** Apply the subtraction test to every candidate: *"If you deleted this,
   would it still be the same product (and the same business)?"* Keep only the claims that
   fail subtraction. Distill to **≤3 Mission** statements + **≤1 Mandate** statement (Grow +
   Monetize). Prefer fewer.

5. **Set the apex.** Record the tie-breaker's resolved order as the top of the product's
   priority hierarchy (it seeds conflict resolution, not just L0).

6. **Get ratification.** Present the ≤3 statements + the apex and ask the human to ratify or
   edit. Do not proceed until they sign off in their own words.

7. **Write it.** Only after ratification, write the Preamble into the product's
   `CONSTITUTION.md` under `## L0 — Preamble`, with the conflict apex, the framework pin,
   and a dated Amendments Ledger entry. Use [templates/article.md](../../templates/article.md)
   only for L1 — L0 is plain declarative statements with **no fitness function attached**.

8. **Feed back.** If the run revealed a weak or ambiguous question, refine the elicitation
   protocol and note it under that file's "Reading the answers" / "Status" sections. A real
   run improving the protocol is the framework working as intended (F-I).

## Hard rules

- **Never originate L0.** Distill and phrase only; the founder owns the vision.
- **Never write L0 before explicit human ratification.**
- **Keep it to ≤3 statements.** If you can't, the subtraction test wasn't applied hard enough.
- **Never attach a fitness function to an L0 line.** L0 is identity, not a check; enforcement
  is indirect (every L1 Article must trace to it).
- **Stop at L0.** Defining L1 Articles is a separate step (`harvest-articles`) — do not
  drift into it here.
