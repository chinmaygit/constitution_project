---
name: reconcile-findings
description: Takes the deterministic findings from `audit-structure` and/or `audit-conformance` (or runs them fresh) and closes them — classifying each by whether the FIX touches ratified L0/L1 text (above the firewall: draft it, ask the ratifier, never write) or not (below the firewall: fix it, batch it, report it). Applies below-firewall fixes directly (broken links, governance-map gaps, F-II duplicates, stale-but-already-adopted version numbers, orphan statutes) and drafts + asks for above-firewall ones (an Article's principle/serves/fitness/status/party, the Preamble, a promotion/demotion signal) — never enacting a ratifier's decision itself. Use after running an audit and wanting the findings actually closed, not just reported; when asked "fix what the audit found", "close these findings", "apply the audit report", "reconcile the drift", or "clean up the constitution". Do NOT use for - running the audits with no intent to fix (just invoke `audit-structure`/`audit-conformance` directly), authoring new L1/L2 content from scratch (use `harvest-articles`/`harvest-statutes`), deciding to ratify a drafted amendment (that's the ratifier's own call — this skill drafts and asks, it never flips `status: RATIFIED`), adopting a newer framework spec version (hand off to `sync-operator`'s guided adopt-then-bump flow, don't reimplement it here), or fixing product CODE so a `VIOLATED` Article holds (this skill closes findings about the constitution's own documents — a broken ref, an orphan, a stale number; making the codebase itself conform is separate, human-authorized work `audit-conformance` already declines to do, and so does this skill).
metadata:
  scope: project
  layer: cross-cutting
  enforces: F-II, F-IV
  version: "1.0.0"
---

# Close what an audit found, without crossing the firewall

`audit-structure` and `audit-conformance` are deliberately **read-only** — they report and
propose, they never write. This is the skill that actually closes their findings. It is
already proven: every fix in this framework's own `CONSTITUTION.md` ledger from `[0.16.1]`
through `[0.16.6]` is a hand-run instance of exactly this procedure — this skill codifies a
practice, not a proposal.

## What it does NOT do

It doesn't detect findings — it consumes `audit-structure`'s and `audit-conformance`'s output
(or runs them fresh as step 1) and never reimplements their checks. It doesn't author new
governance content from nothing (`harvest-articles`/`harvest-statutes` do that). It doesn't
ratify — for an above-firewall finding it drafts the fix and asks; the human's "yes" is a
separate, later act this skill doesn't perform.

## The firewall rule (read first — this is the whole skill)

**Classify by what the FIX touches, not by the finding's category.** The same finding type —
`broken-ref`, `orphan`, `duplication`, `field-gap` — can sit on either side of the firewall
depending on *where the edit lands*:

- A broken markdown link, a governance-map entry, an L2 statute's `serves`, an L3 ADR's
  `serves`/`amends`, a stale-but-already-adopted version number — **below the firewall**.
  Fixing these is craft, same as any other reviewed commit.
- Anything that edits an L1 Article's `principle` / `serves` / `fitness` / `status` / `party`,
  or an L0 Preamble line — **above the firewall**, even when the fix looks purely mechanical
  ("it's just correcting a typo in `serves`"). Touching ratified text is touching ratified
  text regardless of how small the edit is.
- A `promotion/demotion signal` is *always* above the firewall — it proposes changing what's
  law, by definition.

Get this classification wrong in the permissive direction and this skill silently amends the
constitution without ratification — the single worst failure mode it can have. When genuinely
unsure which side a finding is on, treat it as above the firewall and ask.

## Procedure

1. **Obtain findings.** Run `audit-structure` (always) and `audit-conformance` (if there's code
   to check) now, or reuse a findings report already produced earlier in this session — don't
   re-run redundantly.

2. **Classify every finding** per the firewall rule above. For each one, name exactly which
   file/field the *fix* would touch — not just where the symptom was observed.

3. **Route what isn't yours to fix:**
   - A `pin/version drift` that implies adopting a newer spec feature (not just correcting a
     stale number) → hand to `sync-operator`'s guided adopt-then-bump flow. Don't reimplement
     "adopt, then bump" here.
   - An `ungoverned` rule that reads as a domain invariant (would pass all four L1 inclusion-test
     criteria), not craft → hand to `harvest-articles` as a candidate. Don't annotate it as L2
     just because it's easier to close here.
   - An orphan/ungoverned rule that *is* craft → annotate or delete it using `harvest-statutes`'s
     own method (`rule · serves · enforced-by · why`) — don't reinvent that annotation step.

4. **Apply below-firewall fixes.** Fix the broken reference, declare the missing map entry,
   consolidate the duplicate to one home, reconcile the stale version number. **Verify each fix
   actually resolves** (a literal existence check for a link, a literal string match for a
   duplicate) — don't report a fix as done on the strength of "looks right now."

5. **Draft above-firewall fixes and ask — don't write.** For each one: state the finding, the
   exact proposed new text (the Article/Preamble line as it would read after the fix), and the
   reasoning. Present it to the ratifier and **wait for their decision** before writing anything
   (use a direct question; if there are genuinely multiple reasonable resolutions, offer them
   explicitly — this is the same shape as any real ratification decision). Once they decide,
   *this skill* may transcribe it (that's still just writing down what was decided, not
   deciding) — or hand off to `ratify-amendment` if that skill is in use for the mechanical part.

6. **Batch below-firewall fixes into one change.** Don't fragment N findings into N commits —
   group the related fixes into one coherent commit, one version bump, one ledger entry that
   lists what was closed and why. Fragmenting the batch is not more careful, it's more noise.

7. **Write the ledger entry honestly.** Below-firewall fixes get a plain summary — they don't
   pretend to be a ratified amendment (no `status`/`conformance` claim for something that isn't
   an Article change). Above-firewall fixes that got ratified during this run get the ratifier
   named, per F-IV.

8. **Report.** One list: finding → firewall side → action (applied / drafted-and-asked /
   routed elsewhere) → verification evidence → the commit/tag it landed in.

## Output shape

```
APPLIED — BELOW FIREWALL (N)
  map-gap: <home> undeclared           → <home>/AGENT.md written, map updated; verified on disk
  broken-ref: <file>:<line>            → path fixed; verified resolves
  duplication: <rule> in 2 places      → consolidated to <home>; other now points at it

DRAFTED — ABOVE FIREWALL, AWAITING RATIFIER (N)
  field-gap: <ambiguity>               → draft: "<proposed text>" — asked; awaiting decision
  promotion signal: <statute> → Article → drafted principle/serves/fitness — awaiting ratifier

ROUTED ELSEWHERE (N)
  pin drift (spec adoption implied)    → handed to sync-operator
  ungoverned rule reads as invariant   → handed to harvest-articles

BATCHED AS
  <commit sha / tag> — <N> findings closed, <one-line summary>
```

## Hard rules

- **Classify by what the fix touches, never by the finding's category alone.** The same
  category can be below or above the firewall depending on which file/field the edit lands in.
- **Never write `status: RATIFIED`, edit an Article's `principle`/`serves`/`fitness`/`party`, or
  edit an L0 Preamble line.** Draft and ask; the ratifier's decision is a separate act.
- **Never guess a `conformance` verdict.** If a finding needs one, that's `audit-conformance`'s
  job (with evidence) — reconcile what it already found, don't originate a new verdict here.
- **Every applied fix is verified, not assumed.** A link "should" resolve is not evidence; check it.
- **Batch below-firewall fixes into one commit/version/ledger entry** — don't fragment.
- **When genuinely unsure which side of the firewall a finding is on, treat it as above the
  firewall.** The cost of an unnecessary question is small; the cost of an unratified amendment
  is not.
- **Don't reimplement `audit-structure`/`audit-conformance`'s detection, `harvest-statutes`'s
  annotation, or `sync-operator`'s adopt-then-bump sequencing.** Route to them; fix only what's
  this skill's own job.
- **Never fix product code.** This skill closes findings about the constitution's own
  documents. A `VIOLATED` Article means the code needs to change — that's separate,
  human-authorized work, not something this skill does as a side effect of reconciling.
