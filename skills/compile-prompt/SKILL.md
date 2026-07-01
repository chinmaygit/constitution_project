---
name: compile-prompt
description: Compiles a single task into the L4 briefing the implementing actor runs — L4 = compile(task, L0..L3). Given an owner's task statement, it LOCATES where the task sits in the product's constitution (which L0 line it serves, which RATIFIED Articles govern it, which L2 statutes constrain the build, which L3 ADRs are precedent), then emits ONE provenance-tagged prompt ending in a definition-of-done = the fitness assertions the output must pass (the same checks CI runs). Compile-only - it produces the artifact and STOPS; a separate actor session implements it. Read-only over L0–L3 (below the firewall - never edits the constitution). If the task can't be placed cleanly - it serves an L0 line with no enforcing Article, or it collides with two Articles - it STOPS and escalates to the ratifier (the certiorari move) instead of fabricating governance. Use when an owner states a task/feature/change and wants the governing constitution slice compiled into an actor briefing, to see which Articles/statutes/ADRs govern a task, or to generate the L4 prompt. Triggers - "compile this task", "what governs <task>", "build the prompt for <feature>", "where does <task> sit in the constitution", "brief the actor on <task>". Do NOT use for - implementing the task itself (that is the separate actor session the artifact is handed to), auditing code against L1 (use audit-conformance), deriving missing statutes (use derive-statutes), checking the constitution's structural integrity (use audit-structure), or changing any L0–L3 text (above the firewall, or an ordinary L2/L3 edit).
metadata:
  scope: project
  layer: L4
  enforces: process/compiler.md
  version: "1.1.0"
---

# Compile a task into the L4 actor briefing

L4 is the one layer you never hand-write — it is **compiled per task** from the layers above:

```
L4 = compile( task, L0..L3 )  →  the focused briefing the implementing actor runs
```

This skill *is* that compile step. It reads the product's constitution, selects only the slices
that touch **this** task, and emits one provenance-tagged briefing ending in a definition of done.
It is the front door for day-to-day work: the owner states a task, the compiler reaches down
through L0→L3 and hands the actor exactly the law that governs it. Spec:
[process/compiler.md](../../../process/compiler.md). Template:
[templates/compiled-prompt.md](../../../templates/compiled-prompt.md).

## Grounding rules (read first)

1. **Compile, don't implement.** The output is the briefing artifact, full stop. A *separate*
   actor session runs it. This skill never writes product code — keeping the compile step and the
   build step apart is what makes the briefing auditable and the provenance trail clean.
2. **Place, don't fabricate.** Every line in the briefing must trace to a rule that already exists
   in L0–L3. If the task doesn't map onto existing law — it serves an L0 line that **no Article
   enforces**, or two Articles pull in opposite directions — **STOP and escalate** (the certiorari
   move). The compiler *reads* governance; it never invents an Article or statute to make a task
   fit. That gap is not a compiler failure — it is the signal the constitution must grow, and it is
   above the firewall (F-IV): the ratifier's call, not the agent's.
3. **Discover, don't assume (project-agnostic).** This skill compiles for *any* product and names
   none — every path and id below is a `<placeholder>`. Find every layer with the discovery protocol
   in the Procedure (bootstrap from the root `AGENT.md` governance map to find the declared L2 homes). A path you were handed is a convenience; the map is
   the source of truth. Never hardcode or assume a path, and never trust that the files you were
   named are the complete set.

## Selection strategy (v1 default)

Which slices to pull is a judgment call (see compiler.md). v1 uses **strategy 2 — always-include +
relevant**, safe over clever:

- **L0** — always include every line the task plausibly serves (usually one; name it).
- **L1** — include every `RATIFIED` Article whose `serves` or product surface touches the task.
  When unsure, **include**: a spurious invariant costs one line in the briefing; a missing one
  costs a violation in production.
- **L2** — from the statute homes **discovered** in the Procedure (those declared in the map), include those whose statutes' `serves` back-links or surface touch the
  task. Discover the full set first, then match — never match against only the homes you were handed.
- **L3** — include ADRs whose `serves` overlaps the selected L0/L1/L2 ids. Always cite the **live**
  ruling, never a superseded one (cite its successor).

Strategy 3 (an agent picks the slices; the audit later checks whether any *unincluded* rule was
violated and feeds that back) is the **F-III experiment** to graduate to once there is a
pre-registered metric (invariant-violations-per-PR vs. briefing length) — not the default.

## Procedure

1. **Read the task.** Restate the owner's intent in one line. If it is really several tasks,
   compile the smallest shippable one and say which slice you took.
2. **Bootstrap from the product's entry point.** Read the product's **root `AGENT.md`** first — it
   is the single entry point and should declare a **governance map**: where L0/L1 live (the
   constitution doc), where L3 lives (the ADR directory), and the L2 convention. Paths vary per
   product — **never assume one**; the map tells you. **There is no fallback disk scan** — if there
   is no governance map, record it as **blocking FRICTION** and say so plainly in the output: L2
   homes cannot be reliably determined without one. Compile what you can from L0/L1/L3 and flag the
   gap rather than guessing at L2.
3. **Trust the governance map — it is the sole source of L2 homes.** Read the map found in step 2.
   Identify the declared location(s) for L2 statutes (e.g. `AGENT.md`, `CLAUDE.md`, or a specific
   directory). Parse those locations; those carrying `serves`-annotated statutes are the L2 homes.
   This skill does **not** independently scan the filesystem for undeclared homes — a statute home
   that exists on disk but isn't listed in the map is invisible to this step, by design (the map,
   not a glob, is the source of truth as of framework `0.16.0`). If, while reading task-relevant
   code, you *incidentally* notice a plausible statute home the map doesn't list, don't silently
   fold it in or silently ignore it — surface it as FRICTION so the map can be corrected.
4. **Load L0 / L1 / L3 from the declared locations.** L0 (Preamble P-lines) + L1 (Articles +
   `status` / `conformance` / `serves` / `fitness` / `party`) from the constitution doc; L3 ADRs
   (+ `serves` / `superseded_by`) from the ADR directory the map names.
5. **Place the task — the certiorari check.** Map it to ≥1 L0 line and ≥1 `RATIFIED` Article.
   - **Clean placement** → proceed.
   - **No enforcing Article** (serves an L0 line nothing governs) **or collision** (two Articles in
     tension) → **STOP. Do not compile.** Report the gap/collision and escalate to the ratifier —
     the certiorari trigger (→ an ADR, possibly an amendment). See the certiorari output example.
   - Note conformance: if a governing Article is `VIOLATED`, you may still compile, but the briefing
     must say the actor is building on **known debt** (don't hide it).
6. **Scan for negative invariants — what the task must NOT break.** Beyond the Articles the task
   *implements*, scan every `RATIFIED` Article for ones the task could *violate* even though it
   doesn't implement them — typically because the task's write path touches a field, table, or flow
   another Article freezes (e.g. a row-reorder that must not mutate a frozen identity column).
   Include each as a **MUST NOT BREAK** invariant, tagged to its Article. When unsure, include
   (strategy 2). *This is the guardrail a cheaper model skips when it reasons "that Article isn't
   about my feature" — relevance is not the test; **reachability** is.*
7. **Select the slices** per the strategy above — spanning both the governing and the
   must-not-break Articles, their statutes, and the precedent ADRs.
8. **Write the definition of done.** Turn each governing/must-not-break Article's `fitness` and each
   relevant statute's `enforced-by` into concrete pass/fail assertions for **this** task — checkable
   (a test, a query, a lint), not prose. **Never emit an assertion that tells the actor to invent an
   unspecified convention** (an ordering base, an id format, a response shape). If the task needs a
   convention L0–L3 doesn't pin, that is a **gap to surface as FRICTION** — an L2 detail for the
   ratifier, not a "pick one and document it" punt. An invented convention is ungoverned and can't
   be CI-checked.
9. **Compile.** Fill [templates/compiled-prompt.md](../../../templates/compiled-prompt.md):
   `WHY` (L0) → `INVARIANTS` (L1 — governing *and* must-not-break) → `HOW TO BUILD` (L2) →
   `PRECEDENT` (L3) → `DEFINITION OF DONE`. Every line carries a provenance tag — `[L0·Pn]`,
   `[L1·An]`, `[L2·<statute>]`, `[L3·ADR-NNNN]`. The header names the product and its pinned version.
10. **Emit the artifact and stop.** Print the compiled briefing as the deliverable, and report what
    you **discovered** — the L2 homes found, and any home not declared in the root map. Offer to
    write it to a handoff file in the product's gitignored ephemeral area for a separate actor
    session. **Do not implement it here.**

## Output shape

**A — clean compile** (task places cleanly under existing law):

```
### Compiled instruction — task: <task name>
# generated from <product> constitution @ v<X.Y.Z> (constitution@<pin>) · DO NOT EDIT (edit L0–L3 instead)

WHY THIS EXISTS
  [L0·<Pn>]        <the vision line this task serves, in one clause>

INVARIANTS YOU MUST HOLD
  [L1·<Art-gov>]   <governing Article — the invariant this task implements, tightened to the task>
  [L1·<Art-neg>]   <must-not-break Article — a frozen field or flow the task's write path could touch>

HOW TO BUILD (current stack)
  [L2·<statute-a>]   <stack-binding statute, e.g. the DB-access rule> · enforced-by: <mechanism>
  [L2·<statute-b>]   <boundary-validation statute>                    · enforced-by: <mechanism>

PRECEDENT
  [L3·ADR-<NNNN>]  <the live ruling that constrains this task; cite the successor if superseded>

DEFINITION OF DONE (these run in CI — your code must pass)
  ✓ <assertion from Art-gov's fitness — checkable by test / query / lint>
  ✓ <assertion from Art-neg — the must-not-break invariant, e.g. "field X is unchanged by this op">
  ✓ <assertion from a statute's enforced-by — e.g. boundary input is schema-validated>
```

**B — certiorari STOP** (task cannot be compiled; escalate instead):

```
CERTIORARI — task cannot be compiled
  task:    <task name>
  serves:  [L0·<Pn> <vision line>]
  blocker: <Pn> has NO enforcing L1 Article — this vision line is unimplemented in L1.
  → STOP. Above the firewall (F-IV). Escalate to the ratifier:
       (a) ratify an Article that enforces <Pn>, then re-compile against it, or
       (b) the owner accepts this as ungoverned vision work and says so on the record.
  Do not invent an Article to fill the slot — that gap is exactly what the certiorari move surfaces.
```

End either branch with a one-line roll-up: the L0/L1/L2/L3 ids pulled, and (for a STOP) the
escalation handed to the ratifier.

## Hard rules

- **Compile-only — emit the artifact, never implement.** A separate actor session runs the briefing.
- **Read-only over L0–L3 — never edit the constitution.** Below the firewall; L0/L1 are the
  ratifier's (F-IV). If a slice looks wrong, report it; don't fix it inside a compile.
- **Every line is provenance-tagged** to the rule it came from. No untagged instruction reaches the
  actor — if you can't tag it, it isn't governance and doesn't belong in the briefing.
- **Place or escalate — never fabricate.** No-Article or collision → STOP (certiorari). Inventing
  an Article/statute to make a task fit is the one thing this skill must not do.
- **Cite live law only** — never a `SUPERSEDED` Article or ADR; cite its successor.
- **Definition of done = checkable assertions** (the same ones CI runs), not prose.
- **Surface conformance debt** — if a governing Article is `VIOLATED`, the briefing says so; the
  actor must know it's building on known debt.
- **Default to strategy 2** (safe over clever). Strategy 3 is a pre-registered F-III experiment,
  not a default.
