#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const adapters = [
  'adapters/claude/CLAUDE.md',
  'adapters/codex/AGENTS.md',
  'adapters/copilot/copilot-instructions.md',
  'adapters/cursor/rules/index.mdc',
  'adapters/windsurf/.windsurfrules',
];

const errors = [];

for (const adapter of adapters) {
  const text = readFileSync(adapter, 'utf8');
  if (!text.includes('.workflow/')) {
    errors.push(`${adapter} must route to .workflow/`);
  }
  if (!text.includes('.workflow/router.md')) {
    errors.push(`${adapter} must mention .workflow/router.md`);
  }
  if (!text.includes('.workflow/config/agent-behavior.yaml')) {
    errors.push(`${adapter} must mention .workflow/config/agent-behavior.yaml`);
  }
}

if (errors.length > 0) {
  console.error(`render-adapters: failed with ${errors.length} issue(s)`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('render-adapters: adapter shims are current');
