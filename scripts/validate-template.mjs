#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

// AGENTSMYTH_WF tells validators to look at src/workflow/ (source) rather than
// workflow/ (dev workspace) when running build-level checks.
const sourceEnv = { ...process.env, AGENTSMYTH_WF: 'src/workflow' };

// Structural/template checks — validate the package source itself (src/workflow/).
const sourceCommands = [
  ['node', ['src/workflow/validators/check-starter-blocks.mjs']],
  ['node', ['src/workflow/validators/check-lifecycle.mjs']],
];

// WP-R4 Wave 1 semantic checks — validate this repo's own dogfooded lifecycle artifacts
// under workflow/artifacts/ (dev workspace). AGENTSMYTH_HOME (not AGENTSMYTH_WF) points
// definitions reads (agent-behavior.yaml, schemas) at src/workflow — the canonical source in
// this repo — while data reads (artifacts) stay on workflow/, since workflow/agent-behavior.yaml
// does not exist as a separate synced copy here (see AGENTS.md's source-repo note). This is the
// two-root resolver (WP-R2) used exactly as designed, not a new mechanism.
const artifactEnv = { ...process.env, AGENTSMYTH_HOME: 'src/workflow' };
const artifactCommands = [
  ['node', ['src/workflow/validators/check-waivers.mjs']],
  ['node', ['src/workflow/validators/check-coverage-ledger.mjs']],
  ['node', ['src/workflow/validators/check-evidence-citations.mjs']],
  ['node', ['src/workflow/validators/check-scope-fence.mjs']],
  ['node', ['src/workflow/validators/check-manifest-coverage.mjs']],
  ['node', ['src/workflow/validators/check-skipped-accounting.mjs']],
  ['node', ['src/workflow/validators/check-release-readiness.mjs']],
  ['node', ['src/workflow/validators/check-skill-triggers.mjs']],
  ['node', ['src/workflow/validators/check-phase-map.mjs']],
  ['node', ['src/workflow/validators/check-assumptions.mjs']],
  ['node', ['src/workflow/validators/check-verify-matrix.mjs']],
  ['node', ['src/workflow/validators/check-followups.mjs']],
  ['node', ['src/workflow/validators/check-open-items.mjs']],
];

for (const [cmd, args] of sourceCommands) {
  execFileSync(cmd, args, { stdio: 'inherit', env: sourceEnv });
}

for (const [cmd, args] of artifactCommands) {
  execFileSync(cmd, args, { stdio: 'inherit', env: artifactEnv });
}
