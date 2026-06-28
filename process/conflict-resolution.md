# Conflict resolution

Two things rules do that need a process: they **collide** (two rules disagree on one PR),
and they prove **incomplete** (no rule covers the case). Both route through the same
escalation.

## Priority hierarchy

Each product declares its own order; the framework's own order (for governing itself) is:

```
evidence > framework/instance integrity > one-home-per-rule > simplicity > automation > convenience
```

A product's order is domain-shaped. DSAMind's, for example:

```
pedagogical integrity > correctness > single source of truth > simplicity > performance > DX
```

The top slot is the differentiator — DSAMind ranks *pattern pedagogy above raw
correctness* (a passing-but-wrong-pattern solution is a failure to align). Encoding it
means features inherit the value instead of re-litigating "but the tests pass."

## Escalation (the certiorari move)

```
1. DETECT    an agent finds a collision, or a case the law doesn't cleanly cover
2. ATTEMPT   apply the priority hierarchy
3. ESCALATE  if the order is silent/tied, or the rule itself looks wrong, the agent
             STOPS and asks the human — it does not guess on an L0/L1 matter
4. RULE      the human decides
5. RECORD    the ruling becomes an ADR (L3 case law)
6. PROMOTE   if the ruling extends an Article, the ADR also proposes the amendment,
             which runs the amendment lifecycle (warn-only → ratify)
```

## Case law that climbs to L1

A single ADR patches a single case. But when the **same** escalation recurs — several
ADRs all interpreting one Article — that pile of ADRs is the evidence packet arguing the
Article itself is incomplete and should be amended. Repeated case law becomes a
constitutional amendment, the way repeated rulings eventually prompt new legislation.

> Worked example (DSAMind): Article I says "one pattern per problem," but *Course
> Schedule* is genuinely taught two ways (BFS topo-sort vs DFS cycle detection). The agent
> escalates rather than guessing; the human rules "split into two Problem records"; that
> ruling, recorded as an ADR and seen repeatedly, is exactly how DSAMind's sub-clause
> "Article I.2 — no multi-pattern ambiguity" came to exist.
