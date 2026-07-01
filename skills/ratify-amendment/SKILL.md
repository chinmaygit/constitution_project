---
name: ratify-amendment
description: Transcribes a ratification decision the human has ALREADY made — never makes the decision itself. Given a `propose-amendment` package (or a `harvest-articles` draft) and an explicit, attributable human "yes," it mechanically flips `status: RATIFIED` (or marks the superseded clause `SUPERSEDED — <date>` with a forward link, or archives a sunset rule), links the ADR, archives the graduated experiment file as the evidence packet if one exists, bumps the product's version, and writes the Amendments Ledger entry naming the ratifier (F-IV). Surfaces a pre-registered decision rule's actual verdict honestly — met or not — even if the human ratifies despite a REJECT; it never hides that to make the ratification look cleaner. Use only after a human has explicitly said yes to a specific drafted package — never to decide whether something should be ratified. Triggers - "ratify this amendment", "the ratifier approved, write it in", "graduate this experiment", "supersede Article <N> with this", "sunset this Article", "write the ratification". Do NOT use for - drafting or evidencing a proposal (use `propose-amendment`), deciding whether to ratify (that decision is the human's alone, made outside this skill, before it ever runs), or applying a below-firewall fix (use `reconcile-findings` — no ratification ceremony needed for those).
metadata:
  scope: project
  layer: cross-cutting
  enforces: F-IV
  version: "1.0.0"
---

# Write down a ratification decision that already happened

The mechanical half of [process/amendment-lifecycle.md](../../process/amendment-lifecycle.md)'s
`RATIFY` stage, and (when there was one) the *graduation outputs* of
[process/experiment-lifecycle.md](../../process/experiment-lifecycle.md): flip status, link the
ADR, archive the evidence. This skill has exactly one input it cannot proceed without — a human
has already decided — and exactly one output it must never produce on its own initiative:
`status: RATIFIED` written from an inference instead of a decision.

## What it does NOT do

**It does not decide.** Every other skill in this framework that touches L0/L1 — `harvest-articles`,
`propose-amendment`, `reconcile-findings` — stops at drafting and asking. This skill is what runs
*after* the asking is answered. If you find yourself reaching for this skill to see whether
something *should* be ratified, stop — that question belongs to the human, asked directly, before
this skill is even invoked.

## The firewall rule (read first — this is the whole skill)

**The trigger for running this skill IS the human's already-made decision. This skill does not
produce that decision; it transcribes it.** Before doing anything else, state plainly: who
ratified, when, and what they actually said — a direct statement ("yes, ratify this"), not
silence, not an inference from "they'll probably be fine with it," not a prior approval of a
*different* draft being stretched to cover this one. If that isn't in hand, **stop** and get it —
do not proceed on a guess. This is the single highest-consequence write in the entire framework;
treat the precondition with more suspicion, not less, precisely because the mechanical part that
follows is easy.

## Procedure

1. **Confirm the precondition, out loud, first.** Name the ratifier, the date, and quote or
   closely paraphrase their actual decision. No precondition, no proceeding.

2. **Check the decision rule, if one exists — and report it honestly.** If this candidate went
   through `propose-amendment`'s experiment path, read the pre-registered decision rule and the
   measured result. State plainly whether it was met (`RATIFY` per its own frozen condition),
   missed (`REJECT`), or ambiguous (`ITERATE`). **If the human ratifies despite a `REJECT` or
   `ITERATE` verdict, that is their call to make — but say so explicitly in the ledger entry.**
   Never let a ratified amendment's record imply its evidence was cleaner than it was.

3. **Write the new law.** Flip `status: RATIFIED` on the drafted Article (or write the new
   Preamble line). If this supersedes existing text, mark the old clause verbatim
   `SUPERSEDED — <date>` in the same edit, with a forward link (`→ Article <N> v2` / `→ ADR-<NNNN>`)
   — the old text is **never deleted** (amendment-lifecycle.md). For a demotion, write the
   already-drafted statute text into the product's declared L2 home in the same change, and
   mark the old Article superseded with a forward link to it. For a sunset, mark the Article
   `SUPERSEDED — <date> (sunset: <reason>)` with no replacement to link.

4. **Finalize the ADR.** Confirm `status: accepted`, `serves`/`amends` correctly naming what
   changed, and that it's listed in `decisions/INDEX.md`. This is L3 — never deleted, only
   superseded with a forward link, same as the Article it interprets.

5. **Archive the evidence.** If there was a pre-registered experiment, mark it `GRADUATED`,
   `REJECTED`, or `ITERATE` per the actual verdict (step 2) and keep the file — it is the
   amendment's evidence packet, archived not deleted, per experiment-lifecycle.md.

6. **Bump the version; write the ledger entry.** Name the ratifier explicitly (F-IV — the one
   field this ledger entry cannot omit). State what changed, why (pointing at the ADR), and what
   it superseded (pointing at the old clause, still readable in the same document).

7. **Flag the WARN-ONLY → BLOCKING flip, if applicable.** If a fitness signal was running in
   shadow mode, note in the report that it should now become blocking — this skill doesn't wire
   the CI change itself (that's implementation work), it only makes sure the flip isn't forgotten.

8. **Report.** Ratifier + decision quoted, decision-rule verdict (if any) reported honestly, what
   was written and where, what was superseded, the commit/tag it landed in.

## Output shape

```
RATIFIED BY: <name>, <date>
  decision: "<what they actually said>"

DECISION RULE VERDICT (if a pre-registered experiment existed)
  <RATIFY per rule | REJECT per rule, ratified anyway — human override, noted | ITERATE>

WRITTEN
  Article <N>: status PROPOSED → RATIFIED
  superseded: "<old text>" → SUPERSEDED — <date> → Article <N> v2 / ADR-<NNNN>
  ADR: decisions/<NNNN>-<slug>.md — status: accepted
  experiment: experiments/EXP-<NNNN>-<slug>.md — GRADUATED (archived, not deleted)

FOLLOW-UP
  fitness signal <name>: WARN-ONLY → should now be BLOCKING (CI wiring is separate work)

LANDED AS
  <commit sha / tag>
```

## Hard rules

- **Never ratify without an explicit, attributable human decision already in hand.** Silence,
  inference, or a prior approval of something else are not consent. Stop and ask instead.
- **Never decide whether to ratify.** That question is not this skill's to answer, ever — not
  even when the evidence looks overwhelming.
- **Never delete a superseded clause.** Mark it, forward-link it, keep it verbatim.
- **Never hide a decision rule's actual verdict.** Report `REJECT`/`ITERATE` honestly even when
  the human ratifies anyway — the record's honesty matters more than making the amendment look clean.
- **The ledger entry always names the ratifier** (F-IV) — this is the one field it can never omit.
- **Don't wire the CI/blocking mechanism.** Flag the WARN-ONLY → BLOCKING flip; implementing it
  is separate work.
- **This is the highest-consequence write in the framework.** When any part of the precondition
  is unclear, stop. The cost of asking again is small; the cost of writing `RATIFIED` on an
  inference is a real, silent constitutional violation.
