#!/usr/bin/env node

// Dispatcher + interactive prompting only (per cli/AGENTS.md's one-concern
// statute): all governance logic lives in src/engine/*; file scaffolding in
// scaffold.ts/agents.ts.

import * as fs from 'fs';
import * as path from 'path';
import prompts from 'prompts';
import { scaffoldFramework } from './scaffold';
import { setupAgents } from './agents';
import { loadInstance } from './engine/parse';
import { audit, formatFindings } from './engine/audit';
import { computeLock, diffLock, readLock, writeLock, LOCK_FILENAME } from './engine/lock';
import { appendEvent, ensureOps, readEvents, slugify, EventType } from './engine/events';
import { foldBoard, renderBoardHtml, renderBoardText } from './engine/board';
import { renderUnit, checkTones, claudeGenerator, TONES, Tone } from './engine/tone';
import { buildCompilePack, writeCompilePack } from './engine/compile';
import { listProposals, readProposal, recordRuling } from './engine/proposals';
import { runDoctor } from './engine/doctor';
import { Instance } from './engine/model';

const VERSION: string = require('../package.json').version;

const HELP_TEXT = `
constitution — govern AI-native product development (v${VERSION})

Law plane (concise, human-ratified above the firewall):
  init                          Scaffold the framework into this repo (interactive)
  audit [--json]                Deterministic structural audit of the whole L0–L4 graph
  compile "<task>" [--out]      Emit the L4 compile pack (canonical law + briefing contract)
  render <unit> [--tone T]      Read a unit (P1, F-II, …) in a tone: canonical|plain|casual|formal
  tones check                   Report stale/orphaned tone renders (drift detection)

The firewall (F-IV, mechanized):
  firewall                      CI gate: fail if ratified L0/L1 text drifted from the lock
  lock status                   Show lock vs. live ratified units
  lock accept                   HUMAN ONLY (interactive): accept current ratified text into the lock
  proposals [show <id>]         The ratification queue (drafted below, ruled on above)
  ratify <id>                   HUMAN ONLY (interactive): rule on a queued proposal
  doctor                        Self-heal below the firewall; queue drafts above it

Ops plane (delivery visibility — .constitution/, never the law):
  feature <verb> <slug|title>   declare|start|validate|ship|block|unblock|note [--refs F-II,ADR-0001]
  board [--html [file]]         Kanban of features + governance health strip

  --version | --help
`;

function fail(msg: string): never {
  console.error(`error: ${msg}`);
  process.exit(1);
}

function getFlag(args: string[], name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1];
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  return eq ? eq.split('=').slice(1).join('=') : undefined;
}

function hasFlag(args: string[], name: string): boolean {
  return args.includes(`--${name}`) || args.some((a) => a.startsWith(`--${name}=`));
}

function positionals(args: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      if (!args[i].includes('=') && args[i + 1] && !args[i + 1].startsWith('--')) i++;
      continue;
    }
    out.push(args[i]);
  }
  return out;
}

function load(root: string): Instance {
  try {
    return loadInstance(root);
  } catch (e) {
    fail((e as Error).message);
  }
}

function requireHumanTty(action: string): void {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    fail(
      `${action} requires an interactive human session (F-IV: no agent holds the pen above ` +
        'the firewall). Run this yourself in a terminal.'
    );
  }
}

// ---------------------------------------------------------------------------

async function runInit() {
  const targetDir = process.cwd();
  console.log(`\nInitializing Constitution Framework in ${targetDir}...\n`);

  const response = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'What is the name of this project?',
      initial: path.basename(targetDir),
    },
    {
      type: 'text',
      name: 'ratifier',
      message: 'Who is the ratifier for this constitution? (a real human — F-IV)',
      initial: '<Your Name>',
    },
    {
      type: 'multiselect',
      name: 'agents',
      message: 'Which AI agents do you want to configure?',
      choices: [
        { title: 'Cursor', value: 'cursor', selected: true },
        { title: 'Claude', value: 'claude', selected: true },
        { title: 'Antigravity', value: 'antigravity', selected: true },
        { title: 'GitHub Copilot', value: 'copilot', selected: false },
      ],
    },
  ]);

  if (response.projectName === undefined || response.ratifier === undefined || response.agents === undefined) {
    console.log('\nInitialization cancelled.');
    process.exit(0);
  }

  try {
    await scaffoldFramework(targetDir, response.projectName, response.ratifier);
    await setupAgents(targetDir, response.agents);
    ensureOps(targetDir);

    console.log('\nSuccess! The constitution framework is now active in your project.');
    console.log('Next steps:');
    console.log('  1. Define your L0 with the ratifier (the define-preamble skill).');
    console.log('  2. Once anything is RATIFIED, run `constitution lock accept` (you, not an agent).');
    console.log('  3. Wire `constitution firewall` and `constitution audit` into CI.');
  } catch (error) {
    console.error('Failed to initialize constitution:', error);
    process.exit(1);
  }
}

function runAudit(args: string[]) {
  const instance = load(process.cwd());
  const findings = audit(instance);
  if (hasFlag(args, 'json')) {
    console.log(JSON.stringify(findings, null, 2));
  } else {
    console.log(formatFindings(findings));
  }
  process.exit(findings.some((f) => f.severity === 'error') ? 1 : 0);
}

function runFirewall() {
  const instance = load(process.cwd());
  const lock = readLock(instance.root);
  if (!lock) {
    console.error(`no ${LOCK_FILENAME} — the firewall gate has nothing to hold.`);
    console.error('Have the ratifier run `constitution lock accept` once, then commit the lock.');
    process.exit(1);
  }
  const diff = diffLock(instance, lock);
  if (diff.clean) {
    console.log(`firewall clean — ${Object.keys(lock.units).length} ratified unit(s) match the lock (accepted by ${lock.acceptedBy}, ${lock.acceptedAt.slice(0, 10)}).`);
    process.exit(0);
  }
  console.error('FIREWALL: ratified L0/L1 drifted from the accepted lock (F-IV).');
  for (const id of diff.changed) console.error(`  changed: ${id} — ratified text differs from what the ratifier accepted`);
  for (const id of diff.added) console.error(`  added:   ${id} — RATIFIED but never accepted by a human`);
  for (const id of diff.removed) console.error(`  removed: ${id} — was accepted, no longer ratified/present`);
  console.error('\nEither revert the law-plane change, or the ratifier re-runs `constitution lock accept`.');
  process.exit(1);
}

async function runLock(args: string[]) {
  const sub = positionals(args)[0] ?? 'status';
  const instance = load(process.cwd());
  const lock = readLock(instance.root);

  if (sub === 'status') {
    if (!lock) {
      console.log(`no ${LOCK_FILENAME}. Ratified units that would be locked:`);
    } else {
      const diff = diffLock(instance, lock);
      console.log(`lock accepted by ${lock.acceptedBy} at ${lock.acceptedAt} (constitution @ ${lock.constitutionVersion})`);
      console.log(diff.clean ? 'status: clean' : `status: DRIFT — changed [${diff.changed}], added [${diff.added}], removed [${diff.removed}]`);
      return;
    }
    for (const [id, u] of Object.entries(computeLock(instance, '(unaccepted)').units)) {
      console.log(`  ${id.padEnd(8)} ${u.kind.padEnd(9)} ${u.hash.slice(0, 16)}`);
    }
    return;
  }

  if (sub === 'accept') {
    requireHumanTty('`constitution lock accept`');
    const next = computeLock(instance, '');
    console.log(`\nAbout to accept ${Object.keys(next.units).length} ratified unit(s) as the firewall baseline`);
    if (lock) {
      const diff = diffLock(instance, lock);
      console.log(diff.clean ? '(no change vs. current lock)' : `changes vs. current lock — changed [${diff.changed}], added [${diff.added}], removed [${diff.removed}]`);
    }
    const resp = await prompts([
      { type: 'text', name: 'name', message: 'Your name (recorded as the accepting ratifier):', initial: instance.constitution.ratifier },
      { type: 'text', name: 'confirm', message: 'Type ACCEPT to confirm you personally reviewed the ratified text:' },
    ]);
    if (resp.confirm !== 'ACCEPT' || !resp.name) {
      console.log('not accepted.');
      process.exit(1);
    }
    next.acceptedBy = resp.name;
    writeLock(instance.root, next);
    console.log(`wrote ${LOCK_FILENAME} — commit it. \`constitution firewall\` now gates ratified text.`);
    return;
  }

  fail(`unknown lock subcommand "${sub}" (use: status | accept)`);
}

function runCompile(args: string[]) {
  const task = positionals(args).join(' ').trim();
  if (!task) fail('usage: constitution compile "<task>" [--out] [--feature <slug>]');
  const instance = load(process.cwd());
  if (hasFlag(args, 'out') || getFlag(args, 'feature')) {
    const artifact = writeCompilePack(instance, task, getFlag(args, 'feature'));
    console.log(`wrote ${artifact.file} (feature: ${artifact.feature}; 'compiled' event logged).`);
    console.log('Hand the pack to the compile-prompt skill / an LLM to emit the briefing.');
  } else {
    process.stdout.write(buildCompilePack(instance, task));
  }
}

function runRender(args: string[]) {
  const unitId = positionals(args)[0];
  if (!unitId) fail('usage: constitution render <unit> [--tone canonical|plain|casual|formal] [--no-generate]');
  const tone = (getFlag(args, 'tone') ?? 'canonical') as Tone | 'canonical';
  if (tone !== 'canonical' && !TONES.includes(tone as Tone)) fail(`unknown tone "${tone}" (canonical|${TONES.join('|')})`);
  const instance = load(process.cwd());
  const generator = hasFlag(args, 'no-generate') ? null : claudeGenerator;
  try {
    const r = renderUnit(instance, unitId, tone, generator);
    if (tone !== 'canonical') {
      console.log(`(${r.tone} rendering — a derived view, ${r.fromCache ? 'cached' : 'freshly generated'}; the canonical text is the law)\n`);
    }
    console.log(r.text);
  } catch (e) {
    fail((e as Error).message);
  }
}

function runTones(args: string[]) {
  const sub = positionals(args)[0] ?? 'check';
  if (sub !== 'check') fail('usage: constitution tones check');
  const instance = load(process.cwd());
  const r = checkTones(instance);
  console.log(`fresh: ${r.fresh.length} · stale: ${r.stale.length} · orphaned: ${r.orphaned.length}`);
  for (const s of r.stale) console.log(`  stale:    ${s.unit} (${s.tone}) — ${s.reason}`);
  for (const o of r.orphaned) console.log(`  orphaned: ${path.basename(o.file)} — ${o.reason}`);
  if (r.stale.length + r.orphaned.length > 0) {
    console.log('`constitution doctor` prunes these (derived artifacts — below the firewall).');
    process.exit(1);
  }
}

const FEATURE_VERBS: Record<string, EventType> = {
  declare: 'declared',
  start: 'started',
  validate: 'validated',
  ship: 'shipped',
  block: 'blocked',
  unblock: 'unblocked',
  note: 'note',
};

function runFeature(args: string[]) {
  const pos = positionals(args);
  const verb = pos[0];
  const rest = pos.slice(1).join(' ').trim();
  if (!verb || !(verb in FEATURE_VERBS) || !rest) {
    fail(`usage: constitution feature <${Object.keys(FEATURE_VERBS).join('|')}> <slug or "title"> [--title "…"] [--refs F-II,ADR-0001] [--detail "…"]`);
  }
  const root = process.cwd();
  const known = new Set(readEvents(root).map((e) => e.feature));
  const feature = known.has(rest) ? rest : slugify(rest);
  const title = getFlag(args, 'title') ?? (feature === rest ? undefined : rest);
  const refs = getFlag(args, 'refs')?.split(',').map((s) => s.trim()).filter(Boolean);
  const e = appendEvent(root, { type: FEATURE_VERBS[verb], feature, title, refs, detail: getFlag(args, 'detail') });
  console.log(`logged: ${e.type} ${e.feature}${title ? ` — ${title}` : ''}`);
}

function runBoard(args: string[]) {
  const root = process.cwd();
  const board = foldBoard(root);
  if (hasFlag(args, 'html')) {
    let instance: Instance | null = null;
    try {
      instance = loadInstance(root);
    } catch {
      /* board still renders without a parseable constitution */
    }
    const out = getFlag(args, 'html') ?? path.join('.constitution', 'board.html');
    ensureOps(root);
    fs.writeFileSync(path.join(root, out), renderBoardHtml(board, instance));
    console.log(`wrote ${out}`);
  } else {
    console.log(renderBoardText(board));
  }
}

function runDoctorCmd() {
  const instance = load(process.cwd());
  const report = runDoctor(instance);
  for (const f of report.fixed) console.log(`fixed:  ${f}`);
  for (const q of report.queued) console.log(`queued: ${q} (above the firewall — awaiting the ratifier; see \`constitution proposals\`)`);
  for (const s of report.skipped) console.log(`open:   ${s}`);
  if (report.remaining.length > 0) {
    console.log('\nbelow-firewall findings needing a real fix (not mechanical):');
    console.log(formatFindings(report.remaining));
  }
  if (report.fixed.length + report.queued.length + report.skipped.length + report.remaining.length === 0) {
    console.log('healthy — nothing to fix, nothing queued.');
  }
}

function runProposals(args: string[]) {
  const pos = positionals(args);
  const root = process.cwd();
  if (pos[0] === 'show' && pos[1]) {
    const p = readProposal(root, pos[1]);
    if (!p) fail(`no proposal "${pos[1]}"`);
    console.log(p.body);
    return;
  }
  const all = listProposals(root);
  if (all.length === 0) {
    console.log('ratification queue empty.');
    return;
  }
  for (const p of all) {
    console.log(`${p.status.padEnd(9)} ${p.id}  [${p.kind}] ${p.title}${p.ruledBy ? ` (ruled by ${p.ruledBy})` : ''}`);
  }
}

async function runRatify(args: string[]) {
  const id = positionals(args)[0];
  if (!id) fail('usage: constitution ratify <proposal-id>');
  requireHumanTty('`constitution ratify`');
  const root = process.cwd();
  const p = readProposal(root, id);
  if (!p) fail(`no proposal "${id}" (see \`constitution proposals\`)`);
  if (p.status !== 'PROPOSED') fail(`proposal "${id}" is already ${p.status}`);
  console.log('\n' + p.body + '\n');
  const resp = await prompts([
    { type: 'select', name: 'ruling', message: `Your ruling on ${id}:`, choices: [
      { title: 'Approve', value: 'APPROVED' },
      { title: 'Reject', value: 'REJECTED' },
      { title: 'Leave queued', value: 'SKIP' },
    ] },
    { type: (prev: string) => (prev === 'SKIP' ? null : 'text'), name: 'name', message: 'Your name (recorded as the ratifier):' },
    { type: (_: unknown, values: { ruling?: string }) => (values.ruling === 'SKIP' ? null : 'text'), name: 'confirm', message: `Type the proposal id (${id}) to confirm:` },
  ]);
  if (!resp.ruling || resp.ruling === 'SKIP') {
    console.log('left queued.');
    return;
  }
  if (resp.confirm !== id || !resp.name) {
    console.log('confirmation mismatch — nothing recorded.');
    process.exit(1);
  }
  recordRuling(root, id, resp.ruling, resp.name);
  console.log(`recorded: ${id} ${resp.ruling} by ${resp.name}.`);
  if (resp.ruling === 'APPROVED') {
    console.log('Apply the drafted change to the law plane yourself (or direct an agent for below-firewall');
    console.log('mechanics), then re-run `constitution lock accept` if ratified text changed.');
  }
}

// ---------------------------------------------------------------------------

async function main() {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case 'init':
      await runInit();
      break;
    case 'audit':
      runAudit(args);
      break;
    case 'firewall':
      runFirewall();
      break;
    case 'lock':
      await runLock(args);
      break;
    case 'compile':
      runCompile(args);
      break;
    case 'render':
      runRender(args);
      break;
    case 'tones':
      runTones(args);
      break;
    case 'feature':
      runFeature(args);
      break;
    case 'board':
      runBoard(args);
      break;
    case 'doctor':
      runDoctorCmd();
      break;
    case 'proposals':
      runProposals(args);
      break;
    case 'ratify':
      await runRatify(args);
      break;
    case '--version':
    case '-v':
      console.log(VERSION);
      break;
    case '--help':
    case '-h':
    case undefined:
      console.log(HELP_TEXT);
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(HELP_TEXT);
      process.exit(1);
  }
}

main();
