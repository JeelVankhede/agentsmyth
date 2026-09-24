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
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
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
  // Quoted, deliberately. These four fields were written as raw unquoted scalars, so any value
  // carrying a colon or a quote produced a malformed document — and under a poisoned
  // written_by_version the traversal-laden path reached agent-facing instruction text unescaped.
  // The assertion pins the quoting rather than tolerating either form, because "either form" is how
  // the unquoted one comes back.
  check('S3-item-names-backup', 'the item names the backup path, so it survives lost scrollback',
    /backup_path: "workflow\/backups\//.test(pending));
  check('S3-item-names-its-own-config', 'the item names the config it targets, not a hardcoded one',
    /config: domain\.yaml/.test(pending));
  check('S3-item-names-descriptor', 'the item names the migration descriptor that explains the change',
    /migration_id: "1\.0\.1-to-1\.1\.0\/domain\.yaml"/.test(pending));
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


// ── W: what the delta actually WROTE ──────────────────────────────────────────────────────────
// The suite's central gap, and the reason this block exists. Every descriptor assertion above
// checks a LABEL: `S3-delta-applied` greps stdout for the word "delta-applied", which the CLI
// prints whenever `text !== before` — true for any change, including a wrong one. The only
// content-reading assertion checked the USER'S own line, never the descriptor's. So an ensure-key
// that wrote the wrong value, the wrong indent, the wrong place, or appended garbage left all 51
// checks green. These read the merged file back.
{
  const bin = pkgWithDescriptor('1.1.0', '1.0.1-to-1.1.0', 'domain.yaml', [
    'kind: migration',
    'from: "1.0.1"',
    'to: "1.1.0"',
    'target: workflow/config/domain.yaml',
    'changes:',
    '  - op: ensure-key',
    '    key: probe_key',
    '    value: probe_value',
    '',
  ].join('\n'));
  const repo = freshRepo(home, 'wcontent');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  writeManifest(repo, readManifest(repo).replace(/written_by_version: .+/g, 'written_by_version: 1.0.1'));

  const result = runWith(bin, ['upgrade'], { cwd: repo, home });
  const merged = readFileSync(target, 'utf8');

  check('W1-exit', 'a content-verified delta upgrade succeeds', result.status === 0);
  check('W1-key-present', 'the descriptor key is actually in the merged file, not merely announced',
    /^probe_key: probe_value$/m.test(merged));
  check('W1-value-exact', 'the value written is the value the descriptor named, character for character',
    merged.match(/^probe_key: (.*)$/m)?.[1] === 'probe_value');
  check('W1-no-duplicate', 'the key is written once, not appended on every pass',
    [...merged.matchAll(/^probe_key:/gm)].length === 1);
  check('W1-still-parses', 'the merged file is still a YAML mapping, not text with a line stapled on',
    /^domain:/m.test(merged) && !/^\s*probe_key:.*\S\s+\S+:/m.test(merged));

  // Idempotency at the CONTENT level, not the label level: ensure-key must not re-add on a re-run.
  const second = runWith(bin, ['upgrade'], { cwd: repo, home });
  check('W1-idempotent-content', 'a second upgrade leaves the merged content byte-identical',
    second.status === 0 && readFileSync(target, 'utf8') === merged);
}

// ── W2/W3: the two operations that had no test of any kind ────────────────────────────────────
// `rename-key` and `set-machine-owned` are two of applyChanges()'s three branches. A repo-wide grep
// for either string in test/ returned nothing — not even the weak label check. `rename-key` is the
// one whose entire purpose is preserving the user's value across a key move, and it would first
// have executed for real on a consumer's repo.
{
  const bin = pkgWithDescriptor('1.1.0', '1.0.1-to-1.1.0', 'domain.yaml', [
    'kind: migration',
    'from: "1.0.1"',
    'to: "1.1.0"',
    'target: workflow/config/domain.yaml',
    'changes:',
    '  - op: rename-key',
    '    key: old_probe',
    '    to: new_probe',
    '',
  ].join('\n'));
  const repo = freshRepo(home, 'wrename');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  writeFileSync(target, `${readFileSync(target, 'utf8').replace(/\n*$/, '')}\nold_probe: the-user-chose-this\n`);
  writeManifest(repo, readManifest(repo).replace(/written_by_version: .+/g, 'written_by_version: 1.0.1'));

  const result = runWith(bin, ['upgrade'], { cwd: repo, home });
  const merged = readFileSync(target, 'utf8');
  check('W2-exit', 'a rename-key upgrade succeeds', result.status === 0);
  check('W2-new-key', 'the key is renamed', /^new_probe:/m.test(merged));
  check('W2-old-key-gone', 'the old key name is removed, not duplicated', !/^old_probe:/m.test(merged));
  check('W2-value-preserved', "the user's value survives the move — the whole reason descriptors exist",
    merged.match(/^new_probe: (.*)$/m)?.[1] === 'the-user-chose-this');
}
{
  const bin = pkgWithDescriptor('1.1.0', '1.0.1-to-1.1.0', 'domain.yaml', [
    'kind: migration',
    'from: "1.0.1"',
    'to: "1.1.0"',
    'target: workflow/config/domain.yaml',
    'changes:',
    '  - op: set-machine-owned',
    '    key: machine_probe',
    '    value: agentsmyth-owns-this',
    '',
  ].join('\n'));
  const repo = freshRepo(home, 'wmachine');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  writeFileSync(target, `${readFileSync(target, 'utf8').replace(/\n*$/, '')}\nmachine_probe: stale-value\n`);
  writeManifest(repo, readManifest(repo).replace(/written_by_version: .+/g, 'written_by_version: 1.0.1'));

  const result = runWith(bin, ['upgrade'], { cwd: repo, home });
  const merged = readFileSync(target, 'utf8');
  check('W3-exit', 'a set-machine-owned upgrade succeeds', result.status === 0);
  check('W3-overwritten', 'a machine-owned value is overwritten, unlike ensure-key',
    merged.match(/^machine_probe: (.*)$/m)?.[1] === 'agentsmyth-owns-this');
  check('W3-once', 'it is replaced in place rather than appended', [...merged.matchAll(/^machine_probe:/gm)].length === 1);
}

// ── W4: the regression the council caught, with a test that can fail ──────────────────────────
// Every other descriptor fixture names its directory so `from` equals the repo's recorded version
// EXACTLY, so the old buggy predicate (`compareVersions(from, fromVersion) < 0 → continue`) never
// fired in any of them. A challenger proved it: reverting the fix in a package copy left all 51
// assertions green. This is the case that exposed the bug — a repo whose version sits STRICTLY
// INSIDE a descriptor's span — and it is the one the suite never constructed.
{
  const bin = pkgWithDescriptor('1.1.0', '1.0.0-to-1.1.0', 'domain.yaml', [
    'kind: migration',
    'from: "1.0.0"',
    'to: "1.1.0"',
    'target: workflow/config/domain.yaml',
    'changes:',
    '  - op: ensure-key',
    '    key: span_probe',
    '    value: applied',
    '',
  ].join('\n'));
  const repo = freshRepo(home, 'wspan');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  // 1.0.1 is strictly between the descriptor's from (1.0.0) and to (1.1.0) — and is the published
  // version, so this is the entire installed base, not an edge case.
  writeManifest(repo, readManifest(repo).replace(/written_by_version: .+/g, 'written_by_version: 1.0.1'));

  const result = runWith(bin, ['upgrade'], { cwd: repo, home });
  check('W4-exit', 'an upgrade whose recorded version sits inside a descriptor span succeeds', result.status === 0);
  check('W4-descriptor-applied', 'a descriptor whose span CONTAINS the recorded version is applied, not skipped',
    /^span_probe: applied$/m.test(readFileSync(target, 'utf8')));
}

// ── W5: both exclusion boundaries, so the predicate is pinned from both sides ──────────────────
// W4 alone would pass under a predicate that applies every descriptor unconditionally. These two
// assert what must NOT be applied: a descriptor already behind the repo, and one ahead of the CLI.
{
  const bin = pkgWithDescriptor('1.1.0', '0.9.0-to-1.0.0', 'domain.yaml', [
    'kind: migration',
    'from: "0.9.0"',
    'to: "1.0.0"',
    'target: workflow/config/domain.yaml',
    'changes:',
    '  - op: ensure-key',
    '    key: behind_probe',
    '    value: should-not-apply',
    '',
  ].join('\n'));
  const repo = freshRepo(home, 'wbehind');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  writeManifest(repo, readManifest(repo).replace(/written_by_version: .+/g, 'written_by_version: 1.0.1'));
  const result = runWith(bin, ['upgrade'], { cwd: repo, home });
  check('W5-behind-exit', 'an upgrade with only an already-applied descriptor succeeds', result.status === 0);
  check('W5-behind-not-applied', 'a descriptor whose `to` is at or below the recorded version is NOT applied',
    !/^behind_probe:/m.test(readFileSync(target, 'utf8')));
}
{
  const bin = pkgWithDescriptor('1.1.0', '1.1.0-to-2.0.0', 'domain.yaml', [
    'kind: migration',
    'from: "1.1.0"',
    'to: "2.0.0"',
    'target: workflow/config/domain.yaml',
    'changes:',
    '  - op: ensure-key',
    '    key: ahead_probe',
    '    value: should-not-apply',
    '',
  ].join('\n'));
  const repo = freshRepo(home, 'wahead');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  writeManifest(repo, readManifest(repo).replace(/written_by_version: .+/g, 'written_by_version: 1.0.1'));
  const result = runWith(bin, ['upgrade'], { cwd: repo, home });
  check('W5-ahead-exit', 'an upgrade with only a future descriptor succeeds', result.status === 0);
  check('W5-ahead-not-applied', 'a descriptor whose `to` is beyond the CLI version is NOT applied',
    !/^ahead_probe:/m.test(readFileSync(target, 'utf8')));
}

// ── W6: a descriptor the CLI cannot honour is a hard error, never a silent no-op ───────────────
// The op dispatch was three `===` tests with no default branch, and the field reader stripped the
// double quote but not the single — so `op: 'rename-key'`, legal YAML and unconstrained by the
// schema, parsed as the literal "'rename-key'", matched nothing, and was dropped with no error, no
// warning, and a "no-change" report for a file that needed a migration.
{
  const bin = pkgWithDescriptor('1.1.0', '1.0.1-to-1.1.0', 'domain.yaml', [
    'kind: migration',
    'from: "1.0.1"',
    'to: "1.1.0"',
    'target: workflow/config/domain.yaml',
    'changes:',
    '  - op: invent-a-key',
    '    key: bogus_probe',
    '    value: nope',
    '',
  ].join('\n'));
  const repo = freshRepo(home, 'wbadop');
  writeManifest(repo, readManifest(repo).replace(/written_by_version: .+/g, 'written_by_version: 1.0.1'));
  const result = runWith(bin, ['upgrade'], { cwd: repo, home });
  check('W6-refuses', 'an unrecognised descriptor op stops the upgrade instead of being dropped',
    result.status !== 0);
  check('W6-names-the-op', 'the refusal names the op it could not honour',
    /invent-a-key/.test(result.stdout + result.stderr));
}
{
  // Single-quoted YAML is legal and must work, not silently no-op.
  const bin = pkgWithDescriptor('1.1.0', '1.0.1-to-1.1.0', 'domain.yaml', [
    'kind: migration',
    "from: '1.0.1'",
    "to: '1.1.0'",
    'target: workflow/config/domain.yaml',
    'changes:',
    "  - op: 'ensure-key'",
    "    key: 'quoted_probe'",
    "    value: 'quoted_value'",
    '',
  ].join('\n'));
  const repo = freshRepo(home, 'wquote');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  writeManifest(repo, readManifest(repo).replace(/written_by_version: .+/g, 'written_by_version: 1.0.1'));
  const result = runWith(bin, ['upgrade'], { cwd: repo, home });
  check('W6-singlequote-exit', 'a single-quoted descriptor upgrades successfully', result.status === 0);
  check('W6-singlequote-applied', 'single-quoted YAML scalars are honoured, not parsed as literal quotes',
    /^quoted_probe: quoted_value$/m.test(readFileSync(target, 'utf8')));
}

// ── W7: a descriptor that does not satisfy its own schema is rejected at load ──────────────────
// R5's acceptance says "a descriptor validates against its own schema". Nothing ran it: a grep for
// `migration.schema` across every .mjs in the repo returned only the schema file and a README
// sentence claiming the validation existed.
{
  const bin = pkgWithDescriptor('1.1.0', '1.0.1-to-1.1.0', 'domain.yaml', [
    'kind: not-a-migration',
    'from: "1.0.1"',
    'to: "1.1.0"',
    'target: workflow/config/domain.yaml',
    'changes:',
    '  - op: ensure-key',
    '    key: k',
    '    value: v',
    '',
  ].join('\n'));
  const repo = freshRepo(home, 'wschema');
  writeManifest(repo, readManifest(repo).replace(/written_by_version: .+/g, 'written_by_version: 1.0.1'));
  const result = runWith(bin, ['upgrade'], { cwd: repo, home });
  check('W7-refuses', 'a descriptor whose kind is wrong is rejected before it is applied',
    result.status !== 0);
  check('W7-explains', 'the refusal says which descriptor and what was wrong with it',
    /1\.0\.1-to-1\.1\.0/.test(result.stdout + result.stderr) && /kind/.test(result.stdout + result.stderr));
}


// ── X: the six findings that could destroy a user's data ──────────────────────────────────────
// One block per P0 from the Review council. Each reconstructs the reproduction that found it, so a
// regression fails here rather than in someone's repository.

// X1 — a traversal in `written_by_version` must be refused, not used as a path segment.
{
  const repo = freshRepo(home, 'xtraversal');
  writeManifest(repo, readManifest(repo).replace(
    /^written_by_version: .+$/m, 'written_by_version: ../../../../../../tmp/agentsmyth-escape-probe'));
  const result = run(['upgrade'], { cwd: repo, home });
  check('X1-refuses', 'a manifest whose written_by_version is a path fragment is a hard stop',
    result.status !== 0);
  check('X1-explains', 'the refusal names the field rather than failing obscurely',
    /written_by_version/.test(result.stdout + result.stderr));
  check('X1-no-escape', 'nothing was written outside the repository',
    !existsSync('/tmp/agentsmyth-escape-probe'));
}

// X2 — the WRITE fence, exercised alone.
//
// Two fences guard a symlinked governed path: writeBackup() refuses to READ through one, and
// atomicWriteFileSync() refuses to WRITE through one. Either alone keeps the victim intact, so a
// test that lets both fire pins neither — reverting one left the suite green. This case makes the
// symlinked file PRISTINE (its recorded digest matches the victim's content), so no backup is taken
// and the read fence never runs. A descriptor then rewrites the file, and the write fence is the
// only thing between that write and a file outside the repository.
{
  const bin = pkgWithDescriptor('1.1.0', '1.0.1-to-1.1.0', 'domain.yaml', [
    'kind: migration', 'from: "1.0.1"', 'to: "1.1.0"',
    'target: workflow/config/domain.yaml',
    'changes:', '  - op: ensure-key', '    key: x2_probe', '    value: v', '',
  ].join('\n'));
  const repo = freshRepo(home, 'xsymlink');
  const outside = mkScratch('wpr18-victim-');
  const victim = join(outside, 'victim.txt');
  const victimContent = 'REAL_VICTIM_CONTENT\n';
  writeFileSync(victim, victimContent);
  const governed = join(repo, 'workflow', 'config', 'domain.yaml');
  rmSync(governed);
  symlinkSync(victim, governed);

  // Record the victim's own digest so the symlinked path reads `pristine`, not `drifted`.
  const victimDigest = createHash('sha256')
    .update(`${victimContent.replace(/\r\n/g, '\n').replace(/\n*$/, '')}\n`, 'utf8').digest('hex');
  writeManifest(repo, readManifest(repo)
    .replace(/written_by_version: .+/g, 'written_by_version: 1.0.1')
    .replace(/(- path: workflow\/config\/domain\.yaml\n\s+sha256: )[0-9a-f]{64}/, `$1${victimDigest}`));

  const dryRun = runWith(bin, ['upgrade', '--dry-run'], { cwd: repo, home });
  check('X2-is-pristine', 'the fixture really does read as pristine, so no backup is taken and only the write fence is in play',
    !/drifted\s+workflow\/config\/domain\.yaml/.test(dryRun.stdout));

  const result = runWith(bin, ['upgrade'], { cwd: repo, home });
  check('X2-victim-intact', 'a file outside the repo is never overwritten through a governed symlink',
    readFileSync(victim, 'utf8') === victimContent);
  check('X2-surfaced', 'the attempt is reported rather than silently skipped',
    result.status !== 0 || /symbolic link|refusing/.test(result.stdout + result.stderr));
}

// X3 — the READ fence, exercised alone.
//
// Here the symlinked file IS drifted, so writeBackup() runs and the read fence is what must stop it.
// The write fence cannot stand in: the backup destination is a fresh path inside workflow/backups/,
// not a symlink, so that write would succeed either way. The assertions are positive on purpose —
// an earlier version checked "no backup directory contains the secret", which passed vacuously when
// no backup directory existed at all.
{
  const repo = freshRepo(home, 'xexfil');
  const outside = mkScratch('wpr18-secret-');
  const secret = join(outside, '.env');
  writeFileSync(secret, 'API_TOKEN=super-secret\n');
  const governed = join(repo, 'workflow', 'config', 'verification.yaml');
  rmSync(governed);
  symlinkSync(secret, governed);
  // Force it to read as drifted so the backup path is actually exercised.
  writeManifest(repo, readManifest(repo).replace(
    /(- path: workflow\/config\/verification\.yaml\n\s+sha256: )[0-9a-f]{64}/, `$1${'0'.repeat(64)}`));

  const result = run(['upgrade'], { cwd: repo, home });
  check('X3-refused', 'backing up through a symlink out of the repo is refused, loudly',
    result.status !== 0 && /symbolic link|refusing/.test(result.stdout + result.stderr));

  const backupDir = join(repo, 'workflow', 'backups');
  const grep = spawnSync('grep', ['-rl', 'super-secret', backupDir], { encoding: 'utf8' });
  check('X3-no-exfiltration', 'and the secret never lands in a committed backup',
    !existsSync(backupDir) || grep.stdout.trim().length === 0);
}

// X4 — re-running `init` must not adopt a hand-edit as agentsmyth's own content.
{
  const repo = freshRepo(home, 'xreinit');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  const edited = `${readFileSync(target, 'utf8').replace(/\n*$/, '')}\n# a deliberate user edit\n`;
  writeFileSync(target, edited);
  const manifestBefore = readManifest(repo);

  // Delete `.agentsmyth/` first, because that is what the agent-driven setup does as its final
  // step — and it is the reason this is reachable at all. While the scaffold directory is present
  // `init` refuses outright; once it is gone (the documented steady state) the only remaining gate
  // was the one this finding is about.
  rmSync(join(repo, '.agentsmyth'), { recursive: true, force: true });

  const reinit = run(['init'], { cwd: repo, home });
  check('X4-init-succeeds', 're-running init on a set-up repo still succeeds', reinit.status === 0);
  check('X4-manifest-untouched', 'the manifest is left exactly as it was, not re-baselined against disk',
    readManifest(repo) === manifestBefore);
  check('X4-says-so', 'and the user is told why, rather than it happening silently',
    /already exists/.test(reinit.stdout));

  // The edit must still read as drift afterwards — that is the property re-baselining destroyed.
  const after = run(['upgrade'], { cwd: repo, home });
  check('X4-drift-survives', 'the edit is still detected as drift after a re-init',
    /drifted\s+workflow\/config\/domain\.yaml/.test(after.stdout));
}

// X5 — the backup supersede sweep must not touch a directory agentsmyth never created.
{
  const repo = freshRepo(home, 'xsweep');
  const consumerFile = join(repo, 'workflow', 'backups', 'nightly', 'workflow', 'config', 'domain.yaml');
  mkdirSync(dirname(consumerFile), { recursive: true });
  writeFileSync(consumerFile, 'the consumer owns this\n');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  writeFileSync(target, `${readFileSync(target, 'utf8').replace(/\n*$/, '')}\n# edit\n`);

  run(['upgrade'], { cwd: repo, home });
  check('X5-consumer-file-survives', "a consumer's own workflow/backups/ subtree is never swept",
    existsSync(consumerFile) && readFileSync(consumerFile, 'utf8') === 'the consumer owns this\n');
}

// X6 — a backup an OPEN reconcile item names must survive the next upgrade's supersede.
{
  const bin = pkgWithDescriptor('1.1.0', '1.0.1-to-1.1.0', 'domain.yaml', [
    'kind: migration', 'from: "1.0.1"', 'to: "1.1.0"',
    'target: workflow/config/domain.yaml',
    'changes:', '  - op: ensure-key', '    key: x6_probe', '    value: v', '',
  ].join('\n'));
  const repo = freshRepo(home, 'xopenitem');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  writeFileSync(target, `${readFileSync(target, 'utf8').replace(/\n*$/, '')}\n# first edit\n`);
  writeManifest(repo, readManifest(repo).replace(/written_by_version: .+/g, 'written_by_version: 1.0.1'));
  runWith(bin, ['upgrade'], { cwd: repo, home });

  const pending = readFileSync(join(repo, 'workflow', 'config', 'pending-setup.yaml'), 'utf8');
  const backupRel = pending.match(/backup_path: "([^"]+)"/)?.[1];
  check('X6-item-raised', 'the first upgrade raises an item naming a backup', Boolean(backupRel));

  // Edit again and upgrade again WITHOUT resolving the item — the sequence that destroyed it.
  writeFileSync(target, `${readFileSync(target, 'utf8').replace(/\n*$/, '')}\n# second edit\n`);
  writeManifest(repo, readManifest(repo).replace(/written_by_version: .+/g, 'written_by_version: 1.0.2'));
  runWith(bin, ['upgrade'], { cwd: repo, home });

  check('X6-backup-survives', "an open item's backup_path still resolves after a second upgrade",
    Boolean(backupRel) && existsSync(join(repo, backupRel)));
}

// ── Y: silent-misclassification and compatibility regressions ─────────────────────────────────

// Y1 — a manifest entry whose keys are reordered is schema-valid and must not be silently dropped.
{
  const repo = freshRepo(home, 'yreorder');
  const reordered = readManifest(repo).replace(
    /^ {2}- path: (workflow\/config\/domain\.yaml)\n {4}sha256: ([0-9a-f]{64})\n {4}written_by_version: (.+)$/m,
    '  - sha256: $2\n    path: $1\n    written_by_version: $3');
  check('Y1-fixture-built', 'the reorder fixture actually reordered something',
    reordered !== readManifest(repo));
  writeManifest(repo, reordered);

  const result = run(['upgrade'], { cwd: repo, home });
  check('Y1-not-newly-governed', 'a reordered entry is still read, not silently reclassified',
    !/newly-governed\s+workflow\/config\/domain\.yaml/.test(result.stdout));
  check('Y1-pristine', 'and it compares correctly against disk',
    /pristine\s+workflow\/config\/domain\.yaml/.test(result.stdout));
}

// Y2 — `upgrade --baseline` must perform the same manifest hard stops bare `upgrade` does.
{
  const repo = freshRepo(home, 'ybaseline');
  writeManifest(repo, readManifest(repo).replace(/^format_version: .+$/m, 'format_version: 99'));
  const result = run(['upgrade', '--baseline'], { cwd: repo, home });
  check('Y2-refuses', '--baseline refuses a manifest written by a newer CLI', result.status !== 0);
  check('Y2-not-downgraded', 'and leaves its format_version alone rather than stamping it down',
    /^format_version: 99$/m.test(readManifest(repo)));
}

// Y3 — a drifted pre-commit hook raises a reconcile item like any other governed file.
//
// The edit goes INSIDE the marker block on purpose. That is the case with something at stake: the
// span between the markers is agentsmyth's to replace, so an upgrade overwrites whatever the user
// put there. Editing outside the markers is the safe case — that content survives untouched and
// correctly needs no item — and asserting on it would have let this pass under the bug.
//
// The bug: three functions had to agree on one vocabulary and nothing made them. applyUpgradeTo()
// returned 'no-change' for any hook path, refreshEnforcementSurfaces() reported 'gate-refreshed',
// and the reconcile filter matched a hardcoded 'delta-applied' || 're-rendered'. So the hook was
// rewritten, its backup deleted as a false no-op, and the user told nothing.
{
  const repo = freshRepo(home, 'yhook');
  const hook = join(repo, '.githooks', 'pre-commit');
  const original = readFileSync(hook, 'utf8');
  const BEGIN = '# >>> agentsmyth:mandatory-lifecycle-gate >>>';
  check('Y3-fixture-valid', 'the fixture hook really does carry an agentsmyth marker block',
    original.includes(BEGIN));

  // Plant the edit inside the block, and a second one outside it as a control.
  const edited = `${original.replace(BEGIN, `${BEGIN}\n# a user edit INSIDE the managed block`)}\n# a user edit outside the block\n`;
  writeFileSync(hook, edited);

  const result = run(['upgrade'], { cwd: repo, home });
  check('Y3-detected', 'an edited tracked hook is detected as drift',
    /drifted\s+\.githooks\/pre-commit/.test(result.stdout));

  const pending = readFileSync(join(repo, 'workflow', 'config', 'pending-setup.yaml'), 'utf8');
  const raisedForHook = /field: "reconcile\.[^"]*pre-commit"/.test(pending);
  const backupPath = pending.match(/backup_path: "([^"]*pre-commit)"/)?.[1];

  check('Y3-item-raised', 'a hook whose managed block was rewritten raises a reconcile item like any other governed file',
    raisedForHook);
  check('Y3-backup-kept', "and the backup the item names still exists — it is the only copy of the user's overwritten lines",
    Boolean(backupPath) && existsSync(join(repo, backupPath)));
  check('Y3-backup-has-user-line', 'the backup holds what the user wrote inside the block, which the live file no longer does',
    Boolean(backupPath) && readFileSync(join(repo, backupPath), 'utf8').includes('# a user edit INSIDE the managed block'));
  check('Y3-outside-survives', 'content outside the markers survives in the live file, untouched',
    readFileSync(hook, 'utf8').includes('# a user edit outside the block'));
}

// Y4 — a CRLF working tree must not permanently exclude the Cursor adapter.
{
  const repo = freshRepo(home, 'ycrlf');
  const mdc = join(repo, '.cursor', 'rules', 'agentsmyth.mdc');
  writeFileSync(mdc, readFileSync(mdc, 'utf8').replace(/\n/g, '\r\n'));
  run(['upgrade', '--baseline'], { cwd: repo, home });
  check('Y4-governed-under-crlf', 'a CRLF-checked-out adapter still enters the manifest',
    readManifest(repo).includes('.cursor/rules/agentsmyth.mdc'));
  const result = run(['upgrade'], { cwd: repo, home });
  check('Y4-not-newly-governed', 'and is never reclassified newly-governed run after run',
    !/newly-governed\s+\.cursor/.test(result.stdout));
}

// Y5 — --dry-run previews without writing anything.
{
  const repo = freshRepo(home, 'ydryrun');
  const target = join(repo, 'workflow', 'config', 'domain.yaml');
  writeFileSync(target, `${readFileSync(target, 'utf8').replace(/\n*$/, '')}\n# edit\n`);
  const before = readFileSync(target, 'utf8');
  const manifestBefore = readManifest(repo);

  const result = run(['upgrade', '--dry-run'], { cwd: repo, home });
  check('Y5-exit', '--dry-run succeeds', result.status === 0);
  check('Y5-announces', 'it says plainly that nothing was written', /DRY RUN/.test(result.stdout));
  check('Y5-no-writes', 'and nothing was: the target and the manifest are untouched',
    readFileSync(target, 'utf8') === before && readManifest(repo) === manifestBefore);
  check('Y5-no-backups', 'no backup is taken during a preview',
    !existsSync(join(repo, 'workflow', 'backups')));

  // The preview must not promise more than the run delivers. With no descriptor in play this
  // drifted file would be backed up, found unchanged, and its backup removed — no item, no loss —
  // so a preview announcing a reconcile item for it would be describing a different command.
  check('Y5-honest-about-no-op', 'a drifted file this version has no change for is previewed as left alone, not as raising an item',
    /no rewrite, no reconcile item/.test(result.stdout)
    && !/would each raise a reconcile item/.test(result.stdout));
}

// Y6 — the `.mdc` half of the existence-versus-authorship fix, which E2 covered only for copilot.
{
  const repo = mkScratch('wpr18-ymdc-');
  git(repo, 'init', '-q');
  git(repo, 'config', 'user.email', 'test@example.com');
  git(repo, 'config', 'user.name', 'test');
  git(repo, 'config', 'core.hooksPath', '.githooks');
  const mdc = join(repo, '.cursor', 'rules', 'agentsmyth.mdc');
  mkdirSync(dirname(mdc), { recursive: true });
  writeFileSync(mdc, '# the user wrote this cursor rule themselves\n');
  const init = run(['init'], { cwd: repo, home });
  check('Y6-init-ok', 'init succeeds over a pre-existing .mdc', init.status === 0);
  check('Y6-not-adopted', 'a .mdc agentsmyth did not write is not adopted into the manifest',
    !readManifest(repo).includes('.cursor/rules/agentsmyth.mdc'));
  run(['upgrade'], { cwd: repo, home });
  check('Y6-preserved', "and the user's file is byte-identical after an upgrade",
    readFileSync(mdc, 'utf8') === '# the user wrote this cursor rule themselves\n');
}


// ── Z: polyrepo-member, the mode RI21 names and nothing tested ────────────────────────────────
// RI21's acceptance is that a backup lands inside a real git working tree and is visible to
// `git status` there, in all three repository modes. For `polyrepo-member` the code could not
// deliver it and a comment claimed it did: `repoDir` there IS `workspace_root`, which by that
// mode's own definition lies outside every git repo, so `git rev-parse` from it fails and the
// fallback wrote the backup to exactly the untracked location the comment said it avoided.
// A grep for "polyrepo" across this file used to return nothing, which is why the comment and the
// code were free to disagree.
{
  const ws = mkScratch('wpr18-poly-ws-');
  const member = join(ws, 'service-a');
  mkdirSync(member, { recursive: true });
  git(member, 'init', '-q');
  git(member, 'config', 'user.email', 'test@example.com');
  git(member, 'config', 'user.name', 'test');

  // `workspace_root` itself must NOT be a git repo — that is the property that broke this.
  const wsIsGit = spawnSync('git', ['rev-parse', '--show-toplevel'],
    { cwd: ws, encoding: 'utf8' }).status === 0;
  check('Z1-fixture-valid', 'the polyrepo `workspace_root` is genuinely outside any git repo', !wsIsGit);

  const init = run(['init'], { cwd: ws, home });
  check('Z1-init-ok', 'init succeeds at a polyrepo `workspace_root`', init.status === 0);

  // Declare the mode and the member checkout.
  const profilePath = join(ws, 'workflow', 'config', 'repo-profile.yaml');
  writeFileSync(profilePath, readFileSync(profilePath, 'utf8')
    .replace(/^(\s*)mode:.*$/m, `$1mode: polyrepo-member\n$1workspace_root: ${ws}\n$1sibling_repos:\n$1  - name: service-a\n$1    path: service-a`));

  run(['upgrade', '--baseline'], { cwd: ws, home });
  const target = join(ws, 'workflow', 'config', 'domain.yaml');
  writeFileSync(target, `${readFileSync(target, 'utf8').replace(/\n*$/, '')}\n# a polyrepo user edit\n`);

  // A descriptor is required, not incidental. Without one nothing rewrites the file, so the backup
  // is taken and then correctly removed as a no-op — which would leave this block asserting against
  // an empty directory and passing for a reason that has nothing to do with WHERE backups land.
  const bin = pkgWithDescriptor('1.1.0', '1.0.1-to-1.1.0', 'domain.yaml', [
    'kind: migration', 'from: "1.0.1"', 'to: "1.1.0"',
    'target: workflow/config/domain.yaml',
    'changes:', '  - op: ensure-key', '    key: poly_probe', '    value: v', '',
  ].join('\n'));
  writeManifest(ws, readManifest(ws).replace(/written_by_version: .+/g, 'written_by_version: 1.0.1'));

  const result = runWith(bin, ['upgrade'], { cwd: ws, home });
  check('Z1-upgrade-ok', 'an upgrade in polyrepo-member mode succeeds', result.status === 0);

  const inMember = existsSync(join(member, 'workflow', 'backups'));
  const inWorkspace = existsSync(join(ws, 'workflow', 'backups'));
  check('Z1-backup-in-member-tree', 'the backup lands inside the member repo, not beside the untracked shared workflow',
    inMember && !inWorkspace);

  // The acceptance criterion as RI21 actually words it: git can see it.
  // `-uall` because plain porcelain collapses an untracked directory to `?? workflow/`, which is
  // git's display choice and not a statement about what it can see. The claim under test is that
  // the file is inside the working tree git tracks, so ask git to enumerate.
  const status = spawnSync('git', ['status', '--porcelain', '-uall'], { cwd: member, encoding: 'utf8' }).stdout;
  check('Z1-visible-to-git-status', "and `git status` in that member repo reports it, which is RI21's acceptance verbatim",
    /workflow\/backups\/.*domain\.yaml/.test(status));
}


// ── V: the two Phase 12 fixes that could not fire, and the reason they could not ───────────────
// Both of these shipped green. V1's condition could never be true in the case it targeted; V2's
// code worked only when run from a directory no consumer has. Neither was reachable by adding
// assertions to a suite that already passed — V1 needed a faithful post-setup state and V2 needed
// the shipped validator layout. These two blocks build exactly those.

// V1 — the post-setup baseline check must fire on a skipped step 5f, and stay silent after it ran.
{
  const CONFIGS = ['domain.yaml', 'release.yaml', 'repo-profile.yaml', 'source-of-truth.yaml', 'verification.yaml'];
  const checkLifecycle = join(repoRoot, 'src', 'workflow', 'validators', 'check-lifecycle.mjs');

  // Reproduce what the setup skill's Phase 3 actually does: REWRITE all five configs. An earlier
  // version of this scenario only substituted <PLACEHOLDER> tokens, and two of the five carry
  // none — so it produced 3 drifted of 7 and could not distinguish a working rule from a dead one.
  const postSetup = (label, runStep5f) => {
    const repo = freshRepo(home, label);
    for (const name of CONFIGS) {
      const f = join(repo, 'workflow', 'config', name);
      writeFileSync(f, `${readFileSync(f, 'utf8').replace(/<PLACEHOLDER>/g, 'filled').replace(/<USER-TODO>/g, 'filled').replace(/\n*$/, '')}\n# filled during setup\n`);
    }
    if (runStep5f) run(['upgrade', '--baseline'], { cwd: repo, home });
    const out = spawnSync(process.execPath, [checkLifecycle], { cwd: repo, encoding: 'utf8', env: { ...process.env, HOME: home } });
    return `${out.stdout}${out.stderr}`;
  };

  const skipped = postSetup('v1skipped', false);
  const ran = postSetup('v1ran', true);

  // Guard the fixture itself: if setup did not actually drift the configs, both assertions below
  // would pass vacuously and prove nothing.
  check('V1-fixture-drifts-configs', 'the simulated setup really does leave every config differing from its recorded digest',
    /(\d+) digest\(s\) compared against disk — [1-9]/.test(skipped));
  check('V1-catches-skipped-5f', 'a baseline never re-taken after setup is reported, not left for the first upgrade to discover',
    /EVERY one differs from what is on disk/.test(skipped));
  check('V1-silent-after-5f', 'and running step 5f clears it — the rule is not just always-on',
    !/EVERY one differs from what is on disk/.test(ran));
  check('V1-not-whole-governed-set', 'the rule keys on the config files setup rewrites, not on the whole governed set',
    // The hook and the adapter stay pristine after setup, so a rule requiring EVERY governed file
    // to differ can never fire. This asserts the fixture is in exactly that state.
    /0 recorded file\(s\) no longer present|unchanged/.test(skipped));
}

// V2 — the installed-version comparison must fire WHERE THE VALIDATOR SHIPS.
//
// This is the assertion whose absence let the defect through. The existing setup-checks suite runs
// check-setup-complete out of src/, where a package.json resolves two levels up; in a consumer it
// runs from ~/.agentsmyth/workflow/validators/, where nothing does. So the old code returned null,
// the comparison never ran, and 20/20 stayed green over a check that was inert in deployment.
{
  const repo = freshRepo(home, 'v2layout');
  const globalValidator = join(home, '.agentsmyth', 'workflow', 'validators', 'check-setup-complete.mjs');
  check('V2-ships-to-global-tree', 'the validator really is installed into the global tree, which is what a consumer runs',
    existsSync(globalValidator));
  check('V2-no-package-json-there', 'and there is no package.json at either depth it probes — the reason the first fix was inert',
    !existsSync(join(globalValidator, '..', '..', '..', 'package.json'))
    && !existsSync(join(globalValidator, '..', '..', 'package.json')));
  check('V2-version-stamp-written', 'prepare stamps the installed version into the global tree instead',
    existsSync(join(home, '.agentsmyth', 'workflow', 'installed-version.txt')));

  // Two stamps that agree with each other but trail the installed package — the exact state the
  // repo-local comparison cannot see, and the one the requirement exists to catch.
  const profile = join(repo, 'workflow', 'config', 'repo-profile.yaml');
  writeFileSync(profile, readFileSync(profile, 'utf8').replace(/^agentsmyth_version:.*$/m, 'agentsmyth_version: 0.0.1'));
  const agentsMd = join(repo, 'AGENTS.md');
  if (existsSync(agentsMd)) {
    writeFileSync(agentsMd, readFileSync(agentsMd, 'utf8').replace(/agentsmyth:[0-9][^\s]*/g, 'agentsmyth:0.0.1'));
  }

  const asShipped = spawnSync(process.execPath, [globalValidator], { cwd: repo, encoding: 'utf8', env: { ...process.env, HOME: home } });
  const shipped = `${asShipped.stdout}${asShipped.stderr}`;
  check('V2-fires-in-shipped-layout', 'a repo whose stamps agree but trail the installed version is reported, running the validator exactly as a consumer does',
    /is installed — this repo is behind/.test(shipped));
  check('V2-not-claiming-unresolvable', 'and it no longer reports the installed version as unresolvable from there',
    !/installed version not resolvable/.test(shipped));
  check('V2-still-a-warning', 'being behind stays a warning, not an error line — this rule reaches every repo on the machine',
    !/^- .*is installed — this repo is behind/m.test(shipped));
}

for (const dir of cleanup) {
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* best effort */ }
}

console.log('');
console.log(`upgrade-path: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
