#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Deliberately duplicated from lib.mjs's _resolveRepoRoot, not imported, even
// though lib.mjs ships alongside this file at setup time: lib.mjs's module-level code includes
// a definitions_root guard that can process.exit(1) if a custom root doesn't exist yet — an
// unacceptable side effect here, since this script runs during setup verification itself,
// precisely when things may not be fully configured. Keep this in sync with lib.mjs's version.
// Exported so a drift-detection test can call it directly instead of re-deriving expected
// behavior from source.
export function resolveRepoRoot() {
  const profilePath = join(process.cwd(), 'workflow', 'config', 'repo-profile.yaml');
  if (existsSync(profilePath)) {
    try {
      const text = readFileSync(profilePath, 'utf8');
      if (text.match(/^\s*mode:\s*(.+)$/m)?.[1]?.trim() === 'polyrepo-member') {
        const workspaceRoot = text.match(/^\s*workspace_root:\s*(.+)$/m)?.[1]?.trim();
        if (workspaceRoot) {
          return workspaceRoot.startsWith('~/')
            ? join(homedir(), workspaceRoot.slice(2))
            : workspaceRoot;
        }
      }
    } catch { /* fall through to git detection */ }
  }
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  } catch {
    return process.cwd();
  }
}

const repoRoot = resolveRepoRoot();

// Debug hook (for automated root-resolution testing only) — prints the resolved root and exits
// before any of this file's actual setup-completeness checks run, which would otherwise
// fail/exit in a scratch test directory that has no real workflow tree. Never fires in normal
// operation.
if (process.env.AGENTSMYTH_DEBUG_ROOT) {
  console.log(repoRoot);
  process.exit(0);
}

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
// Regexes need the `m` flag — without it, `^`/`$` only anchor to the start/end of the whole
// string, so these never matched (domain.yaml always has `version`/`kind` lines before `domain:`).
// Also use `[ \t]+` rather than `\s+` before the required non-whitespace character — `\s` matches
// `\n` too, so an empty "summary:" line was incorrectly seen as "has content" by matching across
// into the next line's text. `[ \t]` stays within the current line, so a single condition
// correctly covers both "field absent" and "field present but blank" without the asymmetric
// second fallback check `name` previously needed and `summary` was missing.
// Found via audit: this made both checks false-fail for every correctly-filled domain.yaml (and
// the summary check separately false-pass for a genuinely empty one), in every consumer repo, not
// just this dev repo.
const domainText = read('workflow/config/domain.yaml');
if (domainText) {
  if (!/^  name:[ \t]+\S/m.test(domainText)) {
    errors.push('workflow/config/domain.yaml — domain.name must be a non-empty string');
  }
  if (!/^  summary:[ \t]+\S/m.test(domainText)) {
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

// Mirrors resolveRepoRoot()'s own regex style (no YAML parser available at this point in the
// file, same constraint as that function) rather than importing lib.mjs's version — same reason
// resolveRepoRoot() itself isn't imported: lib.mjs's module-level code can process.exit(1) if a
// custom definitions_root doesn't exist yet, an unacceptable side effect during setup
// verification itself, when things may deliberately not be fully configured yet.
//
// Also true when AGENTSMYTH_HOME is set — this is the same env var lib.mjs's own two-root
// resolver already treats as equivalent to definitions_root (definitions_root -> AGENTSMYTH_HOME
// -> repo-local fallback), and scripts/validate-template.mjs already uses it exactly this way to
// point this repo's own dogfood checks at src/workflow/ instead of workflow/. Without this,
// folding this validator into `agentsmyth check` (which this repo's own `AGENTSMYTH_HOME=src/workflow
// node bin/agentsmyth.mjs check` invocation now exercises) falsely treated agentsmyth's own dev
// workspace as an unlinked consumer repo needing a full local workflow/ tree it was never meant
// to have — found live while folding this validator into `agentsmyth check` for the first time.
function definitionsRootIsSet() {
  if (process.env.AGENTSMYTH_HOME) return true;
  const text = read('workflow/config/repo-profile.yaml');
  if (!text) return false;
  return Boolean(text.match(/^\s*definitions_root:\s*(\S.*)$/m)?.[1]?.trim());
}

// Always required, regardless of whether skills/router/validators/schemas resolve from a global
// definitions_root install or exist locally — see src/setup/SKILL.md Step 5b, which documents
// this exact pair as the only two definitions-adjacent paths that "must always exist... regardless
// of link state."
const alwaysRequiredPaths = [
  'workflow/artifacts',
  'workflow/learnings',
];

// Required locally only in the defensive, no-definitions_root fallback (src/setup/SKILL.md Step
// 5b's second branch — "should not normally happen," since `agentsmyth init` always sets
// definitions_root before the agent-driven setup skill starts, but still a real, supported path).
// When definitions_root IS set, Step 5b's first branch deliberately does not expand any of these
// locally — they resolve from the global install at runtime. Previously this list was checked
// unconditionally, which meant setup could never actually pass via the intended, default
// definitions_root-linked path — found via a real consumer's first end-to-end use of the
// /agentsmyth invocation skill (wp-r12-local-install-fixes-v1's own R4).
const definitionsTreePaths = [
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
];

const requiredPaths = definitionsRootIsSet()
  ? alwaysRequiredPaths
  : [...alwaysRequiredPaths, ...definitionsTreePaths];

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
