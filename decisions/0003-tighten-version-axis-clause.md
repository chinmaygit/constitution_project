---
id: 0003
title: Tighten F-II's version-axis clause into three numbered, unambiguous axes
status: accepted
date: 2026-07-05
supersedes: []
superseded_by: []
serves: [F-II]
amends: [F-II]
trigger: certiorari
---

## Question of law
ADR-0002 added a version-axis clause to F-II's Principle and Fitness. The two sentences
disagree on scope: Principle's self-hosted exception names two axes (pin + ledger); Fitness
lists all three before the same "except," reading like it covers all three. That ambiguity
already produced a wrong statute this session (`cli/AGENTS.md` claimed the tooling axis
collapses too, citing F-II).

## Ruling
Rewrite both sentences as a numbered list, with the exception scoped to axes 1+2 only in
both places. No behavior change — code and the corrected statute already assume the 2-axis
reading; this just makes the text say what's already true.

**Principle**, replace ADR-0002's two sentences with:
> A version number is a governed fact too, and three exist, each with exactly one home:
> 1. the instance's own Amendments Ledger version,
> 2. the framework spec version it has adopted (the header pin — never bumped ahead of
>    what's actually adopted),
> 3. the framework tooling installed (the instance's own package manifest).
>
> These three are never compared as one axis, with one exception: in the framework's own
> self-hosted repo, axis 1 and axis 2 are the same number by design. Axis 3 is never folded
> into that collapse, even here.

**Fitness**, replace ADR-0002's sentence with:
> No check treats axis 1 and axis 2 as the same number for any instance except the
> framework's own self-hosted repo; no check ever treats axis 3 as the same number as
> either of the others, anywhere.

## Constitutional impact
Replaces those two sentences in F-II. `status`/`serves`/`enforcement`/`party` unchanged. Old
text kept verbatim in the ledger, marked `SUPERSEDED — <date>`, forward-linked here. Does not
supersede ADR-0002 — its ruling still stands, this only fixes the wording.

## Consequences
Closes the ambiguity; no enforcement changes.

## Alternatives considered
New Article instead of re-amending F-II — rejected, same reason as ADR-0002: still one home
per rule, just stated more precisely.
