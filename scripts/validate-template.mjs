#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const commands = [
  ['node', ['.workflow/validators/check-template-contracts.mjs']],
  ['node', ['.workflow/validators/check-lifecycle.mjs']],
];

for (const [cmd, args] of commands) {
  execFileSync(cmd, args, { stdio: 'inherit' });
}
