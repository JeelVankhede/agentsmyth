#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cwd = process.cwd();
const command = process.argv[2];

// Deliberately duplicated from lib.mjs's _resolveRepoRoot, third copy alongside
// lib.mjs's own and check-setup-complete.mjs's: this is the CLI entrypoint and shells out to
// validators as a separate process rather than importing lib.mjs directly, so it can't share
// the function without restructuring the dispatch model. Keep in sync with lib.mjs's version.
// Used only for `check` (resolving an EXISTING repo) below — NOT for `init`'s target-directory
// selection further down, which intentionally installs wherever the user invoked the command,
// same as today. A polyrepo-member's very first `init` (which now writes `definitions_root`
// itself) has no repo-profile.yaml yet to read workspace_root from — specifying
// workspace_root at first-init time is a real gap, not handled here; this covers every
// subsequent `check` call once repo-profile.yaml exists.
function resolveExistingRepoRoot() {
  const profilePath = join(cwd, 'workflow', 'config', 'repo-profile.yaml');
  if (existsSync(profilePath)) {
    try {
      const text = readFileSync(profilePath, 'utf8');
      if (text.match(/^\s*mode:\s*(.+)$/m)?.[1]?.trim() === 'polyrepo-member') {
        const workspaceRoot = text.match(/^\s*workspace_root:\s*(.+)$/m)?.[1]?.trim();
        if (workspaceRoot) {
          return workspaceRoot.startsWith('~/') ? join(homedir(), workspaceRoot.slice(2)) : workspaceRoot;
        }
      }
    } catch { /* fall through to git detection */ }
  }
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  } catch {
    return cwd;
  }
}

if (!command || command === 'help') {
  console.log('Usage: agentsmyth <command>');
  console.log('');
  console.log('Commands:');
  console.log('  init     Set up the agentsmyth workflow in the current repository');
  console.log('  prepare  Install/refresh the global lifecycle definitions (~/.agentsmyth/)');
  console.log('  check    Run the lifecycle phase gate validator');
  console.log('  doctor   Diagnose agentsmyth installation (not yet implemented)');
  process.exit(0);
}

// ─── check ─────────────────────────────────────────────────────────────────
// Resolves the check-lifecycle validator via the two-root resolver in lib.mjs,
// forwarding all args and propagating the exit code. Falls back to npx if the
// binary is not on PATH (common when installed via npm without global linking).

if (command === 'check') {
  // Resolve the existing repo root first — git top-level for single-repo/monorepo,
  // workspace_root for polyrepo-member — so a subdirectory invocation finds the real
  // workflow/config/, rather than headless-bootstrapping a duplicate one in the wrong place.
  const checkRoot = resolveExistingRepoRoot();

  // Debug hook (for automated root-resolution testing only) — prints the resolved root and exits
  // before headless bootstrap or the validator invocation runs, which would otherwise write
  // files into a scratch test directory. Never fires in normal operation.
  if (process.env.AGENTSMYTH_DEBUG_ROOT) {
    console.log(checkRoot);
    process.exit(0);
  }

  // Headless bootstrap: if workflow/config/repo-profile.yaml is absent, write stub configs
  // and a pending-setup.yaml listing what the agent needs to fill in.
  const profilePath = join(checkRoot, 'workflow', 'config', 'repo-profile.yaml');
  if (!existsSync(profilePath)) {
    const branch = headlessBootstrap(checkRoot, pkgRoot);
    console.log('');
    console.log('agentsmyth: workflow/config/ was absent — bootstrapped stub configs.');
    if (branch !== '<USER-TODO>') console.log(`  inferred default_branch: ${branch}`);
    console.log('  remaining gaps → workflow/config/pending-setup.yaml');
    console.log('');
    console.log('Run the agentsmyth setup skill to fill in the details, then re-run check.');
    console.log('');
    process.exit(0);
  }

  // Version-skew check (R6): warn if agentsmyth_version in repo-profile doesn't match the CLI.
  const currentPkgVersion = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')).version;
  try {
    const profileContent = readFileSync(profilePath, 'utf8');
    const versionMatch = profileContent.match(/^agentsmyth_version:\s*(\S+)/m);
    const profileVersion = versionMatch ? versionMatch[1] : null;
    if (profileVersion && profileVersion !== currentPkgVersion) {
      console.warn(`agentsmyth: version skew detected — repo-profile.yaml was written by v${profileVersion}, CLI is v${currentPkgVersion}`);
      console.warn('  Run "agentsmyth prepare" to update the global definitions and re-stamp repo-profile.yaml.');
      console.warn('');
    }
  } catch { /* non-fatal */ }

  // Resolve the validator path via the installed package's lib.mjs resolver
  const validatorsDir = join(pkgRoot, 'src', 'workflow', 'validators');
  const validatorPath = join(validatorsDir, 'check-lifecycle.mjs');

  // If running from a global install, the validator lives at pkgRoot; fall back
  // to the local workflow/validators/ if check-lifecycle.mjs was placed there.
  const localValidator = join(checkRoot, 'workflow', 'validators', 'check-lifecycle.mjs');
  const resolvedValidator = existsSync(validatorPath) ? validatorPath : localValidator;

  const args = process.argv.slice(3);
  try {
    execFileSync(process.execPath, [resolvedValidator, ...args], { stdio: 'inherit', cwd: checkRoot });
  } catch (e) {
    process.exit(e.status ?? 1);
  }
  process.exit(0);
}

// ─── prepare ───────────────────────────────────────────────────────────────
// Global-only install: installs/refreshes ~/.agentsmyth/workflow/ and the 5 adapters' global
// gate files. Writes zero repo-level files — that split (definitions global, config+artifacts
// repo-local) is what distinguishes `prepare` from `init`. See runPrepare() below.

if (command === 'prepare') {
  runPrepare(pkgRoot);
  process.exit(0);
}

// ─── doctor ────────────────────────────────────────────────────────────────

if (command === 'doctor') {
  console.log('agentsmyth doctor: not yet implemented');
  process.exit(0);
}

if (command !== 'init') {
  console.error(`Unknown command: ${command}`);
  console.error('Run "agentsmyth help" for usage.');
  process.exit(1);
}

// ─── shared helpers ────────────────────────────────────────────────────────

// Writes stub config files + pending-setup.yaml when workflow/config/ is absent.
// Infers what it can (default branch); marks the rest <USER-TODO> in pending-setup.yaml.
// Never overwrites existing files. Returns the inferred default branch string.
function headlessBootstrap(repoDir, pkgRootDir) {
  // Link to a global definitions install, same treatment as bare `init`: auto-run
  // `prepare` when missing, surface any failure clearly, and exit before touching any repo
  // file — no partial stub-config state on a prepare failure.
  const globalWorkflowDir = join(homedir(), '.agentsmyth', 'workflow');
  if (!existsSync(globalWorkflowDir)) {
    try {
      runPrepare(pkgRootDir);
    } catch (err) {
      console.error('');
      console.error('agentsmyth: could not install the global lifecycle definitions needed to bootstrap this repo.');
      console.error(`  ${err.message}`);
      console.error('  Fix the issue above and re-run "agentsmyth check" (or run "agentsmyth prepare" directly to see the full error).');
      process.exit(1);
    }
  }

  const configDir = join(repoDir, 'workflow', 'config');
  mkdirSync(configDir, { recursive: true });

  let defaultBranch = '<USER-TODO>';
  try {
    const ref = execFileSync('git', ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'], {
      cwd: repoDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    defaultBranch = ref.replace(/^origin\//, '') || defaultBranch;
  } catch {
    try {
      const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
        cwd: repoDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
      if (branch && branch !== 'HEAD') defaultBranch = branch;
    } catch { /* leave as USER-TODO */ }
  }

  const pkgVersion = JSON.parse(readFileSync(join(pkgRootDir, 'package.json'), 'utf8')).version;
  const templateDir = join(pkgRootDir, 'src', 'assets', 'workflow', 'config');
  for (const name of ['domain.yaml', 'release.yaml', 'repo-profile.yaml', 'source-of-truth.yaml', 'verification.yaml']) {
    const dest = join(configDir, name);
    if (existsSync(dest)) continue;
    let content = readFileSync(join(templateDir, name), 'utf8');
    if (name === 'repo-profile.yaml') {
      content = content.replace('default_branch: <PLACEHOLDER>', `default_branch: ${defaultBranch}`);
      // Stamp the package version so `agentsmyth check` can detect skew
      content = `agentsmyth_version: ${pkgVersion}\n` + content;
    }
    writeFileSync(dest, content);
  }

  // Write definitions_root into the stub repo-profile.yaml — reuses the same
  // insertion logic `init` and `prepare`-linked repos already rely on, rather than
  // duplicating the repository:/learnings_sessions_root: anchor-matching here.
  writeDefinitionsRoot(repoDir, globalWorkflowDir, pkgVersion);

  const pendingPath = join(configDir, 'pending-setup.yaml');
  if (!existsSync(pendingPath)) {
    const branchItem = defaultBranch === '<USER-TODO>' ? [
      `  - id: PS-4`,
      `    config: repo-profile.yaml`,
      `    field: "repository.default_branch"`,
      `    question: "What is the default branch name for this repo (e.g. main, master)?"`,
      `    hint: "Run: git symbolic-ref refs/remotes/origin/HEAD"`,
      `    status: open`,
    ].join('\n') : null;
    const items = [
      [`  - id: PS-1`, `    config: domain.yaml`, `    field: "domain.name"`, `    question: "What is the name of the domain or product this repo serves?"`, `    hint: "Check README.md or package.json description"`, `    status: open`].join('\n'),
      [`  - id: PS-2`, `    config: domain.yaml`, `    field: "domain.summary"`, `    question: "Describe the domain in one sentence for lifecycle artifacts."`, `    hint: "Check README.md"`, `    status: open`].join('\n'),
      [`  - id: PS-3`, `    config: verification.yaml`, `    field: "commands[0].run"`, `    question: "What command confirms the repo is healthy (build, test, lint)?"`, `    hint: "Check Makefile, package.json scripts, or CI config"`, `    status: open`].join('\n'),
      ...(branchItem ? [branchItem] : []),
    ];
    writeFileSync(pendingPath,
      `version: 1\nkind: pending-setup\n\n` +
      `# Written by agentsmyth headless bootstrap.\n` +
      `# Run the agentsmyth setup skill to resolve these items.\n` +
      `items:\n${items.join('\n')}\n`
    );
  }

  return defaultBranch;
}

function copyRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    const srcPath = join(src, name);
    const destPath = join(dest, name);
    if (statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// Expands a workflow-bundle.md (FILE-marker format) into individual files under destDir.
function expandBundle(bundlePath, destDir) {
  const content = readFileSync(bundlePath, 'utf8');
  const fileRe = /<!-- FILE: ([^>]+) -->\n([\s\S]*?)<!-- END FILE -->/g;
  let match;
  while ((match = fileRe.exec(content)) !== null) {
    const [, relPath, fileContent] = match;
    const destPath = join(destDir, relPath);
    mkdirSync(dirname(destPath), { recursive: true });
    writeFileSync(destPath, fileContent);
  }
}

// Installs or updates a delimited gate section in a target file.
// If the markers are found, replaces the content between them.
// If not found, appends the full gateContent (which includes markers).
function installGateSection(filePath, gateContent, beginMarker, endMarker) {
  mkdirSync(dirname(filePath), { recursive: true });
  let existing = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
  const begin = existing.indexOf(beginMarker);
  const end = existing.indexOf(endMarker);
  if (begin !== -1 && end !== -1 && end > begin) {
    writeFileSync(filePath, existing.slice(0, begin) + gateContent + existing.slice(end + endMarker.length));
  } else {
    const sep = existing.length > 0 && !existing.endsWith('\n') ? '\n' : '';
    writeFileSync(filePath, existing + sep + '\n' + gateContent + '\n');
  }
}

// Adds or updates definitions_root (and agentsmyth_version) in workflow/config/repo-profile.yaml.
function writeDefinitionsRoot(repoDir, defsRootValue, pkgVersion) {
  const profilePath = join(repoDir, 'workflow', 'config', 'repo-profile.yaml');
  mkdirSync(dirname(profilePath), { recursive: true });

  if (!existsSync(profilePath)) {
    writeFileSync(profilePath,
      `# Created by agentsmyth init (linked to a global install)\n` +
      `# Run the agentsmyth setup skill to fill remaining fields.\n` +
      `agentsmyth_version: ${pkgVersion}\nversion: 1\nkind: repo-profile\n\nrepository:\n  definitions_root: ${defsRootValue}\n`
    );
    return;
  }

  let content = readFileSync(profilePath, 'utf8');
  // Update or add agentsmyth_version stamp
  if (/^agentsmyth_version:/m.test(content)) {
    content = content.replace(/^agentsmyth_version:.*$/m, `agentsmyth_version: ${pkgVersion}`);
  } else {
    content = `agentsmyth_version: ${pkgVersion}\n` + content;
  }
  // Update or add definitions_root
  if (/^\s*definitions_root:/m.test(content)) {
    content = content.replace(/^(\s*)definitions_root:.*$/m, `$1definitions_root: ${defsRootValue}`);
  } else if (/^\s*learnings_sessions_root:/m.test(content)) {
    content = content.replace(/([ \t]*learnings_sessions_root:[^\n]*\n)/, `$1  definitions_root: ${defsRootValue}\n`);
  } else if (/^repository:/m.test(content)) {
    content = content.replace(/^(repository:\n)/, `$1  definitions_root: ${defsRootValue}\n`);
  } else {
    content += `\n  definitions_root: ${defsRootValue}\n`;
  }
  writeFileSync(profilePath, content);
}

// Installs/refreshes the global lifecycle definitions at ~/.agentsmyth/workflow/ and the 5
// adapters' global gate files. Writes zero repo-level files — callers that need a repo linked
// to the resulting global tree must independently compute the global workflow dir and call
// writeDefinitionsRoot() themselves afterward (see bare `init` and headlessBootstrap(), which
// both do this) — they need that same computation whether or not this function actually ran
// (e.g. when the global install already existed), so there is no shared value worth returning.
// Throws on failure (e.g. an unwritable home directory) so callers can surface the error
// instead of silently continuing.
function runPrepare(pkgRootDir) {
  const globalDir = join(homedir(), '.agentsmyth');
  const pkg = JSON.parse(readFileSync(join(pkgRootDir, 'package.json'), 'utf8'));
  const version = pkg.version;

  console.log(`agentsmyth prepare (v${version})`);
  console.log(`Installing global definitions to ${globalDir} ...`);

  // Expand workflow bundle to ~/.agentsmyth/workflow/
  expandBundle(join(pkgRootDir, 'dist', 'workflow-bundle.md'), globalDir);
  // Copy validators
  copyRecursive(join(pkgRootDir, 'validators'), join(globalDir, 'validators'));
  console.log('  ✓ definitions installed');

  // Install global gates
  const gatesInstalled = [];
  const gatesMissed = [];

  // Claude Code: ~/.claude/CLAUDE.md
  const claudeGate = readFileSync(join(pkgRootDir, 'src', 'adapters', 'claude', 'global-gate.md'), 'utf8').trim();
  installGateSection(
    join(homedir(), '.claude', 'CLAUDE.md'),
    claudeGate + '\n',
    '<!-- agentsmyth global gate BEGIN -->',
    '<!-- agentsmyth global gate END -->'
  );
  gatesInstalled.push('Claude Code (~/.claude/CLAUDE.md)');

  // Codex: ~/.codex/AGENTS.md
  const codexGate = readFileSync(join(pkgRootDir, 'src', 'adapters', 'codex', 'global-gate.md'), 'utf8').trim();
  installGateSection(
    join(homedir(), '.codex', 'AGENTS.md'),
    codexGate + '\n',
    '# agentsmyth global gate BEGIN',
    '# agentsmyth global gate END'
  );
  gatesInstalled.push('Codex (~/.codex/AGENTS.md)');

  // Windsurf: ~/.codeium/windsurf/memories/global_rules.md
  const windsurfGate = readFileSync(join(pkgRootDir, 'src', 'adapters', 'windsurf', 'global-gate.md'), 'utf8').trim();
  installGateSection(
    join(homedir(), '.codeium', 'windsurf', 'memories', 'global_rules.md'),
    windsurfGate + '\n',
    '# agentsmyth global gate BEGIN',
    '# agentsmyth global gate END'
  );
  gatesInstalled.push('Windsurf (~/.codeium/windsurf/memories/global_rules.md)');

  // Copilot (macOS + VS Code only)
  const copilotPath = join(homedir(), 'Library', 'Application Support', 'Code', 'User', 'prompts', 'agentsmyth.instructions.md');
  if (process.platform === 'darwin') {
    const copilotGate = readFileSync(join(pkgRootDir, 'src', 'adapters', 'copilot', 'global-gate.md'), 'utf8').trim();
    installGateSection(
      copilotPath,
      copilotGate + '\n',
      '<!-- agentsmyth global gate BEGIN -->',
      '<!-- agentsmyth global gate END -->'
    );
    gatesInstalled.push('Copilot (~/Library/.../Code/User/prompts/agentsmyth.instructions.md)');
  } else {
    gatesMissed.push('Copilot (macOS + VS Code only — not installed on this platform)');
  }

  // Cursor: no global file — print paste-text
  const cursorPasteText = [
    '',
    'Cursor (no global file — paste this into Settings → Rules):',
    '──────────────────────────────────────────────────────────',
    'When working in a repository with a workflow/ directory:',
    'Load ~/.agentsmyth/workflow/router.md + agent-behavior.yaml before any task.',
    'Per-repo config in workflow/config/. Run `agentsmyth check` to bootstrap if absent.',
    '──────────────────────────────────────────────────────────',
  ].join('\n');

  console.log('');
  console.log('Global gates installed:');
  for (const g of gatesInstalled) console.log(`  ✓ ${g}`);
  for (const g of gatesMissed) console.log(`  - ${g}`);
  console.log(cursorPasteText);
  console.log('');
  console.log('agentsmyth prepare complete.');
  console.log('');
  console.log('Next: run "agentsmyth init" in any repository — it will link to');
  console.log('this global install instead of copying the definitions locally.');
  console.log('');
}

// The definitions files an older bare `init` used to copy locally, before `init` started
// linking to a global install by default. Present as a group at the workflow root only in a
// repo that ran `init` under the old behavior — never partially, since expandBundle() always
// writes all of them together.
const STALE_DEFINITION_NAMES = ['skills', 'router.md', 'lifecycle.md', 'rules.md', 'schemas', 'validators'];

// Prompts for explicit confirmation before deleting the given paths. Fails closed (no hang,
// no silent skip) when stdin is not an interactive TTY — e.g. CI — by surfacing the pending
// state as a blocking error instead of waiting for input that will never arrive.
async function confirmDeletion(paths) {
  if (!process.stdin.isTTY) {
    console.error('agentsmyth: non-interactive session — cannot prompt to confirm deletion of:');
    for (const p of paths) console.error(`  - ${p}`);
    console.error('Re-run "agentsmyth init" in an interactive terminal, or remove these paths manually first.');
    process.exit(1);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question('Delete these local files now? [y/N] ');
    return /^y(es)?$/i.test(answer.trim());
  } finally {
    rl.close();
  }
}

// Migration: audits a repo's workflow/ for a pre-existing local definitions
// tree, prompts with the exact paths, and deletes only on explicit confirmation. Never
// silent in either direction — declining still leaves the paths in place and logged, never
// hidden. Runs before the caller writes definitions_root, but does not block linking either
// way (declining is not a reason to refuse the link).
async function auditStaleDefinitions(repoDir) {
  const stalePaths = STALE_DEFINITION_NAMES
    .map((name) => join(repoDir, 'workflow', name))
    .filter((p) => existsSync(p));

  if (stalePaths.length === 0) return;

  console.log('');
  console.log('agentsmyth: found a local copy of the lifecycle definitions from before this repo linked to a global install:');
  for (const p of stalePaths) console.log(`  - ${p}`);
  console.log('These are no longer read once linked (skills/schemas resolve from the global install instead).');

  const confirmed = await confirmDeletion(stalePaths);
  if (confirmed) {
    for (const p of stalePaths) rmSync(p, { recursive: true, force: true });
    console.log('  ✓ removed the stale local definitions listed above.');
  } else {
    console.log('  Leaving them in place — the repo will still link to the global install.');
  }
}

// ── init (per-repo) ───────────────────────────────────────────────────────

// `--system` was removed: it never shipped in a published release, so no deprecated
// alias is kept. Reject explicitly rather than silently falling through to a full interview —
// a stale `--system` invocation should not look like it worked.
if (process.argv.slice(3).includes('--system')) {
  console.error('agentsmyth: "init --system" was removed. Use "agentsmyth prepare" for a global-only install.');
  process.exit(1);
}

const targetDir = join(cwd, '.agentsmyth');

if (existsSync(targetDir)) {
  console.error('Error: .agentsmyth/ already exists in this directory.');
  console.error('If setup was interrupted, remove it with: rm -rf .agentsmyth');
  console.error('If setup is complete, .agentsmyth/ should have been removed by the agent.');
  process.exit(1);
}

// Link to a global definitions install: auto-run `prepare` when no global install
// exists yet, then write `definitions_root` into this repo's repo-profile.yaml before the
// setup skill's interview starts. No opt-out, no fallback to a local copy — any failure here
// is surfaced clearly and stops `init`, rather than silently continuing into a half-linked
// repo (see runPrepare()'s own comment for why it throws instead of exiting internally).
const globalWorkflowDir = join(homedir(), '.agentsmyth', 'workflow');
if (!existsSync(globalWorkflowDir)) {
  try {
    runPrepare(pkgRoot);
  } catch (err) {
    console.error('');
    console.error('agentsmyth: could not install the global lifecycle definitions needed by "init".');
    console.error(`  ${err.message}`);
    console.error('  Fix the issue above and re-run "agentsmyth init" (or run "agentsmyth prepare" directly to see the full error).');
    process.exit(1);
  }
}
// Migration: audit for a pre-existing local definitions tree before
// committing the link — see auditStaleDefinitions()'s own comment for why this never blocks
// linking either way.
await auditStaleDefinitions(cwd);

const initPkgVersion = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')).version;
writeDefinitionsRoot(cwd, globalWorkflowDir, initPkgVersion);

// Copy bundles
mkdirSync(targetDir, { recursive: true });
copyFileSync(join(pkgRoot, 'dist', 'setup-bundle.md'), join(targetDir, 'setup-bundle.md'));
copyFileSync(join(pkgRoot, 'dist', 'workflow-bundle.md'), join(targetDir, 'workflow-bundle.md'));

// Copy validators needed during setup
copyRecursive(join(pkgRoot, 'validators'), join(targetDir, 'validators'));

// Copy static assets (configs, adapters, AGENTS.md)
copyRecursive(join(pkgRoot, 'src', 'assets'), join(targetDir, 'assets'));

// Add .agentsmyth to .gitignore
const gitignorePath = join(cwd, '.gitignore');
const gitignoreEntry = '.agentsmyth\n';
if (existsSync(gitignorePath)) {
  const current = readFileSync(gitignorePath, 'utf8');
  if (!current.includes('.agentsmyth')) {
    writeFileSync(gitignorePath, current.endsWith('\n') ? current + gitignoreEntry : current + '\n' + gitignoreEntry);
  }
} else {
  writeFileSync(gitignorePath, gitignoreEntry);
}

console.log('');
console.log('agentsmyth init complete.');
console.log('');
console.log('Next step: open your AI agent and say:');
console.log('  "run the agentsmyth setup"');
console.log('');
console.log('The agent will inspect this repo, interview you, fill the');
console.log('workflow configs, and remove .agentsmyth/ when done.');
console.log('');
