// The typed governance model — the engine's view of the law plane.
// Parsing populates this; audit/lock/compile/tone/board consume it.

export type ArticleStatus = 'PROPOSED' | 'RATIFIED' | 'SUPERSEDED';
export type Conformance = 'HOLDS' | 'VIOLATED' | 'UNVERIFIED';
export type Enforcement = 'UNGUARDED' | 'AUDITED' | 'GATED' | 'STRUCTURAL';

export interface PreambleLine {
  id: string; // e.g. "P1"
  text: string;
  hash: string; // canonical hash (normalized text)
  line: number;
}

export interface Article {
  id: string; // e.g. "F-II" or "A4"
  name: string;
  status: string; // ArticleStatus when well-formed
  conformance: string;
  enforcement: string;
  party: string;
  principle: string;
  serves: string[]; // L0 ids
  fitness: string;
  why: string;
  proven: string;
  // Hash covers the ratified substance (id, name, party, status, principle,
  // serves, fitness, why) and deliberately EXCLUDES conformance/enforcement —
  // those are audit outputs, set below the firewall, and must not trip the gate.
  hash: string;
  line: number;
}

export interface LedgerEntry {
  version: string;
  date: string;
  title: string;
  line: number;
}

export interface ConstitutionDoc {
  file: string; // absolute path
  title: string;
  version: string; // from the `framework: constitution@X.Y.Z` header pin
  ratifier: string;
  selfHosted: boolean;
  preamble: PreambleLine[];
  articles: Article[];
  ledger: LedgerEntry[];
  parseNotes: string[]; // non-fatal irregularities found while parsing
}

export interface Statute {
  home: string; // path relative to instance root
  rule: string; // the bold imperative
  serves: string;
  enforcedBy: string;
  why: string;
  line: number;
}

export interface Adr {
  file: string; // relative to instance root
  id: string;
  title: string;
  status: string;
  date: string;
  supersedes: string[];
  supersededBy: string[];
  serves: string[];
  amends: string[];
  trigger: string;
  parseNotes: string[];
}

export interface GovernanceMap {
  file: string; // relative to instance root
  constitutionPath?: string;
  decisionsPath?: string;
  linkedPaths: { path: string; line: number }[]; // every relative path referenced
  statuteHomes: string[]; // linked files that actually contain statute bullets
}

export interface Experiment {
  file: string; // relative to instance root
  id: string; // e.g. "EXP-0001"
  name: string;
  status: string; // DRAFT | PRE-REGISTERED | RUNNING | MEASURED | GRADUATED | REJECTED | ITERATE
  preRegistered: string; // YYYY-MM-DD or ''
  ratifier: string;
  candidate: string;
  hypothesis: string;
  metric: string;
  decisionRule: string;
  parseNotes: string[];
}

export interface Instance {
  root: string; // absolute path
  constitution: ConstitutionDoc;
  map?: GovernanceMap;
  statutes: Statute[];
  adrs: Adr[];
  experiments: Experiment[];
}

// A governed unit = anything the lock hashes or tone renders: an L0 line,
// an Article, or an ADR.
export interface Unit {
  id: string;
  kind: 'preamble' | 'article' | 'adr';
  text: string; // canonical text as parsed
  hash: string;
  ratified: boolean; // preamble lines: always; articles: status === RATIFIED; adrs: accepted
}

export function unitsOf(instance: Instance): Unit[] {
  const units: Unit[] = [];
  for (const p of instance.constitution.preamble) {
    units.push({ id: p.id, kind: 'preamble', text: p.text, hash: p.hash, ratified: true });
  }
  for (const a of instance.constitution.articles) {
    units.push({
      id: a.id,
      kind: 'article',
      text: articleCanonicalText(a),
      hash: a.hash,
      ratified: a.status === 'RATIFIED',
    });
  }
  return units;
}

export function articleCanonicalText(a: Article): string {
  return [
    `Article ${a.id} — ${a.name}`,
    `status: ${a.status} · party: ${a.party}`,
    `Principle — ${a.principle}`,
    `Serves — ${a.serves.join(', ')}`,
    `Fitness — ${a.fitness}`,
    a.why ? `Why — ${a.why}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
