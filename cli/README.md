# constitution-cli

Scaffolds this framework into a product repo — package-managed distribution per
[ADR-0001](../decisions/0001-package-managed-distribution.md). The files it writes into
the target repo are read-only build artifacts, not hand-vendored copies. Engineering
conventions for this package's own code are in [AGENT.md](AGENT.md), not here.

## Status

Local-only. Not published to any registry — `npm view constitution-cli version` returns
404. There is no `npx constitution ...` yet; don't write docs elsewhere that assume there is.

## Usage (today)

```bash
cd cli/
npm install
npm run build        # once, or again after pulling framework changes
```

Then, from the target product repo (the CLI reads `process.cwd()`):

```bash
node <path-to-this-framework-repo>/cli/dist/index.js
```

It prompts for a ratifier name and target agents (Cursor / Claude / Antigravity /
Copilot), then writes `CONSTITUTION.md` (skipped if one already exists), `AGENT.md`
(safe-appends a governance-map block if one isn't there yet), and per-agent skill
copies: `.claude/skills/`, `.agents/skills/`, `.cursor/rules/`.

There is no distinct "upgrade" mode yet — re-running it re-prompts and overwrites the
skill copies with the current source. That's a known gap, not a hidden feature.

## What this is not

Not how *you*, the operator working across many repos on one machine, get live access
to the framework's own skills — that's `skills/sync-operator`, which symlinks
instead of copying because you're working directly against this repo's source. This CLI
is for everyone else who needs the framework in a repo: other contributors, CI, any
machine that isn't yours.
