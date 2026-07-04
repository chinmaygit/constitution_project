// Self-healing, split by the firewall (the reconcile-findings discipline,
// mechanized):
//
//  BELOW the firewall — fixed unattended: stale/orphaned tone renders pruned,
//  missing ops scaffold created, declared version-sync targets aligned to the
//  constitution version.
//
//  ABOVE the firewall — never fixed: each finding is drafted into the
//  ratification queue (.constitution/proposals/) exactly once, and waits for
//  the human. Getting this split wrong in the permissive direction would be
//  the engine silently amending the constitution — the worst failure mode it
//  can have.

import * as fs from 'fs';
import * as path from 'path';
import { audit, Finding } from './audit';
import { ensureOps, opsDir } from './events';
import { Instance } from './model';
import { hasOpenProposalFor, queueProposal } from './proposals';
import { pruneStaleTones } from './tone';

export interface InstanceConfig {
  // Files whose "version" field must equal the constitution version
  // (e.g. ["cli/package.json"] in the self-hosted repo).
  versionSync?: string[];
}

export function readConfig(root: string): InstanceConfig {
  // Committed config at the root wins; .constitution/config.json is the
  // fallback for instances that keep the whole ops dir untracked.
  for (const p of [path.join(root, 'constitution.config.json'), path.join(opsDir(root), 'config.json')]) {
    if (!fs.existsSync(p)) continue;
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8')) as InstanceConfig;
    } catch {
      return {};
    }
  }
  return {};
}

export interface DoctorReport {
  fixed: string[];
  queued: string[]; // proposal ids drafted for above-firewall findings
  skipped: string[]; // above-firewall findings that already have an open proposal
  remaining: Finding[]; // below-firewall findings the engine cannot fix mechanically
}

export function runDoctor(instance: Instance): DoctorReport {
  const report: DoctorReport = { fixed: [], queued: [], skipped: [], remaining: [] };

  // 1. Ops scaffold is regenerable — always safe.
  ensureOps(instance.root);

  // 2. Prune tone renders whose canonical source changed (derived artifacts).
  for (const f of pruneStaleTones(instance)) {
    report.fixed.push(`pruned stale tone render ${path.relative(instance.root, f)}`);
  }

  // 3. Declared version-sync targets (one number for the whole repo).
  const config = readConfig(instance.root);
  const version = instance.constitution.version;
  for (const rel of config.versionSync ?? []) {
    const p = path.join(instance.root, rel);
    if (!fs.existsSync(p) || !version) continue;
    try {
      const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (pkg.version !== version) {
        pkg.version = version;
        fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
        report.fixed.push(`synced ${rel} version -> ${version}`);
      }
    } catch {
      report.remaining.push({
        code: 'SYNC-UNPARSEABLE',
        severity: 'warn',
        firewall: 'below',
        where: rel,
        message: 'versionSync target is not parseable JSON',
      });
    }
  }

  // 4. Audit; queue drafts for everything above the firewall, report the rest.
  for (const finding of audit(instance)) {
    if (finding.firewall === 'above') {
      const target = finding.where;
      if (hasOpenProposalFor(instance.root, target, finding.code)) {
        report.skipped.push(`${finding.code} @ ${target} (already queued)`);
        continue;
      }
      const p = queueProposal(instance.root, {
        title: `${finding.code}: ${finding.message.slice(0, 80)}`,
        kind: finding.code,
        target,
        rationale:
          `Deterministic audit finding (severity: ${finding.severity}) at ${finding.where}:\n\n` +
          `> ${finding.message}\n\n` +
          'The fix touches ratified L0/L1 substance, so it crosses the firewall (F-IV) and ' +
          'requires the ratifier.',
        draft:
          '_No mechanical draft — the ruling is the ratifier\'s. Options: amend the text ' +
          '(then re-run `constitution lock accept`), revert the change that caused this, or ' +
          'reject this proposal with a reason._',
      });
      report.queued.push(p.id);
    } else {
      report.remaining.push(finding);
    }
  }

  return report;
}
