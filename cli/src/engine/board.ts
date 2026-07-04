// Folds the ops event log into Kanban state and renders it (terminal + static
// HTML). Reads the law plane for the governance health strip; writes nothing
// anywhere near it.

import { DeliveryEvent, EventType, LIFECYCLE, readEvents } from './events';
import { Instance } from './model';

export interface FeatureState {
  feature: string;
  title: string;
  column: EventType; // latest lifecycle event
  blocked: boolean;
  refs: string[];
  lastEvent: string; // ISO ts
  firstEvent: string;
  history: DeliveryEvent[];
}

export interface BoardState {
  columns: { id: EventType; label: string; features: FeatureState[] }[];
  generatedAt: string;
}

const COLUMN_LABELS: Record<string, string> = {
  declared: 'Declared',
  compiled: 'Compiled',
  started: 'Building',
  validated: 'Validating',
  shipped: 'Shipped',
};

export function foldBoard(root: string): BoardState {
  const events = readEvents(root);
  const byFeature = new Map<string, FeatureState>();
  for (const e of events) {
    let f = byFeature.get(e.feature);
    if (!f) {
      f = {
        feature: e.feature,
        title: e.title ?? e.feature,
        column: 'declared',
        blocked: false,
        refs: [],
        lastEvent: e.ts,
        firstEvent: e.ts,
        history: [],
      };
      byFeature.set(e.feature, f);
    }
    f.history.push(e);
    f.lastEvent = e.ts;
    if (e.title) f.title = e.title;
    for (const r of e.refs ?? []) if (!f.refs.includes(r)) f.refs.push(r);
    if (LIFECYCLE.includes(e.type)) f.column = e.type;
    if (e.type === 'blocked') f.blocked = true;
    if (e.type === 'unblocked') f.blocked = false;
  }
  const columns = LIFECYCLE.map((id) => ({
    id,
    label: COLUMN_LABELS[id],
    features: [...byFeature.values()]
      .filter((f) => f.column === id)
      .sort((a, b) => b.lastEvent.localeCompare(a.lastEvent)),
  }));
  return { columns, generatedAt: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// Terminal rendering

export function renderBoardText(board: BoardState): string {
  const lines: string[] = [];
  const total = board.columns.reduce((n, c) => n + c.features.length, 0);
  if (total === 0) {
    return 'board empty — declare work with `constitution feature declare "<title>"`.';
  }
  for (const col of board.columns) {
    lines.push(`\n${col.label} (${col.features.length})`);
    lines.push('─'.repeat(Math.max(col.label.length + 4, 12)));
    for (const f of col.features) {
      const flags = f.blocked ? ' ⛔ BLOCKED' : '';
      const refs = f.refs.length ? `  [${f.refs.join(', ')}]` : '';
      lines.push(`  • ${f.title}${flags}${refs}`);
      lines.push(`    ${f.feature} · last activity ${f.lastEvent.slice(0, 10)}`);
    }
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Static HTML dashboard

export function renderBoardHtml(board: BoardState, instance: Instance | null): string {
  const doc = instance?.constitution;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const columnsHtml = board.columns
    .map(
      (col) => `
    <section class="col">
      <header><h2>${esc(col.label)}</h2><span class="count">${col.features.length}</span></header>
      ${col.features
        .map(
          (f) => `
      <article class="card${f.blocked ? ' blocked' : ''}">
        <h3>${esc(f.title)}</h3>
        ${f.blocked ? '<span class="flag">BLOCKED</span>' : ''}
        <div class="refs">${f.refs.map((r) => `<span class="ref">${esc(r)}</span>`).join('')}</div>
        <div class="meta">${esc(f.feature)} · ${esc(f.lastEvent.slice(0, 16).replace('T', ' '))}</div>
      </article>`
        )
        .join('')}
    </section>`
    )
    .join('');

  const healthHtml = doc
    ? `
  <section class="health">
    <h2>Governance health — ${esc(doc.title)} @ ${esc(doc.version)}</h2>
    <div class="articles">
      ${doc.articles
        .map(
          (a) => `
      <div class="article">
        <span class="aid">${esc(a.id)}</span>
        <span class="aname">${esc(a.name)}</span>
        <span class="badge st-${esc(a.status)}">${esc(a.status)}</span>
        <span class="badge cf-${esc(a.conformance)}">${esc(a.conformance)}</span>
        <span class="badge en-${esc(a.enforcement)}">${esc(a.enforcement)}</span>
      </div>`
        )
        .join('')}
    </div>
  </section>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>constitution — delivery board</title>
<style>
  :root {
    --bg: #f6f7f9; --panel: #ffffff; --ink: #1a1d21; --muted: #6b7280;
    --line: #e5e7eb; --accent: #4f46e5; --ok: #16a34a; --bad: #dc2626; --warn: #d97706;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0f1115; --panel: #171a21; --ink: #e5e7eb; --muted: #9ca3af;
            --line: #262b35; --accent: #818cf8; --ok: #4ade80; --bad: #f87171; --warn: #fbbf24; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; font: 14px/1.45 -apple-system, "Segoe UI", Roboto, sans-serif;
         background: var(--bg); color: var(--ink); padding: 24px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .sub { color: var(--muted); margin-bottom: 20px; font-size: 12px; }
  .board { display: grid; grid-template-columns: repeat(5, minmax(180px, 1fr)); gap: 12px; }
  .col { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 10px; min-height: 120px; }
  .col header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
  .col h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .06em; margin: 0; color: var(--muted); }
  .count { color: var(--muted); font-size: 12px; }
  .card { border: 1px solid var(--line); border-radius: 8px; padding: 10px; margin-bottom: 8px; background: var(--bg); }
  .card.blocked { border-color: var(--bad); }
  .card h3 { font-size: 13px; margin: 0 0 6px; }
  .flag { color: var(--bad); font-size: 10px; font-weight: 700; letter-spacing: .08em; }
  .refs { display: flex; flex-wrap: wrap; gap: 4px; margin: 4px 0; }
  .ref { font: 11px ui-monospace, monospace; color: var(--accent); border: 1px solid var(--line);
         border-radius: 999px; padding: 1px 7px; }
  .meta { color: var(--muted); font-size: 11px; }
  .health { margin-top: 28px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 14px; }
  .health h2 { font-size: 13px; margin: 0 0 10px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
  .article { display: flex; gap: 8px; align-items: center; padding: 5px 0; border-top: 1px solid var(--line); }
  .article:first-child { border-top: 0; }
  .aid { font: 12px ui-monospace, monospace; color: var(--accent); min-width: 48px; }
  .aname { flex: 1; font-size: 13px; }
  .badge { font: 10px ui-monospace, monospace; padding: 2px 8px; border-radius: 999px;
           border: 1px solid var(--line); color: var(--muted); }
  .st-RATIFIED { color: var(--ok); border-color: var(--ok); }
  .st-PROPOSED { color: var(--warn); border-color: var(--warn); }
  .cf-HOLDS { color: var(--ok); border-color: var(--ok); }
  .cf-VIOLATED { color: var(--bad); border-color: var(--bad); }
  .cf-UNVERIFIED { color: var(--warn); border-color: var(--warn); }
  .en-UNGUARDED { color: var(--bad); border-color: var(--bad); }
  .en-AUDITED { color: var(--warn); border-color: var(--warn); }
  .en-GATED, .en-STRUCTURAL { color: var(--ok); border-color: var(--ok); }
  @media (max-width: 900px) { .board { grid-template-columns: 1fr 1fr; } }
</style>
</head>
<body>
  <h1>Delivery board</h1>
  <div class="sub">generated ${esc(board.generatedAt)} by <code>constitution board --html</code> —
    operational view over <code>.constitution/events.jsonl</code>; reads the law, never stores it.</div>
  <div class="board">${columnsHtml}</div>
  ${healthHtml}
</body>
</html>
`;
}
