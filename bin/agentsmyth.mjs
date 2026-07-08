#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'node:fs';
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

// ─── init ──────────────────────────────────────────────────────────────────

const targetDir = join(cwd, '.agentsmyth');

if (existsSync(targetDir)) {
  console.error('Error: .agentsmyth/ already exists in this directory.');
  console.error('If setup was interrupted, remove it with: rm -rf .agentsmyth');
  console.error('If setup is complete, .agentsmyth/ should have been removed by the agent.');
  process.exit(1);
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
