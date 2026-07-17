#!/usr/bin/env node
// Regression test for check-setup-refs.mjs (audit-remediation R8). Runs the real validator (not a
// copy of its logic) against (a) a fixture config-map.md with one seeded field that no schema has —
// expecting a non-zero exit and the specific error — and (b) the real src/setup/references/ docs —
// expecting a clean exit. Both runs point schema reads at src/workflow via AGENTSMYTH_WF and the
// docs dir via AGENTSMYTH_SETUP_REFS.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const validator = join(repoRoot, 'src', 'workflow', 'validators', 'check-setup-refs.mjs');

function run(setupRefsDir) {
  return spawnSync(process.execPath, [validator], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, AGENTSMYTH_WF: 'src/workflow', AGENTSMYTH_SETUP_REFS: setupRefsDir },
  });
}

let passed = 0;
let failed = 0;
function check(id, description, condition) {
  if (condition) { console.log(`[PASS] ${id}: ${description}`); passed++; }
  else { console.error(`[FAIL] ${id}: ${description}`); failed++; }
}

// (a) Seeded-wrong-field fixture must fail with the specific field named.
const bad = run('test/fixtures/setup-refs/bad');
const badOut = (bad.stdout ?? '') + (bad.stderr ?? '');
check('bad-exit', 'seeded wrong field → non-zero exit', bad.status !== 0);
check('bad-msg', 'error names the nonexistent field',
  badOut.includes('nonexistent_field') && badOut.includes('not found in verification.yaml'));

// (b) Real shipped reference docs must pass cleanly.
const good = run('src/setup/references');
const goodOut = (good.stdout ?? '') + (good.stderr ?? '');
check('good-exit', 'real config-map.md + token-map.md → clean exit', good.status === 0);
check('good-ok', 'real docs report ok', goodOut.includes('check-setup-refs: ok'));

// (c) Semantic pin (audit-remediation R8 review P3): existence alone would let a wrong-but-existing
// field through (the original `{{REPO_NAME}}` → `repository.root` bug rendered "."). Pin each token
// to its INTENDED field so a semantic regression fails, not just a nonexistent field.
import { readFileSync } from 'node:fs';
const EXPECTED = {
  REPO_NAME: ['domain.yaml', 'domain.name'],
  REPO_PURPOSE: ['domain.yaml', 'domain.summary'],
  DOMAIN_NAME: ['domain.yaml', 'domain.name'],
  DEFAULT_BRANCH: ['repo-profile.yaml', 'repository.default_branch'],
  BRANCH_POLICY: ['repo-profile.yaml', 'branch_policy.require_non_default_branch_for_changes'],
  PROTECTED_PATHS: ['repo-profile.yaml', 'paths.protected'],
  VERIFICATION_CMDS: ['verification.yaml', 'commands[].command'],
  CONSTRAINTS: ['domain.yaml', 'constraints.product'],
};
const tokenMap = readFileSync(join(repoRoot, 'src/setup/references/token-map.md'), 'utf8');
let semanticOk = true;
const semanticProblems = [];
for (const [token, [wantFile, wantField]] of Object.entries(EXPECTED)) {
  const row = tokenMap.split('\n').find((l) => l.includes(`{{${token}}}`));
  if (!row) { semanticOk = false; semanticProblems.push(`${token}: row missing`); continue; }
  if (!row.includes(wantFile)) { semanticOk = false; semanticProblems.push(`${token}: expected file ${wantFile}`); }
  if (!row.includes(`\`${wantField}`)) { semanticOk = false; semanticProblems.push(`${token}: expected field ${wantField}`); }
}
check('token-semantics', 'token-map tokens map to their intended fields', semanticOk);
if (!semanticOk) console.error('   ' + semanticProblems.join('; '));

console.log(`\n${passed}/${passed + failed} setup-refs checks passed`);
process.exit(failed === 0 ? 0 : 1);
