# Quickstart — governing a product with `constitution`

Ten minutes from install to a governed task loop.

## 1. Install and scaffold

```bash
npm install -g @chinmaygit/constitution-cli   # GitHub Packages; see cli/README.md for registry setup
cd your-product
constitution init
```

`init` writes the law-plane skeleton (`CONSTITUTION.md`, a Governance Map in
`AGENTS.md`, `decisions/`), the spec + templates under `.constitution/`, compiled
skills for the agents you pick, and the ops scaffold (`.constitution/events.jsonl`
et al., with a `.gitignore` that keeps regenerable caches out of git).

## 2. Define the law (once, with a human)

1. **L0** — run the `define-preamble` skill with the ratifier present. ≤3 identity
   statements; an agent may phrase, never originate (F-V).
2. **L1** — once real decisions exist, `harvest-articles` drafts Articles from them
   (`status: PROPOSED`). The ratifier ratifies; agents never write `RATIFIED` (F-IV).
3. **Lock it** — the ratifier (a human, in a terminal — the command refuses agents
   and pipes) runs:

```bash
constitution lock accept   # writes constitution.lock.json — commit it
```

4. **Gate it** — add to CI (see `.github/workflows/governance.yml` here for a model):

```bash
constitution audit      # structural integrity of the whole L0–L4 graph
constitution firewall   # fails if ratified L0/L1 drifted from the accepted lock
```

## 3. The task loop (every feature)

```bash
constitution feature declare "Widget search" --refs A1        # intent, on the board
constitution compile "add widget search" --out                # canonical law pack → .constitution/compiles/
# hand the pack to the compile-prompt skill / an LLM → the L4 briefing → an actor implements it
constitution feature start widget-search
constitution feature validate widget-search                   # definition-of-done passed
constitution feature ship widget-search
constitution board            # terminal kanban;  --html → .constitution/board.html
```

## 4. Keep it healthy (agents can run all of this)

```bash
constitution doctor       # fixes below the firewall; queues drafts above it
constitution proposals    # the ratification queue
constitution tones check  # tone-view drift detection
```

When `doctor` queues something, only a human closes it:

```bash
constitution ratify <proposal-id>   # interactive, typed confirmation
constitution lock accept            # re-accept after any ratified-text change
```

## Reading the law in your language

```bash
constitution render F-II                    # canonical (the law, verbatim)
constitution render F-II --tone plain       # plain-language view (derived, cached)
constitution render F-II --tone casual
```

Views are derived artifacts — see [tone.md](tone.md). The canonical text is the only law.
