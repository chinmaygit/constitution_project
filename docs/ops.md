# Ops visibility — a dashboard over the law, not a layer of it

Feature-delivery visibility has the same relationship to the constitution that a build
dashboard has to source code: it **reads** the law (which Article governs this task,
what's the definition of done) and it reads delivery events — it is not a governed
layer, and the constitution never stores its data.

## Where the data lives

`.constitution/` in the instance repo — the ops plane:

```
.constitution/
  events.jsonl     append-only delivery events        (commit — it's your delivery record)
  proposals/       the ratification queue              (commit — pending law needs review)
  tone/            tone render cache                   (gitignored — regenerable)
  compiles/        L4 compile packs                    (gitignored — regenerable)
  board.html       the rendered dashboard              (gitignored — regenerable)
  templates/ process/   vendored spec from the CLI     (read-only build artifacts)
```

`ensureOps` writes a `.constitution/.gitignore` with exactly that split. Volume scales
with activity here, and only here — a ten-thousand-feature product still has a
dozen-Article constitution.

## Events

```bash
constitution feature declare "Widget search" --refs A1,ADR-0003
constitution feature start|validate|ship|block|unblock|note widget-search --detail "…"
```

One JSON line each: `{ts, type, feature, title?, refs?, detail?}`. `refs` point INTO
the law by id; the law never points back. `constitution compile --out` also logs a
`compiled` event, so the pipeline instruments itself.

## The board

```bash
constitution board          # terminal
constitution board --html   # .constitution/board.html — static, no server
```

Columns: **Declared → Compiled → Building → Validating → Shipped** (latest lifecycle
event wins; `blocked` is a flag, not a column). The HTML version adds the governance
health strip — every Article's `status` / `conformance` / `enforcement` read live from
the law plane — so "what's moving" and "is the law holding" sit on one page.

## Deleting it

Deleting `.constitution/` loses delivery history and caches — never legality. That
asymmetry is the design: the law is small and durable; the ops plane is voluminous
and expendable.
