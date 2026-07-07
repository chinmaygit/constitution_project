import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect } from 'vitest';
import { makeInstanceDir, MINI_CONSTITUTION, MINI_ADR } from './fixture';
import { loadInstance, canonicalHash, parseConstitution } from '../src/engine/parse';
import { audit } from '../src/engine/audit';
import { stripInlineMarkup, countWords, sentenceLengths, hasStackedQualifier } from '../src/engine/prose';
import { computeLock, diffLock, writeLock } from '../src/engine/lock';
import { appendEvent, readEvents } from '../src/engine/events';
import { foldBoard, renderBoardHtml } from '../src/engine/board';
import { renderUnit, checkTones, pruneStaleTones } from '../src/engine/tone';
import { buildCompilePack } from '../src/engine/compile';
import { queueProposal, listProposals, recordRuling, hasOpenProposalFor } from '../src/engine/proposals';
import { runDoctor } from '../src/engine/doctor';
import { scaffoldFramework } from '../src/scaffold';
import { ensureOps } from '../src/engine/events';
import * as os from 'os';

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
    expect(inst.adrs).toHaveLength(3);
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

describe('scaffold: .gitignore does not shadow the ops-plane\'s own rules', () => {
  it('ignores only the regenerable vendored copies, leaving events.jsonl/proposals trackable', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'constitution-scaffold-'));
    await scaffoldFramework(dir, 'Acme', 'Ada');
    ensureOps(dir);
    const gitignore = fs.readFileSync(path.join(dir, '.gitignore'), 'utf8');
    expect(gitignore).toContain('.constitution/templates/');
    expect(gitignore).toContain('.constitution/process/');
    expect(gitignore).not.toMatch(/^\.constitution\/\s*$/m);

    // Simulate git's own ignore-matching: a blanket `.constitution/` entry
    // would make this file unreachable regardless of the nested .gitignore.
    const rules = gitignore.split('\n').filter(Boolean).filter((l) => !l.startsWith('#'));
    const ignoredAsDir = rules.some((r) => r === '.constitution/' || r === '.constitution');
    expect(ignoredAsDir).toBe(false);

    const opsIgnore = fs.readFileSync(path.join(dir, '.constitution', '.gitignore'), 'utf8');
    expect(opsIgnore).toContain('tone/');
    expect(opsIgnore).toContain('compiles/');
    expect(opsIgnore).not.toContain('events.jsonl');
  });

  it('re-running init on an existing governance map (case-insensitive heading) does not duplicate it', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'constitution-scaffold-'));
    fs.writeFileSync(path.join(dir, 'AGENTS.md'), '## Governance map (entry point)\n\nCustom, hand-authored map.\n');
    await scaffoldFramework(dir, 'Acme', 'Ada');
    const content = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
    expect(content).toBe('## Governance map (entry point)\n\nCustom, hand-authored map.\n');
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

describe('prose.ts: text-analysis primitives (EXP-0001)', () => {
  it('stripInlineMarkup drops code spans and keeps link text, not the URL', () => {
    expect(stripInlineMarkup('')).toBe('');
    expect(stripInlineMarkup('see `status: RATIFIED` here')).toBe('see  here');
    expect(stripInlineMarkup('see [registry.md](registry.md) here')).toBe('see registry.md here');
    expect(stripInlineMarkup('a `code span` and a [link](https://example.com/very/long/path) together')).toBe(
      'a  and a link together'
    );
  });

  it('countWords handles empty/whitespace and strips markup before counting', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n\t  ')).toBe(0);
    expect(countWords('one two three')).toBe(3);
    // a long URL must not inflate the count — it's stripped before counting
    expect(countWords('see [it](https://example.com/a/b/c/d/e/f/g/h) now')).toBe(3);
  });

  it('sentenceLengths treats text with no terminal punctuation as one sentence', () => {
    expect(sentenceLengths('')).toEqual([]);
    expect(sentenceLengths('no ending punctuation here')).toEqual([4]);
  });

  it('sentenceLengths does not fragment a numbered list into meaningless pieces', () => {
    const text =
      'A version number is a governed fact, and three exist: 1. the ledger version, ' +
      '2. the framework spec version, 3. the tooling version. Axis three is different.';
    const lens = sentenceLengths(text);
    // one long sentence covering the whole numbered list, then a short one
    expect(lens.length).toBe(2);
    expect(lens[0]).toBeGreaterThan(20);
    expect(lens[1]).toBeLessThan(6);
  });

  it('hasStackedQualifier requires 2+ DISTINCT pattern types, not repeats of the same type', () => {
    expect(hasStackedQualifier('a plain sentence with nothing unusual')).toBe(false);
    expect(hasStackedQualifier('a clause set off — like this — on its own')).toBe(false); // 1 type only
    expect(hasStackedQualifier('two separate — asides — used here — again')).toBe(false); // same type twice
    expect(hasStackedQualifier('this holds — with one exception noted here')).toBe(true); // em-dash + "exception"
    expect(hasStackedQualifier('unless scoped to a narrower case (see below)')).toBe(false); // 1 type only
    expect(hasStackedQualifier('a rule (with a nested (inner) clause) — and an exception')).toBe(true); // nested paren + em-dash + exception
  });
});

describe('audit: governance prose clarity (EXP-0001, WARN-ONLY)', () => {
  it('never blocks — findings are always severity warn, firewall below', () => {
    const dir = makeInstanceDir({
      constitution: (s) =>
        s.replace(
          '- **Principle** — Every widget passes verification before it ships.',
          '- **Principle** — Every widget passes verification before it ships, except — as a carved-out exception — legacy widgets grandfathered in before the rule existed, which is a separate case entirely and always will be.'
        ),
    });
    const findings = audit(loadInstance(dir));
    const prose = findings.filter((f) => f.code.startsWith('PROSE-'));
    expect(prose.length).toBeGreaterThan(0);
    for (const p of prose) {
      expect(p.severity).toBe('warn');
      expect(p.firewall).toBe('below');
    }
    // warn findings never flip the exit-determining error filter
    expect(findings.filter((f) => f.severity === 'error')).toEqual([]);
  });

  it('checkProse fires independently on every field it is wired to, not just Article Principle', () => {
    // Covers the remaining checkProse() call sites (Article Fitness/Why, Statute
    // rule/Why, ADR body) — regression guard against a wrong-field reference
    // (e.g. checking .enforcedBy instead of .why) that unit tests on prose.ts
    // alone wouldn't catch, since that would still be a syntactically valid call.
    const dense =
      'This holds — with one exception noted here — because the rule was written before ' +
      'the edge case existed and nobody has revisited it since the original decision, which ' +
      'is itself now a separate problem entirely.';

    const fitnessDir = makeInstanceDir({
      constitution: (s) => s.replace('- **Fitness** — CI runs the verify suite on every widget build.', `- **Fitness** — ${dense}`),
    });
    const fitnessFindings = audit(loadInstance(fitnessDir)).filter((f) => f.code.startsWith('PROSE-'));
    expect(fitnessFindings.some((f) => f.message.includes('A1 Fitness'))).toBe(true);

    const whyDir = makeInstanceDir({
      constitution: (s) => s.replace('- **Why** — unverified widgets break user trust.', `- **Why** — ${dense}`),
    });
    const whyFindings = audit(loadInstance(whyDir)).filter((f) => f.code.startsWith('PROSE-'));
    expect(whyFindings.some((f) => f.message.includes('A1 Why'))).toBe(true);

    const statuteRuleDir = makeInstanceDir({
      map: (s) => s.replace('All widget checks run through the single verify entrypoint.', dense),
    });
    const statuteRuleFindings = audit(loadInstance(statuteRuleDir)).filter((f) => f.code.startsWith('PROSE-'));
    expect(statuteRuleFindings.some((f) => f.message.startsWith('statute "'))).toBe(true);

    const statuteWhyDir = makeInstanceDir({
      map: (s) => s.replace('two entrypoints drift apart silently.', dense),
    });
    const statuteWhyFindings = audit(loadInstance(statuteWhyDir)).filter((f) => f.code.startsWith('PROSE-'));
    expect(statuteWhyFindings.some((f) => f.message.includes('Why'))).toBe(true);

    const adrDir = makeInstanceDir();
    fs.writeFileSync(
      path.join(adrDir, 'decisions', '0001-verify-pre-merge.md'),
      MINI_ADR.replace('Pre-merge, always.', `Pre-merge, always. ${dense}`)
    );
    const adrFindings = audit(loadInstance(adrDir)).filter((f) => f.code.startsWith('PROSE-'));
    expect(adrFindings.some((f) => f.message.includes('ADR 0001'))).toBe(true);
  });

  it('checkProse skips empty/undefined fields without producing findings', () => {
    const dir = makeInstanceDir({
      constitution: (s) => s.replace('- **Why** — unverified widgets break user trust.', '- **Why** — '),
    });
    const findings = audit(loadInstance(dir)).filter((f) => f.code.startsWith('PROSE-'));
    expect(findings.some((f) => f.message.includes('A1 Why'))).toBe(false);
  });

  it('a non-last ledger entry stops its body at the next heading, not before or after', () => {
    // The fixture's only prior ledger test covers the LAST-entry/EOF boundary
    // (headings.length - 1). This covers the other branch of parseLedger's
    // ternary: end = headings[k+1].index — an off-by-one here would silently
    // bleed the next entry's heading (or its own last line) across the boundary.
    const dir = makeInstanceDir({
      constitution: (s) =>
        s.replace(
          '### [1.2.3] — 2026-07-01 — founding ratification\n- Founding entry. Ratifier: Ada Lovelace.',
          '### [1.2.3] — 2026-07-01 — founding ratification\n- Founding entry line one.\n- Founding entry line two.\n\n' +
            '### [1.3.0] — 2026-07-02 — second entry\n- Second entry text. Ratifier: Grace Hopper.'
        ),
    });
    const inst = loadInstance(dir);
    expect(inst.constitution.ledger.length).toBe(2);
    expect(inst.constitution.ledger[0].body).toContain('line two');
    expect(inst.constitution.ledger[0].body).not.toContain('Second entry text');
    expect(inst.constitution.ledger[1].body).toContain('Grace Hopper');
  });

  it('parseAdr body falls back to the whole raw file when there is no YAML frontmatter', () => {
    const dir = makeInstanceDir();
    fs.writeFileSync(
      path.join(dir, 'decisions', '0002-no-frontmatter.md'),
      '## Question of law\nWhat happens with no frontmatter?\n\n## Ruling\nIt still parses.\n'
    );
    const inst = loadInstance(dir);
    const adr = inst.adrs.find((a) => a.file.endsWith('0002-no-frontmatter.md'))!;
    expect(adr.body).toContain('It still parses');
    expect(adr.parseNotes).toContain('no YAML frontmatter');
  });

  it('a baseline file with valid JSON but a non-array keys field degrades to nothing-known', () => {
    // Distinct from the "corrupt JSON" test above — this is syntactically
    // valid JSON with the wrong shape, exercising the other branch of
    // readProseBaseline's Array.isArray(parsed?.keys) check.
    const dir = makeInstanceDir();
    const opsDir = path.join(dir, '.constitution');
    fs.mkdirSync(opsDir, { recursive: true });
    fs.writeFileSync(path.join(opsDir, 'prose-baseline.json'), JSON.stringify({ keys: 'oops' }));
    const findings = audit(loadInstance(dir)).filter((f) => f.code.startsWith('PROSE-') || f.code === 'LEDGER-LENGTH');
    expect(findings.every((f) => f.baseline === false)).toBe(true);
  });

  it('flags a ledger entry over the word cap and leaves a short one alone', () => {
    const longEntry = 'Session narrative. '.repeat(40); // ~120 words, pad to exceed 150
    const dir = makeInstanceDir({
      constitution: (s) =>
        s.replace(
          '### [1.2.3] — 2026-07-01 — founding ratification\n- Founding entry. Ratifier: Ada Lovelace.',
          `### [1.2.3] — 2026-07-01 — founding ratification\n- ${longEntry}${longEntry}`
        ),
    });
    const findings = audit(loadInstance(dir));
    const ledgerFinding = findings.find((f) => f.code === 'LEDGER-LENGTH');
    expect(ledgerFinding).toBeDefined();
    expect(ledgerFinding!.message).toContain('[1.2.3]');

    const shortDir = makeInstanceDir(); // unmodified fixture, short ledger entry
    expect(audit(loadInstance(shortDir)).find((f) => f.code === 'LEDGER-LENGTH')).toBeUndefined();
  });

  it('the last ledger entry (no trailing heading) is still checked, not silently dropped', () => {
    // MINI_CONSTITUTION's single ledger entry IS the last section in the file —
    // this is the real EOF-boundary case (verified against CONSTITUTION.md itself).
    const dir = makeInstanceDir();
    const inst = loadInstance(dir);
    expect(inst.constitution.ledger[0].body.length).toBeGreaterThan(0);
    expect(inst.constitution.ledger[0].body).toContain('Ada Lovelace');
  });

  it('baseline-snapshot: self-initializes on first run, then isolates new findings from known ones', () => {
    const dir = makeInstanceDir({
      constitution: (s) =>
        s.replace(
          '- **Principle** — Every widget passes verification before it ships.',
          '- **Principle** — Every widget passes verification before it ships, except — as a carved-out exception — legacy widgets grandfathered in before the rule existed, which is a separate case entirely and always will be.'
        ),
    });
    const first = audit(loadInstance(dir));
    const firstProse = first.filter((f) => f.code.startsWith('PROSE-'));
    expect(firstProse.length).toBeGreaterThan(0);
    expect(firstProse.every((f) => f.baseline === true)).toBe(true); // day-one: nothing is "new"
    expect(fs.existsSync(path.join(dir, '.constitution', 'prose-baseline.json'))).toBe(true);

    // Second run, nothing changed — still baseline (matches the snapshot).
    const second = audit(loadInstance(dir)).filter((f) => f.code.startsWith('PROSE-'));
    expect(second.every((f) => f.baseline === true)).toBe(true);

    // Introduce a NEW dense field (A2's Principle) — only the new one is baseline:false.
    fs.writeFileSync(
      path.join(dir, 'CONSTITUTION.md'),
      fs
        .readFileSync(path.join(dir, 'CONSTITUTION.md'), 'utf8')
        .replace(
          '- **Principle** — Failures are always surfaced to the user.',
          '- **Principle** — Failures are always surfaced to the user, except — in one narrow exception — during a graceful shutdown, which is a separate case entirely and always will be.'
        )
    );
    const third = audit(loadInstance(dir)).filter((f) => f.code.startsWith('PROSE-'));
    const newOnes = third.filter((f) => f.baseline === false);
    const oldOnes = third.filter((f) => f.baseline === true);
    expect(newOnes.length).toBeGreaterThan(0);
    expect(oldOnes.length).toBeGreaterThan(0);
  });

  it('the written baseline has no duplicate keys, even when 2+ fields share a where', () => {
    // Adversarial review finding: Principle and Fitness on the same Article
    // line both key to the same `where`, and an undeduped write grew
    // duplicate array entries every time the self-init branch ran.
    const dir = makeInstanceDir({
      constitution: (s) =>
        s
          .replace(
            '- **Principle** — Every widget passes verification before it ships.',
            '- **Principle** — Every widget passes verification before it ships, except — as a carved-out exception — legacy widgets grandfathered in before the rule existed, which is a separate case entirely and always will be.'
          )
          .replace(
            '- **Fitness** — CI runs the verify suite on every widget build.',
            '- **Fitness** — This holds — with one exception noted here — because the rule predates the edge case and nobody has revisited it since, which is itself now a separate problem entirely.'
          ),
    });
    audit(loadInstance(dir));
    const raw = JSON.parse(fs.readFileSync(path.join(dir, '.constitution', 'prose-baseline.json'), 'utf8'));
    expect(raw.keys.length).toBe(new Set(raw.keys).size);
  });

  it('a missing or corrupt baseline file degrades gracefully instead of crashing', () => {
    const dir = makeInstanceDir();
    const opsDir = path.join(dir, '.constitution');
    fs.mkdirSync(opsDir, { recursive: true });
    fs.writeFileSync(path.join(opsDir, 'prose-baseline.json'), '{ not valid json');
    expect(() => audit(loadInstance(dir))).not.toThrow();
    const findings = audit(loadInstance(dir)).filter((f) => f.code.startsWith('PROSE-') || f.code === 'LEDGER-LENGTH');
    // corrupt baseline degrades to "nothing known" — everything reads as not-yet-baselined
    expect(findings.every((f) => f.baseline === false)).toBe(true);
  });

  it('the real F-II example: sentence-length fires on the actual known-bad text', () => {
    // Regression guard against the exact case the WARN-ONLY experiment is
    // calibrated on (see design doc + eng review). Uses the real repo, not the
    // fixture, since this is the specific known-bad text the thresholds were
    // chosen against.
    const repoRoot = path.resolve(__dirname, '..', '..');
    const inst = loadInstance(repoRoot);
    const findings = audit(inst);
    const f2 = findings.find((f) => f.code === 'PROSE-SENTENCE-LEN' && f.message.includes('F-II'));
    expect(f2).toBeDefined();
    const ledgerHit = findings.find((f) => f.code === 'LEDGER-LENGTH' && f.message.includes('[0.17.0]'));
    expect(ledgerHit).toBeDefined();
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
