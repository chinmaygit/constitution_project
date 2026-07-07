<!-- Copy into a product's CONSTITUTION.md under "Amendments Ledger". One entry per
     amendment, newest first. An entry is a change-log record, not a legal document. -->

### [<version>] — <YYYY-MM-DD> — <one-line title>
- **What changed:** <old text → new text, or "new Article added">.
- **Why:** <one clause — the ADR that justified it, or "operator directive">.
- **ADR:** [<NNNN>-<slug>](../decisions/<NNNN>-<slug>.md) (omit if wording-only, no ruling needed).

<!--
An entry's job is "old text → new text + the ADR that justified it" (see
process/amendment-lifecycle.md) — not a session narrative of what was tried, what broke,
and what was verified. That belongs in BUILDLOG.md, which already exists for exactly
this. `constitution audit` runs a WARN-ONLY word-count cap for this (EXP-0001, ~150
words) — it never blocks, but a warning is real signal that narrative crept back in.

Length scales with the size of the change: a wording-only fix is 2-3 lines; a new
Article or a real ruling might need a paragraph. Neither ever needs the ledger to
restate the *implementation* story — only the *legal* one (what the law said, what it
says now, and why).
-->
