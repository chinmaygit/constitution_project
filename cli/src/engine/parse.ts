// Parser for the law plane. Targets the document shapes the framework already
// uses (see templates/): header fence, `**P1.**` preamble lines,
// `### Article <id> — <name>` with a backtick field line, statute bullets with
// `· serves:` / `· enforced-by:`, ADR YAML frontmatter. Lenient by design:
// irregularities become parseNotes, not exceptions — the audit turns them into
// findings.

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  Adr,
  Article,
  ConstitutionDoc,
  GovernanceMap,
  Instance,
  LedgerEntry,
  PreambleLine,
  Statute,
  articleCanonicalText,
} from './model';

// Collapses ALL whitespace (including line breaks) so that re-wrapping a
// paragraph never changes a unit's canonical hash, but changing a word does.
export function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function canonicalHash(text: string): string {
  return crypto.createHash('sha256').update(normalize(text), 'utf8').digest('hex');
}

// ---------------------------------------------------------------------------
// CONSTITUTION.md

export function parseConstitution(file: string): ConstitutionDoc {
  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.split('\n');
  const notes: string[] = [];

  const title = (lines.find((l) => l.startsWith('# ')) ?? '# (untitled)').replace(/^# /, '').trim();

  // Header fence: framework: constitution@X.Y.Z [ (self-hosted) ] / ratifier: NAME
  let version = '';
  let ratifier = '';
  let selfHosted = false;
  const pinMatch = raw.match(/framework:\s*constitution@([\w.\-]+)(.*)/);
  if (pinMatch) {
    version = pinMatch[1];
    selfHosted = /self-hosted/.test(pinMatch[2]);
  } else {
    notes.push('header: no `framework: constitution@<version>` pin found');
  }
  const ratMatch = raw.match(/ratifier:\s*(.+)/);
  if (ratMatch) ratifier = ratMatch[1].trim();
  else notes.push('header: no `ratifier:` line found');

  const preamble = parsePreamble(lines, notes);
  const articles = parseArticles(lines, notes);
  const ledger = parseLedger(lines);

  return { file, title, version, ratifier, selfHosted, preamble, articles, ledger, parseNotes: notes };
}

function sectionRange(lines: string[], startRe: RegExp): [number, number] {
  const start = lines.findIndex((l) => startRe.test(l));
  if (start === -1) return [-1, -1];
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) {
      end = i;
      break;
    }
  }
  return [start, end];
}

function parsePreamble(lines: string[], notes: string[]): PreambleLine[] {
  const [start, end] = sectionRange(lines, /^## L0\b/);
  if (start === -1) {
    notes.push('no `## L0` section found');
    return [];
  }
  const out: PreambleLine[] = [];
  let current: { id: string; text: string[]; line: number } | null = null;
  for (let i = start + 1; i < end; i++) {
    const m = lines[i].match(/^\*\*(P\d+)\.\*\*\s*(.*)$/);
    if (m) {
      if (current) out.push(finishPreamble(current));
      current = { id: m[1], text: [m[2]], line: i + 1 };
    } else if (current) {
      if (lines[i].trim() === '' || /^#|^---/.test(lines[i])) {
        out.push(finishPreamble(current));
        current = null;
      } else {
        current.text.push(lines[i]);
      }
    }
  }
  if (current) out.push(finishPreamble(current));
  return out;
}

function finishPreamble(c: { id: string; text: string[]; line: number }): PreambleLine {
  const text = normalize(c.text.join('\n'));
  return { id: c.id, text, hash: canonicalHash(`${c.id}. ${text}`), line: c.line };
}

function parseArticles(lines: string[], notes: string[]): Article[] {
  const out: Article[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^### Article\s+(\S+)\s+—\s+(.+)$/);
    if (!m) continue;
    const id = m[1];
    const name = m[2].trim();
    // Field line: `status: X` · `conformance: Y` · ... — within the next 3 lines.
    const fields: Record<string, string> = {};
    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
      const tokens = lines[j].match(/`([\w-]+):\s*([^`]+)`/g);
      if (tokens) {
        for (const t of tokens) {
          const tm = t.match(/`([\w-]+):\s*([^`]+)`/);
          if (tm) fields[tm[1]] = tm[2].trim();
        }
        break;
      }
    }
    for (const req of ['status', 'conformance', 'enforcement', 'party']) {
      if (!(req in fields)) notes.push(`Article ${id}: missing field \`${req}\``);
    }
    // Bullets until the next heading.
    let end = lines.length;
    for (let j = i + 1; j < lines.length; j++) {
      if (/^#{2,3} /.test(lines[j]) || /^---\s*$/.test(lines[j])) {
        end = j;
        break;
      }
    }
    const bullets = parseBoldBullets(lines.slice(i + 1, end));
    const servesRaw = bullets['Serves'] ?? '';
    const serves = servesRaw
      .split(/[,;]|\band\b/)
      .map((s) => s.trim().replace(/\.$/, ''))
      .filter((s) => /^P\d+$/.test(s));
    if (servesRaw && serves.length === 0) notes.push(`Article ${id}: Serves ("${servesRaw}") names no P<N> id`);

    const article: Article = {
      id,
      name,
      status: fields['status'] ?? '',
      conformance: fields['conformance'] ?? '',
      enforcement: fields['enforcement'] ?? '',
      party: fields['party'] ?? '',
      principle: bullets['Principle'] ?? '',
      serves,
      fitness: bullets['Fitness'] ?? '',
      why: bullets['Why'] ?? '',
      proven: bullets['Proven'] ?? '',
      hash: '',
      line: i + 1,
    };
    article.hash = canonicalHash(articleCanonicalText(article));
    out.push(article);
  }
  return out;
}

// `- **Label** — text...` bullets, text continuing on indented lines.
function parseBoldBullets(lines: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  let label: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (label) out[label] = normalize(buf.join('\n')).replace(/\n/g, ' ');
    label = null;
    buf = [];
  };
  for (const line of lines) {
    const m = line.match(/^- \*\*([^*]+)\*\*\s*—\s*(.*)$/);
    if (m) {
      flush();
      label = m[1].trim();
      buf = [m[2]];
    } else if (label && /^\s+\S/.test(line)) {
      buf.push(line);
    } else if (label) {
      flush();
    }
  }
  flush();
  return out;
}

function parseLedger(lines: string[]): LedgerEntry[] {
  const out: LedgerEntry[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^### \[([\w.\-]+)\]\s+—\s+(\S+)\s+—\s+(.+)$/);
    if (m) out.push({ version: m[1], date: m[2], title: m[3].trim(), line: i + 1 });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Governance map (root AGENTS.md)

export function parseGovernanceMap(root: string, file: string): GovernanceMap {
  const abs = path.join(root, file);
  const raw = fs.readFileSync(abs, 'utf8');
  const lines = raw.split('\n');
  const linkedPaths: { path: string; line: number }[] = [];
  let constitutionPath: string | undefined;
  let decisionsPath: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Existence-checked references: real markdown links only. Backtick tokens
    // are scanned solely to classify the constitution/decisions declarations —
    // prose mentions (`SKILL.md`, generated dirs) must not become findings.
    for (const m of line.matchAll(/\[[^\]]*\]\(([^)#]+)\)/g)) {
      const p = m[1].trim();
      if (!p || /^https?:/.test(p)) continue;
      linkedPaths.push({ path: p, line: i + 1 });
    }
    for (const m of line.matchAll(/`([^`\s]+\.md|[^`\s]+\/)`/g)) {
      const p = m[1].trim();
      if (/constitution \(l0/i.test(line) && p.endsWith('.md') && !constitutionPath) constitutionPath = p;
      if (/case law|\bl3\b/i.test(line) && !decisionsPath) decisionsPath = p;
    }
  }

  // A linked file is a statute home iff it exists and contains statute bullets.
  const statuteHomes: string[] = [];
  for (const { path: p } of linkedPaths) {
    const full = path.join(root, p);
    if (p.endsWith('.md') && fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf8');
      if (/·\s*serves:/.test(content)) statuteHomes.push(p);
    }
  }
  // The map file itself may host statutes (fresh consumer default).
  if (/·\s*serves:/.test(raw) && !statuteHomes.includes(file)) statuteHomes.push(file);

  return { file, constitutionPath, decisionsPath, linkedPaths, statuteHomes: [...new Set(statuteHomes)] };
}

// ---------------------------------------------------------------------------
// Statutes

export function parseStatutes(root: string, home: string): Statute[] {
  const raw = fs.readFileSync(path.join(root, home), 'utf8');
  const lines = raw.split('\n');
  const out: Statute[] = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^- \*\*(.*)$/);
    if (!m) {
      i++;
      continue;
    }
    const startLine = i + 1;
    // Rule text: from the bold open to the closing ** (may span lines).
    let ruleBuf = m[1];
    while (!/\*\*/.test(ruleBuf) && i + 1 < lines.length) {
      i++;
      ruleBuf += ' ' + lines[i].trim();
    }
    let rule = ruleBuf.replace(/\*\*.*$/, '').replace(/\*\*/g, '').trim();
    // Annotation lines: `· key: value` with wrapped continuations. Indented
    // prose between the bold close and the first `·` line is rule commentary
    // (common shape in real statute homes) — folded into the rule, not a
    // reason to drop the statute.
    const ann: Record<string, string> = {};
    let key: string | null = null;
    while (i + 1 < lines.length) {
      const next = lines[i + 1];
      const am = next.match(/^\s*·\s*([\w-]+):\s*(.*)$/);
      if (am) {
        key = am[1];
        ann[key] = am[2].trim();
        i++;
      } else if (key && /^\s{2,}\S/.test(next) && !/^\s*- /.test(next)) {
        ann[key] += ' ' + next.trim();
        i++;
      } else if (!key && /^\s*\S/.test(next) && !/^\s*- /.test(next) && !/^#|^---/.test(next) && next.trim() !== '') {
        rule += ' ' + next.trim();
        i++;
      } else {
        break;
      }
    }
    if (Object.keys(ann).length > 0) {
      out.push({
        home,
        rule,
        serves: ann['serves'] ?? '',
        enforcedBy: ann['enforced-by'] ?? '',
        why: ann['why'] ?? '',
        line: startLine,
      });
    }
    i++;
  }
  return out;
}

// ---------------------------------------------------------------------------
// ADRs (L3)

export function parseAdr(root: string, file: string): Adr {
  const raw = fs.readFileSync(path.join(root, file), 'utf8');
  const notes: string[] = [];
  const fm: Record<string, string> = {};
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const m = line.match(/^([\w_]+):\s*(.*)$/);
      if (m) fm[m[1]] = m[2].replace(/#.*$/, '').trim();
    }
  } else {
    notes.push('no YAML frontmatter');
  }
  const list = (v: string | undefined): string[] =>
    (v ?? '')
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  return {
    file,
    id: fm['id'] ?? '',
    title: fm['title'] ?? '',
    status: fm['status'] ?? '',
    date: fm['date'] ?? '',
    supersedes: list(fm['supersedes']),
    supersededBy: list(fm['superseded_by']),
    serves: list(fm['serves']),
    amends: list(fm['amends']),
    trigger: fm['trigger'] ?? '',
    parseNotes: notes,
  };
}

// ---------------------------------------------------------------------------
// Whole instance

export function findConstitutionFile(root: string): string | null {
  for (const candidate of ['CONSTITUTION.md', 'decisions/CONSTITUTION.md', 'docs/CONSTITUTION.md']) {
    if (fs.existsSync(path.join(root, candidate))) return candidate;
  }
  return null;
}

export function loadInstance(root: string): Instance {
  const constitutionRel = findConstitutionFile(root);
  if (!constitutionRel) {
    throw new Error(
      `no CONSTITUTION.md found under ${root} (looked in ., decisions/, docs/) — run \`constitution init\` first`
    );
  }
  const constitution = parseConstitution(path.join(root, constitutionRel));

  let map: GovernanceMap | undefined;
  for (const candidate of ['AGENTS.md', 'CLAUDE.md']) {
    const p = path.join(root, candidate);
    if (fs.existsSync(p) && /Governance Map/i.test(fs.readFileSync(p, 'utf8'))) {
      map = parseGovernanceMap(root, candidate);
      break;
    }
  }

  const statutes: Statute[] = [];
  for (const home of map?.statuteHomes ?? []) {
    statutes.push(...parseStatutes(root, home));
  }

  const adrs: Adr[] = [];
  const decisionsDir = path.join(root, 'decisions');
  if (fs.existsSync(decisionsDir)) {
    for (const f of fs.readdirSync(decisionsDir).sort()) {
      if (/^\d{4}-.*\.md$/.test(f)) adrs.push(parseAdr(root, path.join('decisions', f)));
    }
  }

  return { root, constitution, map, statutes, adrs };
}
