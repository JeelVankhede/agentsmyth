#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync, rmSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { confirmPrompt } from './prompts.mjs';

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
      [`  - id: PS-3`, `    config: verification.yaml`, `    field: "commands[0].command"`, `    question: "What command confirms the repo is healthy (build, test, lint)?"`, `    hint: "Check Makefile, package.json scripts, or CI config"`, `    status: open`].join('\n'),
      ...(branchItem ? [branchItem] : []),
    ];
    writeFileSync(pendingPath,
      `version: 1\nkind: pending-setup\n\n` +
      `# Written by agentsmyth headless bootstrap.\n` +
      `# Run the agentsmyth setup skill to resolve these items.\n` +
      `items:\n${items.join('\n')}\n`
    );
  }

  // Scaffold workflow/artifacts/ (7 empty phase dirs) and workflow/learnings/ (README,
  // curated.md, empty sessions/) — mechanical, idempotent (mkdirSync recursive is a no-op if
  // present; the two template files use the same skip-if-exists rule as the config stubs
  // above). Mirrors what the agent's setup skill Phase 5b previously created by hand.
  for (const name of ['briefs', 'plans', 'tasks', 'reviews', 'verify', 'ship', 'reflect']) {
    mkdirSync(join(repoDir, 'workflow', 'artifacts', name), { recursive: true });
  }
  const learningsDir = join(repoDir, 'workflow', 'learnings');
  mkdirSync(join(learningsDir, 'sessions'), { recursive: true });
  const learningsTemplateDir = join(pkgRootDir, 'src', 'assets', 'workflow', 'learnings');
  for (const name of ['README.md', 'curated.md']) {
    const dest = join(learningsDir, name);
    if (existsSync(dest)) continue;
    copyFileSync(join(learningsTemplateDir, name), dest);
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

// Adapter token substitution — a deterministic implementation of the same 8-token map and
// TODO-fallback rule setup/references/token-map.md and SKILL.md Step 5a.1 already document as
// agent-executed prose. Used only by placeDeterministicAdapters() below, for the two tools no
// global gate can ever cover (Cursor, non-macOS Copilot) — everything else stays agent-driven.
const ADAPTER_TODO_FALLBACK = '<!-- TODO: see pending-setup.yaml -->';

// Minimal indentation-based YAML list reader — not a general parser, sufficient for this
// repo's own hand-authored config shape (2-space nesting, list items starting with "- ", or
// inline flow-style "key: [a, b]"/"key: []"). Returns an array of strings (scalar items) or
// objects (single-level "key: value" mapping items, e.g. paths.protected's {pattern, reason}
// entries).
function extractYamlList(content, dottedPath) {
  const keys = dottedPath.split('.');
  const lines = content.split('\n');
  let searchFrom = 0;
  let indent = 0;
  let terminalTrailing = '';
  for (let k = 0; k < keys.length; k++) {
    const re = new RegExp(`^${' '.repeat(indent)}${keys[k]}:[ \\t]*(.*)$`);
    let found = -1;
    let trailing = '';
    for (let i = searchFrom; i < lines.length; i++) {
      const m = lines[i].match(re);
      if (m) { found = i; trailing = m[1].trim(); break; }
    }
    if (found === -1) return [];
    searchFrom = found + 1;
    indent += 2;
    if (k === keys.length - 1) terminalTrailing = trailing;
  }
  // Inline flow-style value on the same line as the terminal key (e.g. "commands: []" or
  // "commands: [a, b]") — parse directly instead of walking subsequent lines as a block list.
  if (terminalTrailing) {
    const flow = terminalTrailing.match(/^\[(.*)\]$/);
    if (!flow) return [];
    const inner = flow[1].trim();
    return inner === '' ? [] : inner.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
  }
  const items = [];
  let current = null;
  for (let i = searchFrom; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    const lineIndent = line.match(/^ */)[0].length;
    if (lineIndent < indent) break;
    if (lineIndent === indent && line.trim().startsWith('- ')) {
      if (current !== null) items.push(current);
      const rest = line.trim().slice(2);
      const kv = rest.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
      current = kv ? { [kv[1]]: kv[2].replace(/^['"]|['"]$/g, '') } : rest.replace(/^['"]|['"]$/g, '');
    } else if (current !== null && typeof current === 'object' && lineIndent === indent + 2) {
      const kv = line.trim().match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
      if (kv) current[kv[1]] = kv[2].replace(/^['"]|['"]$/g, '');
    }
  }
  if (current !== null) items.push(current);
  return items;
}

// Builds the 8-token adapter substitution map from whatever config values already exist in
// repoDir at the time this runs (see token-map.md for the authoritative field list). Only
// includes a key when a real, non-placeholder value is resolvable; renderAdapterTemplate()
// applies the standard TODO fallback for every token left absent here.
function buildAdapterTokens(repoDir) {
  const configDir = join(repoDir, 'workflow', 'config');
  const tokens = {};

  try {
    const profile = readFileSync(join(configDir, 'repo-profile.yaml'), 'utf8');
    const branchMatch = profile.match(/^\s*default_branch:\s*(.*)$/m);
    const branch = branchMatch?.[1]?.trim();
    if (branch && branch !== '<USER-TODO>' && branch !== '<PLACEHOLDER>') {
      tokens.DEFAULT_BRANCH = branch;
    }
    const policyMatch = profile.match(/^\s*require_non_default_branch_for_changes:\s*(true|false)\s*$/m);
    if (policyMatch) {
      tokens.BRANCH_POLICY = policyMatch[1] === 'true'
        ? 'All changes via non-default branch required.'
        : `Direct commits to \`${tokens.DEFAULT_BRANCH ?? ADAPTER_TODO_FALLBACK}\` permitted.`;
    }
    const protectedPaths = extractYamlList(profile, 'paths.protected');
    tokens.PROTECTED_PATHS = protectedPaths.length === 0
      ? '- (none defined)'
      : protectedPaths.map((p) => typeof p === 'string' ? `- ${p}` : `- \`${p.pattern}\` — ${p.reason}`).join('\n');
  } catch { /* repo-profile.yaml unreadable — leave these tokens for the fallback */ }

  try {
    const verification = readFileSync(join(configDir, 'verification.yaml'), 'utf8');
    const commands = extractYamlList(verification, 'commands');
    tokens.VERIFICATION_CMDS = commands.length === 0
      ? '- (none defined)'
      : commands.map((c) => typeof c === 'string' ? `- ${c}` : `- \`${c.command}\``).join('\n');
  } catch { /* verification.yaml unreadable — leave this token for the fallback */ }

  try {
    const domain = readFileSync(join(configDir, 'domain.yaml'), 'utf8');
    const constraints = [...extractYamlList(domain, 'constraints.product'), ...extractYamlList(domain, 'constraints.safety')];
    tokens.CONSTRAINTS = constraints.length === 0
      ? '- (none defined)'
      : constraints.map((c) => `- ${c}`).join('\n');
    // REPO_NAME, REPO_PURPOSE, DOMAIN_NAME source from domain.name/domain.summary, which stay
    // literal <PLACEHOLDER> until the agent's resolution pass — intentionally left unset here
    // so they fall back to ADAPTER_TODO_FALLBACK, per the user's "final call is from interview
    // setup only" instruction for anything requiring judgment.
  } catch { /* domain.yaml unreadable — leave these tokens for the fallback */ }

  return tokens;
}

// Renders a {{TOKEN}}-templated adapter source against a token map, substituting
// ADAPTER_TODO_FALLBACK for any token with no resolvable value.
function renderAdapterTemplate(templateContent, tokens) {
  return templateContent.replace(/\{\{([A-Z_]+)\}\}/g, (_match, name) => tokens[name] ?? ADAPTER_TODO_FALLBACK);
}

// Places the adapter file for exactly the two cases no global gate mechanism can ever cover,
// regardless of which AI agent tool the user actually uses in this repo: Cursor (no global
// config mechanism exists for this tool at all) and Copilot on a non-macOS platform (the
// global install only writes Copilot's gate on macOS — see runPrepare()). Deterministic,
// platform-detected, never an interview question. Strictly additive: never overwrites an
// existing adapter file at the target path, skipping entirely if one is already there — see
// R5 in workflow/artifacts/briefs/wp-r9b-scaffold-init-resolution-v1.md for why this is
// narrower than SKILL.md Step 5a.1's own append-on-collision rule for the same paths.
function placeDeterministicAdapters(repoDir, pkgRootDir) {
  const tokens = buildAdapterTokens(repoDir);

  const cursorDest = join(repoDir, '.cursor', 'rules', 'agentsmyth.mdc');
  if (!existsSync(cursorDest)) {
    const cursorSrc = readFileSync(join(pkgRootDir, 'src', 'assets', 'adapters', 'cursor', 'rules', 'index.mdc'), 'utf8');
    mkdirSync(dirname(cursorDest), { recursive: true });
    writeFileSync(cursorDest, renderAdapterTemplate(cursorSrc, tokens));
  }

  if (platform() !== 'darwin') {
    const copilotDest = join(repoDir, '.github', 'copilot-instructions.md');
    if (!existsSync(copilotDest)) {
      const copilotSrc = readFileSync(join(pkgRootDir, 'src', 'assets', 'adapters', 'copilot', 'copilot-instructions.md'), 'utf8');
      mkdirSync(dirname(copilotDest), { recursive: true });
      writeFileSync(copilotDest, renderAdapterTemplate(copilotSrc, tokens));
    }
  }
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
  const claudeGate = readFileSync(join(pkgRootDir, 'src', 'assets', 'adapters', 'claude', 'global-gate.md'), 'utf8').trim();
  installGateSection(
    join(homedir(), '.claude', 'CLAUDE.md'),
    claudeGate + '\n',
    '<!-- agentsmyth global gate BEGIN -->',
    '<!-- agentsmyth global gate END -->'
  );
  gatesInstalled.push('Claude Code (~/.claude/CLAUDE.md)');

  // Codex: ~/.codex/AGENTS.md
  const codexGate = readFileSync(join(pkgRootDir, 'src', 'assets', 'adapters', 'codex', 'global-gate.md'), 'utf8').trim();
  installGateSection(
    join(homedir(), '.codex', 'AGENTS.md'),
    codexGate + '\n',
    '# agentsmyth global gate BEGIN',
    '# agentsmyth global gate END'
  );
  gatesInstalled.push('Codex (~/.codex/AGENTS.md)');

  // Windsurf: ~/.codeium/windsurf/memories/global_rules.md
  const windsurfGate = readFileSync(join(pkgRootDir, 'src', 'assets', 'adapters', 'windsurf', 'global-gate.md'), 'utf8').trim();
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
    const copilotGate = readFileSync(join(pkgRootDir, 'src', 'assets', 'adapters', 'copilot', 'global-gate.md'), 'utf8').trim();
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

  // Cursor: no global gate file — print paste-text (unrelated to the invocation command below,
  // which uses Cursor's own separate global custom-commands mechanism).
  const cursorPasteText = [
    '',
    'Cursor (no global file — paste this into Settings → Rules):',
    '──────────────────────────────────────────────────────────',
    'When working in a repository with a workflow/ directory:',
    'Load ~/.agentsmyth/workflow/router.md + agent-behavior.yaml before any task.',
    'Per-repo config in workflow/config/. Run `agentsmyth check` to bootstrap if absent.',
    '──────────────────────────────────────────────────────────',
  ].join('\n');

  // Global invocation command: one per adapter, in that tool's own real global-command
  // mechanism (confirmed via research, not assumed identical across tools — each format/location
  // is genuinely different). Gives the user an explicit "/agentsmyth" (or Codex's own
  // "/prompts:agentsmyth") action to start/resume the lifecycle in the current repo, alongside
  // the passive gates above rather than replacing them — the gates can't fire in a repo that
  // hasn't been `init`'d yet, this can. Strictly additive, same rule as
  // `placeDeterministicAdapters()`'s per-repo files: never overwrite a file the user (or a prior
  // run) already placed at the target path.
  const commandsInstalled = [];

  function writeInvocationCommand(label, srcRelPath, destPath) {
    if (existsSync(destPath)) return; // never overwrite — matches placeDeterministicAdapters()
    const content = readFileSync(join(pkgRootDir, 'src', 'assets', 'adapters', ...srcRelPath), 'utf8');
    mkdirSync(dirname(destPath), { recursive: true });
    writeFileSync(destPath, content);
    commandsInstalled.push(label);
  }

  writeInvocationCommand(
    'Claude Code (/agentsmyth)',
    ['claude', 'invocation-skill.md'],
    join(homedir(), '.claude', 'skills', 'agentsmyth', 'SKILL.md')
  );
  writeInvocationCommand(
    'Codex (/prompts:agentsmyth)',
    ['codex', 'invocation-prompt.md'],
    join(homedir(), '.codex', 'prompts', 'agentsmyth.md')
  );
  writeInvocationCommand(
    'Cursor (/agentsmyth)',
    ['cursor', 'invocation-command.md'],
    join(homedir(), '.cursor', 'commands', 'agentsmyth.md')
  );
  writeInvocationCommand(
    'Windsurf (/agentsmyth)',
    ['windsurf', 'invocation-workflow.md'],
    join(homedir(), '.codeium', 'windsurf', 'global_workflows', 'agentsmyth.md')
  );
  if (process.platform === 'darwin') {
    writeInvocationCommand(
      'Copilot (/agentsmyth, VS Code)',
      ['copilot', 'invocation-prompt.md'],
      join(homedir(), 'Library', 'Application Support', 'Code', 'User', 'prompts', 'agentsmyth.prompt.md')
    );
  }

  console.log('');
  console.log('Global gates installed:');
  for (const g of gatesInstalled) console.log(`  ✓ ${g}`);
  for (const g of gatesMissed) console.log(`  - ${g}`);
  console.log(cursorPasteText);
  console.log('');
  if (commandsInstalled.length > 0) {
    console.log('Global invocation commands installed:');
    for (const c of commandsInstalled) console.log(`  ✓ ${c}`);
    console.log('');
  }
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
  return confirmPrompt('Delete these local files now?');
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

// Mechanical scaffold: write config stubs, pending-setup.yaml, empty workflow/artifacts/ +
// workflow/learnings/, and inject definitions_root — the same headlessBootstrap() logic
// `check` already uses for a repo with no workflow/config/. headlessBootstrap() writes the
// full repo-profile.yaml template (with default_branch, branch_policy, paths.protected, etc.)
// before injecting definitions_root into it — deliberately NOT calling writeDefinitionsRoot()
// separately here first: doing so would pre-create a minimal repo-profile.yaml containing only
// definitions_root, which would then make headlessBootstrap()'s own per-file skip-if-exists
// check skip writing the full template entirely, silently dropping every other default field.
// headlessBootstrap()'s per-file skip-if-exists still means this never overwrites a config a
// prior agent session already filled in with real values.
headlessBootstrap(cwd, pkgRoot);

// Deterministic adapter placement (R5): Cursor unconditionally, Copilot only on a non-macOS
// platform — the two cases no global gate mechanism can ever reach. Runs after
// headlessBootstrap() so the config values it renders from (default branch, protected paths,
// etc.) already exist.
placeDeterministicAdapters(cwd, pkgRoot);

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
console.log('  workflow/config/*.yaml, pending-setup.yaml, workflow/artifacts/, and');
console.log('  workflow/learnings/ are already scaffolded.');
console.log('');
console.log('Next step: open your AI agent and say:');
console.log('  "run the agentsmyth setup"');
console.log('');
console.log('The agent will resolve the open items in pending-setup.yaml,');
console.log('fill in the remaining workflow configs, and remove .agentsmyth/ when done.');
console.log('');
