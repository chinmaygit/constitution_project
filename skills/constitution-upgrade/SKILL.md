---
name: constitution-upgrade
description: Gives the OPERATOR (a person working across many repos on one machine) live, always-current access to the framework's own skills (`/compile-prompt`, `/audit-conformance`, …) by symlinking them into their global skills dir, then checks a project they're working in for spec drift against the framework and proposes the pin bump. This is distinct from installing the framework INTO a product repo — that is the CLI's job (`cli/`), which writes portable, package-managed copies per ADR-0001, not symlinks. Idempotent — the first run installs, every later run updates; safe to run repeatedly. Use when the operator wants their own global constitution skills set up or refreshed, wants to check whether a project they're in is on the latest spec, or just pulled framework changes and wants them live. Triggers - "upgrade the constitution framework", "update my constitution skills", "set up the constitution framework for me", "is my constitution up to date", "relink constitution skills", "check framework drift", "constitution-upgrade". Do NOT use for - installing the framework into a product repo for other contributors/CI (use the CLI in `cli/`), auditing a constitution's internal integrity (use audit-structure), auditing code vs L1 (use audit-conformance), or compiling a task (use compile-prompt).
metadata:
  scope: global
  layer: tooling
  enforces: registry.md (the version pin)
  version: "1.1.0"
---

# Give the operator live access to the framework's skills, and check drift

The framework lives in one repo (default `~/Workspace/constitution`). This skill serves **the
operator** — a person working across many repos on one machine, who wants the framework's own
skills (`/compile-prompt`, `/audit-conformance`, …) invocable in *any* session without reinstalling
per project. It does two things: **link the operator's global skills to the live source → drift-check
whatever project they're currently in**. It is *idempotent*: the first run installs, every later run
updates.

**This is not how a product repo gets the framework.** That is a separate concern with a separate
consumer (other contributors, CI, machines that aren't yours) and a separate mechanism — the CLI in
`cli/`, which writes portable, package-managed copies into the target repo per ADR-0001 / ledger
`[0.15.0]`. See "Installing into a product repo" below. This skill and the CLI are not two
implementations of the same job — they serve different consumers, so both can be right at once.

## The model (read first)

- **The operator's own skills are symlinked, always current.** Each framework skill is linked from
  *your* global skills dir into the one framework repo. You are working directly against the live
  source, on your own machine — a symlink is the natural fit here, and pulling the framework updates
  every linked skill at once. This is scoped to your global environment; it is **not** a general claim
  that all framework distribution must be symlinks (ADR-0001 settled that a *product repo* is served
  better by package-managed copies — see below).
- **The spec is pinned, deliberately adopted.** A consumer's `constitution@X.Y.Z` pin (in its
  `CONSTITUTION.md` header + the framework `registry.md`) is *which spec it conforms to* — e.g.
  whether it has adopted the `enforcement` axis. The pin is a **conformance claim**, not a version
  sticker: never bump it past what the consumer has actually adopted.
- **Skills current + spec pinned** is the clean split. Newer skills are backward-compatible tooling;
  newer *spec* (a new Article field, a new layer rule) is adopted on purpose and — above the
  firewall — ratified by a human.

## Procedure

1. **Locate the framework.** Default `~/Workspace/constitution` (override if the user names another
   path; or infer it from an existing skill symlink's target). Confirm it's a git repo with a
   `CONSTITUTION.md` and `skills/`.

2. **Pull the latest.** `git -C <framework> pull --ff-only` (if it has a remote; local-only repos
   skip this). Report the current version: `git -C <framework> tag --sort=version:refname | tail -1`
   and the latest ledger entry (what changed).

3. **(Re)link every skill — idempotent install.** For each `<framework>/skills/<name>/`,
   ensure `~/.claude/skills/<name>` is a symlink to it:
   ```bash
   mkdir -p ~/.claude/skills
   for d in <framework>/skills/*/; do
     n=$(basename "$d")
     ln -sfn "$d" ~/.claude/skills/"$n"     # -f replaces a stale link, -n won't descend into a dir link
   done
   ```
   This links **new** skills the framework has added since last run, and fixes stale/broken links.
   Never overwrite a *non-symlink* of the same name without asking (a name collision with another
   tool) — report it instead. After linking, list what's now available.

4. **Drift-check the consumer (the update notifier).** If run inside (or pointed at) a consumer
   project, read its framework pin (its `CONSTITUTION.md` header) and compare to the framework's
   current version. If the consumer **lags**, this is the heart of the update: diff the framework
   ledger entries between the pinned and current versions and list the **spec features to adopt**
   (e.g. "0.14.0 added the `enforcement` Article axis"). For the authoritative structural view, hand
   off to **`audit-structure`** (its `pin/version drift` check + field checks) — don't re-implement it.

5. **Adopt + bump (guided, honest).** For each lagging spec feature, guide adoption:
   - **Below the firewall** (a new skill, a new audit check) → already live via step 3.
   - **Above the firewall** (a new Article field/axis, an L0/L1 rule) → the consumer must adopt it in
     its `CONSTITUTION.md` and a **human ratifies** (F-IV). Propose the change; don't enact it.
   Only **after** a spec feature is actually adopted, bump the consumer's pin (header + `registry.md`)
   to that version. **Never bump the pin ahead of adoption** — the pin must stay an honest conformance
   claim.

6. **Report.** Framework version (was → now), skills linked (with any new ones flagged), the
   consumer's pin, and the drift list with adopt/ratify actions. End with the one next command if
   anything remains (e.g. "adopt the enforcement axis, then bump the pin to 0.14.0").

## Installing into a product repo (not this skill's job)

If the actual task is "get the framework's skills into this product's repo" (for other
contributors, CI, or any machine that isn't yours) — that's the CLI, not this skill. Today the CLI
is **local-only, not yet published**: run `node <framework>/cli/dist/index.js` with the target
repo as the working directory (it uses `process.cwd()`), after `npm run build` in `<framework>/cli/`
if `dist/` is stale. It prompts for a ratifier name and target agents, then writes `CONSTITUTION.md`,
`AGENT.md`, and per-agent skill copies (`.claude/skills/`, `.agents/skills/`, `.cursor/rules/`) —
gitignored, generated, never hand-edited (see the target repo's own `AGENT.md`). It has no distinct
"upgrade" mode yet — re-running it re-prompts for setup and overwrites the skill copies with the
current source; that's a known gap, not a hidden feature. Do not reimplement any of this in prose
here — if it needs improving, that's a `cli/src/` change.

## Bootstrap (first time only)

This skill links *itself*, but on a brand-new machine it isn't discoverable until linked once:
```bash
ln -sfn ~/Workspace/constitution/skills/constitution-upgrade ~/.claude/skills/constitution-upgrade
```
After that one line, `/constitution-upgrade` is available and self-maintaining.

## Hard rules

- **Idempotent.** Safe to run repeatedly; create-or-fix links, never duplicate or clobber.
- **Symlinks for the operator's global skills, always.** That is this skill's one job and its
  mechanism is not up for debate here — a copy in your own `~/.claude/skills/` would drift from the
  source you're actively editing; a link can't.
- **Don't reimplement product-repo installation.** That's the CLI's job (ADR-0001 / `[0.15.0]`),
  which uses package-managed copies for good reason (portability across contributors/CI/machines).
  Point to it; don't hand-roll a competing copy mechanism here — that would be the real F-II violation.
- **Never bump a consumer's pin past what it has adopted.** The pin is a conformance claim. Drift is
  surfaced, adoption is deliberate.
- **Above-firewall spec adoption is the ratifier's** (F-IV) — propose, don't enact. New *skills* are
  below the firewall and link freely.
- **Don't touch consumer code or constitution content** — this skill distributes the framework and
  reports drift; adopting spec is separate, guided, human-ratified work.
- **A name collision with a non-symlink in the global skills dir** is reported, not overwritten.
