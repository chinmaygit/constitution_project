---
id: 0001
title: Allow package-managed installation of skills to satisfy F-II
status: proposed
date: 2026-07-01
supersedes: []
superseded_by: []
serves: [F-II]
amends: [F-II]
trigger: certiorari
---

## Question of law
Does installing (copying) framework skills via a CLI tool into a consumer's repository (e.g., `.cursorrules`, `.claude.json`) violate Article F-II ("One home per rule"), which previously mandated symlinks to avoid drift?

## Ruling
Distribution via a versioned package manager (e.g., `npx`, npm) satisfies F-II. The installed files in the consumer repo are treated as read-only build artifacts managed by the package version, not as duplicated source rules. 

## Constitutional impact
Amends F-II to explicitly recognize package-managed distributions as a valid "one home". This supersedes the `constitution-upgrade` skill's strict "symlinks, never copies" enforcement.

## Consequences
- **Positive**: Enables a standard, gstack-style CLI (`npx create-constitution`). Allows seamless integration with agents that don't support symlinked configs.
- **Negative**: Consumer repos now contain physical copies of the skills, requiring the CLI to manage drift and updates rather than relying on the OS filesystem (symlinks).

## Alternatives considered
- **Symlinks only**: Rejected. Friction-heavy for certain agents and limits standard node ecosystem distribution.
