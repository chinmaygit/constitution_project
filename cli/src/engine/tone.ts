// Tone rendering — a VIEW over the one canonical text, never a fork of it.
//
// Invariants (from the product's non-negotiables):
//  - Exactly one canonical, ratified text per unit. It lives in the law plane.
//  - A tone render is a derived artifact: cached under .constitution/tone/,
//    keyed by (unit id, canonical hash, tone, transform version). If the
//    canonical text changes, every cached render of it is stale BY CONSTRUCTION
//    and is refused/pruned — there is nothing to "keep in sync".
//  - Renders are never hand-edited (the engine overwrites them) and are never
//    read by ratification, amendment, audit, lock, or compile.

import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { Instance, Unit, unitsOf } from './model';
import { opsDir } from './events';

export const TONES = ['plain', 'casual', 'formal'] as const;
export type Tone = (typeof TONES)[number];

// Bump when a tone prompt changes — invalidates every cached render at once.
export const TRANSFORM_VERSION = 1;

const TONE_PROMPTS: Record<Tone, string> = {
  plain:
    'Rewrite the following constitutional text in plain, everyday language a new team member ' +
    'would understand on first read. Preserve every obligation, threshold, id reference, and ' +
    'exception EXACTLY — you may simplify wording, never meaning. Do not add advice, opinions, ' +
    'or content that is not in the source. Output only the rewritten text.',
  casual:
    'Rewrite the following constitutional text in a relaxed, conversational tone, like a ' +
    'senior engineer explaining it over coffee. Keep every obligation, threshold, id reference, ' +
    'and exception EXACTLY intact — casual delivery, identical meaning, nothing added. ' +
    'Output only the rewritten text.',
  formal:
    'Rewrite the following constitutional text as crisp formal policy prose (complete ' +
    'sentences, no bullets unless the source has them). Identical meaning, obligations, and ' +
    'references; nothing added or dropped. Output only the rewritten text.',
};

export type Generator = (prompt: string, sourceText: string) => string;

// Default generator shells out to the `claude` CLI if present.
export function claudeGenerator(prompt: string, sourceText: string): string {
  const res = spawnSync('claude', ['-p', `${prompt}\n\n<source>\n${sourceText}\n</source>`], {
    encoding: 'utf8',
    timeout: 120_000,
  });
  if (res.error || res.status !== 0) {
    throw new Error(
      `tone generation unavailable: \`claude -p\` failed (${res.error?.message ?? `exit ${res.status}`}). ` +
        'Install the Claude CLI, or read the canonical text directly — it is always authoritative.'
    );
  }
  return res.stdout.trim();
}

export function toneDir(root: string): string {
  return path.join(opsDir(root), 'tone');
}

function cachePath(root: string, unitId: string, tone: Tone): string {
  return path.join(toneDir(root), `${unitId}.${tone}.md`);
}

interface CacheEntry {
  unit: string;
  tone: string;
  sourceHash: string;
  transformVersion: number;
  body: string;
}

function readCache(file: string): CacheEntry | null {
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const meta: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const km = line.match(/^([\w-]+):\s*(.*)$/);
    if (km) meta[km[1]] = km[2].trim();
  }
  return {
    unit: meta['unit'] ?? '',
    tone: meta['tone'] ?? '',
    sourceHash: meta['source-hash'] ?? '',
    transformVersion: Number(meta['transform-version'] ?? 0),
    body: m[2].replace(/^\s*<!--[\s\S]*?-->\s*/, '').trim(),
  };
}

export function findUnit(instance: Instance, unitId: string): Unit | null {
  return unitsOf(instance).find((u) => u.id.toLowerCase() === unitId.toLowerCase()) ?? null;
}

export interface RenderResult {
  unitId: string;
  tone: Tone | 'canonical';
  text: string;
  fromCache: boolean;
  generated: boolean;
}

export function renderUnit(
  instance: Instance,
  unitId: string,
  tone: Tone | 'canonical',
  generator: Generator | null = claudeGenerator
): RenderResult {
  const unit = findUnit(instance, unitId);
  if (!unit) {
    throw new Error(`no unit "${unitId}" in this constitution (units are L0 lines and Articles, e.g. P1, F-II)`);
  }
  if (tone === 'canonical') {
    return { unitId: unit.id, tone, text: unit.text, fromCache: false, generated: false };
  }

  const file = cachePath(instance.root, unit.id, tone);
  const cached = readCache(file);
  if (cached && cached.sourceHash === unit.hash && cached.transformVersion === TRANSFORM_VERSION) {
    return { unitId: unit.id, tone, text: cached.body, fromCache: true, generated: false };
  }

  if (!generator) {
    throw new Error(
      `no fresh ${tone} render of ${unit.id} cached (canonical text changed or never rendered), ` +
        'and no generator available. The canonical text is always readable: `constitution render ' +
        `${unit.id} --tone canonical\`.`
    );
  }

  const body = generator(TONE_PROMPTS[tone], unit.text);
  fs.mkdirSync(toneDir(instance.root), { recursive: true });
  const frontmatter = [
    '---',
    `unit: ${unit.id}`,
    `tone: ${tone}`,
    `source-hash: ${unit.hash}`,
    `transform-version: ${TRANSFORM_VERSION}`,
    `generated: ${new Date().toISOString()}`,
    '---',
    '<!-- DERIVED ARTIFACT — a tone rendering, not law. The canonical, ratified text',
    '     lives in the constitution; if this file disagrees with it, this file is wrong',
    '     and will be regenerated. Never hand-edit. -->',
    '',
  ].join('\n');
  fs.writeFileSync(file, frontmatter + body + '\n');
  return { unitId: unit.id, tone, text: body, fromCache: false, generated: true };
}

export interface ToneCheckResult {
  fresh: { unit: string; tone: string }[];
  stale: { unit: string; tone: string; file: string; reason: string }[];
  orphaned: { file: string; reason: string }[];
}

// Drift detection: a cached render whose source-hash no longer matches the
// canonical text (or whose transform version is old) is stale. `doctor` prunes
// these unattended — pruning a derived artifact is below the firewall.
export function checkTones(instance: Instance): ToneCheckResult {
  const result: ToneCheckResult = { fresh: [], stale: [], orphaned: [] };
  const dir = toneDir(instance.root);
  if (!fs.existsSync(dir)) return result;
  const units = new Map(unitsOf(instance).map((u) => [u.id, u]));
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.md')) continue;
    const file = path.join(dir, f);
    const entry = readCache(file);
    if (!entry || !entry.unit) {
      result.orphaned.push({ file, reason: 'unreadable or missing frontmatter' });
      continue;
    }
    const unit = units.get(entry.unit);
    if (!unit) {
      result.orphaned.push({ file, reason: `unit ${entry.unit} no longer exists` });
    } else if (entry.sourceHash !== unit.hash) {
      result.stale.push({ unit: entry.unit, tone: entry.tone, file, reason: 'canonical text changed since render' });
    } else if (entry.transformVersion !== TRANSFORM_VERSION) {
      result.stale.push({ unit: entry.unit, tone: entry.tone, file, reason: `transform v${entry.transformVersion} < v${TRANSFORM_VERSION}` });
    } else {
      result.fresh.push({ unit: entry.unit, tone: entry.tone });
    }
  }
  return result;
}

export function pruneStaleTones(instance: Instance): string[] {
  const check = checkTones(instance);
  const removed: string[] = [];
  for (const s of [...check.stale, ...check.orphaned.map((o) => ({ file: o.file }))]) {
    fs.unlinkSync(s.file);
    removed.push(s.file);
  }
  return removed;
}
