---
name: propose-amendment
description: Formalizes a candidate change to already-RATIFIED L0/L1 law — not a brand-new Article from scratch (`harvest-articles`), but a change to what's already binding — into a ratification-ready package per `process/amendment-lifecycle.md`. Drafts the new text (before/after), authors the accompanying ADR (`templates/adr.md`, every L1 change ships with one), and decides whether the candidate needs measurement or just agreement: a genuine hypothesis about catch-rate/friction gets pre-registered as an experiment (`process/experiment-lifecycle.md`, `templates/experiment.md`) and wired WARN-ONLY (shadow — logged, not yet blocking); an obvious fix or a certiorari ruling skips straight to ratification-ready. Never writes `status: RATIFIED` and never marks a decision rule's outcome as met before it is. Use for a promotion candidate (L2→L1), a demotion candidate (L1→L2), an Article whose text has drifted stale against the code (`audit-conformance`'s "code past the Article" finding), a genuinely new L0 line, or formalizing an above-firewall draft `reconcile-findings` already surfaced. Triggers - "propose an amendment", "draft a change to Article <N>", "promote this statute to an Article", "demote this Article", "this Article's text is stale, fix it", "pre-register an experiment for this rule", "formalize this for ratification". Do NOT use for - authoring a brand-new Article's first draft from real sources (use `harvest-articles` — this skill formalizes a candidate, it doesn't harvest one), applying a below-firewall fix directly (use `reconcile-findings`, no ceremony needed), or actually ratifying (use `ratify-amendment` — this skill never sets `status: RATIFIED`).
metadata:
  scope: project
  layer: cross-cutting
  enforces: F-III
  version: "1.0.0"
---

# Turn a candidate change into a ratification-ready package

Operationalizes [process/amendment-lifecycle.md](../../process/amendment-lifecycle.md)'s
`PROPOSE → WARN-ONLY → EVIDENCE` stages — and, when the candidate needs real measurement rather
than just agreement, [process/experiment-lifecycle.md](../../process/experiment-lifecycle.md)'s
`DRAFT → PRE-REGISTERED → RUNNING (shadow)`. Every version bump in this framework's own
`CONSTITUTION.md` ledger is a small instance of this: draft the new text, say why, get a nod. A
formal amendment is the same shape scaled up — an evidence packet and a shadow period before
something becomes binding, because L1 ossifies on purpose.

## What it does NOT do

It doesn't harvest a brand-new Article from scratch — that's `harvest-articles`; this skill
starts from a candidate that already exists (a promotion signal, a demotion signal, stale
Article text, a certiorari ruling, or a harvested-but-not-yet-ratified draft that needs the
formal evidence packet). It doesn't apply below-firewall fixes — those need no ceremony, use
`reconcile-findings` directly. It never sets `status: RATIFIED` — that is the one thing only
`ratify-amendment`, after a human decision, ever writes.

## The firewall rule (read first)

**You may draft, evidence, and pre-register. You may never enact.** Every artifact this skill
produces — the new Article/Preamble text, the ADR, the experiment file — is a proposal. A
pre-registered decision rule is **frozen once set** (Article F-III) — you may not edit it after
`RUNNING` starts to make a later result fit. If a run's actual outcome doesn't match what you
expected, that's data, not a reason to rewrite the rule that measures it.

## Procedure

1. **Identify the candidate and its source.** A promotion signal (a statute that passes all
   four L1 inclusion-test criteria), a demotion signal (an Article that turns out tech-coupled),
   stale Article text (the code moved past what the Article says — `audit-conformance`'s finding),
   a genuinely new L0 line, or a certiorari ruling that extends an Article. Cite the source
   exactly — the signal, the finding, or the ruling that started this.

2. **Draft the new text.** Before/after, in full: the Article's `principle` / `serves` /
   `fitness` / `enforcement` / `party` (per [templates/article.md](../../templates/article.md))
   or the Preamble line, exactly as it would read if ratified. For a promotion, also draft the
   statute's *removal* from L2 in the same change (F-II — one home; it doesn't live in both
   layers even during the proposal). For a demotion, draft the statute it becomes (hand the
   actual L2 annotation to `harvest-statutes` once ratified — don't do that step here).

3. **Decide: measurement or agreement?** Ask whether the candidate has a genuine hypothesis
   worth testing (will this actually catch real issues? what's the false-positive/friction
   cost?) or whether it just needs a human to confirm it's true:
   - **Needs measurement** → pre-register an experiment. Create
     `experiments/EXP-<NNNN>-<slug>.md` from [templates/experiment.md](../../templates/experiment.md):
     hypothesis, the metric + guardrail, and a **decision rule frozen before `RUNNING` starts**
     (F-III). Wire the fitness signal **WARN-ONLY** — it runs and logs, it does not block or
     surface to users yet. Set `status: PRE-REGISTERED` with today's date, predating `RUNNING`.
   - **Needs only agreement** (a certiorari ruling, an obvious fix, a harvested draft with clear
     evidence already) → skip the experiment; the ADR *is* the evidence packet. Say explicitly
     why no measurement period is needed — don't silently skip it without a reason on record.

4. **Author the ADR.** Every L1 change ships with one
   ([templates/adr.md](../../templates/adr.md)): the question of law, the ruling (the drafted
   text from step 2), `serves`/`amends` naming the Article, and the alternatives considered.
   This is the *reasoned* record (the ledger, written later by `ratify-amendment`, is the
   *legible* one — what/when vs. why, per amendment-lifecycle.md).

5. **State what happens to the old rule.** If this supersedes existing text, name it explicitly:
   the old clause is never deleted — it will be marked `SUPERSEDED — <date>` with a forward link
   when ratified. Draft that forward-link note now so `ratify-amendment` only has to transcribe it.

6. **Report — the package, not a decision.** The candidate, the drafted text, the ADR, the
   experiment file (if any) and what it's watching for how long, and the one open question: is
   this ready for the ratifier now, or does it need to run in shadow first?

## Output shape

```
CANDIDATE
  source: <promotion signal / demotion signal / stale-Article finding / certiorari ruling>
  drafted: "<new text, in full>"          (supersedes: "<old text>" if applicable)

EVIDENCE PATH
  [ ] measurement needed → experiments/EXP-<NNNN>-<slug>.md pre-registered
        hypothesis: <...>  metric: <...>  decision rule: <frozen, verbatim>
        warn-only wiring: <what's now logging, not yet blocking>
  [ ] agreement only → no experiment; ADR is the evidence packet. why: <reason>

ADR
  decisions/<NNNN>-<slug>.md — serves: <ids> · amends: <Article> · status: proposed

READY FOR
  → ratify-amendment, once the ratifier decides (now, or after the shadow period ends)
```

## Hard rules

- **Never write `status: RATIFIED`.** This skill's output is always a proposal package,
  never a decision.
- **A decision rule is frozen once `PRE-REGISTERED`.** Do not edit it after `RUNNING` starts —
  that defeats the entire point of pre-registration (F-III).
- **A promotion drafts the L2 removal in the same change.** Never let a rule sit in both L1-draft
  and L2 at once past the proposal stage (F-II).
- **State explicitly why a candidate skips the experiment path**, if it does. Silent skipping
  looks like corner-cutting even when it's the right call.
- **Every candidate cites its exact source** — the signal, finding, or ruling. No proposal from
  vibes.
- **Don't do `harvest-statutes`'s or `harvest-articles`'s job.** Draft what a demotion/promotion
  becomes; don't annotate or harvest it yourself.
