#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = process.cwd();

const errors = [];
const warnings = [];

function path(...parts) {
  return join(repoRoot, ...parts);
}

function exists(rel) {
  return existsSync(path(rel));
}

function read(rel) {
  const full = path(rel);
  return existsSync(full) ? readFileSync(full, 'utf8') : null;
}

function countPlaceholders(text) {
  return (text.match(/<PLACEHOLDER>/g) ?? []).length;
}

// The 5 agent-editable config files (agent-behavior.yaml is a workflow invariant, excluded)
const agentConfigs = [
  'workflow/config/domain.yaml',
  'workflow/config/repo-profile.yaml',
  'workflow/config/source-of-truth.yaml',
  'workflow/config/verification.yaml',
  'workflow/config/release.yaml',
];

// Check 1: all config files exist
for (const file of agentConfigs) {
  if (!exists(file)) {
    errors.push(`${file} is missing — agent must write this during setup Phase 3`);
  }
}

// Check 2: no unfilled <PLACEHOLDER> values remain (configs + mental map)
const filesToCheckPlaceholders = [
  ...agentConfigs,
  'docs/knowledge-map/repo-mental-map.md',
];

for (const file of filesToCheckPlaceholders) {
  const text = read(file);
  if (!text) continue;
  const count = countPlaceholders(text);
  if (count > 0) {
    errors.push(`${file} has ${count} unfilled <PLACEHOLDER> value(s) — fill all before proceeding`);
  }
}

// Check 3: domain.yaml has a real name and summary
const domainText = read('workflow/config/domain.yaml');
if (domainText) {
  if (!/^  name:\s+\S/.test(domainText) || /^  name:\s*$/.test(domainText)) {
    errors.push('workflow/config/domain.yaml — domain.name must be a non-empty string');
  }
  if (!/^  summary:\s+\S/.test(domainText)) {
    errors.push('workflow/config/domain.yaml — domain.summary must be a non-empty string');
  }
}

// Check 4: repo-profile.yaml has a real default_branch
const profileText = read('workflow/config/repo-profile.yaml');
if (profileText) {
  if (!/default_branch:\s+\S/.test(profileText)) {
    errors.push('workflow/config/repo-profile.yaml — repository.default_branch must be set');
  }
}

// Check 5: repo-mental-map.md exists and has content beyond placeholder
const mapText = read('docs/knowledge-map/repo-mental-map.md');
if (!mapText) {
  errors.push('docs/knowledge-map/repo-mental-map.md is missing — agent must write this during setup Phase 3');
} else if (countPlaceholders(mapText) > 0) {
  errors.push(`docs/knowledge-map/repo-mental-map.md has ${countPlaceholders(mapText)} unfilled <PLACEHOLDER> value(s)`);
}

// Check 6: flag USER-TODO items as pending (not failures, but visible)
const allConfigText = agentConfigs.map(f => read(f) ?? '').join('\n') + (mapText ?? '');
const userTodos = (allConfigText.match(/<USER-TODO:[^>]*>/g) ?? []);
if (userTodos.length > 0) {
  warnings.push(`${userTodos.length} <USER-TODO> item(s) remain — these need follow-up but do not block setup:`);
  for (const todo of userTodos) {
    warnings.push(`  ${todo}`);
  }
}

// ── Check: full workflow tree presence ──────────────────────────────────────

const requiredPaths = [
  'workflow/router.md',
  'workflow/lifecycle.md',
  'workflow/rules.md',
  'workflow/glossary.md',
  'workflow/skills/lifecycle-think/SKILL.md',
  'workflow/skills/lifecycle-plan/SKILL.md',
  'workflow/skills/lifecycle-build/SKILL.md',
  'workflow/skills/lifecycle-review/SKILL.md',
  'workflow/skills/lifecycle-test/SKILL.md',
  'workflow/skills/lifecycle-ship/SKILL.md',
  'workflow/skills/lifecycle-reflect/SKILL.md',
  'workflow/validators/check-config.mjs',
  'workflow/validators/check-artifacts.mjs',
  'workflow/schemas/lifecycle-artifact.schema.yaml',
  'workflow/artifacts',
  'workflow/learnings',
];

for (const p of requiredPaths) {
  if (!exists(p)) {
    errors.push(`${p} is missing — workflow bundle was not fully expanded`);
  }
}

// ── Check: .agentsmyth/ must be gone (agent cleanup step) ──────────────────

if (exists('.agentsmyth')) {
  errors.push('.agentsmyth/ still exists — agent must delete it as the final step of Phase 5');
}

// ── Check: at least one tool-native adapter must be present ────────────────

const adapterPaths = [
  '.claude/CLAUDE.md',
  'AGENTS.md',
  '.github/copilot-instructions.md',
  '.cursor/rules/agentsmyth.mdc',
  '.windsurfrules',
];

const presentAdapters = adapterPaths.filter(p => exists(p));
if (presentAdapters.length === 0) {
  errors.push(
    'no tool-native adapter found — expected at least one of: ' + adapterPaths.join(', ')
  );
} else {
  console.log(`  adapters present: ${presentAdapters.join(', ')}`);
}

for (const warning of warnings) {
  console.warn(warning);
}

if (errors.length > 0) {
  console.error(`check-setup-complete: failed with ${errors.length} issue(s)`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error('');
  console.error('Fix all issues above. Waivers are not permitted during setup.');
  process.exit(1);
}

console.log('check-setup-complete: ok');
