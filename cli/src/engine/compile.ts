// The deterministic half of the L4 compile step.
//
// L4 = compile(task, L0..L3). Selecting WHICH slices govern a task is judgment
// and stays in the compile-prompt skill (or any LLM). What the engine
// guarantees is the input: a complete, current, canonical pack of the law —
// every ratified unit with its hash, the statute index, the ADR index — plus
// the briefing contract the compiler must emit. No consumer of the pack can
// accidentally compile against stale or partial law.

import * as fs from 'fs';
import * as path from 'path';
import { Instance, articleCanonicalText } from './model';
import { appendEvent, opsDir, slugify } from './events';

export function buildCompilePack(instance: Instance, task: string): string {
  const doc = instance.constitution;
  const now = new Date().toISOString();
  const lines: string[] = [];

  lines.push(`# L4 compile pack — task: ${task}`);
  lines.push('');
  lines.push('```');
  lines.push(`constitution: ${doc.title} @ ${doc.version}`);
  lines.push(`ratifier:     ${doc.ratifier}`);
  lines.push(`generated:    ${now} by \`constitution compile\``);
  lines.push('```');
  lines.push('');
  lines.push('This pack is the complete canonical law of this instance. Compile the task into');
  lines.push('ONE briefing per the contract at the bottom. Select only the slices that govern');
  lines.push('the task; tag every line with provenance. If the task cannot be placed — it');
  lines.push('serves an L0 line no Article enforces, or two Articles collide — STOP and');
  lines.push('escalate to the ratifier (certiorari) instead of fabricating governance.');
  lines.push('');

  lines.push('## L0 — Preamble');
  for (const p of doc.preamble) {
    lines.push(`- **${p.id}** (hash \`${p.hash.slice(0, 12)}\`) — ${p.text}`);
  }
  lines.push('');

  lines.push('## L1 — Articles (RATIFIED only; PROPOSED/SUPERSEDED are not law)');
  for (const a of doc.articles) {
    if (a.status !== 'RATIFIED') continue;
    lines.push(`### ${a.id} — ${a.name}  (hash \`${a.hash.slice(0, 12)}\`)`);
    lines.push('```');
    lines.push(articleCanonicalText(a));
    lines.push('```');
    lines.push(`current audit state: conformance ${a.conformance}, enforcement ${a.enforcement}`);
    lines.push('');
  }

  lines.push('## L2 — Statute index');
  if (instance.statutes.length === 0) lines.push('_(no statutes harvested yet)_');
  for (const s of instance.statutes) {
    lines.push(`- [${s.home}:${s.line}] ${s.rule}`);
    lines.push(`  · serves: ${s.serves || '—'} · enforced-by: ${s.enforcedBy || '—'}`);
  }
  lines.push('');

  lines.push('## L3 — Case law index');
  if (instance.adrs.length === 0) lines.push('_(no ADRs yet)_');
  for (const adr of instance.adrs) {
    lines.push(
      `- ADR-${adr.id} (${adr.status}, ${adr.date}, trigger: ${adr.trigger}) — ${adr.title}` +
        (adr.serves.length ? ` · serves: ${adr.serves.join(', ')}` : '') +
        ` · ${adr.file}`
    );
  }
  lines.push('');

  lines.push('## Briefing contract (emit exactly this shape)');
  lines.push('```');
  lines.push(`### Compiled instruction — task: ${task}`);
  lines.push(`# generated from ${doc.title} @ v${doc.version} · DO NOT EDIT (edit L0–L3 instead)`);
  lines.push('');
  lines.push('WHY THIS EXISTS');
  lines.push('  [L0·<id>]   <the vision line(s) this task serves>');
  lines.push('');
  lines.push('INVARIANTS YOU MUST HOLD');
  lines.push('  [L1·<id>]   <the relevant Article(s), verbatim or tightened to this task>');
  lines.push('');
  lines.push('HOW TO BUILD (current stack)');
  lines.push('  [L2·<home:line>] <the relevant statutes>');
  lines.push('');
  lines.push('PRECEDENT');
  lines.push('  [L3·ADR-<id>] <the case law that constrains this task>');
  lines.push('');
  lines.push('DEFINITION OF DONE (these run in CI — your work must pass)');
  lines.push('  ✓ <fitness assertion drawn from the governing Articles>');
  lines.push('```');

  return lines.join('\n') + '\n';
}

export interface CompileArtifact {
  file: string; // relative path under .constitution/compiles/
  feature: string;
}

export function writeCompilePack(instance: Instance, task: string, feature?: string): CompileArtifact {
  const slug = feature ?? slugify(task);
  const relFile = path.join('.constitution', 'compiles', `${new Date().toISOString().slice(0, 10)}-${slug}.md`);
  const absFile = path.join(instance.root, relFile);
  fs.mkdirSync(path.dirname(absFile), { recursive: true });
  fs.writeFileSync(absFile, buildCompilePack(instance, task));
  appendEvent(instance.root, { type: 'compiled', feature: slug, title: task, detail: relFile });
  return { file: relFile, feature: slug };
}
