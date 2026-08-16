#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

// AGENTSMYTH_WF tells validators to look at src/workflow/ (source) rather than
// workflow/ (dev workspace) when running build-level checks.
const sourceEnv = { ...process.env, AGENTSMYTH_WF: 'src/workflow' };

// Structural/template checks — validate the package source itself (src/workflow/).
const sourceCommands = [
  ['node', ['src/workflow/validators/check-starter-blocks.mjs']],
  ['node', ['src/workflow/validators/check-lifecycle.mjs']],
  // Recurrence guard: every field named in the setup reference docs must exist in the schemas
  // (audit-remediation R8). Reads src/setup/references/ and src/workflow/schemas/.
  ['node', ['src/workflow/validators/check-setup-refs.mjs']],
];

// WP-R4 Wave 1 semantic checks — validate this repo's own dogfooded lifecycle artifacts
// under workflow/artifacts/ (dev workspace). AGENTSMYTH_HOME (not AGENTSMYTH_WF) points
// definitions reads (agent-behavior.yaml, schemas) at src/workflow — the canonical source in
// this repo — while data reads (artifacts) stay on workflow/, since workflow/agent-behavior.yaml
// does not exist as a separate synced copy here (see AGENTS.md's source-repo note). This is the
// two-root resolver (WP-R2) used exactly as designed, not a new mechanism.
const artifactEnv = { ...process.env, AGENTSMYTH_HOME: 'src/workflow' };
const artifactCommands = [
  // check-artifacts was never invoked here — it ran only against test fixtures, so this repo's own
  // artifacts went unchecked and drifted (WP-R8 Review F7). Wired in with a baseline that
  // grandfathers the 96 violations that already existed; every new one fails, including new ones in
  // the same files. The baseline can only shrink — a stale entry is an error.
  ['node', ['src/workflow/validators/check-artifacts.mjs', '--baseline', 'workflow/config/artifact-baseline.yaml']],
  ['node', ['src/workflow/validators/check-waivers.mjs']],
  ['node', ['src/workflow/validators/check-coverage-ledger.mjs']],
  ['node', ['src/workflow/validators/check-coverage-range-shorthand.mjs']],
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
  // Previously documented but never actually invoked by any script, CI job, or test runner
  // (found via audit-validator-fixture-gaps) — both check real dev-workspace/repo state directly,
  // no env override needed.
  ['node', ['src/workflow/validators/check-config.mjs']],
  ['node', ['src/workflow/validators/check-schema-keywords.mjs']],
  ['node', ['src/workflow/validators/check-domain-placeholders.mjs']],
  ['node', ['src/workflow/validators/check-constraint-conflicts.mjs']],
  // Mechanical regression check for skill_scoring.triggers predicates against the fixed
  // examples/power-skill-sandbox/ scenario. Needs AGENTSMYTH_HOME to resolve agent-behavior.yaml
  // at src/workflow (same reason as the rest of this group); the sandbox fixture itself is read
  // by repo-relative path since it lives under examples/, not workflow/.
  ['node', ['src/workflow/validators/check-trigger-predicates.mjs']],
];

for (const [cmd, args] of sourceCommands) {
  execFileSync(cmd, args, { stdio: 'inherit', env: sourceEnv });
}

for (const [cmd, args] of artifactCommands) {
  execFileSync(cmd, args, { stdio: 'inherit', env: artifactEnv });
}
