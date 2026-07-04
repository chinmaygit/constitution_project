// constitution.lock.json — the firewall as a gate (F-IV, mechanized).
// Records the canonical hash of every RATIFIED L0/L1 unit. Written only via
// `constitution lock accept` (interactive human TTY + typed confirmation —
// enforced in the CLI layer). `constitution firewall` compares live hashes to
// the lock and fails on any drift: an agent cannot land an edit to ratified
// text, or a new RATIFIED status, without a human re-accepting the lock.

import * as fs from 'fs';
import * as path from 'path';
import { Instance, Unit, unitsOf } from './model';

export interface LockUnit {
  kind: 'preamble' | 'article';
  hash: string;
}

export interface LockFile {
  lockVersion: 1;
  constitutionVersion: string;
  acceptedBy: string;
  acceptedAt: string; // ISO
  units: Record<string, LockUnit>; // id -> hash of ratified units only
}

export const LOCK_FILENAME = 'constitution.lock.json';

export function lockPath(root: string): string {
  return path.join(root, LOCK_FILENAME);
}

export function readLock(root: string): LockFile | null {
  const p = lockPath(root);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8')) as LockFile;
}

export function ratifiedUnits(instance: Instance): Unit[] {
  return unitsOf(instance).filter((u) => u.ratified && u.kind !== 'adr');
}

export function computeLock(instance: Instance, acceptedBy: string): LockFile {
  const units: Record<string, LockUnit> = {};
  for (const u of ratifiedUnits(instance)) {
    units[u.id] = { kind: u.kind as 'preamble' | 'article', hash: u.hash };
  }
  return {
    lockVersion: 1,
    constitutionVersion: instance.constitution.version,
    acceptedBy,
    acceptedAt: new Date().toISOString(),
    units,
  };
}

export function writeLock(root: string, lock: LockFile): void {
  fs.writeFileSync(lockPath(root), JSON.stringify(lock, null, 2) + '\n');
}

export interface LockDiff {
  changed: string[]; // ratified unit text differs from the accepted hash
  added: string[]; // ratified now, absent from the lock (unaccepted ratification)
  removed: string[]; // in the lock, no longer ratified/present (unaccepted repeal)
  clean: boolean;
}

export function diffLock(instance: Instance, lock: LockFile): LockDiff {
  const live = new Map(ratifiedUnits(instance).map((u) => [u.id, u.hash]));
  const changed: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];
  for (const [id, unit] of Object.entries(lock.units)) {
    const liveHash = live.get(id);
    if (liveHash === undefined) removed.push(id);
    else if (liveHash !== unit.hash) changed.push(id);
  }
  for (const id of live.keys()) {
    if (!(id in lock.units)) added.push(id);
  }
  return { changed, added, removed, clean: changed.length + added.length + removed.length === 0 };
}
