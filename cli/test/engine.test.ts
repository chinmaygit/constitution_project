import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect } from 'vitest';
import { makeInstanceDir, MINI_CONSTITUTION } from './fixture';
import { loadInstance, canonicalHash, parseConstitution } from '../src/engine/parse';
import { audit } from '../src/engine/audit';
import { computeLock, diffLock, writeLock } from '../src/engine/lock';
import { appendEvent, readEvents } from '../src/engine/events';
import { foldBoard, renderBoardHtml } from '../src/engine/board';
import { renderUnit, checkTones, pruneStaleTones } from '../src/engine/tone';
import { buildCompilePack } from '../src/engine/compile';
import { queueProposal, listProposals, recordRuling, hasOpenProposalFor } from '../src/engine/proposals';
import { runDoctor } from '../src/engine/doctor';

describe('parse', () => {
  it('reads header, preamble, articles, statutes, adrs, ledger', () => {
    const dir = makeInstanceDir();
    const inst = loadInstance(dir);
    expect(inst.constitution.version).toBe('1.2.3');
    expect(inst.constitution.ratifier).toBe('Ada Lovelace');
    expect(inst.constitution.selfHosted).toBe(false);
    expect(inst.constitution.preamble.map((p) => p.id)).toEqual(['P1', 'P2']);
    expect(inst.constitution.articles.map((a) => a.id)).toEqual(['A1', 'A2']);
    const a1 = inst.constitution.articles[0];
    expect(a1.status).toBe('RATIFIED');
    expect(a1.enforcement).toBe('GATED');
    expect(a1.serves).toEqual(['P1']);
    expect(a1.principle).toContain('verification');
    expect(inst.statutes).toHaveLength(1);
    expect(inst.statutes[0].serves).toBe('A1');
    expect(inst.statutes[0].enforcedBy).toBe('CI');
    expect(inst.adrs).toHaveLength(1);
    expect(inst.adrs[0].serves).toEqual(['A1']);
    expect(inst.constitution.ledger[0].version).toBe('1.2.3');
  });

  it('parses the self-hosted framework repo itself (dogfood)', () => {
    const repoRoot = path.resolve(__dirname, '..', '..');
    const inst = loadInstance(repoRoot);
    expect(inst.constitution.selfHosted).toBe(true);
    expect(inst.constitution.preamble.map((p) => p.id)).toEqual(['P1']);
    expect(inst.constitution.articles.map((a) => a.id)).toEqual([
      'F-I', 'F-II', 'F-III', 'F-IV', 'F-V', 'F-VI', 'F-VII',
    ]);
    expect(inst.constitution.articles.every((a) => a.status === 'RATIFIED')).toBe(true);
    expect(inst.statutes.length).toBeGreaterThan(5);
    expect(inst.adrs).toHaveLength(1);
    const findings = audit(inst);
    expect(findings.filter((f) => f.severity === 'error')).toEqual([]);
  });
});

describe('parse: real-world format variance (found dogfooding against DSAMind)', () => {
  it('parses titled P-lines, section-grouped #### Articles, Serves parentheticals, and dated SUPERSEDED status', () => {
    const dir = makeInstanceDir({
      constitution: () => `# Acme Constitution

\`\`\`
framework: constitution@1.2.3
ratifier:  Ada Lovelace
\`\`\`

## L0 — Preamble (vision)

**P1 — Fluency, not coverage.**
Acme exists to make widgets trustworthy.

**P2 — In service of the interview.**
Widgets ship only when proven to work.

## L1 — Articles

### §A — Widget model
_Serves P1, P2._

#### Article A1 — Widgets are verified
\`status: RATIFIED\` · \`conformance: HOLDS\` · \`enforcement: GATED\` · \`party: User\`

- **Principle** — Every widget passes verification before it ships.
- **Serves** — P1 (fluency is measured, not assumed), P2 (the interview is the point).
- **Fitness** — CI runs the verify suite on every widget build.

#### Article A2 — Legacy widget rule
\`status: SUPERSEDED — 2026-07-02\` · \`conformance: HOLDS\` · \`enforcement: UNGUARDED\` · \`party: User\`

- **Principle** — Widgets used to be hand-checked.
- **Serves** — P2 (grow).
- **Fitness** — n/a — superseded.

---

## Amendments Ledger

### [1.2.3] — 2026-07-01 — founding ratification
- Founding entry. Ratifier: Ada Lovelace.
`,
    });
    const inst = loadInstance(dir);
    expect(inst.constitution.preamble.map((p) => p.id)).toEqual(['P1', 'P2']);
    expect(inst.constitution.preamble[0].text).toContain('Fluency, not coverage');
    expect(inst.constitution.preamble[0].text).toContain('trustworthy');
    expect(inst.constitution.articles.map((a) => a.id)).toEqual(['A1', 'A2']);
    expect(inst.constitution.articles[0].serves).toEqual(['P1', 'P2']);
    expect(inst.constitution.articles[1].serves).toEqual(['P2']);
    expect(inst.constitution.articles[1].status).toBe('SUPERSEDED — 2026-07-02');

    const findings = audit(inst);
    expect(findings.map((f) => f.code)).not.toContain('L0-EMPTY');
    expect(findings.map((f) => f.code)).not.toContain('ART-STATUS');
    expect(findings.map((f) => f.code)).not.toContain('ART-SERVES');
    expect(findings.map((f) => f.code)).not.toContain('PARSE');
  });

  it('does not apply LEDGER-SYNC to a non-self-hosted instance whose own ledger version differs from the framework pin', () => {
    const dir = makeInstanceDir({
      constitution: (s) => s.replace('### [1.2.3] — 2026-07-01', '### [0.5.0] — 2026-07-01'),
    });
    const findings = audit(loadInstance(dir));
    expect(findings.map((f) => f.code)).not.toContain('LEDGER-SYNC');
  });
});

describe('canonical hashing', () => {
  it('is stable under reflow but not under wording changes', () => {
    const a = 'The quick brown fox\njumps over the   lazy dog.';
    const b = 'The quick brown fox jumps over the lazy dog.';
    const c = 'The quick brown fox jumps over the eager dog.';
    expect(canonicalHash(a)).toBe(canonicalHash(b));
    expect(canonicalHash(a)).not.toBe(canonicalHash(c));
  });

  it('article hash ignores conformance/enforcement (audit outputs) but not principle', () => {
    const dir = makeInstanceDir();
    const base = parseConstitution(path.join(dir, 'CONSTITUTION.md')).articles[0].hash;
    fs.writeFileSync(
      path.join(dir, 'CONSTITUTION.md'),
      MINI_CONSTITUTION.replace('`conformance: HOLDS` · `enforcement: GATED`', '`conformance: VIOLATED` · `enforcement: UNGUARDED`')
    );
    expect(parseConstitution(path.join(dir, 'CONSTITUTION.md')).articles[0].hash).toBe(base);
    fs.writeFileSync(
      path.join(dir, 'CONSTITUTION.md'),
      MINI_CONSTITUTION.replace('passes verification before it ships', 'usually passes verification')
    );
    expect(parseConstitution(path.join(dir, 'CONSTITUTION.md')).articles[0].hash).not.toBe(base);
  });
});

describe('lock / firewall', () => {
  it('locks only ratified units and detects edits, unaccepted ratifications, and repeals', () => {
    const dir = makeInstanceDir();
    const inst = loadInstance(dir);
    const lock = computeLock(inst, 'Ada');
    // P1, P2 (preamble always ratified) + A1 (RATIFIED); A2 is PROPOSED — excluded.
    expect(Object.keys(lock.units).sort()).toEqual(['A1', 'P1', 'P2']);
    expect(diffLock(inst, lock).clean).toBe(true);

    // An agent edits ratified principle text → changed.
    fs.writeFileSync(
      path.join(dir, 'CONSTITUTION.md'),
      MINI_CONSTITUTION.replace('Every widget passes verification', 'Most widgets pass verification')
    );
    expect(diffLock(loadInstance(dir), lock).changed).toEqual(['A1']);

    // An agent flips PROPOSED → RATIFIED → added (unaccepted ratification).
    fs.writeFileSync(path.join(dir, 'CONSTITUTION.md'), MINI_CONSTITUTION.replace('`status: PROPOSED`', '`status: RATIFIED`'));
    expect(diffLock(loadInstance(dir), lock).added).toEqual(['A2']);

    // A ratified article vanishes → removed.
    fs.writeFileSync(path.join(dir, 'CONSTITUTION.md'), MINI_CONSTITUTION.replace('`status: RATIFIED`', '`status: SUPERSEDED`'));
    expect(diffLock(loadInstance(dir), lock).removed).toEqual(['A1']);
  });
});

describe('audit', () => {
  it('is clean on the well-formed fixture', () => {
    const inst = loadInstance(makeInstanceDir());
    expect(audit(inst).filter((f) => f.severity === 'error')).toEqual([]);
  });

  it('flags dangling serves as above-firewall, L0 overflow, and missing forward links', () => {
    const dir = makeInstanceDir({
      constitution: (s) =>
        s
          .replace('- **Serves** — P2.', '- **Serves** — P9.')
          .replace(
            '## L1 — Articles',
            '**P3.** Three.\n\n**P4.** Four is too many.\n\n## L1 — Articles'
          ),
    });
    fs.writeFileSync(
      path.join(dir, 'decisions', '0002-old.md'),
      '---\nid: 0002\ntitle: old\nstatus: superseded\ndate: 2026-01-01\nsupersedes: []\nsuperseded_by: []\nserves: [A1]\namends: []\ntrigger: migration\n---\n## Question of law\nq\n## Ruling\nr\n'
    );
    const findings = audit(loadInstance(dir));
    const codes = findings.map((f) => f.code);
    expect(codes).toContain('ART-SERVES-DANGLING');
    expect(findings.find((f) => f.code === 'ART-SERVES-DANGLING')!.firewall).toBe('above');
    expect(codes).toContain('L0-SIZE');
    expect(codes).toContain('ADR-NO-FORWARD-LINK');
  });

  it('flags an agent-written RATIFIED article missing from the lock', () => {
    const dir = makeInstanceDir();
    const inst = loadInstance(dir);
    const lock = computeLock(inst, 'Ada');
    writeLock(dir, lock);
    expect(audit(loadInstance(dir)).some((f) => f.code.startsWith('LOCK-'))).toBe(false);
    fs.writeFileSync(path.join(dir, 'CONSTITUTION.md'), MINI_CONSTITUTION.replace('`status: PROPOSED`', '`status: RATIFIED`'));
    const f = audit(loadInstance(dir)).find((x) => x.code === 'LOCK-UNACCEPTED');
    expect(f).toBeDefined();
    expect(f!.firewall).toBe('above');
    expect(f!.severity).toBe('error');
  });
});

describe('ops plane: events + board', () => {
  it('folds the event log into kanban columns with blocked flags', () => {
    const dir = makeInstanceDir();
    appendEvent(dir, { type: 'declared', feature: 'widget-search', title: 'Widget search', refs: ['A1'] });
    appendEvent(dir, { type: 'compiled', feature: 'widget-search' });
    appendEvent(dir, { type: 'started', feature: 'widget-search' });
    appendEvent(dir, { type: 'blocked', feature: 'widget-search', detail: 'waiting on schema' });
    appendEvent(dir, { type: 'declared', feature: 'export-csv', title: 'CSV export' });
    appendEvent(dir, { type: 'started', feature: 'export-csv' });
    appendEvent(dir, { type: 'validated', feature: 'export-csv' });
    appendEvent(dir, { type: 'shipped', feature: 'export-csv' });

    expect(readEvents(dir)).toHaveLength(8);
    const board = foldBoard(dir);
    const col = (id: string) => board.columns.find((c) => c.id === id)!.features;
    expect(col('started').map((f) => f.feature)).toEqual(['widget-search']);
    expect(col('started')[0].blocked).toBe(true);
    expect(col('started')[0].refs).toEqual(['A1']);
    expect(col('shipped').map((f) => f.feature)).toEqual(['export-csv']);

    const html = renderBoardHtml(board, loadInstance(dir));
    expect(html).toContain('Widget search');
    expect(html).toContain('cf-HOLDS');
    expect(html).toContain('BLOCKED');
  });
});

describe('tone rendering', () => {
  it('generates via the transform, caches by canonical hash, and refuses stale views', () => {
    const dir = makeInstanceDir();
    let calls = 0;
    const stub = (_prompt: string, source: string) => {
      calls++;
      return `PLAIN: ${source.slice(0, 30)}`;
    };
    const inst = loadInstance(dir);
    const r1 = renderUnit(inst, 'A1', 'plain', stub);
    expect(r1.generated).toBe(true);
    const r2 = renderUnit(inst, 'A1', 'plain', stub);
    expect(r2.fromCache).toBe(true);
    expect(calls).toBe(1);
    expect(r2.text).toBe(r1.text);

    // canonical passthrough never touches the generator or cache
    const canon = renderUnit(inst, 'A1', 'canonical', null);
    expect(canon.text).toContain('Every widget passes verification');

    // amend the canonical text → cached view is stale by construction
    fs.writeFileSync(
      path.join(dir, 'CONSTITUTION.md'),
      MINI_CONSTITUTION.replace('Every widget passes verification', 'Each widget must pass verification')
    );
    const inst2 = loadInstance(dir);
    expect(checkTones(inst2).stale).toHaveLength(1);
    expect(() => renderUnit(inst2, 'A1', 'plain', null)).toThrow(/no fresh plain render/);
    // with a generator it re-renders rather than serving the stale view
    const r3 = renderUnit(inst2, 'A1', 'plain', stub);
    expect(r3.generated).toBe(true);
    expect(calls).toBe(2);

    // prune removes nothing now (fresh), but removes after another amendment
    fs.writeFileSync(path.join(dir, 'CONSTITUTION.md'), MINI_CONSTITUTION);
    expect(pruneStaleTones(loadInstance(dir))).toHaveLength(1);
    expect(checkTones(loadInstance(dir)).fresh).toHaveLength(0);
  });
});

describe('compile pack', () => {
  it('contains only ratified law plus statute/adr indexes and the contract', () => {
    const inst = loadInstance(makeInstanceDir());
    const pack = buildCompilePack(inst, 'add widget search');
    expect(pack).toContain('task: add widget search');
    expect(pack).toContain('### A1 — Widgets are verified');
    expect(pack).not.toContain('### A2'); // PROPOSED is not law
    expect(pack).toContain('single verify entrypoint');
    expect(pack).toContain('ADR-0001');
    expect(pack).toContain('DEFINITION OF DONE');
    expect(pack).toContain('STOP and');
  });
});

describe('proposals + doctor', () => {
  it('queues above-firewall findings exactly once and never edits the law', () => {
    // P2 stays served (so only ONE above-firewall finding: the dangling P9)
    const dir = makeInstanceDir({ constitution: (s) => s.replace('- **Serves** — P2.', '- **Serves** — P2, P9.') });
    const before = fs.readFileSync(path.join(dir, 'CONSTITUTION.md'), 'utf8');
    const report1 = runDoctor(loadInstance(dir));
    expect(report1.queued).toHaveLength(1);
    expect(listProposals(dir)[0].status).toBe('PROPOSED');
    // idempotent: second run skips, doesn't duplicate
    const report2 = runDoctor(loadInstance(dir));
    expect(report2.queued).toHaveLength(0);
    expect(report2.skipped).toHaveLength(1);
    expect(listProposals(dir)).toHaveLength(1);
    // the law plane is untouched
    expect(fs.readFileSync(path.join(dir, 'CONSTITUTION.md'), 'utf8')).toBe(before);
  });

  it('records a human ruling without applying anything', () => {
    const dir = makeInstanceDir();
    const p = queueProposal(dir, { title: 'Amend A1 wording', kind: 'amendment', target: 'A1', rationale: 'r', draft: 'd' });
    expect(hasOpenProposalFor(dir, 'A1', 'amendment')).toBe(true);
    const ruled = recordRuling(dir, p.id, 'APPROVED', 'Ada Lovelace');
    expect(ruled.status).toBe('APPROVED');
    expect(hasOpenProposalFor(dir, 'A1', 'amendment')).toBe(false);
    expect(() => recordRuling(dir, p.id, 'REJECTED', 'Eve')).toThrow(/already APPROVED/);
  });

  it('prunes stale tone renders as a below-firewall fix', () => {
    const dir = makeInstanceDir();
    renderUnit(loadInstance(dir), 'P1', 'plain', () => 'plain P1');
    fs.writeFileSync(path.join(dir, 'CONSTITUTION.md'), MINI_CONSTITUTION.replace('widgets trustworthy', 'widgets dependable'));
    const report = runDoctor(loadInstance(dir));
    expect(report.fixed.some((f) => f.includes('pruned stale tone render'))).toBe(true);
  });
});
