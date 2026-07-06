#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

// AGENTSMYTH_WF tells validators to look at src/workflow/ (source) rather than
// workflow/ (dev workspace) when running build-level checks.
const env = { ...process.env, AGENTSMYTH_WF: 'src/workflow' };

const commands = [
  ['node', ['src/workflow/validators/check-starter-blocks.mjs']],
  ['node', ['src/workflow/validators/check-lifecycle.mjs']],
];

for (const [cmd, args] of commands) {
  execFileSync(cmd, args, { stdio: 'inherit', env });
}
