# constitution-cli

The framework's **engine and installer**. `constitution init` scaffolds the framework
into a product repo — package-managed distribution per
[ADR-0001](../decisions/0001-package-managed-distribution.md); the files it writes are
read-only build artifacts, not hand-vendored copies. Beyond `init`, the binary is the
deterministic governance engine: `audit`, `firewall`/`lock`, `compile`, `render`/`tones`,
`feature`/`board`, `doctor`, `proposals`/`ratify` — run `constitution --help`, and see
[../docs/quickstart.md](../docs/quickstart.md) for the workflow. Engine code lives in
`src/engine/` (see [AGENTS.md](AGENTS.md) for its statutes, including determinism and
the failing-first test rule); tests in `test/` run via `npm test`. Engineering
conventions for this package's own code are in [AGENTS.md](AGENTS.md), not here.

## Status

Published to the public **npm registry** as `constitution-cli` (repo:
[chinmaygit/constitution_project](https://github.com/chinmaygit/constitution_project)).
No token needed to install — GitHub Packages required one even for public packages
(a platform limitation), which is why this moved to npmjs.org.

## Usage

```bash
npm install --save-dev constitution-cli
npx constitution init
```

`constitution` with no command, `--help`, or an unrecognized command prints usage and does
**not** launch the interactive scaffold — only `init` does. `--version` prints the
installed version.

## Building from source (this repo)

```bash
cd cli/
npm install
npm run build        # vendors skills/, templates/, process/ into cli/, then compiles
```

`npm run build` runs `scripts/vendor.js` first (via `prebuild`) — it copies
`skills/`, `templates/`, `process/` from the framework repo root into `cli/`, since a
published package can only contain files inside `cli/` itself, not sibling directories.
The vendored copies are gitignored build artifacts, same as `dist/` — never hand-edited.

Then, from the target product repo (the CLI reads `process.cwd()`):

```bash
node <path-to-this-framework-repo>/cli/dist/index.js init
```

It prompts for a project name, a ratifier name, and target agents (Cursor / Claude /
Antigravity / Copilot), then writes `CONSTITUTION.md` (skipped if one already exists,
generated from [`templates/constitution.md`](../templates/constitution.md) — never
hand-written inline, so it can't drift from the template) and `AGENTS.md` (safe-appends
a governance-map block from
[`templates/governance-map.md`](../templates/governance-map.md) if one isn't there yet),
and per-agent skill copies: `.claude/skills/`, `.agents/skills/`, `.cursor/rules/`.

There is no distinct "upgrade" mode yet — re-running `init` re-prompts and overwrites the
skill copies with the current source. That's a known gap, not a hidden feature.

**Known gap**: `init` always writes a fresh `CONSTITUTION.md`/`AGENTS.md` at the target
root — it doesn't yet detect an existing constitution living somewhere else (e.g.
`decisions/CONSTITUTION.md`) or a governance map already living inside a `CLAUDE.md`
instead of `AGENTS.md`. Running `init` against a repo shaped that way produces confusing
duplicate stub files; check for an existing constitution before running it, and clean up
manually if it writes the wrong thing.

## What this is not

Not how *you*, the operator working across many repos on one machine, get live access
to the framework's own skills — that's `skills/sync-operator`, which symlinks
instead of copying because you're working directly against this repo's source. This CLI
is for everyone else who needs the framework in a repo: other contributors, CI, any
machine that isn't yours.
