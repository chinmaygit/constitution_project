---
name: constitution-upgrade
description: Installs and updates the constitution framework for day-to-day use — the one-command keystone (mirrors gstack's /gstack-upgrade). It pulls the latest framework, (re)links every framework skill into the user's global skills dir so they are invocable (`/compile-prompt`, `/audit-conformance`, …), then runs the pin-drift check to tell the consumer which newer spec features to adopt and proposes the pin bump. Idempotent — the first run installs, every later run updates; safe to run repeatedly. Use when a user wants to install/set up the constitution framework, update it, re-link its skills, check whether their instance is on the latest spec, or after pulling framework changes. Triggers - "upgrade the constitution framework", "update constitution skills", "install the constitution framework", "is my constitution up to date", "relink constitution skills", "check framework drift", "constitution-upgrade". Do NOT use for - auditing a constitution's internal integrity (use audit-structure), auditing code vs L1 (use audit-conformance), or compiling a task (use compile-prompt). This skill is the *distribution + update* mechanism, not a governance audit.
metadata:
  scope: global
  layer: tooling
  enforces: registry.md (the version pin)
  version: "1.0.0"
---

# Install / upgrade the constitution framework

The framework lives in one repo (default `~/Workspace/constitution`) and is consumed by products
(DSAMind is the founding instance). This skill is how a machine **gets** the framework and **keeps
it current** — the same role `/gstack-upgrade` plays for gstack. It does three things, in order:
**pull → (re)link skills → drift-check + adopt**. It is *idempotent*: the first run installs, every
later run updates.

## The model (read first)

- **Skills are symlinked, always current.** Each framework skill is linked from the global skills
  dir into the one repo — never copied (F-II, one home). Pulling the framework updates every linked
  skill at once; no re-install.
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

## Bootstrap (first time only)

This skill links *itself*, but on a brand-new machine it isn't discoverable until linked once:
```bash
ln -sfn ~/Workspace/constitution/skills/constitution-upgrade ~/.claude/skills/constitution-upgrade
```
After that one line, `/constitution-upgrade` is available and self-maintaining.

## Hard rules

- **Idempotent.** Safe to run repeatedly; create-or-fix links, never duplicate or clobber.
- **Symlinks, never copies.** Skills stay single-source in the framework repo (F-II — one home).
  A copy would drift; a link can't.
- **Never bump a consumer's pin past what it has adopted.** The pin is a conformance claim. Drift is
  surfaced, adoption is deliberate.
- **Above-firewall spec adoption is the ratifier's** (F-IV) — propose, don't enact. New *skills* are
  below the firewall and link freely.
- **Don't touch consumer code or constitution content** — this skill distributes the framework and
  reports drift; adopting spec is separate, guided, human-ratified work.
- **A name collision with a non-symlink in the global skills dir** is reported, not overwritten.
