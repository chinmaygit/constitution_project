// Deterministic structural audit — the machine-checkable subset of the
// audit-structure skill, runnable in CI. Every finding is classified by what
// its FIX touches (the reconcile-findings discipline): `above` the firewall
// means the fix edits ratified L0/L1 substance and must go through a human;
// `below` means the engine or an agent may fix it directly.

import * as fs from 'fs';
import * as path from 'path';
import { Instance } from './model';
import { diffLock, readLock } from './lock';
import { opsDir } from './events';
import { countWords, hasStackedQualifier, sentenceLengths } from './prose';

export interface Finding {
  code: string;
  severity: 'error' | 'warn';
  firewall: 'above' | 'below';
  where: string; // file[:line] or unit id
  message: string;
  // Set only on PROSE-*/LEDGER-LENGTH findings (EXP-0001, WARN-ONLY candidate
  // rule): true if this finding's (code, where) pair was already present in
  // the baseline snapshot taken when the experiment started, false if it's
  // new since then. Undefined for every other check.
  baseline?: boolean;
}

const ARTICLE_STATUS = ['PROPOSED', 'RATIFIED', 'SUPERSEDED'];
const CONFORMANCE = ['HOLDS', 'VIOLATED', 'UNVERIFIED'];
const ENFORCEMENT = ['UNGUARDED', 'AUDITED', 'GATED', 'STRUCTURAL'];
const ADR_STATUS = ['proposed', 'accepted', 'superseded'];
const PLACEHOLDER_RE = /<[^>]+>|your name|todo|tbd|xxx/i;

// EXP-0001 draft thresholds — tunable during the WARN-ONLY window, not final.
// experiments/EXP-0001-governance-prose-clarity.md's Hypothesis section states
// these same two numbers in prose; if you retune one here, update that file's
// wording too (or the experiment's own record of what it tested goes stale).
const SENTENCE_WORD_CEILING = 30;
const LEDGER_WORD_CEILING = 150;
const PROSE_BASELINE_FILE = 'prose-baseline.json';

// NOT side-effect-free: on its first call in a given instance, this writes
// .constitution/prose-baseline.json (see writeProseBaseline below) to seed
// the EXP-0001 false-positive baseline. Every caller — the pre-commit hook,
// `constitution audit --json` in CI, and every test that calls audit()
// directly — triggers this on a fresh instance. A future dry-run mode or a
// read-only caller needs to know this before assuming audit() never touches
// disk.
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

    // `SUPERSEDED — <date>` (the amendment lifecycle's own supersession shape,
    // e.g. from `ratify-amendment`) carries a date suffix — still a valid status.
    const statusOk = ARTICLE_STATUS.includes(a.status) || /^SUPERSEDED\s+—\s+.+$/.test(a.status);
    if (!statusOk)
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

  // -- ledger -------------------------------------------------------------------
  // Only the framework's own self-hosted repo pins itself in the header — there
  // the header version and the ledger's own version axis are the same number.
  // A downstream consumer's header pins the *framework spec* it adopted, while
  // its ledger tracks the *product's own* constitution version; those are two
  // legitimately independent axes and must not be compared.
  if (doc.selfHosted && doc.ledger.length > 0 && doc.version && doc.ledger[0].version !== doc.version)
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

  // -- governance prose clarity (EXP-0001, WARN-ONLY candidate rule) -----------
  // Never blocks anything (severity is always 'warn') — this is evidence
  // gathering for a pre-registered experiment (F-III), not yet a ratified
  // rule. See experiments/0001-governance-prose-clarity.md.
  const proseFindings: Finding[] = [];
  const checkProse = (where: string, label: string, text: string) => {
    if (!text) return;
    const longSentences = sentenceLengths(text).filter((len) => len > SENTENCE_WORD_CEILING);
    if (longSentences.length > 0) {
      proseFindings.push({
        code: 'PROSE-SENTENCE-LEN',
        severity: 'warn',
        firewall: 'below',
        where,
        message: `${label}: ${longSentences.length} sentence(s) over ${SENTENCE_WORD_CEILING} words (worst: ${Math.max(...longSentences)}) — candidate rule EXP-0001, not yet ratified`,
      });
    }
    if (hasStackedQualifier(text)) {
      proseFindings.push({
        code: 'PROSE-STACKED-QUALIFIER',
        severity: 'warn',
        firewall: 'below',
        where,
        message: `${label}: stacks 2+ distinct qualifier patterns (em-dash aside / except-unless-scoped-to / nested parenthetical) — candidate rule EXP-0001, not yet ratified`,
      });
    }
  };
  for (const a of doc.articles) {
    const where = `${rel}:${a.line}`;
    checkProse(where, `Article ${a.id} Principle`, a.principle);
    checkProse(where, `Article ${a.id} Fitness`, a.fitness);
    checkProse(where, `Article ${a.id} Why`, a.why);
  }
  for (const s of instance.statutes) {
    const where = `${s.home}:${s.line}`;
    checkProse(where, `statute "${truncate(s.rule)}"`, s.rule);
    checkProse(where, `statute "${truncate(s.rule)}" Why`, s.why);
  }
  for (const adr of instance.adrs) {
    checkProse(adr.file, `ADR ${adr.id || adr.file}`, adr.body);
  }
  for (const entry of doc.ledger) {
    const where = `${rel}:${entry.line}`;
    const words = countWords(entry.body);
    if (words > LEDGER_WORD_CEILING) {
      proseFindings.push({
        code: 'LEDGER-LENGTH',
        severity: 'warn',
        firewall: 'below',
        where,
        message: `ledger entry [${entry.version}] runs ${words} words (cap ${LEDGER_WORD_CEILING}) — narrative belongs in BUILDLOG.md, not the ledger (candidate rule EXP-0001)`,
      });
    }
  }
  // Baseline-snapshot: isolate pre-existing (already-known) findings from new
  // ones, so the WARN-ONLY window's false-positive-rate metric isn't
  // contaminated by the same known-dense text re-firing every commit — these
  // checks run over whole documents, not a diff. Self-initializes on first
  // run: if no baseline exists yet, today's findings ARE the baseline
  // (nothing is "new" on day one). A missing/corrupt baseline file degrades
  // to "nothing known" rather than crashing or silently re-seeding over data
  // that might still be recoverable.
  // Keyed by (code, where) — location, not field. Two dense fields on the same
  // Article/Statute line (e.g. both Principle and Fitness) share one key, so a
  // fixed Principle can still read as "known" via a still-bad Fitness at the
  // same line. Acceptable for a WARN-ONLY evidence-gathering signal; tighten
  // to a per-field key only if the WARN-ONLY window's data shows this
  // coarseness is actually masking real false-positive-rate signal.
  const keyOf = (fnd: Finding) => `${fnd.code}::${fnd.where}`;
  const baseline = readProseBaseline(instance.root);
  if (baseline === null) {
    // Dedupe before writing — multiple fields (Principle + Fitness) on the
    // same Article/Statute line produce the same (code, where) key, and an
    // undeduped array would grow duplicate entries every time this branch
    // ran (adversarial review finding: the committed baseline had 39 keys,
    // only 35 unique). A Set is the correct on-disk shape for a key set.
    writeProseBaseline(instance.root, [...new Set(proseFindings.map(keyOf))]);
    for (const pf of proseFindings) pf.baseline = true;
  } else {
    for (const pf of proseFindings) pf.baseline = baseline.has(keyOf(pf));
  }
  f.push(...proseFindings);

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

// null = no baseline file exists yet (caller should seed one from today's
// findings). A Set (possibly empty) = a baseline exists; empty specifically
// covers a corrupt/malformed file — degrade to "nothing known" rather than
// crash or silently overwrite whatever's there.
function readProseBaseline(root: string): Set<string> | null {
  const p = path.join(opsDir(root), PROSE_BASELINE_FILE);
  if (!fs.existsSync(p)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
    return new Set(Array.isArray(parsed?.keys) ? parsed.keys : []);
  } catch {
    return new Set();
  }
}

function writeProseBaseline(root: string, keys: string[]): void {
  const dir = opsDir(root);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, PROSE_BASELINE_FILE),
    JSON.stringify({ createdAt: new Date().toISOString(), keys }, null, 2) + '\n'
  );
}

export function formatFindings(findings: Finding[]): string {
  if (findings.length === 0) return 'audit clean — 0 findings.';
  const lines: string[] = [];
  const errors = findings.filter((x) => x.severity === 'error');
  const warns = findings.filter((x) => x.severity === 'warn');
  for (const x of findings) {
    const fw = x.firewall === 'above' ? 'ABOVE-FIREWALL' : 'below';
    // baseline === false means new since the EXP-0001 snapshot was taken —
    // surfaced here too, not just in --json, so a human running `constitution
    // audit` can tell "known since day one" apart from "this commit's doing."
    const tag = x.baseline === false ? ' [NEW]' : '';
    lines.push(`${x.severity.toUpperCase().padEnd(5)} ${x.code.padEnd(24)} [${fw}] ${x.where} — ${x.message}${tag}`);
  }
  lines.push('');
  lines.push(`${errors.length} error(s), ${warns.length} warning(s). Above-firewall findings need the ratifier; the rest are fixable below (see \`constitution doctor\`).`);
  return lines.join('\n');
}
