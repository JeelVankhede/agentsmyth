#!/usr/bin/env node
// Regression suite for check-lifecycle.mjs's checkpoint-approval gate (requireCheckpointApproval /
// checkpointApprovalSection). Added after a real violation this session: an agent treated
// answering earlier clarifying questions as blanket approval for a later, distinct plan-review
// checkpoint it never actually surfaced to the user. workflow/rules.md already stated the rule in
// prose (its "## Approval" section) before this check existed and was not sufficient on its own
// to prevent the violation — this suite exercises the mechanical, hard-blocking backstop.
//
// AGENTSMYTH_WF is used (not --dir, which check-lifecycle.mjs's --phase mode does not support)
// to point the gate at each fixture's own artifacts/ tree, one whole-process invocation per case.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const validator = join(repoRoot, 'src', 'workflow', 'validators', 'check-lifecycle.mjs');

function runGate(fixtureDir) {
  return spawnSync(
    process.execPath,
    [validator, '--phase', 'plan', '--slug', 'checkpoint-test'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: { ...process.env, AGENTSMYTH_WF: join('test', 'fixtures', 'checkpoint-approval', fixtureDir) },
    }
  );
}

const cases = [
  {
    id: 'missing',
    description: 'Brief declares user_checkpoint but has no Checkpoint Approval section',
    fixtureDir: 'missing',
    expectRejected: true,
  },
  {
    id: 'mismatched',
    description: 'Checkpoint Approval section names a different checkpoint than orchestration.user_checkpoint',
    fixtureDir: 'mismatched',
    expectRejected: true,
  },
  {
    id: 'valid',
    description: 'Checkpoint Approval section present, matching, approved, with real evidence',
    fixtureDir: 'valid',
    expectRejected: false,
  },
];

let passed = 0;
let gaps = 0;

for (const testCase of cases) {
  const result = runGate(testCase.fixtureDir);
  const rejected = result.status !== 0;
  const ok = rejected === testCase.expectRejected;

  if (ok) {
    console.log(`[PASS] ${testCase.id}: ${testCase.description}`);
    passed++;
  } else {
    console.error(`[GAP]  ${testCase.id}: ${testCase.description}`);
    console.error(`       expected rejected=${testCase.expectRejected}, got rejected=${rejected}`);
    if (result.stdout) console.error(`       stdout: ${result.stdout.trim()}`);
    gaps++;
  }
}

console.log(`\n${passed}/${cases.length} checkpoint-approval cases correct`);

if (gaps > 0) {
  console.error(`${gaps} confirmed gap(s) in the checkpoint-approval gate`);
  process.exit(1);
}
