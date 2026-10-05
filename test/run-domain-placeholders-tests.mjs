#!/usr/bin/env node
// Regression suite for check-domain-placeholders.mjs (OI-82). All four of its rules measured
// undefended, and for a structural reason: the validator scans `git ls-files`, so it only ever sees
// TRACKED files in the repo it is run from. A fixture placed in this repo would have to contain the
// very leakage it tests for, and would then be flagged on every run — the same catch-22 that
// check-lifecycle's stray-artifact guard has. (test/fixtures/ is now exempt from this scan for
// exactly that reason, which closes the door on the in-repo approach entirely.)
//
// So each case builds a throwaway git repo, commits one file carrying one banned string, and
// asserts the matching error. The banned strings are assembled from fragments here, the same way
// the validator assembles its own patterns, so this file does not itself become a leak.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const validator = join(repoRoot, 'src', 'workflow', 'validators', 'check-domain-placeholders.mjs');
const term = (a, b) => a + b;

let passed = 0;
let failed = 0;
const scratch = [];

function check(id, description, condition, output) {
  if (condition) {
    console.log(`[PASS] ${id}: ${description}`);
    passed++;
  } else {
    console.error(`[FAIL] ${id}: ${description}`);
    if (output) console.error(`       got: ${output.trim().split('\n').slice(-3).join(' | ')}`);
    failed++;
  }
}

// Commits `files` into a scratch repo and runs the validator there. AGENTSMYTH_HOME points
// definitions reads at the real source tree while repoRoot — and therefore `git ls-files` — is the
// scratch repo.
function runIn(files) {
  const dir = mkdtempSync(join(tmpdir(), 'domain-placeholders-'));
  scratch.push(dir);
  spawnSync('git', ['init', '-q'], { cwd: dir });
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(join(dir, dirname(rel)), { recursive: true });
    writeFileSync(join(dir, rel), body);
  }
  spawnSync('git', ['add', '-A'], { cwd: dir });
  spawnSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'fixture'], { cwd: dir });
  const r = spawnSync(process.execPath, [validator], {
    cwd: dir, encoding: 'utf8',
    env: { ...process.env, AGENTSMYTH_HOME: join(repoRoot, 'src', 'workflow') },
  });
  return `${r.stdout ?? ''}${r.stderr ?? ''}`;
}

const placeholder = runIn({ 'notes.md': `# Notes\n\n${term('Placeholder for a later ', 'phase')}\n` });
check('placeholder-marker', 'a starter placeholder marker left in a tracked file is flagged',
  placeholder.includes('contains placeholder marker'), placeholder);

const leakage = runIn({ 'notes.md': `# Notes\n\nSee the ${term('ai-recipes', '-workspace')} layout.\n` });
check('leakage-term', 'a source-workspace leakage term is flagged',
  leakage.includes('contains reference-specific term'), leakage);

// "Bare" alone is ordinary English and deliberately not a standalone pattern; it is only a leak
// signal when its naming partner appears in the same file. This asserts the paired rule, which is
// separate from the single-term rule above.
const paired = runIn({ 'notes.md': `# Notes\n\n${term('Ba', 're')} and ${term('Fa', 're')} were the starter pair.\n` });
check('paired-leakage', 'the paired starter naming is flagged only together',
  paired.includes('alongside'), paired);

// workflow/ is shipped content, so repo-relative phrasing that reads fine in docs/ is banned there.
// The term has to be one that appears ONLY in workflowOnlyPatterns: a string that is also in the
// blanket leakage list fires that rule instead, and an assertion on the filename alone cannot tell
// the two apart — which is exactly how the first version of this case passed while leaving the rule
// undefended. Asserted on the rule's own wording for the same reason.
const workflowOnly = runIn({ 'workflow/router.md': `# Router\n\nRun it against ${term('this ', 'repository')}.\n` });
check('workflow-only-term', 'repo-relative phrasing inside shipped workflow/ content is flagged',
  workflowOnly.includes('contains repo-relative term'), workflowOnly);

// The position half of the same rule: the identical string outside workflow/ must NOT be flagged,
// or the rule is a blanket ban wearing a position check's clothes.
const workflowOnlyElsewhere = runIn({ 'docs/guide.md': `# Guide\n\nRun it against ${term('this ', 'repository')}.\n` });
check('workflow-only-scoped', 'the same phrasing outside workflow/ is left alone',
  !workflowOnlyElsewhere.includes('contains repo-relative term'), workflowOnlyElsewhere);

for (const dir of scratch) {
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* best-effort cleanup */ }
}

console.log(`\n${passed}/${passed + failed} domain-placeholder checks passed`);

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
