# Tone — a view of the law, never a fork of it

Constitution-speak is dense on purpose: the canonical text is a legal record. Most
readers shouldn't have to parse it that way — so tone is **user-selectable at read
time**:

```bash
constitution render F-II                  # canonical — the one ratified text
constitution render F-II --tone plain     # new-teammate language
constitution render F-II --tone casual    # senior-engineer-over-coffee
constitution render F-II --tone formal    # crisp policy prose
```

## The invariants

1. **One canonical text per unit, ever.** Ratification, amendment, audit, lock,
   and compile read only the canonical text. No tone is ever an input to any of them.
2. **A render is a derived artifact.** Cached at `.constitution/tone/<unit>.<tone>.md`
   with the source's canonical hash and the transform version in its frontmatter.
   Never hand-authored, never hand-edited (the engine overwrites it), gitignored by
   default.
3. **Drift is impossible to serve, not just discouraged.** A cache entry is valid only
   while its recorded `source-hash` equals the live canonical hash. Amend the law and
   every view of that unit is stale *by construction*: `render` regenerates or refuses
   (`--no-generate`), `tones check` reports, `doctor` prunes.
4. **A wrong rendering is a transform bug.** If a tone misstates the canonical text,
   fix the prompt in `cli/src/engine/tone.ts` and bump `TRANSFORM_VERSION` — which
   invalidates every cached render at once. You never "fix" an individual render file.

## Generation

The transform runs `claude -p` with a meaning-preserving rewrite prompt (obligations,
thresholds, ids, and exceptions must survive verbatim; nothing added). No `claude` CLI
on the machine → the engine says so and points at the canonical text rather than
serving anything stale. The canonical text is always readable with no generator at all.
