#!/usr/bin/env node
import { readFileSync } from 'node:fs';

// ── Per-repo adapter shims (rendered with repo tokens at init time) ─────────

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

// ── Global gate templates (RI2: must be token-free) ─────────────────────────
// Installed by `agentsmyth init --system` to tool-native global config paths.
// Must never contain {{...}} substitution markers — they serve all repos.

const globalGates = [
  'src/adapters/claude/global-gate.md',
  'src/adapters/codex/global-gate.md',
  'src/adapters/copilot/global-gate.md',
  'src/adapters/windsurf/global-gate.md',
];

const WINDSURF_CHAR_CAP = 6000;

for (const gatePath of globalGates) {
  const text = readFileSync(gatePath, 'utf8');
  const tokens = [...text.matchAll(/\{\{([A-Z_]+)\}\}/g)];
  if (tokens.length > 0) {
    errors.push(`${gatePath} (global gate) must be token-free but contains: ${tokens.map(m => `{{${m[1]}}}`).join(', ')}`);
  }
  if (gatePath.includes('windsurf') && text.length > WINDSURF_CHAR_CAP) {
    errors.push(`${gatePath} exceeds Windsurf 6,000-char cap (${text.length} chars)`);
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
