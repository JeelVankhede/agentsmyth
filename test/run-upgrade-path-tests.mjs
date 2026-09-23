#!/usr/bin/env node
// Upgrade-path tests — exercises `agentsmyth upgrade` as a real subprocess against synthesised
// repo states.
//
// WHY FIXTURES AND NOT OLD PACKAGE VERSIONS. The obvious way to test "a repo set up by version X,
// upgraded by version Y" is to install X from npm and run Y over it. That needs network access at
// test time, which workflow/config/verification.yaml classifies as a BLOCKED check rather than a
// passing one — a suite that silently degrades to "skipped" on an offline machine is worse than no
// suite. So the "old" side is synthesised here instead: a scratch repo is taken through a real
// `init`, and its manifest is then edited to represent whatever prior state the case needs. Every
// run exercises the working tree's CLI, which is the only CLI a test can honestly claim to check.
//
// The axis is MANIFEST STATE, not version pairs. Version pairs are the wrong axis because that is
// not what the code branches on — it branches on what the manifest says, and a version pair only
// matters insofar as it produces one of these states.
//
// Every spawn requires an explicit scratch HOME, same rule as run-init-prepare-interop-tests.mjs:
// there is no fallback to the real environment, so a bug here cannot write into a developer's
// actual ~/.agentsmyth.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const binPath = join(repoRoot, 'bin', 'agentsmyth.mjs');

let passed = 0;
let failed = 0;
const cleanup = [];

function check(id, description, condition) {
  if (condition) {
    console.log(`[PASS] ${id}: ${description}`);
    passed += 1;
  } else {
    console.error(`[FAIL] ${id}: ${description}`);
    failed += 1;
  }
}

function mkScratch(prefix) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  cleanup.push(dir);
  return dir;
}

function run(args, { cwd, home }) {
  if (!home) throw new Error('run() requires an explicit scratch `home` — refusing to run without one');
  return spawnSync(process.execPath, [binPath, ...args], {
    cwd, encoding: 'utf8', env: { ...process.env, HOME: home },
  });
}

function git(cwd, ...args) {
  return spawnSync('git', args, { cwd, encoding: 'utf8' });
}

// A repo that has been through a real `init`, with a tracked hooks path so the pre-commit hook is
// governed (a hook inside .git/ is deliberately not, since .git/** is a declared protected path).
function freshRepo(home, label) {
  const repo = mkScratch(`wpr18-${label}-`);
  git(repo, 'init', '-q');
  git(repo, 'config', 'user.email', 'test@example.com');
  git(repo, 'config', 'user.name', 'test');
  git(repo, 'config', 'core.hooksPath', '.githooks');
  const result = run(['init'], { cwd: repo, home });
  if (result.status !== 0) throw new Error(`init failed for ${label}: ${result.stderr}`);
  return repo;
}

// A copy of the package with a migration descriptor planted in it.
//
// Descriptors are read relative to the CLI's own package root, so exercising them means running a
// COPY — planting a fixture descriptor in `src/assets/workflow/migrations/` would ship it to every
// consumer, and a descriptor that describes a shape change that never happened is worse than none.
// This is also the only way to test a version STEP, since the real package's version is fixed.
function pkgWithDescriptor(version, dirName, targetBasename, changesYaml) {
  const pkg = mkScratch('wpr18-pkg-');
  // dist/ and validators/ are build output but are what `prepare` installs from, so a package copy
  // without them cannot complete an init.
  for (const part of ['bin', 'src', 'dist', 'validators', 'package.json']) {
    cpSync(join(repoRoot, part), join(pkg, part), { recursive: true });
  }
  const manifest = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8'));
  manifest.version = version;
  writeFileSync(join(pkg, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const dir = join(pkg, 'src', 'assets', 'workflow', 'migrations', dirName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, targetBasename), changesYaml);
  return join(pkg, 'bin', 'agentsmyth.mjs');
}

function runWith(bin, args, { cwd, home }) {
  return spawnSync(process.execPath, [bin, ...args], {
    cwd, encoding: 'utf8', env: { ...process.env, HOME: home },
  });
}

function manifestPath(repo) { return join(repo, 'workflow', 'provenance.yaml'); }
function readManifest(repo) { return readFileSync(manifestPath(repo), 'utf8'); }
function writeManifest(repo, text) { writeFileSync(manifestPath(repo), text); }

const home = mkScratch('wpr18-home-');

// ── State 1: no manifest at all ───────────────────────────────────────────
// Every version published to date predates the manifest, so this is not an edge case — it is the
// entire installed base on the day this ships. It must not read as "every file drifted".
{
  const repo = freshRepo(home, 'absent');
  rmSync(manifestPath(repo));
  const result = run(['upgrade'], { cwd: repo, home });

  check('S1-exit', 'a repo with no manifest upgrades successfully', result.status === 0);
  check('S1-adopts', 'it adopts current state as the baseline rather than reporting drift',
    /adopted the current state of \d+ governed file/.test(result.stdout));
  check('S1-no-drift-language', 'it never describes an un-upgraded repo as edited',
    !/edited since agentsmyth wrote it/.test(result.stdout));
  check('S1-manifest-written', 'a manifest now exists', existsSync(manifestPath(repo)));
  check('S1-no-backups', 'nothing was backed up — there was no recorded state to differ from',
    !existsSync(join(repo, 'workflow', 'backups')));
}

// ── State 2: manifest present, every file pristine ────────────────────────
{
  const repo = freshRepo(home, 'pristine');
  const result = run(['upgrade'], { cwd: repo, home });

  check('S2-exit', 'a pristine repo upgrades successfully', result.status === 0);
  check('S2-all-unchanged', 'every governed file reports unchanged', /, 0 edited,/.test(result.stdout));
  check('S2-no-backups', 'nothing is backed up when nothing was edited',
    !existsSync(join(repo, 'workflow', 'backups')));
  check('S2-idempotent', 'a second upgrade still reports nothing edited',
    /, 0 edited,/.test(run(['upgrade'], { cwd: repo, home }).stdout));
}

// ── State 3: manifest present, a file edited ──────────────────────────────
//
// Split into two cases, because the distinction is the whole point and the first version of this
// suite got it wrong. An edit only earns a backup and a reconcile item when the upgrade ACTUALLY
// REWRITES the file. Raising one otherwise sends the agent to merge a file against a byte-identical
// copy of itself, and leaves a committed duplicate behind.
{
  // 3a — edited, and the upgrade has a real change for it.
  const repo = freshRepo(home, 'drifted');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  const edited = `${readFileSync(target, 'utf8')}# deliberate user edit\n`;
  writeFileSync(target, edited);
  writeManifest(repo, readManifest(repo).replace(/written_by_version: [\d.]+/g, 'written_by_version: 1.0.1'));

  const bin = pkgWithDescriptor('1.1.0', '1.0.1-to-1.1.0', 'domain.yaml',
    'version: 1\nkind: migration\nfrom: 1.0.1\nto: 1.1.0\ntarget: workflow/config/domain.yaml\nchanges:\n  - op: ensure-key\n    key: probe_key\n    value: "probe"\n');
  const result = runWith(bin, ['upgrade'], { cwd: repo, home });

  check('S3-exit', 'an upgrade over an edited file succeeds', result.status === 0);
  check('S3-detected', 'the edit is detected as drift', /1 edited/.test(result.stdout));
  check('S3-delta-applied', 'the descriptor is applied to the edited file',
    /delta-applied\s+workflow\/config\/domain\.yaml/.test(result.stdout));
  check('S3-user-edit-survives', "the user's own line is not lost by the delta",
    readFileSync(target, 'utf8').includes('# deliberate user edit'));

  const backups = existsSync(join(repo, 'workflow', 'backups'))
    ? readdirSync(join(repo, 'workflow', 'backups'), { recursive: true }).filter((f) => String(f).endsWith('domain.yaml'))
    : [];
  check('S3-backed-up', 'the user version is preserved when the file is rewritten', backups.length === 1);
  check('S3-byte-identical', 'the backup is byte-identical to what the user had',
    backups.length === 1 && readFileSync(join(repo, 'workflow', 'backups', String(backups[0])), 'utf8') === edited);

  const pending = readFileSync(join(repo, 'workflow', 'config', 'pending-setup.yaml'), 'utf8');
  check('S3-one-item', 'exactly one reconcile item is raised, not zero and not two',
    [...pending.matchAll(/field: "reconcile\./g)].length === 1);
  check('S3-item-names-backup', 'the item names the backup path, so it survives lost scrollback',
    /backup_path: workflow\/backups\//.test(pending));
  check('S3-item-names-its-own-config', 'the item names the config it targets, not a hardcoded one',
    /config: domain\.yaml/.test(pending));
  check('S3-item-names-descriptor', 'the item names the migration descriptor that explains the change',
    /migration_id: 1\.0\.1-to-1\.1\.0\/domain\.yaml/.test(pending));
}

{
  // 3b — edited, and the upgrade has NOTHING for it. Nothing must happen, and crucially the drift
  // must stay visible: adopting the edit as the new baseline would let a LATER version overwrite it
  // with no backup, believing agentsmyth had written it.
  const repo = freshRepo(home, 'drifted-noop');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  writeFileSync(target, `${readFileSync(target, 'utf8')}# deliberate user edit\n`);

  const first = run(['upgrade'], { cwd: repo, home });
  check('S3b-exit', 'an upgrade with no change for an edited file succeeds', first.status === 0);
  check('S3b-no-backup', 'no backup is written when nothing was rewritten',
    !existsSync(join(repo, 'workflow', 'backups', '1.0.1', 'workflow', 'config', 'domain.yaml')));
  check('S3b-no-item', 'no reconcile item is raised for a file nothing touched',
    [...readFileSync(join(repo, 'workflow', 'config', 'pending-setup.yaml'), 'utf8').matchAll(/field: "reconcile\./g)].length === 0);
  check('S3b-drift-still-visible', 'the edit is NOT adopted as the new baseline',
    /1 edited/.test(run(['upgrade'], { cwd: repo, home }).stdout));
}

// ── State 4: manifest present, a governed file deleted ────────────────────
// Distinct from drift on purpose. A deleted file has nothing to preserve, so backing it up would
// write an empty backup and raise a prompt about edits that do not exist.
{
  const repo = freshRepo(home, 'missing');
  rmSync(join(repo, 'workflow', 'config', 'release.yaml'));
  const result = run(['upgrade'], { cwd: repo, home });

  check('S4-exit', 'an upgrade with a deleted governed file succeeds', result.status === 0);
  check('S4-reported-missing', 'the deletion is reported as missing, not as an edit',
    /1 missing/.test(result.stdout) && /0 edited/.test(result.stdout));
  check('S4-no-backup', 'a deleted file is not backed up',
    !existsSync(join(repo, 'workflow', 'backups', '1.0.1', 'workflow', 'config', 'release.yaml')));
  check('S4-not-resurrected', 'a deliberate deletion is not silently undone',
    !existsSync(join(repo, 'workflow', 'config', 'release.yaml')));
}

// ── State 5a: manifest unparseable ────────────────────────────────────────
// The single most important case in this file. Treating "unparseable" as "absent" would adopt the
// user's EDITED files as pristine, and the next upgrade would then overwrite them with no backup.
// That is the only path in the whole design that loses user edits without a trace.
{
  const repo = freshRepo(home, 'unparseable');
  writeManifest(repo, 'version: 1\nkind: provenance\nentries:\n  - path: a\n   sha256: bad-indent\n');
  const result = run(['upgrade'], { cwd: repo, home });

  check('S5a-refuses', 'an unparseable manifest is a hard stop', result.status === 1);
  check('S5a-not-adopted', 'it is never silently treated as absent',
    !/adopted the current state/.test(result.stdout));
  check('S5a-explains-stakes', 'the refusal says what continuing would cost',
    /with no backup/.test(result.stderr));
  check('S5a-names-recovery', 'the refusal names a recovery path',
    /--baseline/.test(result.stderr));
  check('S5a-unchanged', 'the refusal writes nothing',
    readManifest(repo).includes('bad-indent'));
}

// ── State 5b: manifest written by a newer CLI ─────────────────────────────
// The downgrade case. Compared naively every entry reads as mismatched, so an older CLI would back
// up and overwrite files that were already current.
{
  const repo = freshRepo(home, 'newer');
  writeManifest(repo, readManifest(repo).replace('format_version: 1', 'format_version: 99'));
  const result = run(['upgrade'], { cwd: repo, home });

  check('S5b-refuses', 'a manifest from a newer CLI is a hard stop', result.status === 1);
  check('S5b-explains', 'the refusal explains why comparing would be wrong',
    /already current/.test(result.stderr));
  check('S5b-unchanged', 'the refusal writes nothing', readManifest(repo).includes('format_version: 99'));
}

// ── Reconcile idempotency ─────────────────────────────────────────────────
// Three distinct failure modes, all of which shipped code would have hit.
{
  const repo = freshRepo(home, 'idempotency');
  const domain = join(repo, 'workflow', 'config', 'domain.yaml');
  const verification = join(repo, 'workflow', 'config', 'verification.yaml');
  writeFileSync(domain, `${readFileSync(domain, 'utf8')}# edit\n`);
  writeFileSync(verification, `${readFileSync(verification, 'utf8')}# edit\n`);
  writeManifest(repo, readManifest(repo).replace(/written_by_version: [\d.]+/g, 'written_by_version: 1.0.1'));

  const pkg = mkScratch('wpr18-pkg2-');
  for (const part of ['bin', 'src', 'dist', 'validators', 'package.json']) cpSync(join(repoRoot, part), join(pkg, part), { recursive: true });
  const pj = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8'));
  pj.version = '1.1.0';
  writeFileSync(join(pkg, 'package.json'), `${JSON.stringify(pj, null, 2)}\n`);
  const mdir = join(pkg, 'src', 'assets', 'workflow', 'migrations', '1.0.1-to-1.1.0');
  mkdirSync(mdir, { recursive: true });
  for (const name of ['domain.yaml', 'verification.yaml']) {
    writeFileSync(join(mdir, name), `version: 1\nkind: migration\nfrom: 1.0.1\nto: 1.1.0\ntarget: workflow/config/${name}\nchanges:\n  - op: ensure-key\n    key: probe_key\n    value: "probe"\n`);
  }
  const bin = join(pkg, 'bin', 'agentsmyth.mjs');
  runWith(bin, ['upgrade'], { cwd: repo, home });

  const pendingPath = join(repo, 'workflow', 'config', 'pending-setup.yaml');
  const afterFirst = readFileSync(pendingPath, 'utf8');
  check('I1-two-files-two-items', 'two rewritten files raise two items, not one',
    [...afterFirst.matchAll(/field: "reconcile\./g)].length === 2);

  // Same file drifting again at a later recorded version must raise a further item. A marker keyed
  // on the file alone would silently drop this.
  writeManifest(repo, readManifest(repo).replace(/written_by_version: [\d.]+/g, 'written_by_version: 0.9.0'));
  writeFileSync(domain, `${readFileSync(domain, 'utf8')}# second edit\n`);
  const mdir2 = join(pkg, 'src', 'assets', 'workflow', 'migrations', '0.9.0-to-1.1.0');
  mkdirSync(mdir2, { recursive: true });
  writeFileSync(join(mdir2, 'domain.yaml'), 'version: 1\nkind: migration\nfrom: 0.9.0\nto: 1.1.0\ntarget: workflow/config/domain.yaml\nchanges:\n  - op: ensure-key\n    key: probe_two\n    value: "two"\n');
  runWith(bin, ['upgrade'], { cwd: repo, home });
  const afterSecond = readFileSync(pendingPath, 'utf8');
  check('I2-per-version', 'the same file drifting at a later version raises a further item',
    [...afterSecond.matchAll(/field: "reconcile\./g)].length > 2);

  // Pruning a resolved item must not resurrect it. The content-based guard cannot see this; the
  // manifest's raised-marker ledger is what survives the prune.
  const pruned = afterSecond.replace(/ {2}- id: PS-\d+\n(?: {4}(?!- ).+\n)*? {4}field: "reconcile\.0\.9\.0[^"]*"\n(?: {4}(?!- ).+\n)*/g, '');
  const idsBefore = [...afterSecond.matchAll(/id: PS-(\d+)/g)].map((m) => Number(m[1]));
  writeFileSync(pendingPath, pruned);
  runWith(bin, ['upgrade'], { cwd: repo, home });
  const afterPrune = readFileSync(pendingPath, 'utf8');
  check('I3-no-resurrection', 'a pruned, resolved item is not raised again',
    [...afterPrune.matchAll(/field: "reconcile\.0\.9\.0/g)].length === 0);

  const idsAfter = [...afterPrune.matchAll(/id: PS-(\d+)/g)].map((m) => Number(m[1]));
  check('I4-no-id-reuse', 'a pruned PS-N id is never re-issued',
    idsAfter.every((id, i) => idsAfter.indexOf(id) === i)
    && idsAfter.filter((id) => !idsBefore.includes(id)).every((id) => id > Math.max(...idsBefore)));
}

// ── Enforcement surfaces refresh independently of the governed set ────────
//
// This is the branch whose absence hid the worst defect this package shipped. Every repo the rest
// of this suite builds sets `core.hooksPath=.githooks`, so the hook lands OUTSIDE `.git/` and is
// governed. `init` never sets that, so the default — and therefore essentially every real consumer
// — took a path with no coverage at all, in which the gate was never refreshed.
{
  const repo = mkScratch('wpr18-defhook-');
  git(repo, 'init', '-q');
  git(repo, 'config', 'user.email', 'test@example.com');
  git(repo, 'config', 'user.name', 'test');
  run(['init'], { cwd: repo, home });

  const hook = join(repo, '.git', 'hooks', 'pre-commit');
  const original = readFileSync(hook, 'utf8');
  const staled = `${original.replace(
    /(# >>> agentsmyth:mandatory-lifecycle-gate >>>\n)[\s\S]*?(# <<< agentsmyth:mandatory-lifecycle-gate <<<)/,
    '$1# STALE-V0-BODY\nexit 0\n$2',
  )}\n# MY OWN TRAILING LINE\n`;
  writeFileSync(hook, staled);

  const result = run(['upgrade'], { cwd: repo, home });
  const after = readFileSync(hook, 'utf8');

  check('E1-default-hook-not-governed', 'a hook inside .git/ is still absent from the manifest',
    !readManifest(repo).includes('.git/hooks/pre-commit'));
  check('E1-default-hook-refreshed', 'and is refreshed anyway — governance and refresh are separate questions',
    !after.includes('STALE-V0-BODY') && after.includes('agentsmyth check --staged'));
  check('E1-user-content-outside-markers', "content outside the markers survives byte-for-byte",
    after.includes('# MY OWN TRAILING LINE'));
  check('E1-reported', 'the refresh is reported to the user', /gate-refreshed/.test(result.stdout));
}

// ── A pre-existing user adapter is never adopted or overwritten ───────────
//
// `.github/copilot-instructions.md` is a standard Copilot convention file that `init` does not
// place on macOS. Existence is not authorship: adopting it into the manifest would make it read as
// pristine on the next upgrade and be replaced with template content — silently, with no backup.
{
  const repo = mkScratch('wpr18-useradapter-');
  git(repo, 'init', '-q');
  git(repo, 'config', 'user.email', 'test@example.com');
  git(repo, 'config', 'user.name', 'test');
  mkdirSync(join(repo, '.github'), { recursive: true });
  const mine = '# MY OWN COPILOT INSTRUCTIONS\nDo not delete me.\n';
  writeFileSync(join(repo, '.github', 'copilot-instructions.md'), mine);
  run(['init'], { cwd: repo, home });

  check('E2-not-governed', 'a file agentsmyth did not write is not adopted into the manifest',
    !readManifest(repo).includes('copilot-instructions.md'));

  run(['upgrade'], { cwd: repo, home });
  check('E2-preserved', "the user's file is byte-identical after an upgrade",
    readFileSync(join(repo, '.github', 'copilot-instructions.md'), 'utf8') === mine);
}

// ── The skew warning's advice is true ─────────────────────────────────────
// RI15 reworded it to name `upgrade`. That is only honest if upgrade actually moves the stamp.
{
  const repo = freshRepo(home, 'skew');
  writeFileSync(
    join(repo, 'workflow', 'config', 'repo-profile.yaml'),
    readFileSync(join(repo, 'workflow', 'config', 'repo-profile.yaml'), 'utf8').replace(/agentsmyth_version: .+/, 'agentsmyth_version: 0.9.0'),
  );
  check('E3-warns-before', 'check warns while the stamp is behind',
    /version skew detected/.test(run(['check'], { cwd: repo, home }).stdout + run(['check'], { cwd: repo, home }).stderr));

  run(['upgrade'], { cwd: repo, home });
  const after = run(['check'], { cwd: repo, home });
  check('E3-cleared-after', 'and is silent after an upgrade — the advice it prints is true',
    !/version skew detected/.test(after.stdout + after.stderr));
}

// ── Governed surface ──────────────────────────────────────────────────────
{
  const repo = freshRepo(home, 'surface');
  const manifest = readManifest(repo);
  check('G1-agents-md-excluded', 'AGENTS.md is not governed — it carries its own in-band marker provenance',
    !manifest.includes('AGENTS.md'));
  check('G2-pending-setup-excluded', 'pending-setup.yaml is not governed — the CLI appends to it during the upgrade that would hash it',
    !manifest.includes('pending-setup.yaml'));
  check('G3-hook-governed-when-tracked', 'a hook outside .git/ is governed',
    manifest.includes('.githooks/pre-commit'));

  // A hook inside .git/ must NOT be governed: .git/** is a declared protected path, and a backup of
  // it would copy protected content into committed version control.
  const defaultRepo = mkScratch('wpr18-defaulthooks-');
  git(defaultRepo, 'init', '-q');
  git(defaultRepo, 'config', 'user.email', 'test@example.com');
  git(defaultRepo, 'config', 'user.name', 'test');
  run(['init'], { cwd: defaultRepo, home });
  check('G4-git-hook-not-governed', 'a hook inside .git/ is not governed — .git/** is a protected path',
    !readManifest(defaultRepo).includes('.git/hooks/pre-commit'));
}

for (const dir of cleanup) {
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* best effort */ }
}

console.log('');
console.log(`upgrade-path: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
