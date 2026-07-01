# Defining L0 and L1

The procedure a product follows to author its Preamble (L0) and Articles (L1). The
durable principles behind it are Articles **F-V** and **F-VI**; this file is the
operational how-to they reference.

**Order matters: L0 before L1**, because every Article must trace to an L0 line.

## Step A — define L0 (the Preamble)

Gather the raw material with the **L0 elicitation protocol**
([l0-elicitation.md](l0-elicitation.md)) — a finite question set asked of the founder —
then:

1. **Start from the founding insight, not features.** Answer: *why does this product
   deserve to exist that an existing one does not?*
2. **Draft candidate statements.** For each, apply the **identity test**: "If we violated
   this, would we still be the same product?" *No* → it's a candidate. *Yes* → it isn't
   L0; demote it to L1 or L2.
3. **Distill to the minimum.** Prefer one statement; rarely more than three. L0 is the
   shortest layer.
4. **A human authors and ratifies it** (above the firewall). An agent may help phrase,
   never originate — the vision is intent only the founder holds.
5. **Attach no fitness function to L0.** Its enforcement is indirect: every Article must
   trace to it.

## Step B — define L1 (the Articles)

1. **Harvest** candidates from real sources, never a blank page:
   - existing ADRs and past decisions
   - choices made the same way across many features
   - incidents / bugs that traced to a missing rule
   - existing `AGENT.md` / `CLAUDE.md` rules that are actually *domain* invariants
     (separate these from craft/statute rules — those stay at L2)
2. **Filter** each through the inclusion test (general · traces to L0 · falsifiable ·
   survives a tech swap). Route failures to their real home (L2, L0 prose, or a feature
   spec) instead of forcing them into L1.
3. **Trace** each survivor to an L0 line. A candidate that can't trace reveals either an
   incomplete L0 or a non-constitutional rule.
4. **Write** each as principle / serves / fitness / status (`templates/article.md`).
5. **Set status, then reality-check conformance** — `status: RATIFIED` once the ratifier
   agrees the Article is binding law (a human decision, independent of the code). Then run
   the fitness signal and set `conformance`: `HOLDS` if the code satisfies it, `VIOLATED` if
   not (with the gap noted). Never mark `conformance: HOLDS` what the code violates.
6. **Order** any conflicting Articles in the priority hierarchy.
7. **Keep L1 small.** An Article must be *contested* — a rule nobody would violate doesn't
   need constitutional protection. When in doubt, leave it out.

The output of this procedure is a product's `CONSTITUTION.md` (L0 + L1). Going through it
on a real product is the founding proof for F-V and F-VI.
