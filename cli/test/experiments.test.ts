import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { describe, it, expect } from 'vitest';
import { makeInstanceDir } from './fixture';
import { loadInstance } from '../src/engine/parse';
import { audit } from '../src/engine/audit';
import { installHook, HOOK_MARKER } from '../src/engine/hooks';

const GOOD_EXP = `# EXP-0001 · verify-suite catch rate

\`\`\`
candidate        → Article A3 (draft, not yet law)
status           RUNNING
pre-registered   2026-06-01
ratifier         Ada Lovelace
\`\`\`

## Hypothesis
The verify suite catches 90% of seeded widget defects.

## Enforcement during the experiment
Warn-only: failures logged, not blocking.

## Metric
Catch rate over seeded defects; guardrail: false-positive rate < 5%.

## Decision rule  (frozen — do not edit after PRE-REGISTERED)
- RATIFY if catch rate ≥ 90% over 50 defects
- REJECT otherwise

## Result  (fill at MEASURED)
<pending>
`;

function withExperiment(content: string, name = 'EXP-0001-catch-rate.md'): string {
  const dir = makeInstanceDir();
  fs.mkdirSync(path.join(dir, 'experiments'));
  fs.writeFileSync(path.join(dir, 'experiments', name), content);
  return dir;
}

describe('experiments (F-III mechanized)', () => {
  it('parses a well-formed experiment and audits clean', () => {
    const dir = withExperiment(GOOD_EXP);
    const inst = loadInstance(dir);
    expect(inst.experiments).toHaveLength(1);
    const e = inst.experiments[0];
    expect(e.id).toBe('EXP-0001');
    expect(e.status).toBe('RUNNING');
    expect(e.preRegistered).toBe('2026-06-01');
    expect(e.hypothesis).toContain('90%');
    expect(e.decisionRule).toContain('RATIFY if');
    expect(audit(inst).filter((f) => f.code.startsWith('EXP-'))).toEqual([]);
  });

  it('flags RUNNING without pre-registration and placeholder fields', () => {
    const dir = withExperiment(
      GOOD_EXP.replace('pre-registered   2026-06-01', 'pre-registered   <YYYY-MM-DD>').replace(
        /## Metric\n[^\n]+/,
        '## Metric\n<the primary signal, plus any guardrail signal>'
      )
    );
    const codes = audit(loadInstance(dir)).map((f) => f.code);
    expect(codes).toContain('EXP-PREREG');
    expect(codes).toContain('EXP-FIELDS');
  });

  it('a DRAFT may be empty; a future pre-registration may not', () => {
    const draftDir = withExperiment(GOOD_EXP.replace('status           RUNNING', 'status           DRAFT').replace('pre-registered   2026-06-01', 'pre-registered   <YYYY-MM-DD>'));
    expect(audit(loadInstance(draftDir)).filter((f) => f.code.startsWith('EXP-'))).toEqual([]);

    const futureDir = withExperiment(GOOD_EXP.replace('2026-06-01', '2099-01-01'));
    expect(audit(loadInstance(futureDir)).map((f) => f.code)).toContain('EXP-PREREG-FUTURE');
  });
});

describe('hooks install', () => {
  it('installs into a fresh repo, is idempotent, and refuses foreign hooks without --force', () => {
    const dir = makeInstanceDir();
    execFileSync('git', ['init', '-q'], { cwd: dir });
    const r1 = installHook(dir);
    expect(r1.action).toBe('installed');
    const content = fs.readFileSync(r1.path, 'utf8');
    expect(content).toContain(HOOK_MARKER);
    expect(content).toContain('constitution firewall');
    expect(fs.statSync(r1.path).mode & 0o111).toBeTruthy();

    expect(installHook(dir).action).toBe('updated');

    fs.writeFileSync(r1.path, '#!/bin/sh\necho custom hook\n');
    expect(() => installHook(dir)).toThrow(/not written by constitution/);
    expect(installHook(dir, true).action).toBe('updated');
  });
});

describe('experiment section parsing edge case', () => {
  it('reads a required section that is the last section in the file', () => {
    const truncated = GOOD_EXP.split('## Result')[0].trimEnd() + '\n';
    const dir = withExperiment(truncated);
    const inst = loadInstance(dir);
    expect(inst.experiments[0].decisionRule).toContain('RATIFY if');
    expect(audit(inst).filter((f) => f.code.startsWith('EXP-'))).toEqual([]);
  });
});
