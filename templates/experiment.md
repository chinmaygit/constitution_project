<!-- Copy into a product's experiments/ as EXP-NNNN-<slug>.md. Fill ALL fields before RUNNING. -->

# EXP-<NNNN> · <short name>

```
candidate        → Article <N>.<n> (draft, not yet law)
status           DRAFT | PRE-REGISTERED | RUNNING | MEASURED | GRADUATED | REJECTED | ITERATE
pre-registered   <YYYY-MM-DD>          # must predate the first RUNNING day (Article F-III)
ratifier         <human name>          # required for an L1 candidate (Article F-IV)
```

## Hypothesis
<what you believe will happen, and to which measurable outcome>

## Enforcement during the experiment
<warn-only / shadow: what is computed-and-logged but NOT yet shown or blocking>

## Metric
<the primary signal, plus any guardrail signal (e.g. false-positive rate)>

## Decision rule  (frozen — do not edit after PRE-REGISTERED)
- RATIFY if <condition> over <sample / duration>
- REJECT otherwise
- ITERATE if <inconclusive-but-promising condition>

## Result  (fill at MEASURED)
<the numbers, the call, and a link to the ADR if GRADUATED>
