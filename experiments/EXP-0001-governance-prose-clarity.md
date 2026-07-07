# EXP-0001 · Governance prose clarity

```
candidate        → Statute or Article, TBD (see Constitutional impact below)
status           RUNNING
pre-registered   2026-07-06
ratifier         Chinmay
```

## Hypothesis
A sentence-length ceiling (30 words) plus a stacked-qualifier pattern check (2+
distinct qualifier types — em-dash aside, except/unless/scoped-to clause, nested
parenthetical — anywhere in the same field) catches real convolution-drift in
Articles, Statutes, and ADRs with an acceptably low false-positive rate. A
150-word cap on Amendments Ledger entries catches narrative that belongs in
BUILDLOG.md instead.

## Enforcement during the experiment
WARN-ONLY. `constitution audit` reports `PROSE-SENTENCE-LEN`, `PROSE-STACKED-QUALIFIER`,
and `LEDGER-LENGTH` as `severity: warn` findings — never `error`, never blocking the
pre-commit hook or CI. A one-time baseline snapshot (`.constitution/prose-baseline.json`,
written automatically on the first `constitution audit` run after this file's
pre-registered date) separates pre-existing known-dense text from genuinely new
findings, so already-known bloat (the current F-II text, the existing Ledger
entries) doesn't contaminate the false-positive-rate signal below.

## Metric
- **False-positive rate**: of all NEW findings (`baseline: false`) surfaced across
  the next 15 commits touching `CONSTITUTION.md` or `decisions/`, what share are
  judged (by the ratifier, at MEASURED) to be flagging text that is NOT actually
  convoluted — i.e. legitimate enumeration, necessary precision, or a false split
  from the sentence-splitter's known abbreviation/numbered-list limitations.
- **Guardrail (catch rate)**: the checks correctly flag the two known-bad
  calibration cases — Article F-II's current `Principle`/`Fitness` text
  (`PROSE-SENTENCE-LEN`) and Ledger entry `[0.17.0]` (`LEDGER-LENGTH`) — verified
  in `cli/test/engine.test.ts` as a standing regression guard, independent of the
  15-commit window.

## Decision rule (frozen — do not edit after PRE-REGISTERED)
- RATIFY if false-positive rate is under 20% over the 15-commit window AND both
  guardrail cases still fire.
- REJECT if false-positive rate is 20% or higher after one retuning pass of the
  thresholds (sentence-word ceiling, qualifier patterns, ledger word cap).
- ITERATE if the window closes with fewer than 5 NEW findings to judge (too little
  signal to call either way) — extend the window by 15 more commits before
  re-measuring.

At RATIFY: the ratifier decides Statute vs. Article placement. The L0-trace/
tech-swap analysis done during the eng review (a Vale-enforced or any
tool-enforced rule fails "survives a tech swap" per `process/layers.md`)
provisionally points to Statute, but is not binding — the ratifier may override
with the false-positive/catch-rate evidence in hand.

## Result (fill at MEASURED)
Not yet measured.
