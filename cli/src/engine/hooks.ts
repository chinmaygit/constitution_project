// `constitution hooks install` — the firewall as a LOCAL gate: a pre-commit
// hook running `constitution audit` + `constitution firewall`, so ratified-text
// drift is blocked at commit time, not discovered in CI. Idempotent; refuses to
// clobber a hook it didn't write (marker line) unless forced.

import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';

export const HOOK_MARKER = '# constitution-governance-hook v1';

const HOOK_SCRIPT = `#!/bin/sh
${HOOK_MARKER}
# Installed by \`constitution hooks install\`. Blocks commits that break the
# constitution's structural audit or drift ratified L0/L1 from the accepted
# lock (F-IV). Re-run \`constitution hooks install\` to update; delete to remove.

if ! command -v constitution >/dev/null 2>&1; then
  echo "constitution CLI not on PATH — governance pre-commit checks SKIPPED." >&2
  exit 0
fi

# Pre-0.17 CLIs have no audit/firewall subcommands — don't block commits with
# "Unknown command"; say why and pass.
if ! constitution --help 2>/dev/null | grep -q "firewall"; then
  echo "constitution CLI $(constitution --version 2>/dev/null) predates the governance engine (0.17.0) — checks SKIPPED; update the global install." >&2
  exit 0
fi

constitution audit || {
  echo "" >&2
  echo "pre-commit blocked: structural audit failed (see findings above)." >&2
  exit 1
}

if [ -f constitution.lock.json ]; then
  constitution firewall || {
    echo "" >&2
    echo "pre-commit blocked: ratified L0/L1 drifted from the accepted lock (F-IV)." >&2
    echo "Revert the law-plane change, or the ratifier runs \\\`constitution lock accept\\\`." >&2
    exit 1
  }
fi
`;

export function hooksDir(root: string): string {
  // Worktree-safe: .git may be a file pointing elsewhere.
  const out = execFileSync('git', ['rev-parse', '--git-path', 'hooks'], { cwd: root, encoding: 'utf8' }).trim();
  return path.isAbsolute(out) ? out : path.join(root, out);
}

export function installHook(root: string, force = false): { path: string; action: 'installed' | 'updated' } {
  const dir = hooksDir(root);
  fs.mkdirSync(dir, { recursive: true });
  const hookPath = path.join(dir, 'pre-commit');
  let action: 'installed' | 'updated' = 'installed';
  if (fs.existsSync(hookPath)) {
    const existing = fs.readFileSync(hookPath, 'utf8');
    if (!existing.includes(HOOK_MARKER) && !force) {
      throw new Error(
        `${hookPath} exists and was not written by constitution — merge the checks yourself or re-run with --force to overwrite`
      );
    }
    action = 'updated';
  }
  fs.writeFileSync(hookPath, HOOK_SCRIPT, { mode: 0o755 });
  return { path: hookPath, action };
}
