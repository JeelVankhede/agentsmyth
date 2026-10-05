#!/usr/bin/env node
// Regenerates the published proof that the lifecycle gate refuses a commit.
//
// WP-R24. The capture on the docs site and in the README is the one artefact in this repo that a
// reader cannot check by reading source — so it is generated, never hand-written, and this script is
// the only writer. Run it and the published blocks are replaced with the real output of a real
// refusal; run it twice and nothing changes.
//
//   node scripts/capture-gate-refusal.mjs          write the blocks
//   node scripts/capture-gate-refusal.mjs --check   verify the published blocks match a fresh capture
//
// Zero dependencies, Node builtins only (CLAUDE.md rule 4).
//
// The fixture is built by hand from src/assets/ rather than by running `agentsmyth init`. `init`
// auto-runs `prepare`, which re-expands ~/.agentsmyth/workflow/ — and this repo's repo-profile.yaml
// points `definitions_root` there, so running init here would swap the definitions every validator
// resolves against, from underneath whatever chain is in flight.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK_ONLY = process.argv.includes('--check');

const BEGIN = '<!-- agentsmyth:capture BEGIN -->';
const END = '<!-- agentsmyth:capture END -->';

// Deliberately NOT the `agentsmyth:<version>` marker grammar WP-R23 writes into AGENTS.md. That one is
// located by PATTERN so a later release can find and replace an earlier release's block; a capture
// wearing a version-stamped marker would be a candidate match for that search.

const DEMO_SLUG = 'add-session-handling';

function read(p) { return fs.readFileSync(p, 'utf8'); }
function write(p, s) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); }

function sandboxRoot() {
  // tuning.council.sandbox_root in this repo's own repo-profile.yaml. Read rather than assumed, so a
  // repo that moves its sandbox does not silently get a fixture in the old place.
  const profile = read(path.join(repoRoot, 'workflow/config/repo-profile.yaml'));
  const m = profile.match(/^\s*sandbox_root:\s*(\S+)\s*$/m);
  if (!m) throw new Error('capture: tuning.council.sandbox_root not found in workflow/config/repo-profile.yaml');
  const resolved = path.resolve(m[1].replace(/^~(?=$|\/)/, os.homedir()));

  // This value comes out of a config file and is handed to a recursive delete. A typo, a truncated
  // edit, or a `sandbox_root: ~` would otherwise aim rmSync at a real directory. Refuse anything that
  // is not a deep, clearly-sandbox path, and never sit on top of the repo or the home directory.
  const forbidden = [path.parse(resolved).root, os.homedir(), repoRoot];
  if (forbidden.includes(resolved) || resolved.split(path.sep).filter(Boolean).length < 3) {
    throw new Error(`capture: refusing to use "${resolved}" as a sandbox root — too shallow or a real directory`);
  }
  if (resolved === repoRoot || resolved.startsWith(repoRoot + path.sep)) {
    throw new Error('capture: sandbox_root resolves inside the repository — it must live outside every repo');
  }
  return resolved;
}

function git(cwd, args, opts = {}) {
  return spawnSync('git', args, { cwd, encoding: 'utf8', ...opts });
}

// Fixture setup must fail loudly. A silently-failed `git init` or `git add` produces a fixture that
// looks fine and a refusal that means something else — the worst outcome for an artefact whose entire
// value is that it is real.
function gitOrThrow(cwd, args) {
  const res = git(cwd, args);
  if (res.status !== 0) {
    throw new Error(`capture: git ${args.join(' ')} failed (status ${res.status}): ${(res.stderr || '').trim()}`);
  }
  return res;
}

function buildFixture(dir) {
  // Fully rebuilt every run: a fixture that accumulates state across runs cannot be idempotent, and
  // Phase 1 showed that a HALF-built consumer repo drowns the refusal under six setup failures that
  // belong to the fixture rather than to the product.
  fs.rmSync(dir, { recursive: true, force: true });
  for (const d of ['workflow/config', 'workflow/learnings/sessions', 'docs/knowledge-map', 'src', 'bin',
                   ...['briefs','plans','tasks','reviews','verify','ship','reflect'].map(x => `workflow/artifacts/${x}`)]) {
    fs.mkdirSync(path.join(dir, d), { recursive: true });
  }

  const assets = path.join(repoRoot, 'src/assets');
  for (const f of ['domain.yaml', 'release.yaml', 'repo-profile.yaml', 'source-of-truth.yaml', 'verification.yaml']) {
    fs.copyFileSync(path.join(assets, 'workflow/config', f), path.join(dir, 'workflow/config', f));
  }

  // Stamp the version and definitions root so the capture shows the code under change, and so the
  // version-skew banner cannot appear. An unstamped or mismatched profile prints six lines of warning
  // that have nothing to do with what the capture demonstrates.
  const version = JSON.parse(read(path.join(repoRoot, 'package.json'))).version;
  const profilePath = path.join(dir, 'workflow/config/repo-profile.yaml');
  let profile = `agentsmyth_version: ${version}\ndefinitions_root: ${path.join(repoRoot, 'src/workflow')}\n` + read(profilePath);
  profile = profile
    .replace('  default_branch: <PLACEHOLDER>', '  default_branch: main')
    .replace('  test_roots: ["<PLACEHOLDER>"]', '  test_roots: ["test"]')
    .replace('  docs_roots: ["<PLACEHOLDER>"]', '  docs_roots: ["docs"]')
    .replace('  source_roots: ["<PLACEHOLDER>"]', '  source_roots: ["src"]');
  write(profilePath, profile);

  const domainPath = path.join(dir, 'workflow/config/domain.yaml');
  write(domainPath, read(domainPath)
    .replace('  name: <PLACEHOLDER>', '  name: example-service')
    .replace('  summary: <PLACEHOLDER>', '  summary: A small example service, used to demonstrate the agentsmyth lifecycle gate.'));

  const sotPath = path.join(dir, 'workflow/config/source-of-truth.yaml');
  write(sotPath, read(sotPath)
    .replace('      type: "<PLACEHOLDER>"', '      type: "repo"')
    .replace('      location: "<PLACEHOLDER>"', '      location: "docs/"'));

  write(path.join(dir, 'docs/knowledge-map/repo-mental-map.md'),
    '# Repo mental map\n\nExample service. Source in `src/`, docs in `docs/`, lifecycle artifacts in `workflow/artifacts/`.\n');
  write(path.join(dir, 'workflow/learnings/README.md'), '# Learnings\n\nSession notes land in `sessions/`.\n');
  write(path.join(dir, 'workflow/learnings/curated.md'), '# Curated learnings\n\nnone yet\n');
  write(path.join(dir, 'AGENTS.md'),
    '# AGENTS.md\n\nThis repo uses the agentsmyth lifecycle. Load the router before making changes.\n');

  // The hook prefers ./bin/agentsmyth.mjs when the repo has one. Pointing the fixture at this repo's
  // CLI means the capture always shows the behaviour of the code being published alongside it, rather
  // than whatever version the developer happens to have installed globally.
  write(path.join(dir, 'bin/agentsmyth.mjs'),
    `#!/usr/bin/env node\n// Generated fixture shim — see scripts/capture-gate-refusal.mjs\nawait import(${JSON.stringify('file://' + path.join(repoRoot, 'bin/agentsmyth.mjs'))});\n`);

  fs.copyFileSync(path.join(assets, 'hooks/pre-commit'), path.join(dir, '.git-hook-source'));

  gitOrThrow(dir, ['init', '-q', '-b', 'main']);
  gitOrThrow(dir, ['config', 'user.email', 'demo@example.com']);
  gitOrThrow(dir, ['config', 'user.name', 'Demo']);
  fs.copyFileSync(path.join(dir, '.git-hook-source'), path.join(dir, '.git/hooks/pre-commit'));
  fs.chmodSync(path.join(dir, '.git/hooks/pre-commit'), 0o755);
  fs.rmSync(path.join(dir, '.git-hook-source'));

  // A plan that CLAIMS it is ready for Build while carrying no approval. This is the precise shape the
  // gate refuses: src/assets/hooks/pre-commit reads orchestration.status from the staged blob and only
  // runs the downstream check once the artifact says `ready-for-next-phase`, so an in-progress artifact
  // stays committable and this one does not.
  write(path.join(dir, `workflow/artifacts/plans/${DEMO_SLUG}-v1.md`), [
    '---', `slug: ${DEMO_SLUG}`, 'version: 1', 'artifact: plan', 'status: ready-for-next-phase',
    'created: 2026-01-01', 'updated: 2026-01-01', 'manifest_ids: [R1]', 'upstream:',
    `  - workflow/artifacts/briefs/${DEMO_SLUG}-v1.md`, 'orchestration:', '  phase: plan',
    '  status: ready-for-next-phase', '  next_phase: build', '  blockers: []',
    '  user_checkpoint: plan-review', '---', '', '# Add session handling - Plan', '', '## Summary', '',
    'Add session creation, expiry and refresh helpers.', '', '## Checkpoint Approval', '',
    '- Checkpoint: plan-review', '- Status: pending',
    "- User's own words (verbatim, this turn): not yet given.", '',
  ].join('\n'));

  gitOrThrow(dir, ['add', '-A']);
  // Commit everything EXCEPT the plan, so the refusal is about the plan alone and not about fixture
  // noise. The hook is bypassed for this setup commit deliberately — it is scaffolding, not the demo.
  gitOrThrow(dir, ['reset', '-q', '--', `workflow/artifacts/plans/${DEMO_SLUG}-v1.md`]);
  gitOrThrow(dir, ['commit', '-q', '--no-verify', '-m', 'chore: scaffold example service']);
  gitOrThrow(dir, ['add', '--', `workflow/artifacts/plans/${DEMO_SLUG}-v1.md`]);
}

function provoke(dir) {
  const commitMsg = 'plan: session handling';
  const res = git(dir, ['commit', '-m', commitMsg]);
  const body = `${res.stdout ?? ''}${res.stderr ?? ''}`.replace(/\s+$/, '');
  if (res.status === 0) {
    throw new Error('capture: the gate ALLOWED the commit — the fixture no longer demonstrates a refusal');
  }
  return [`$ git commit -m ${JSON.stringify(commitMsg)}`, body, '$ echo $?', String(res.status)].join('\n');
}

function assertHygiene(transcript) {
  // RI3. A capture is published verbatim on two public surfaces; anything local in it is published too.
  const offenders = [/\/Users\//, /\/home\//, /version skew/, new RegExp(escapeRe(os.homedir()))];
  for (const re of offenders) {
    if (re.test(transcript)) throw new Error(`capture: transcript matches ${re} — refusing to publish`);
  }
  if (!/failed with/.test(transcript)) throw new Error('capture: transcript contains no failure line');
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function replaceBlock(file, inner) {
  const src = read(file);
  const start = src.indexOf(BEGIN);
  const end = src.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`capture: ${path.relative(repoRoot, file)} has no ${BEGIN} / ${END} pair — add one first`);
  }
  const next = src.slice(0, start + BEGIN.length) + '\n' + inner + '\n' + src.slice(end);
  if (next === src) return false;
  write(file, next);
  return true;
}

function extractBlock(file) {
  const src = read(file);
  const start = src.indexOf(BEGIN);
  const end = src.indexOf(END);
  if (start === -1 || end === -1) return null;
  return src.slice(start + BEGIN.length, end).trim();
}

// The two surfaces need different wrappers — a Markdown fence renders on GitHub, a <pre> renders in a
// Vue slot — so the BLOCKS cannot be byte-identical. The PAYLOAD is what must match, and --check
// compares payloads after stripping each wrapper rather than comparing raw blocks.
function readmeBlock(t) { return '```console\n' + t + '\n```'; }
// v-pre is load-bearing, not decoration. This block is injected into a Vue SFC <template>, where
// `{{ ... }}` is compiled as an interpolation — so a future gate message containing braces would be
// evaluated as an expression instead of displayed, or would break the site build outright. v-pre tells
// the compiler to emit the subtree as-is. The capture is generated, so its future contents are not
// under this file's control, which is exactly when a guard like this earns its place.
function vueBlock(t) { return `<pre v-pre class="gate-capture"><code>${escapeHtml(t)}</code></pre>`; }
function payloadFromReadme(b) { return b.replace(/^```console\n/, '').replace(/\n```$/, ''); }
function payloadFromVue(b) {
  return b.replace(/^<pre v-pre class="gate-capture"><code>/, '').replace(/<\/code><\/pre>$/, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

const README = path.join(repoRoot, 'README.md');
const VUE = path.join(repoRoot, 'site/.vitepress/theme/GateCapture.vue');

const dir = path.join(sandboxRoot(), 'gate-demo');
buildFixture(dir);
const transcript = provoke(dir);
assertHygiene(transcript);

if (CHECK_ONLY) {
  const problems = [];
  const rp = extractBlock(README), vp = extractBlock(VUE);
  if (rp === null) problems.push('README.md has no capture block');
  if (vp === null) problems.push('GateCapture.vue has no capture block');
  if (rp !== null && payloadFromReadme(rp) !== transcript) problems.push('README.md capture is stale');
  if (vp !== null && payloadFromVue(vp) !== transcript) problems.push('GateCapture.vue capture is stale');
  if (rp !== null && vp !== null && payloadFromReadme(rp) !== payloadFromVue(vp)) {
    problems.push('the two published captures differ from each other');
  }
  if (problems.length) {
    console.error('capture-gate-refusal --check: FAILED');
    for (const p of problems) console.error(`- ${p}`);
    process.exit(1);
  }
  console.log('capture-gate-refusal --check: ok — both published captures match a fresh refusal');
} else {
  const a = replaceBlock(README, readmeBlock(transcript));
  const b = replaceBlock(VUE, vueBlock(transcript));
  console.log(`capture-gate-refusal: ${a || b ? 'updated' : 'unchanged'} (README.md${a ? ' written' : ' already current'}, GateCapture.vue${b ? ' written' : ' already current'})`);
}
