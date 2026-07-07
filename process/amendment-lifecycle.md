# Amendment lifecycle

How a rule changes — and what happens to the rule it replaces.

## The path (for an L1 Article)

```
1. PROPOSE    human or agent drafts the change + attaches an evidence packet
              (usually a graduated experiment — see experiment-lifecycle.md)
2. WARN-ONLY  the new/changed fitness signal runs but does NOT block PRs yet
3. EVIDENCE   accrue: did it catch real issues? false-positive rate? friction cost?
4. RATIFY     a HUMAN approves (Article F-IV) → status flips to RATIFIED;
              the fitness signal becomes blocking
5. REVIEW     periodic re-litigation — every Article must keep earning its keep
6. SUNSET     an Article that never fires, or only causes friction, is archived
```

L0 and L1 changes sit **above the firewall**: agents may propose and gather evidence,
but only a human may ratify. L2–L4 changes may be agent-driven, with L4 the only layer an
agent may both author and run unsupervised (a fitness check fails loudly; it can't quietly
rewrite the vision).

## What happens to the old rule — it is never deleted

A superseded rule is preserved in **three** places:

1. **The Amendments Ledger** in `CONSTITUTION.md` — old clause text kept verbatim, marked
   `SUPERSEDED — <date>`, with a forward link (`→ Article X v2 / ADR-00NN`). The *legible*
   record.
2. **The ADR** that drove the change (L3) — full context, alternatives, consequences. The
   *reasoned* record. Every L1 change ships with one.
3. **Git history** — the raw immutable record underneath both.

So "what did this rule used to say, when did it change, and why" is always answerable: the
ledger gives the what/when, the ADR gives the why.

Ledger entry shape: [../templates/ledger-entry.md](../templates/ledger-entry.md) — a
change-log record, not a narrative. Session narrative belongs in the product's own
build log, if it keeps one, never in the ledger itself.

## Velocity by layer

L0 ossifies on purpose; L4 churns freely. The tiered velocity is the mitigation for both
ossification and churn — neither contaminates the other across the firewall.
