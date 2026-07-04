// Deterministic structural audit — the machine-checkable subset of the
// audit-structure skill, runnable in CI. Every finding is classified by what
// its FIX touches (the reconcile-findings discipline): `above` the firewall
// means the fix edits ratified L0/L1 substance and must go through a human;
// `below` means the engine or an agent may fix it directly.

import * as fs from 'fs';
import * as path from 'path';
import { Instance } from './model';
import { diffLock, readLock } from './lock';

export interface Finding {
  code: string;
  severity: 'error' | 'warn';
  firewall: 'above' | 'below';
  where: string; // file[:line] or unit id
  message: string;
}

const ARTICLE_STATUS = ['PROPOSED', 'RATIFIED', 'SUPERSEDED'];
const CONFORMANCE = ['HOLDS', 'VIOLATED', 'UNVERIFIED'];
const ENFORCEMENT = ['UNGUARDED', 'AUDITED', 'GATED', 'STRUCTURAL'];
const ADR_STATUS = ['proposed', 'accepted', 'superseded'];
const PLACEHOLDER_RE = /<[^>]+>|your name|todo|tbd|xxx/i;

export function audit(instance: Instance): Finding[] {
  const f: Finding[] = [];
  const doc = instance.constitution;
  const rel = path.relative(instance.root, doc.file) || path.basename(doc.file);

  // -- header ---------------------------------------------------------------
  if (!doc.version)
    f.push({ code: 'HEADER-PIN', severity: 'error', firewall: 'below', where: rel, message: 'no `framework: constitution@<version>` pin in the header fence' });
  if (!doc.ratifier || PLACEHOLDER_RE.test(doc.ratifier))
    f.push({ code: 'HEADER-RATIFIER', severity: 'error', firewall: 'above', where: rel, message: `ratifier is unset or a placeholder ("${doc.ratifier}") — F-IV requires a real human ratifier` });

  for (const note of doc.parseNotes)
    f.push({ code: 'PARSE', severity: 'warn', firewall: 'below', where: rel, message: note });

  // -- L0 (F-V) ---------------------------------------------------------------
  if (doc.preamble.length === 0)
    f.push({ code: 'L0-EMPTY', severity: 'warn', firewall: 'above', where: rel, message: 'L0 has no P<N> lines — the vision is undefined (run define-preamble with the ratifier)' });
  if (doc.preamble.length > 3)
    f.push({ code: 'L0-SIZE', severity: 'error', firewall: 'above', where: rel, message: `L0 holds ${doc.preamble.length} statements; F-V caps it at 3 — distill, don't accumulate` });

  const l0Ids = new Set(doc.preamble.map((p) => p.id));
  const served = new Set<string>();

  // -- L1 articles ------------------------------------------------------------
  const seen = new Set<string>();
  for (const a of doc.articles) {
    const where = `${rel}:${a.line}`;
    if (seen.has(a.id))
      f.push({ code: 'ART-DUP', severity: 'error', firewall: 'below', where, message: `Article ${a.id} appears twice (F-II: one home per rule)` });
    seen.add(a.id);

    if (!ARTICLE_STATUS.includes(a.status))
      f.push({ code: 'ART-STATUS', severity: 'error', firewall: 'above', where, message: `Article ${a.id}: status "${a.status}" is not ${ARTICLE_STATUS.join('|')}` });
    if (!CONFORMANCE.includes(a.conformance))
      f.push({ code: 'ART-CONF', severity: 'error', firewall: 'below', where, message: `Article ${a.id}: conformance "${a.conformance}" is not ${CONFORMANCE.join('|')}` });
    if (!ENFORCEMENT.includes(a.enforcement))
      f.push({ code: 'ART-ENF', severity: 'error', firewall: 'below', where, message: `Article ${a.id}: enforcement "${a.enforcement}" is not ${ENFORCEMENT.join('|')}` });
    if (!a.principle)
      f.push({ code: 'ART-PRINCIPLE', severity: 'error', firewall: 'above', where, message: `Article ${a.id}: no Principle bullet` });
    if (!a.fitness)
      f.push({ code: 'ART-FITNESS', severity: 'error', firewall: 'above', where, message: `Article ${a.id}: no Fitness bullet — an Article without a fitness signal is unfalsifiable` });
    if (a.serves.length === 0)
      f.push({ code: 'ART-SERVES', severity: 'error', firewall: 'above', where, message: `Article ${a.id}: Serves names no L0 line — every Article must trace up` });
    for (const s of a.serves) {
      if (!l0Ids.has(s))
        f.push({ code: 'ART-SERVES-DANGLING', severity: 'error', firewall: 'above', where, message: `Article ${a.id}: serves ${s}, which is not an L0 line in this document` });
      served.add(s);
    }
    if (a.status === 'RATIFIED' && a.conformance === 'HOLDS' && a.enforcement === 'UNGUARDED')
      f.push({ code: 'ART-MECH-DEBT', severity: 'warn', firewall: 'below', where, message: `Article ${a.id}: HOLDS + UNGUARDED — true today, protected by nothing (mechanization debt; add a statute + gate)` });
  }

  for (const p of doc.preamble) {
    if (!served.has(p.id) && doc.articles.length > 0)
      f.push({ code: 'L0-UNSERVED', severity: 'warn', firewall: 'above', where: `${rel}:${p.line}`, message: `${p.id} is served by no Article — the vision line is unenforced` });
  }

  // -- ledger -----------------------------------------------------------------
  if (doc.ledger.length > 0 && doc.version && doc.ledger[0].version !== doc.version)
    f.push({ code: 'LEDGER-SYNC', severity: 'error', firewall: 'below', where: `${rel}:${doc.ledger[0].line}`, message: `header pins ${doc.version} but the newest ledger entry is [${doc.ledger[0].version}] — one number for the whole repo` });

  // -- governance map -----------------------------------------------------------
  if (!instance.map) {
    f.push({ code: 'MAP-MISSING', severity: 'warn', firewall: 'below', where: instance.root, message: 'no Governance Map found in AGENTS.md/CLAUDE.md — audit-structure and compile have no entry-point index' });
  } else {
    for (const { path: p, line } of instance.map.linkedPaths) {
      if (!fs.existsSync(path.join(instance.root, p)))
        f.push({ code: 'MAP-BROKEN-LINK', severity: 'error', firewall: 'below', where: `${instance.map.file}:${line}`, message: `governance map references ${p}, which does not exist` });
    }
  }

  // -- statutes (L2, F-VII) -----------------------------------------------------
  const articleIds = new Set(doc.articles.map((a) => a.id));
  for (const s of instance.statutes) {
    const where = `${s.home}:${s.line}`;
    if (!s.serves)
      f.push({ code: 'STAT-SERVES', severity: 'warn', firewall: 'below', where, message: `statute "${truncate(s.rule)}" has no · serves: annotation` });
    if (!s.enforcedBy)
      f.push({ code: 'STAT-ENF', severity: 'warn', firewall: 'below', where, message: `statute "${truncate(s.rule)}" has no · enforced-by: annotation (a statute without a mechanism is a wish)` });
    const idRef = s.serves.match(/^([A-Z]+-[IVXLC]+|[A-Z]\d+)\b/);
    if (idRef && !articleIds.has(idRef[1]) && !l0Ids.has(idRef[1]))
      f.push({ code: 'STAT-SERVES-DANGLING', severity: 'error', firewall: 'below', where, message: `statute "${truncate(s.rule)}" serves ${idRef[1]}, which resolves to no Article or L0 line` });
  }

  // -- ADRs (L3) ------------------------------------------------------------------
  const adrIds = new Set(instance.adrs.map((a) => a.id));
  for (const adr of instance.adrs) {
    for (const note of adr.parseNotes)
      f.push({ code: 'ADR-PARSE', severity: 'warn', firewall: 'below', where: adr.file, message: note });
    if (adr.id && !ADR_STATUS.includes(adr.status))
      f.push({ code: 'ADR-STATUS', severity: 'warn', firewall: 'below', where: adr.file, message: `status "${adr.status}" is not ${ADR_STATUS.join('|')}` });
    for (const s of [...adr.serves, ...adr.amends]) {
      if (!articleIds.has(s) && !l0Ids.has(s))
        f.push({ code: 'ADR-SERVES-DANGLING', severity: 'warn', firewall: 'below', where: adr.file, message: `cites ${s}, which resolves to no Article or L0 line here` });
    }
    for (const sup of adr.supersedes) {
      if (!adrIds.has(sup))
        f.push({ code: 'ADR-SUPERSEDES-DANGLING', severity: 'error', firewall: 'below', where: adr.file, message: `supersedes ADR ${sup}, which does not exist` });
    }
    if (adr.status === 'superseded' && adr.supersededBy.length === 0)
      f.push({ code: 'ADR-NO-FORWARD-LINK', severity: 'error', firewall: 'below', where: adr.file, message: 'superseded but superseded_by is empty — L3 requires a forward link, never deletion' });
  }

  // -- experiments (F-III: pre-registered before running) ------------------------
  const EXP_STATUS = ['DRAFT', 'PRE-REGISTERED', 'RUNNING', 'MEASURED', 'GRADUATED', 'REJECTED', 'ITERATE'];
  const PAST_DRAFT = EXP_STATUS.slice(1); // anything at or beyond PRE-REGISTERED
  for (const exp of instance.experiments) {
    for (const note of exp.parseNotes)
      f.push({ code: 'EXP-PARSE', severity: 'warn', firewall: 'below', where: exp.file, message: note });
    if (!EXP_STATUS.includes(exp.status))
      f.push({ code: 'EXP-STATUS', severity: 'error', firewall: 'below', where: exp.file, message: `status "${exp.status}" is not ${EXP_STATUS.join('|')}` });
    if (PAST_DRAFT.includes(exp.status)) {
      for (const [label, value] of [['Hypothesis', exp.hypothesis], ['Metric', exp.metric], ['Decision rule', exp.decisionRule]] as const) {
        if (!value)
          f.push({ code: 'EXP-FIELDS', severity: 'error', firewall: 'below', where: exp.file, message: `${exp.status} but "${label}" is empty/placeholder — F-III freezes all three before running` });
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(exp.preRegistered))
        f.push({ code: 'EXP-PREREG', severity: 'error', firewall: 'below', where: exp.file, message: `${exp.status} with no valid pre-registered date — running an unregistered experiment violates F-III` });
      else if (exp.preRegistered > new Date().toISOString().slice(0, 10))
        f.push({ code: 'EXP-PREREG-FUTURE', severity: 'error', firewall: 'below', where: exp.file, message: `pre-registered ${exp.preRegistered} is in the future` });
    }
  }

  // -- the firewall lock (F-IV) -------------------------------------------------
  const lock = readLock(instance.root);
  if (!lock) {
    f.push({ code: 'LOCK-MISSING', severity: 'warn', firewall: 'below', where: instance.root, message: 'no constitution.lock.json — the firewall is unguarded; have the ratifier run `constitution lock accept`' });
  } else {
    const diff = diffLock(instance, lock);
    for (const id of diff.changed)
      f.push({ code: 'LOCK-DRIFT', severity: 'error', firewall: 'above', where: id, message: `ratified text of ${id} differs from the hash the ratifier accepted — either revert, or a human re-runs \`constitution lock accept\`` });
    for (const id of diff.added)
      f.push({ code: 'LOCK-UNACCEPTED', severity: 'error', firewall: 'above', where: id, message: `${id} is RATIFIED but absent from the lock — ratification requires a human \`constitution lock accept\`` });
    for (const id of diff.removed)
      f.push({ code: 'LOCK-REMOVED', severity: 'error', firewall: 'above', where: id, message: `${id} was accepted as ratified but is no longer ratified/present — repeal also crosses the firewall` });
  }

  return f;
}

function truncate(s: string, n = 60): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export function formatFindings(findings: Finding[]): string {
  if (findings.length === 0) return 'audit clean — 0 findings.';
  const lines: string[] = [];
  const errors = findings.filter((x) => x.severity === 'error');
  const warns = findings.filter((x) => x.severity === 'warn');
  for (const x of findings) {
    const fw = x.firewall === 'above' ? 'ABOVE-FIREWALL' : 'below';
    lines.push(`${x.severity.toUpperCase().padEnd(5)} ${x.code.padEnd(24)} [${fw}] ${x.where} — ${x.message}`);
  }
  lines.push('');
  lines.push(`${errors.length} error(s), ${warns.length} warning(s). Above-firewall findings need the ratifier; the rest are fixable below (see \`constitution doctor\`).`);
  return lines.join('\n');
}
