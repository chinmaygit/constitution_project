# Governance Map — L2 (this folder)

L2 statutes for the `constitution-cli` TypeScript package (`cli/`) — the framework's
package-managed distribution mechanism, per
[ADR-0001](../decisions/0001-package-managed-distribution.md).

<!-- Statute shape: ../templates/statute.md -->

- **TypeScript strict mode; no `any`.**
  · serves: general craft
  · enforced-by: CI (`tsc` via `npm run build`; `tsconfig.json`'s `strict: true`)
  · why: the CLI writes files into other people's repos unattended (no code review in
    the loop at install time) — a silent `any` is where that goes wrong invisibly.

- **One concern per file: `index.ts` owns interactive prompting + orchestration only,
  `scaffold.ts` owns writing constitution files into the target repo, `agents.ts` owns
  compiling skills into per-agent formats.** A new concern gets a new file.
  · serves: general craft
  · enforced-by: prompt-only
  · why: keeps "what installation does" separable from "how it talks to the user," so a
    distribution-mechanism change (another ADR-0001-style ruling) doesn't require
    touching prompt UX and vice versa.

- **Published to GitHub Packages as `@chinmaygit/constitution-cli`** (not public npm — the
  scope is mandatory for GitHub's npm registry, not a naming choice). A version bump in
  `package.json` with no matching `npm publish` is a lie the registry can catch — don't
  bump without publishing, and don't publish without bumping past what's already live.
  · serves: general craft (documentation must not outrun reality)
  · enforced-by: prompt-only (a mechanization candidate — a CI publish-on-tag workflow
    would make this GATED instead of relying on the publisher's memory)
  · why: this statute existed to keep docs honest before publishing was real (see
    `CONSTITUTION.md` ledger — the decision that flipped it); now it keeps the published
    version and the repo's `package.json` from drifting apart instead.

- **`cli/package.json`'s `version` always equals this repo's `CONSTITUTION.md` header
  version.** One number for the whole self-hosted repo — not a tool-version axis and a
  spec-version axis drifting independently. Every `CONSTITUTION.md` version bump that
  lands in the same change as a `cli/` publish updates both together; a bump to one
  without the other is the bug, not a valid state.
  · serves: F-II (one home for "what version is this")
  · enforced-by: prompt-only (mechanization candidate — a CI check comparing the two
    would make this GATED)
  · why: two independently-numbered versions for one repo is exactly the confusion a
    consumer hits first — "why does `constitution --version` say 1.0.0 when the spec
    ledger is at 0.16.x." One axis removes the question.
