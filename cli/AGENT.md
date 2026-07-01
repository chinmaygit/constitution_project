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

- **Not published to npm.** `constitution-cli` has no registry listing today — do not
  add publish steps, a README claiming `npx constitution ...` works, or docs elsewhere
  in this repo that assume it does, until publishing is a deliberate, separate decision.
  · serves: general craft (documentation must not outrun reality)
  · enforced-by: prompt-only
  · why: confirmed via `npm view constitution-cli version` → 404; anything implying
    otherwise is false advertising to the next person who reads this repo.
