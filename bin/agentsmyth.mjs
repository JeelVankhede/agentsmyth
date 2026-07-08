#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cwd = process.cwd();
const command = process.argv[2];

if (!command || command === 'help') {
  console.log('Usage: agentsmyth <command>');
  console.log('');
  console.log('Commands:');
  console.log('  init     Set up the agentsmyth workflow in the current repository');
  console.log('  check    Run the lifecycle phase gate validator');
  console.log('  doctor   Diagnose agentsmyth installation (not yet implemented)');
  process.exit(0);
}

// ─── check ─────────────────────────────────────────────────────────────────
// Resolves the check-lifecycle validator via the two-root resolver in lib.mjs,
// forwarding all args and propagating the exit code. Falls back to npx if the
// binary is not on PATH (common when installed via npm without global linking).

if (command === 'check') {
  // Resolve the validator path via the installed package's lib.mjs resolver
  const validatorsDir = join(pkgRoot, 'src', 'workflow', 'validators');
  const validatorPath = join(validatorsDir, 'check-lifecycle.mjs');

  // If running from a global install, the validator lives at pkgRoot; fall back
  // to the local workflow/validators/ if check-lifecycle.mjs was placed there.
  const localValidator = join(cwd, 'workflow', 'validators', 'check-lifecycle.mjs');
  const resolvedValidator = existsSync(validatorPath) ? validatorPath : localValidator;

  const args = process.argv.slice(3);
  try {
    execFileSync(process.execPath, [resolvedValidator, ...args], { stdio: 'inherit', cwd });
  } catch (e) {
    process.exit(e.status ?? 1);
  }
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

// Adds or updates definitions_root in workflow/config/repo-profile.yaml.
function writeDefinitionsRoot(repoDir, defsRootValue) {
  const profilePath = join(repoDir, 'workflow', 'config', 'repo-profile.yaml');
  mkdirSync(dirname(profilePath), { recursive: true });

  if (!existsSync(profilePath)) {
    writeFileSync(profilePath,
      `# Created by agentsmyth init --system\n` +
      `# Run the agentsmyth setup skill to fill remaining fields.\n` +
      `version: 1\nkind: repo-profile\n\nrepository:\n  definitions_root: ${defsRootValue}\n`
    );
    return;
  }

  let content = readFileSync(profilePath, 'utf8');
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

// ─── init ──────────────────────────────────────────────────────────────────

const initArgs = process.argv.slice(3);
const isSystem = initArgs.includes('--system');

if (isSystem) {
  // ── init --system: install definitions globally ───────────────────────────

  const globalDir = join(homedir(), '.agentsmyth');
  const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'));
  const version = pkg.version;

  console.log(`agentsmyth init --system (v${version})`);
  console.log(`Installing global definitions to ${globalDir} ...`);

  // Expand workflow bundle to ~/.agentsmyth/workflow/
  expandBundle(join(pkgRoot, 'dist', 'workflow-bundle.md'), globalDir);
  // Copy validators
  copyRecursive(join(pkgRoot, 'validators'), join(globalDir, 'validators'));
  console.log('  ✓ definitions installed');

  // Install global gates
  const gatesInstalled = [];
  const gatesMissed = [];

  // Claude Code: ~/.claude/CLAUDE.md
  const claudeGate = readFileSync(join(pkgRoot, 'src', 'adapters', 'claude', 'global-gate.md'), 'utf8').trim();
  installGateSection(
    join(homedir(), '.claude', 'CLAUDE.md'),
    claudeGate + '\n',
    '<!-- agentsmyth global gate BEGIN -->',
    '<!-- agentsmyth global gate END -->'
  );
  gatesInstalled.push('Claude Code (~/.claude/CLAUDE.md)');

  // Codex: ~/.codex/AGENTS.md
  const codexGate = readFileSync(join(pkgRoot, 'src', 'adapters', 'codex', 'global-gate.md'), 'utf8').trim();
  installGateSection(
    join(homedir(), '.codex', 'AGENTS.md'),
    codexGate + '\n',
    '# agentsmyth global gate BEGIN',
    '# agentsmyth global gate END'
  );
  gatesInstalled.push('Codex (~/.codex/AGENTS.md)');

  // Windsurf: ~/.codeium/windsurf/memories/global_rules.md
  const windsurfGate = readFileSync(join(pkgRoot, 'src', 'adapters', 'windsurf', 'global-gate.md'), 'utf8').trim();
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
    const copilotGate = readFileSync(join(pkgRoot, 'src', 'adapters', 'copilot', 'global-gate.md'), 'utf8').trim();
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

  // Write definitions_root to this repo's repo-profile.yaml
  const defsRootValue = join(homedir(), '.agentsmyth', 'workflow');
  writeDefinitionsRoot(cwd, defsRootValue);
  console.log(`  ✓ definitions_root written to workflow/config/repo-profile.yaml`);

  console.log('');
  console.log('Global gates installed:');
  for (const g of gatesInstalled) console.log(`  ✓ ${g}`);
  for (const g of gatesMissed) console.log(`  - ${g}`);
  console.log(cursorPasteText);
  console.log('');
  console.log('agentsmyth init --system complete.');
  console.log('');
  console.log('Next: open your AI agent in any repository and it will');
  console.log('automatically use the global lifecycle definitions.');
  console.log('');
  process.exit(0);
}

// ── init (per-repo) ───────────────────────────────────────────────────────

const targetDir = join(cwd, '.agentsmyth');

if (existsSync(targetDir)) {
  console.error('Error: .agentsmyth/ already exists in this directory.');
  console.error('If setup was interrupted, remove it with: rm -rf .agentsmyth');
  console.error('If setup is complete, .agentsmyth/ should have been removed by the agent.');
  process.exit(1);
}

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
