<!-- Copy into a product's decisions/ as NNNN-<slug>.md. ADRs are L3 case law: dated, never
     deleted — superseded only, with a forward link. Each cites the law it interprets. -->

---
id: <NNNN>
title: <the ruling in one line>
status: proposed | accepted | superseded
date: <YYYY-MM-DD>
supersedes: []          # ADR ids this replaces
superseded_by: []       # filled in when a later ADR replaces this one (never delete — forward-link)
serves: []              # L0/L1/L2 ids this interprets, e.g. [P1, A1] or [Prisma-invariant]; [] = pure infra/stack
amends: []              # L1 Article ids this ruling proposes to change (the PROMOTE step), if any
trigger: <architectural | stack-invariant | migration | certiorari>
---

## Question of law
<the precise question that forced a decision: the collision between two Articles, or the gap
the law doesn't cover. For a pure infra/stack ADR (`serves: []`), state the technical question
instead — it's a decision record, not case law.>

## Ruling
<what was decided, as an imperative. This is the precedent later work cites.>

## Constitutional impact
<which L0/L1 line(s) this interprets (`serves`) and how. If the ruling *extends* an Article,
name the amendment it proposes (`amends`) and let the amendment lifecycle run. A pile of ADRs all
interpreting one Article is the evidence that the Article itself should be amended.
"None — infra/stack decision" is a valid answer.>

## Consequences
<positive · negative / accepted trade-offs · follow-up work>

## Alternatives considered
<each option and why it was rejected>
