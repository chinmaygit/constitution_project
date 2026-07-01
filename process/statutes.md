# Defining and maintaining L2 (Statutes)

The procedure a product follows to author its Statutes (L2) — the operational/craft layer
just below the firewall. L0/L1 are *discovered and ratified*; L2 is *harvested and mechanized*.
This file is the operational how-to; the layer is defined in [layers.md](layers.md).

A governing meta-Article for L2 is a **deferred candidate** — it must emerge from a live L2
harvest before it is codified (F-I, discovery before codification). Until then, L2 is governed
by the layer definition, **F-II** (one home per rule), and **F-IV** (the firewall).

## What is a Statute

A rule that **fails L1's inclusion test** but is still binding:

- a **stack binding** — a tech swap would rewrite it (e.g. "DB access via the Prisma
  singleton", "Server Components are the default", "auth via the Clerk-backed userService"); or
- **general craft** — durable but it does not trace to an L0 line (e.g. "validate all boundary
  input", "no business logic in components", file-size limits, commit conventions).

A Statute is **not** an Article (constitutional — tech-durable *and* L0-tracing), **not** an
ADR (a dated decision — L3), and **not** a per-feature rule (those live below L2 in feature
specs).

## Step — harvest the Statutes

1. **Harvest from where they already live**, never a blank page: the product's `AGENTS.md`,
   `CLAUDE.md`, and agent-specific files. These rules already exist; the job is
   to *name them L2 and structure them*, not to invent or relocate (F-II).
2. **Filter.** Confirm each fails the L1 inclusion test (tech-coupled, or no L0 trace). A rule
   that passes all four L1 tests is a *promotion candidate* — route it to the amendment
   lifecycle, not L2.
3. **Annotate** each with the statute shape ([templates/statute.md](../templates/statute.md)):
   `rule · serves · enforced-by · why`.
   - `serves` — the L1 Article it operationalizes, or the L0 line it serves via a tech choice,
     or explicitly "general craft (no L0 trace)".
   - `enforced-by` — `lint` / `CI` / `hook` / `prompt-only`. Prefer a mechanism; fall back to
     prompt-only only when no check is feasible, and flag it as future tooling.
4. **Catch orphans.** A Statute that `serves` nothing real is either dead (delete it) or
   evidence of a missing Article (surface it to the ratifier). A general-craft Statute that
   serves no L0 line is fine — that is precisely what L2 is for; it simply never becomes L1.
5. **Mechanize where cheap.** Convert prompt-only statutes into lint rules / CI gates / hooks
   over time. L2's enforcement strength is the share of statutes with a real `enforced-by`.

## The firewall — promotion and demotion

- **Promote (L2 → L1).** A Statute observed to be both tech-durable and L0-tracing across many
  features is a candidate Article. Promotion crosses the firewall: it requires the amendment
  lifecycle and a human ratifier (F-IV). The Statute is removed from L2 in the same change
  (F-II — one home).
- **Demote (L1 → L2).** An Article that turns out tech-coupled (a library swap would rewrite
  it) is demoted: superseded at L1 with a ledger entry and forward link, then rewritten as a
  Statute. An agent may *propose* a demotion; a human ratifies the L1 supersession.

## Maintenance

L2 drifts faster than L1. Auditing it is a **project-level** concern enforced by the product's
own tooling and governance-sweep skill (e.g. DSAMind's `dsa-audit-governance`) plus the
`enforced-by` mechanisms running in CI — not a periodic constitutional audit. The framework
ships no L2 audit skill; it points at this pattern.

The output of this procedure is the product's existing `AGENTS.md` (or declared map target), now named as
L2 and annotated. Going through it on a real product is the live proof the deferred L2 Article
needs before it can graduate.
