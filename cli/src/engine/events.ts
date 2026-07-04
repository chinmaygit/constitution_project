// The ops plane's event log: .constitution/events.jsonl, append-only.
// This is operational tooling data — it references the law by id (refs) but is
// NOT a governed layer, and nothing here is ever written into CONSTITUTION.md.
// Deleting the file loses delivery history, not legality.

import * as fs from 'fs';
import * as path from 'path';

export const OPS_DIR = '.constitution';

export type EventType =
  | 'declared' // intent stated by the owner
  | 'compiled' // L4 briefing compiled for it
  | 'started' // implementation begun
  | 'validated' // definition-of-done assertions passed
  | 'shipped' // delivered
  | 'blocked'
  | 'unblocked'
  | 'note';

export const LIFECYCLE: EventType[] = ['declared', 'compiled', 'started', 'validated', 'shipped'];

export interface DeliveryEvent {
  ts: string; // ISO
  type: EventType;
  feature: string; // slug
  title?: string;
  refs?: string[]; // law ids this work is governed by: ["F-II", "ADR-0001"]
  detail?: string;
  by?: string;
}

export function opsDir(root: string): string {
  return path.join(root, OPS_DIR);
}

export function eventsPath(root: string): string {
  return path.join(opsDir(root), 'events.jsonl');
}

export function ensureOps(root: string): void {
  for (const d of [opsDir(root), path.join(opsDir(root), 'tone'), path.join(opsDir(root), 'proposals'), path.join(opsDir(root), 'compiles')]) {
    fs.mkdirSync(d, { recursive: true });
  }
  const p = eventsPath(root);
  if (!fs.existsSync(p)) fs.writeFileSync(p, '');
  // Regenerable caches stay out of git; the delivery record (events) and the
  // ratification queue (proposals) are worth committing.
  const gi = path.join(opsDir(root), '.gitignore');
  if (!fs.existsSync(gi)) fs.writeFileSync(gi, 'tone/\ncompiles/\nboard.html\n');
}

export function appendEvent(root: string, event: Omit<DeliveryEvent, 'ts'> & { ts?: string }): DeliveryEvent {
  ensureOps(root);
  const full: DeliveryEvent = { ts: event.ts ?? new Date().toISOString(), ...event } as DeliveryEvent;
  fs.appendFileSync(eventsPath(root), JSON.stringify(full) + '\n');
  return full;
}

export function readEvents(root: string): DeliveryEvent[] {
  const p = eventsPath(root);
  if (!fs.existsSync(p)) return [];
  const out: DeliveryEvent[] = [];
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      out.push(JSON.parse(trimmed) as DeliveryEvent);
    } catch {
      // a corrupt line is skipped, never fatal — ops data is best-effort
    }
  }
  return out;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}
