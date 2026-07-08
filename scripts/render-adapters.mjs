#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const adapters = [
  'src/adapters/claude/CLAUDE.md',
  'src/adapters/codex/AGENTS.md',
  'src/adapters/copilot/copilot-instructions.md',
  'src/adapters/cursor/rules/index.mdc',
  'src/adapters/windsurf/.windsurfrules',
];

const errors = [];

const adapterTexts = adapters.map(p => [p, readFileSync(p, 'utf8')]);

for (const [adapter, text] of adapterTexts) {
  if (!text.includes('workflow/')) {
    errors.push(`${adapter} must route to workflow/`);
  }
  if (!text.includes('workflow/router.md')) {
    errors.push(`${adapter} must mention workflow/router.md`);
  }
  if (!text.includes('workflow/agent-behavior.yaml')) {
    errors.push(`${adapter} must mention workflow/agent-behavior.yaml`);
  }
}

const knownTokens = new Set([
  'REPO_NAME', 'REPO_PURPOSE', 'DOMAIN_NAME', 'DEFAULT_BRANCH',
  'BRANCH_POLICY', 'PROTECTED_PATHS', 'VERIFICATION_CMDS', 'CONSTRAINTS',
]);

for (const [adapterPath, text] of adapterTexts) {
  for (const [, token] of text.matchAll(/\{\{([A-Z_]+)\}\}/g)) {
    if (!knownTokens.has(token)) {
      errors.push(`${adapterPath}: unknown token {{${token}}} — add to token-map.md if intentional`);
    }
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
