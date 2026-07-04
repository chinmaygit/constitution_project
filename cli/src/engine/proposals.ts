// The ratification queue — how anything crosses the firewall.
//
// Agents (doctor included) may DRAFT changes to ratified L0/L1 here. Nothing in
// this module ever edits the constitution: a proposal is a file in
// .constitution/proposals/ with status PROPOSED until a human, in an
// interactive session, rules on it (`constitution ratify <id>` — the TTY +
// typed-confirmation guard lives in the CLI layer). Even then the engine only
// records the ruling; applying drafted text to the law and re-accepting the
// lock remain explicit, human-driven steps.

import * as fs from 'fs';
import * as path from 'path';
import { opsDir, slugify } from './events';

export interface Proposal {
  id: string; // filename stem
  file: string; // absolute path
  title: string;
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED' | string;
  kind: string; // e.g. amendment | ratification | repeal | finding
  target: string; // unit id or file the draft touches
  created: string;
  ruledBy?: string;
  ruledAt?: string;
  body: string;
}

export function proposalsDir(root: string): string {
  return path.join(opsDir(root), 'proposals');
}

export function queueProposal(
  root: string,
  p: { title: string; kind: string; target: string; rationale: string; draft: string }
): Proposal {
  const dir = proposalsDir(root);
  fs.mkdirSync(dir, { recursive: true });
  const stem = `${new Date().toISOString().slice(0, 10)}-${slugify(p.title)}`;
  let id = stem;
  let n = 2;
  while (fs.existsSync(path.join(dir, `${id}.md`))) id = `${stem}-${n++}`;
  const file = path.join(dir, `${id}.md`);
  const created = new Date().toISOString();
  const content = [
    '---',
    `title: ${p.title}`,
    'status: PROPOSED',
    `kind: ${p.kind}`,
    `target: ${p.target}`,
    `created: ${created}`,
    '---',
    '<!-- Drafted below the firewall, awaiting the ratifier (F-IV). No agent applies',
    '     this to ratified text; a human rules on it via `constitution ratify`. -->',
    '',
    '## Rationale',
    p.rationale,
    '',
    '## Draft',
    p.draft,
    '',
  ].join('\n');
  fs.writeFileSync(file, content);
  return { id, file, title: p.title, status: 'PROPOSED', kind: p.kind, target: p.target, created, body: content };
}

export function listProposals(root: string): Proposal[] {
  const dir = proposalsDir(root);
  if (!fs.existsSync(dir)) return [];
  const out: Proposal[] = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.md')) continue;
    const p = readProposal(root, f.replace(/\.md$/, ''));
    if (p) out.push(p);
  }
  return out;
}

export function readProposal(root: string, id: string): Proposal | null {
  const file = path.join(proposalsDir(root), `${id}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  const meta: Record<string, string> = {};
  if (m) {
    for (const line of m[1].split('\n')) {
      const km = line.match(/^([\w-]+):\s*(.*)$/);
      if (km) meta[km[1]] = km[2].trim();
    }
  }
  return {
    id,
    file,
    title: meta['title'] ?? id,
    status: meta['status'] ?? 'PROPOSED',
    kind: meta['kind'] ?? '',
    target: meta['target'] ?? '',
    created: meta['created'] ?? '',
    ruledBy: meta['ruled-by'],
    ruledAt: meta['ruled-at'],
    body: raw,
  };
}

// Called ONLY from the interactive ratify command after the human confirmed.
export function recordRuling(root: string, id: string, ruling: 'APPROVED' | 'REJECTED', by: string): Proposal {
  const p = readProposal(root, id);
  if (!p) throw new Error(`no proposal "${id}" in ${proposalsDir(root)}`);
  if (p.status !== 'PROPOSED') throw new Error(`proposal "${id}" is already ${p.status}`);
  const updated = p.body
    .replace(/^status: PROPOSED$/m, `status: ${ruling}`)
    .replace(/^(created: .*)$/m, `$1\nruled-by: ${by}\nruled-at: ${new Date().toISOString()}`);
  fs.writeFileSync(p.file, updated);
  return { ...p, status: ruling, ruledBy: by };
}

export function hasOpenProposalFor(root: string, target: string, kind: string): boolean {
  return listProposals(root).some((p) => p.status === 'PROPOSED' && p.target === target && p.kind === kind);
}
