#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync, readdirSync, realpathSync, statSync, copyFileSync, renameSync, rmSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { basename, join, dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { confirmPrompt } from './prompts.mjs';

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cwd = process.cwd();
const command = process.argv[2];

// Written into definitions_root as a hardcoded, forward-slash literal — never derived via
// join('~', ...), which would silently produce a backslash-joined value on Windows and break
// every reader's `startsWith('~/')` check (lib.mjs's _expandTilde, resolveValidator() here, and
// the same pattern already proven for repository.workspace_root). homedir() itself is already
// cross-platform-correct (macOS/Linux/Windows) on the read side — this constant just makes sure
// the write side never bakes in one specific machine's expanded path (OI-52).
const PORTABLE_DEFINITIONS_ROOT = '~/.agentsmyth/workflow';

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
  console.log('  upgrade  Bring an already-set-up repository current with this version');
  console.log('  prepare  Install/refresh the global lifecycle definitions (~/.agentsmyth/)');
  console.log('  check    Run the lifecycle phase gate validator');
  console.log('  doctor   Diagnose agentsmyth installation (not yet implemented)');
  console.log('');
  console.log('Flags:');
  console.log('  upgrade --dry-run   Show what an upgrade would change; write nothing');
  console.log('  upgrade --baseline  Re-record the files currently on disk as the baseline,');
  console.log('                      without upgrading. Run by the setup skill as its final');
  console.log('                      step, and by hand after resolving a reconcile item.');
  process.exit(0);
}

// ─── check ─────────────────────────────────────────────────────────────────
// Resolves the check-lifecycle validator via the two-root resolver in lib.mjs,
// forwarding all args and propagating the exit code. Falls back to npx if the
// binary is not on PATH (common when installed via npm without global linking).

// Resolves a validator file with the same two-root priority lib.mjs uses internally
// (definitions_root in repo-profile.yaml -> AGENTSMYTH_HOME -> repo-local workflow/), plus a
// final fallback to pkgRoot/src/workflow/ for the dev/source-repo case (pkgRoot IS the repo
// root there, so src/workflow/validators/ exists directly — never true for a real npm install,
// since package.json's "files" field never ships src/workflow/). Shared by every `--<mode>` of
// the `check` command so each new validator (check-lifecycle.mjs, check-commit-coverage.mjs, ...)
// gets the same resolution instead of re-deriving it.
function resolveValidator(checkRoot, profilePath, validatorFilename) {
  let definitionsRoot = null;
  try {
    const m = readFileSync(profilePath, 'utf8').match(/^\s*definitions_root:\s*(.+)$/m);
    definitionsRoot = m ? m[1].trim() : null;
  } catch { /* fall through */ }
  if (definitionsRoot?.startsWith('~/')) definitionsRoot = join(homedir(), definitionsRoot.slice(2));

  // When the repository being checked IS this package — the source repo, developing the
  // validators themselves — its own `src/workflow/validators/` wins over every installed copy.
  // Without this, preferring the repo's own bin/ (which the pre-commit hook now does) changed
  // only which CLI ran: the validator FILES still came from definitions_root, so the gate on a
  // change to a validator kept running the previously installed version of that same validator.
  // Not reachable from the environment either, before or after this change: the one env override
  // this resolver consults (AGENTSMYTH_HOME) is checked AFTER definitions_root, so a stale linked
  // tree could not be stepped around by setting a variable.
  //
  // Guarded so it can never fire for a consumer. It requires the resolved repo root and the
  // package root to be the same directory AND that directory to contain the validator under
  // `src/workflow/`, which is true only in a checkout of this repository: package.json's `files`
  // never ships `src/workflow/`, so an installed copy has nothing at that path, and an install is
  // in node_modules or an npx cache rather than at the repo root being checked.
  const sourceCopy = join(pkgRoot, 'src', 'workflow', 'validators', validatorFilename);
  const isSourceRepo = resolve(checkRoot) === resolve(pkgRoot) && existsSync(sourceCopy);

  const candidates = [
    isSourceRepo && sourceCopy,
    definitionsRoot && join(definitionsRoot, 'validators', validatorFilename),
    process.env.AGENTSMYTH_HOME && join(process.env.AGENTSMYTH_HOME, 'validators', validatorFilename),
    join(checkRoot, 'workflow', 'validators', validatorFilename),
    sourceCopy,
  ].filter(Boolean);
  const resolved = candidates.find((p) => existsSync(p));
  return { resolved, candidates };
}

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
    // The FOURTH copy of git-root resolution, exposed to the same drift harness as the other three.
    // resolveGitRoot() shipped as a documented fourth copy while the test built specifically to
    // catch the first three diverging spawned only those three — so the one mechanism that would
    // have caught "someone changed one half" did not cover the newest half.
    if (process.env.AGENTSMYTH_DEBUG_ROOT === 'git') console.log(resolveGitRoot(checkRoot) ?? '(null)');
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
  // A missing field counts as skew too (Sandbox Testing Scenario E, decided 2026-07-27): a repo
  // that predates version-stamping shouldn't silently evade detection forever.
  const currentPkgVersion = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')).version;
  try {
    const profileContent = readFileSync(profilePath, 'utf8');
    const versionMatch = profileContent.match(/^agentsmyth_version:\s*(\S+)/m);
    const profileVersion = versionMatch ? versionMatch[1] : null;
    if (profileVersion !== currentPkgVersion) {
      if (profileVersion) {
        console.warn(`agentsmyth: version skew detected — repo-profile.yaml was written by v${profileVersion}, CLI is v${currentPkgVersion}`);
      } else {
        console.warn(`agentsmyth: version skew detected — repo-profile.yaml has no agentsmyth_version stamp (pre-dates version-stamping), CLI is v${currentPkgVersion}`);
      }
      console.warn('  Run "agentsmyth prepare" to refresh the global lifecycle definitions to the current version.');
      console.warn('  This warning is informational — it does not block anything.');
      // Naming what clears it matters: `prepare` is global-only by design and writes no repo-level
      // file, so following the line above never removes this warning. Saying only "prepare does not
      // update repo-profile.yaml" left the reader with advice that cannot work and no alternative —
      // found by rehearsing a real 1.0.0 -> current upgrade, where the warning survived prepare and
      // every subsequent check.
      console.warn('  It persists until this repo\'s own agentsmyth_version stamp is updated, which');
      console.warn('  prepare deliberately does not do — it is global-only and writes no repo files.');
      console.warn('  Run "agentsmyth upgrade" to bring this repo current — it refreshes the global');
      console.warn('  definitions, updates the stamp, and brings the files agentsmyth scaffolded here');
      console.warn('  up to date, preserving anything you edited. That is the command that clears this.');

      // WP-R8 R8: a skew warning that leads nowhere is what this used to be. Now the newer
      // version's config surfaces get proposed as pending-setup items, which the router's existing
      // session-start pass picks up — inspect first, then one batched ask. Deliberately
      // non-blocking: until the items resolve, every value falls back to the global install, so a
      // repo that ignores the prompt entirely behaves exactly as it did before upgrading.
      try {
        const configDirForItems = join(checkRoot, 'workflow', 'config');
        const added = appendIntentPendingItems(configDirForItems)
          + appendCouncilTuningPendingItems(configDirForItems);
        if (added > 0) {
          console.warn(`  Added ${added} per-repo tuning item(s) to workflow/config/pending-setup.yaml for this version.`);
          console.warn('  Your agent will offer to resolve them at the start of the next session. Until then, behavior is unchanged.');
        }
      } catch (e) {
        // Non-fatal: a proposal that cannot be written must never block the gate. But it is
        // reported, not swallowed — a silent catch here already hid one real bug during Build.
        console.warn(`  (could not write per-repo tuning items to pending-setup.yaml: ${e.message})`);
      }

      console.warn('');
    }
  } catch { /* non-fatal */ }

  // `--staged` routes to the fast pre-commit coverage proxy (invoked by the mandatory local git
  // hook) instead of the full lifecycle gate validator.
  const args = process.argv.slice(3);
  const stagedIdx = args.indexOf('--staged');
  const validatorFilename = stagedIdx !== -1 ? 'check-commit-coverage.mjs' : 'check-lifecycle.mjs';
  const forwardedArgs = stagedIdx !== -1 ? [...args.slice(0, stagedIdx), ...args.slice(stagedIdx + 1)] : args;

  // Setup-completeness gate (folded in so an agent can't silently skip past incomplete setup —
  // previously check-setup-complete.mjs was only ever invoked manually via src/setup/SKILL.md
  // Phase 4, so nothing forced it to run). Its own checks are self-gating: a genuinely complete
  // repo (no placeholders, .agentsmyth/ gone, adapter present) passes trivially, so running it on
  // every invocation is safe, not just during active setup. Scoped out of `--staged` — that path
  // is deliberately the fast, narrow pre-commit proxy; setup-completeness is a different concern
  // and would slow down every commit for no benefit once a repo is genuinely set up.
  let setupCompleteFailed = false;
  if (stagedIdx === -1) {
    const { resolved: resolvedSetupComplete } = resolveValidator(checkRoot, profilePath, 'check-setup-complete.mjs');
    if (resolvedSetupComplete) {
      try {
        execFileSync(process.execPath, [resolvedSetupComplete], { stdio: 'inherit', cwd: checkRoot });
      } catch {
        setupCompleteFailed = true;
      }
    }
  }

  const { resolved: resolvedValidator, candidates } = resolveValidator(checkRoot, profilePath, validatorFilename);

  if (!resolvedValidator) {
    console.error(`agentsmyth: could not locate ${validatorFilename} in any of:`);
    for (const c of candidates) console.error(`  ${c}`);
    console.error('Run "agentsmyth prepare" to install the global lifecycle definitions.');
    process.exit(1);
  }

  let lifecycleFailed = false;
  try {
    execFileSync(process.execPath, [resolvedValidator, ...forwardedArgs], { stdio: 'inherit', cwd: checkRoot });
  } catch (e) {
    lifecycleFailed = true;
  }
  process.exit(setupCompleteFailed || lifecycleFailed ? 1 : 0);
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

if (command !== 'init' && command !== 'upgrade') {
  console.error(`Unknown command: ${command}`);
  console.error('Run "agentsmyth help" for usage.');
  process.exit(1);
}

// ─── shared helpers ────────────────────────────────────────────────────────

// ─── WP-R8: intent-layer pending-setup items ────────────────────────────────
// The intent block (repo_character, surface_map, concerns) is what a person can actually answer;
// the agent derives the numeric `tuning:` values from it. These items are seeded by `init` for a
// fresh repo and appended on version skew for a repo that predates the block — both paths hand off
// to the SAME resolution pass the router already runs at every session start (inspect first, then
// one batched ask). No new mechanism, and nothing blocks: until these resolve, every value falls
// back to the global install and behavior is exactly what it is today.
//
// Ordered so inference-resolvable items come first — the agent settles repo_character and
// surface_map from the repo itself, which then supplies a recommended default for concerns, so the
// only genuinely human question arrives with a proposed answer rather than cold.
// Declared as a hoisted function, not a `const` array, deliberately: the `check` command runs
// near the top of this file and calls appendIntentPendingItems() from there. A `const` would sit
// in the temporal dead zone at that point and throw ReferenceError — which is exactly what
// happened during Build, and the caller's try/catch swallowed it into a silent no-op.
function intentItemSpecs() {
  return [
  {
    field: 'intent.repo_character',
    question: 'What kind of repo is this — frontend-app, backend-service, library, cli, monorepo, infrastructure, or mixed? This supplies the default answer for every concern below.',
    hint: 'Infer from package.json dependencies (react/vue/next → frontend-app; express/fastify/nest → backend-service), a bin field or cmd/ dir (cli), workspaces/packages/ (monorepo), or terraform/k8s manifests (infrastructure). Do not ask if the repo answers this plainly.',
  },
  {
    field: 'intent.surface_map',
    question: 'Where do UI, API, schema, and hot-path files actually live in this repo? Any category that does not apply can be left empty.',
    hint: 'Infer from real directories — components/, views/, screens/ (ui); routes/, api/, controllers/ (api); migrations/, models/, schema/ (schema). Only ask about categories inference cannot settle.',
  },
  {
    field: 'intent.concerns',
    question: 'How much scrutiny does each concern area deserve here — architecture, code_quality, api_contracts, data_schema, ui_ux, performance, repo_alignment, constraints_safety? Each is not-applicable, light, standard, or strict. Propose a full map derived from repo_character and ask only for confirmation or corrections.',
    hint: 'standard reproduces current behavior for every area, so it is the safe default. repo_alignment and constraints_safety cannot be not-applicable. ui_ux is commonly not-applicable for a cli or library; data_schema for a repo with no persistence.',
  },
  ];
}

// Council fan-out is a per-phase cost decision, and the one config value that bills the user on
// every Complex chain. It gets its own item family rather than joining the intent block: intent is
// what a person answers so the agent can DERIVE numbers, whereas this is the number itself, and the
// idempotency guard below keys off the field prefix — a council item hidden behind the `intent.`
// marker would never be appended to a repo that already resolved its intent items.
function councilTuningItemSpecs() {
  return [
    {
      field: 'tuning.council.per_phase',
      question: 'How many council members should Think and Review each dispatch on Complex work? Defaults are 3 for Think and 2 for Review; lower numbers cost less per chain. Leave unset to inherit both.',
      hint: 'Only ask if the repo runs Complex work often enough for the cost to matter. Merged per entry — naming review alone leaves think at the global value. Set 1 to make a phase effectively single-agent without disabling councils outright.',
    },
  ];
}

// PS-1..PS-8 are the full set headlessBootstrap can emit; the conditional ones leave gaps rather
// than shifting the numbering, so the derived blocks start at 9.
//
// A hoisted FUNCTION, not a const — for the same reason intentItemSpecs() is one. headlessBootstrap
// runs from a call site above this point in the file, so a const would sit in the temporal dead
// zone and throw ReferenceError. The file already carries that warning; I reintroduced the bug it
// describes and the interop suite caught it on the next run.
function intentStartId() { return 9; }

// Renders item specs as pending-setup.yaml entries starting at PS-<startId>. IDs are never
// reused or renumbered, so callers pass the next free number.
function pendingItemsFrom(specs, startId) {
  return specs.map((item, index) => {
    // `config` was hardcoded to repo-profile.yaml, which was true for every family that existed
    // (intent and council tuning both target it) and silently wrong for the first one that does
    // not. A reconcile item for verification.yaml MUST say `config: verification.yaml` — the
    // router reads that field to know what it is being asked about.
    // Every interpolated value is quoted and escaped, not just question and hint.
    //
    // backup_path, migration_id, upgrade_from and upgrade_to were written as raw unquoted scalars,
    // so a value carrying a colon, a quote or a newline produced a malformed document — and under a
    // poisoned `written_by_version` the traversal-laden path was echoed straight into instruction
    // text an agent later reads and acts on. The manifest reader now rejects that input at source,
    // but the class does not depend on it: this renderer must be safe for any value reaching it.
    const yamlScalar = (value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, "'").replace(/[\r\n]+/g, ' ')}"`;
    const lines = [
      `  - id: PS-${startId + index}`,
      `    config: ${item.config ?? 'repo-profile.yaml'}`,
      `    field: ${yamlScalar(item.field)}`,
      `    question: ${yamlScalar(item.question)}`,
      `    hint: ${yamlScalar(item.hint)}`,
    ];
    for (const key of ['backup_path', 'migration_id', 'upgrade_from', 'upgrade_to']) {
      if (item[key]) lines.push(`    ${key}: ${yamlScalar(item[key])}`);
    }
    lines.push('    status: open');
    return lines.join('\n');
  });
}

// Allocates `count` PS ids and returns the starting id plus the file content with its high-water
// mark advanced.
//
// Allocation used to be max(present ids) + 1, which is correct only while nothing is ever removed.
// Prune PS-9 from a file holding PS-1..PS-9 and the next allocation hands out PS-2 — an id that
// already existed and was pruned, in a file whose schema says ids are never renumbered. Nothing
// caught it because no family was transient enough to prune. Reconcile items are: the user merges
// the backup, the agent resolves the item, and a mature repo removes it — which the `items: []`
// branch below explicitly calls the steady state.
//
// `next_id` is optional, so a file that has never been pruned behaves exactly as before.
//
// THE ONE CASE THIS CANNOT FIX, stated rather than papered over. `next_id` stops recurrence; it
// cannot see backwards. For any pre-1.1.0 file that had an item resolved and PRUNED before the
// field existed, that item left no trace in the document at all — resolved-but-still-present items
// are matched by the `present` sweep below, pruned ones are not — so the first allocation computes
// max(present) + 1 and may hand out a number that already belonged to a different, resolved item.
// One collision per repo, self-healing afterwards, in a file whose schema says ids are never reused.
//
// Nothing in the file can recover the lost high-water mark, so there is no fix here, only a choice
// between silent and visible. The caller announces it once, at the moment the field is introduced,
// which is the only moment the ambiguity exists.
function allocatePendingId(content, count) {
  const present = [...content.matchAll(/^\s*-\s*id:\s*PS-(\d+)/gm)].map((m) => Number(m[1]));
  const declared = Number(content.match(/^next_id:\s*(\d+)/m)?.[1] ?? 0);
  const introducing = !/^next_id:/m.test(content);
  const start = Math.max(declared, present.length > 0 ? Math.max(...present) + 1 : 1);
  const advanced = start + count;

  const updated = /^next_id:/m.test(content)
    ? content.replace(/^next_id:.*$/m, `next_id: ${advanced}`)
    : content.replace(/^(kind:\s*pending-setup\s*)$/m, `$1\nnext_id: ${advanced}`);

  return { start, content: updated, introducing };
}

// Says out loud, once, that an id MIGHT be a reuse — see allocatePendingId()'s closing note. Only
// on the run that introduces `next_id`, because that is the only run where the answer is unknowable;
// every run after it reads a recorded high-water mark and is exact.
function warnOnFirstNextId(alloc, pendingPath) {
  if (!alloc.introducing) return;
  console.warn(`  (note: ${pendingPath} predates the next_id high-water mark, so PS-${alloc.start} is`);
  console.warn('   derived from the ids still present. If an item was resolved and pruned from this file');
  console.warn('   before now, that number may repeat one. From this write on, ids are exact.)');
}

// Appends one item family to an EXISTING pending-setup.yaml that lacks it — the upgrade path for a
// repo set up before that family existed. Idempotent per family: a file already mentioning the
// family's marker is left alone, so re-running `check` never duplicates items or resurrects ones
// the user resolved or waived. Each family carries its OWN marker, so adding a family later reaches
// repos that already resolved the earlier ones. Returns the number of items added.
function appendPendingItems(configDir, specs, marker) {
  const pendingPath = join(configDir, 'pending-setup.yaml');
  if (!existsSync(pendingPath)) return 0;

  const content = readFileSync(pendingPath, 'utf8');
  if (content.includes(marker)) return 0;

  // Appending a sequence entry is only valid if the document actually ends in an `items:` block
  // that can take one. Proven by a positive line scan rather than by regex subtraction: the previous
  // guard tried to show "nothing follows items:" by stripping the block and testing the remainder,
  // and the stripping was wrong. A schema-valid file whose top-level keys are ordered `items:` first
  // passed it, so the appended entries landed after `kind:` and the parser then rejected the whole
  // file — corrupting a consumer config on upgrade, which is the exact outcome this guard exists to
  // prevent.
  const lines = content.replace(/\s*$/, '').split('\n');
  const itemsIdx = lines.findIndex((l) => /^items:/.test(l));
  const emptySequence = itemsIdx !== -1 && /^items:\s*\[\s*\]\s*$/.test(lines[itemsIdx]);
  // A top-level key after the block means an append would be inserted into the wrong document
  // position. Only top-level keys matter: sequence entries and their nested mappings are indented.
  const keyFollowsItems = itemsIdx !== -1 && lines.slice(itemsIdx + 1).some((l) => /^[A-Za-z_]/.test(l));

  // Refusing is right; refusing SILENTLY is not. The same argument the `items: []` branch below
  // makes for its own case applies here: a repo whose pending-setup.yaml is shaped this way can
  // never be offered this family, on this upgrade or any later one, because the marker never lands —
  // and nothing ever told anyone. The append is the only part that is unsafe; saying so is not.
  if (itemsIdx === -1 || keyFollowsItems) {
    const reason = itemsIdx === -1
      ? 'it has no top-level "items:" key'
      : 'a top-level key follows the "items:" block, so an appended entry would land in the wrong document position';
    console.warn(`  (skipped adding the "${marker}" item family to ${pendingPath}: ${reason})`);
    console.warn('   Nothing was written. Add the items by hand, or reorder the file so "items:" is last, to be offered them.');
    return 0;
  }

  // `items: []` is the steady state of a mature repo — every item resolved and pruned. Refusing it
  // silently meant such a repo could never be offered a new item family, on this upgrade or any
  // later one, and was told nothing. Rewrite the empty sequence into a block header instead, which
  // is the same document with room for the entries.
  if (emptySequence) {
    const rebuilt = [...lines];
    rebuilt[itemsIdx] = 'items:';
    const alloc = allocatePendingId(rebuilt.join('\n'), specs.length);
    warnOnFirstNextId(alloc, pendingPath);
    atomicWriteFileSync(pendingPath, `${alloc.content}\n${pendingItemsFrom(specs, alloc.start).join('\n')}\n`, undefined, configDir);
    return specs.length;
  }

  const nextId = allocatePendingId(content, specs.length);
  warnOnFirstNextId(nextId, pendingPath);
  const block = pendingItemsFrom(specs, nextId.start).join('\n');
  atomicWriteFileSync(pendingPath, `${nextId.content.replace(/\s*$/, '')}\n${block}\n`, undefined, configDir);
  return specs.length;
}

function appendIntentPendingItems(configDir) {
  return appendPendingItems(configDir, intentItemSpecs(), 'field: "intent.');
}

function appendCouncilTuningPendingItems(configDir) {
  return appendPendingItems(configDir, councilTuningItemSpecs(), 'field: "tuning.council.per_phase');
}

// Writes stub config files + pending-setup.yaml when workflow/config/ is absent.
// ─── Inference helpers for headlessBootstrap()'s widened pending-setup coverage ────────────
// Cheap existsSync/directory-listing-only detection (no new dependency, no YAML parsing of
// arbitrary CI files) — see workflow/artifacts/plans/deepen-setup-interview-v1.md's Approach for
// the full inference-vs-question design rationale (Phase 2: inference only, never a new
// question; Phase 3: a real, waivable pending-setup item where inference can't safely resolve).

function detectCiProvider(repoDir) {
  const workflowsDir = join(repoDir, '.github', 'workflows');
  if (existsSync(workflowsDir)) {
    try {
      if (readdirSync(workflowsDir).length > 0) return 'github-actions';
    } catch { /* unreadable, treat as absent */ }
  }
  const fileCandidates = [
    ['.circleci/config.yml', 'circleci'],
    ['.gitlab-ci.yml', 'gitlab-ci'],
    ['Jenkinsfile', 'jenkins'],
  ];
  for (const [path, provider] of fileCandidates) {
    if (existsSync(join(repoDir, path))) return provider;
  }
  return null;
}

function detectSensitivePaths(repoDir) {
  return ['secrets', 'credentials', 'certs', 'keys'].filter((name) => existsSync(join(repoDir, name)));
}

function detectVerificationCommands(repoDir) {
  const pkgJsonPath = join(repoDir, 'package.json');
  if (existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
      // Exclude `npm init`'s own default test stub — a real, common false positive: a fresh
      // package.json with no actual test suite still has a "test" script, and treating it as a
      // resolved verification command would be worse than asking, not better.
      const found = ['test', 'build', 'lint']
        .filter((script) => pkg.scripts?.[script] && !pkg.scripts[script].includes('no test specified'))
        .map((script) => `npm run ${script}`);
      if (found.length > 0) return found;
    } catch { /* malformed package.json, fall through to Makefile */ }
  }
  const makefilePath = join(repoDir, 'Makefile');
  if (existsSync(makefilePath)) {
    try {
      const text = readFileSync(makefilePath, 'utf8');
      const found = ['test', 'build', 'lint'].filter((target) => new RegExp(`^${target}:`, 'm').test(text)).map((target) => `make ${target}`);
      if (found.length > 0) return found;
    } catch { /* unreadable, fall through */ }
  }
  return [];
}

// "Auto-resolved" category (see headlessBootstrap()'s own comment on the 3-tier design): every
// category here always ends up with a real value (found names, or an honest empty array if
// nothing matched) — never a stuck placeholder, since a repo legitimately lacking a distinct
// docs/ root, say, is a valid outcome, not a resolution failure worth hard-blocking on.
function detectKeyPaths(repoDir) {
  let entries = [];
  try {
    entries = readdirSync(repoDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  } catch { /* leave empty */ }
  return {
    sourceRoots: ['src', 'lib', 'app', 'pkg', 'cmd'].filter((n) => entries.includes(n)),
    testRoots: ['test', 'tests', 'spec'].filter((n) => entries.includes(n)),
    docsRoots: ['docs'].filter((n) => entries.includes(n)),
  };
}

// Infers what it can (default branch); marks the rest <USER-TODO> in pending-setup.yaml.
// Never overwrites existing files. Returns the inferred default branch string.
//
// pending-setup coverage is deliberately 3-tier (deepen-setup-interview-v1), not uniform:
//   1. Hard-gated: a literal <PLACEHOLDER> is left in the config, check-setup-complete.mjs
//      (folded into `agentsmyth check`) hard-fails until it's resolved. Used only where no
//      value at all would misrepresent reality (domain identity, the primary verification
//      command when nothing is inferable, source-of-truth).
//   2. Soft-tracked: a pending-setup.yaml item exists but no config placeholder backs it — the
//      config keeps a safe, honest default; check-pending-setup.mjs reports it as open but never
//      hard-blocks (release-process existence, additional risk/non-goal constraints).
//   3. Auto-resolved: inference always produces a final answer (real values or an honest empty
//      list), no question needed at all in the fully-determined case (key paths).
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

  const ciProvider = detectCiProvider(repoDir);
  const sensitivePaths = detectSensitivePaths(repoDir);
  const verificationCommands = detectVerificationCommands(repoDir);
  const keyPaths = detectKeyPaths(repoDir);
  const keyPathsFoundNothing = keyPaths.sourceRoots.length === 0 && keyPaths.testRoots.length === 0 && keyPaths.docsRoots.length === 0;

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

      // Phase 2 (inference-only): widen the generic protected-path floor with any sensitive
      // directories actually found — purely additive, never removes the existing 3 defaults.
      if (sensitivePaths.length > 0) {
        const extra = sensitivePaths.map((p) => `    - pattern: ${p}/**\n      reason: detected sensitive directory`).join('\n');
        content = content.replace(
          `    - pattern: '**/*secret*'\n      reason: potential secrets\n`,
          `    - pattern: '**/*secret*'\n      reason: potential secrets\n${extra}\n`
        );
      }

      // Auto-resolved tier: always ends with a real value (found names, or an honest empty
      // array) — never leaves the placeholder sentinel stuck.
      content = content.replace('source_roots: ["<PLACEHOLDER>"]', `source_roots: [${keyPaths.sourceRoots.map((p) => `"${p}"`).join(', ')}]`);
      content = content.replace('test_roots: ["<PLACEHOLDER>"]', `test_roots: [${keyPaths.testRoots.map((p) => `"${p}"`).join(', ')}]`);
      content = content.replace('docs_roots: ["<PLACEHOLDER>"]', `docs_roots: [${keyPaths.docsRoots.map((p) => `"${p}"`).join(', ')}]`);
    }

    // Phase 2 (inference-only): CI-gate reality. If no CI config is found, the existing silent
    // default (required: false, provider: none) is already an accurate reflection — left as-is.
    if (name === 'release.yaml' && ciProvider) {
      content = content.replace('  ci:\n    required: false\n    provider: none', `  ci:\n    required: true\n    provider: ${ciProvider}`);
    }

    // Phase 2 (inference-only): enumerate every detected script/target rather than only the
    // first one — the previous behavior (PS-3 alone) only ever captured one command.
    if (name === 'verification.yaml' && verificationCommands.length > 0) {
      const entries = verificationCommands.map((cmd) => {
        const id = cmd.replace(/^(npm run |make )/, '');
        return `  - id: ${id}\n    command: "${cmd}"\n    cwd: .\n    required: true\n    phases: [review, ship]`;
      }).join('\n');
      content = content.replace('commands: []', `commands:\n${entries}`);
    }

    writeFileSync(dest, content);
  }

  // Write definitions_root into the stub repo-profile.yaml — reuses the same
  // insertion logic `init` and `prepare`-linked repos already rely on, rather than
  // duplicating the repository:/learnings_sessions_root: anchor-matching here.
  // The portable literal (not globalWorkflowDir, the expanded path used above for existsSync
  // checks) is what gets committed — see PORTABLE_DEFINITIONS_ROOT's own comment (OI-52).
  writeDefinitionsRoot(repoDir, PORTABLE_DEFINITIONS_ROOT, pkgVersion);

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
    // PS-3 only fires when inference found no verification command at all — a repo whose
    // package.json/Makefile already yielded real commands[] entries has nothing left to ask.
    const verificationItem = verificationCommands.length === 0 ? [
      `  - id: PS-3`,
      `    config: verification.yaml`,
      `    field: "commands[0].command"`,
      `    question: "What command confirms the repo is healthy (build, test, lint)?"`,
      `    hint: "Check Makefile, package.json scripts, or CI config"`,
      `    status: open`,
    ].join('\n') : null;
    // Auto-resolved tier (PS-5): the config already carries real values or an honest [] for
    // every category by this point — this item is purely advisory (never hard-blocks via
    // check-setup-complete.mjs), surfaced only in the fully-blind case as a nudge to double-check
    // the directory-name heuristic didn't just miss an unconventional layout.
    const keyPathsItem = keyPathsFoundNothing ? [
      `  - id: PS-5`,
      `    config: repo-profile.yaml`,
      `    field: "paths.source_roots[] / paths.test_roots[] / paths.docs_roots[]"`,
      `    question: "What are this repo's key directories — source root, test root, docs root (if distinct from repo root)? An empty list for any category that doesn't apply is fine."`,
      `    hint: "Check top-level directories for src/, lib/, app/, pkg/, cmd/ (source); test/, tests/, spec/ (tests); docs/ (docs)."`,
      `    status: open`,
    ].join('\n') : null;
    // Hard-gated tier (PS-6): source-of-truth.yaml ships with a placeholder providers[0] entry;
    // resolving means either filling it in or reverting to providers: [] (a valid, common answer
    // for repos with no formal tracking) — either way, check-setup-complete.mjs blocks until this
    // is actively resolved, not silently defaulted.
    const sourceOfTruthItem = [
      `  - id: PS-6`,
      `    config: source-of-truth.yaml`,
      `    field: "source_of_truth.providers[0].type / source_of_truth.providers[0].location"`,
      `    question: "Where are requirements or decisions tracked for this repo, if anywhere (issue tracker, ADR folder, wiki, Notion, etc.)? 'Nowhere formal' is a valid answer — resolve by reverting providers to an empty list."`,
      `    hint: "Check README.md/CONTRIBUTING.md for a linked project management tool, or a docs/adr/ or docs/decisions/ folder."`,
      `    status: open`,
    ].join('\n');
    // Soft-tracked tier (PS-7): no config placeholder backs this — release.yaml keeps its safe
    // default (required: false) until this item is answered or waived; check-pending-setup.mjs
    // reports it as open but check-setup-complete.mjs does not hard-fail on it.
    const releaseProcessItem = [
      `  - id: PS-7`,
      `    config: release.yaml`,
      `    field: "release.required"`,
      `    question: "Does this repo have a formal release process — versioned publish, tagged deploy, etc.? 'No formal process' is valid and common."`,
      `    hint: "Check package.json version/publish scripts, CHANGELOG.md, or tagged releases (git tag -l)."`,
      `    status: open`,
    ].join('\n');
    // Soft-tracked tier (PS-8): same as PS-7 — domain.yaml's existing generic constraints stay
    // as real (non-placeholder) content; this only prompts for an optional addition.
    const risksItem = [
      `  - id: PS-8`,
      `    config: domain.yaml`,
      `    field: "constraints.product[] / constraints.safety[]"`,
      `    question: "Anything specific the AI agent should never do in this repo, beyond the generic defaults already listed? 'No additional constraints' is a valid answer."`,
      `    hint: "Consider sensitive modules, migrations, payment/auth code, or anything requiring human review before automated changes."`,
      `    status: open`,
    ].join('\n');
    const items = [
      [`  - id: PS-1`, `    config: domain.yaml`, `    field: "domain.name"`, `    question: "What is the name of the domain or product this repo serves?"`, `    hint: "Check README.md or package.json description"`, `    status: open`].join('\n'),
      [`  - id: PS-2`, `    config: domain.yaml`, `    field: "domain.summary"`, `    question: "Describe the domain in one sentence for lifecycle artifacts."`, `    hint: "Check README.md"`, `    status: open`].join('\n'),
      ...(verificationItem ? [verificationItem] : []),
      ...(branchItem ? [branchItem] : []),
      ...(keyPathsItem ? [keyPathsItem] : []),
      sourceOfTruthItem,
      releaseProcessItem,
      risksItem,
      // WP-R8 intent items last, so the file reads PS-1..PS-11 in order. IDs 9-11 are fixed here
      // because PS-1..PS-8 are the full set this bootstrap can emit; the conditional ones
      // (PS-3/4/5) leave gaps when they don't fire rather than shifting the numbering.
      ...pendingItemsFrom(intentItemSpecs(), intentStartId()),
      // Council fan-out, immediately after the intent block. The start id is DERIVED from the
      // intent block's length rather than written as a literal: a literal was correct only for as
      // long as intentItemSpecs() returned exactly three, and adding a fourth would have silently
      // produced two items sharing an id, in a file whose contract says ids are never reused.
      ...pendingItemsFrom(councilTuningItemSpecs(), intentStartId() + intentItemSpecs().length),
    ].filter(Boolean);
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

// ─── WP-R18: provenance primitives ──────────────────────────────────────────
// Read/write side of workflow/provenance.yaml, plus the hashing and atomic-write helpers the
// upgrade path is built on. Phase 1 adds the primitives only — nothing here is wired to a call
// site yet, so observable CLI behavior is unchanged until Phase 2 records the first baseline.
//
// Every function below is a hoisted `function` declaration, and the format version is a function
// rather than a `const`, for the reason intentStartId() already records in this file: helpers here
// are called from `check` near the top of the file, where a `const` would sit in the temporal dead
// zone and throw ReferenceError.

function provenanceFormatVersion() { return 1; }

// A version string agentsmyth itself could have written.
//
// Load-bearing for security, not tidiness. The manifest's `written_by_version` reaches writeBackup()
// as a PATH SEGMENT, and join() collapses `../` — so an unvalidated
// `written_by_version: ../../../../tmp/x` redirected the real content of every drifted governed file
// anywhere the process could write. The same pull request that plants the field also controls the
// governed file's content and its recorded (mismatched) digest, so path AND payload were both
// attacker-chosen through one change to a file whose only defence was a comment saying not to edit
// it by hand.
//
// Rejecting rather than sanitising is the whole point: a manifest that does not carry a version
// string is not a manifest agentsmyth wrote, and normalising one into something path-safe would be
// pretending otherwise. The same predicate bounds the backup-supersede sweep, so "a directory
// agentsmyth created" is a closed, checkable set rather than "whatever is under the backup root".
const VERSION_STRING_RE = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z][0-9A-Za-z.-]*)?$/;
function isVersionString(value) {
  return typeof value === 'string' && VERSION_STRING_RE.test(value);
}

// A repo-relative path a manifest entry may name. Rejects absolute paths, any `..` segment, and
// Windows drive letters — the traversal check that lived only in check-lifecycle.mjs, which
// `agentsmyth upgrade` never invokes, so the guarantee sat on the reporting path rather than on the
// path that performs the writes.
function isSafeRelPath(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (value.startsWith('/') || /^[A-Za-z]:/.test(value)) return false;
  return !value.split('/').includes('..');
}

// Reads the running package's version. A helper rather than an inline JSON.parse because three
// call sites need it and one of them (the init flow) runs at top level where a `const` computed
// earlier in the file would already have been consumed by a different scope.
function pkgVersionForProvenance(pkgRootDir) {
  return JSON.parse(readFileSync(join(pkgRootDir, 'package.json'), 'utf8')).version;
}

function provenanceNormalization() { return 'lf-single-trailing-newline'; }

// The declared normalization, applied before every digest. Line endings collapse to LF and the
// file ends in exactly one newline.
//
// This exists because the repo ships no `.gitattributes` — nothing anywhere states a line-ending
// contract — so a Windows checkout under `core.autocrlf=true` would otherwise change every byte of
// every governed file and read as a user edit on all of them, on the first upgrade, for every
// Windows consumer. Deliberately narrow: it does NOT strip trailing whitespace within a line, only
// line endings and trailing blank lines, so the transformation matches the name recorded in the
// manifest rather than quietly doing more than it claims.
function normalizeForHash(raw) {
  return raw.replace(/\r\n/g, '\n').replace(/\n*$/, '') + '\n';
}

function digestContent(raw) {
  return createHash('sha256').update(normalizeForHash(raw), 'utf8').digest('hex');
}

// Returns null for an absent or unreadable file rather than throwing. The caller decides what
// absence means — for an upgrade it is a re-create, not a drift, and those must stay
// distinguishable (a deleted file and an edited file are different states).
function digestFile(filePath) {
  try {
    return digestContent(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

// The first atomic write in this codebase. Every other write in this file is a truncating
// `writeFileSync`, which leaves a half-written, schema-invalid file if the process dies mid-write.
// That is tolerable for a scaffold that runs once; it is not tolerable for an upgrade that rewrites
// a config the consumer is already depending on.
//
// Temp file lives in the SAME directory as the target on purpose: rename(2) is namespace-scoped and
// fails EXDEV across mount points, so a temp in os.tmpdir() would break on any repo living on a
// different filesystem than /tmp.
//
// This buys atomicity against process crash and against concurrent readers — a reader sees the
// whole old file or the whole new one, never a torn one. It does NOT buy power-loss durability,
// which needs fsync of the file before the rename and of the directory after, and the directory
// half is not portable to Windows. That is a declared non-goal, not an oversight.
// True when `candidate` resolves inside `rootDir`, `rootDir` itself counting as inside. Segment
// comparison via relative(), not a string prefix test: "/repo-backup" starts with "/repo" and is
// not inside it.
function isInside(rootDir, candidate) {
  const rel = relative(resolve(rootDir), resolve(candidate));
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

function atomicWriteFileSync(filePath, content, options, boundary) {
  // Resolve a symlink to its target before writing. Renaming over a link severs it and orphans the
  // shared file it pointed at — and symlinked shared config is exactly the shape a polyrepo-member
  // workspace uses, so this is not a hypothetical.
  //
  // Resolving is not enough on its own, and shipping it without the fence below turned every write
  // path in this file into an arbitrary-file-overwrite primitive: a checked-in symlink at a
  // governed path (git preserves those across clone — verified) redirected the write anywhere the
  // process could reach. Every caller therefore declares the directory the resolved target must
  // stay inside, and a symlink is followed only that far. A caller passing no boundary gets no
  // dereference at all: refusing is the safe default, because the case that needs one is the
  // exception and the case that does not is every other write in this file.
  let isLink = false;
  try {
    isLink = lstatSync(filePath).isSymbolicLink();
  } catch { /* absent — a new write, nothing to resolve */ }

  let target = filePath;
  if (isLink) {
    if (!boundary) {
      throw new Error(`${filePath} is a symbolic link and this write declares no containment boundary; refusing to follow it`);
    }
    // A dangling link has no target to contain, so it cannot be shown safe and is refused rather
    // than written through. realpathSync is the only thing that can throw here.
    let real;
    try {
      real = realpathSync(filePath);
    } catch (err) {
      throw new Error(`${filePath} is a symbolic link that does not resolve (${err.message}); refusing to write through it`);
    }
    if (!isInside(boundary, real)) {
      throw new Error(`${filePath} is a symbolic link resolving to ${real}, which is outside ${boundary}; refusing to write through it`);
    }
    target = real;
  }

  const dir = dirname(target);
  mkdirSync(dir, { recursive: true });
  const tmp = join(dir, `.${basename(target)}.${process.pid}.tmp`);

  // Carry the existing mode onto the replacement. A temp file is created 0644, so without this an
  // upgrade silently strips the executable bit from anything it rewrites.
  let mode = options?.mode;
  if (mode === undefined) {
    try { mode = statSync(target).mode & 0o777; } catch { /* new file — default applies */ }
  }

  try {
    writeFileSync(tmp, content, mode === undefined ? options : { ...options, mode });
    renameSync(tmp, target);
  } catch (err) {
    try { rmSync(tmp, { force: true }); } catch { /* best effort — the throw below is what matters */ }
    throw err;
  }
}

// True when the working tree has uncommitted changes, false when clean, null when the question does
// not apply (not a git repo, or git is unavailable). Three-valued deliberately: "not a git repo" and
// "clean" are different answers and warning on the first would be noise.
function gitWorkingTreeDirty(repoDir) {
  try {
    const out = execFileSync('git', ['status', '--porcelain'], {
      cwd: repoDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    });
    return out.trim().length > 0;
  } catch {
    return null;
  }
}

// Which git working tree a path belongs to. Returns null outside a repo.
//
// FOURTH hand-synced copy of git-root logic in this project, alongside lib.mjs's _resolveRepoRoot,
// check-setup-complete.mjs's, and resolveExistingRepoRoot() above. That is real duplication debt and
// is recorded as such in the task artifact. The alternative — importing lib.mjs here — would pull
// its module-level definitions_root guard, which can process.exit(1), into the CLI entrypoint;
// check-setup-complete.mjs:1-12 documents avoiding lib.mjs for exactly that reason.
//
// NOT the same function as lib.mjs's resolveGitCwd(), despite the plan naming that one: that takes
// an artifact's frontmatter and returns repoRoot unless the artifact declares `target_repo`. An
// upgrade has no artifact, so it needs this instead.
function resolveGitRoot(startDir) {
  try {
    const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: startDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return root || null;
  } catch {
    return null;
  }
}

// The manifest sits beside the config set it describes, so one config set has exactly one
// manifest. Deliberately NOT under workflow/config/: check-config.mjs walks that directory
// recursively, so anything parked there is schema-validated — including, later, a backup of an
// old-schema document, which would fail the first time a schema tightens.
function provenancePath(repoDir) {
  return join(repoDir, 'workflow', 'provenance.yaml');
}

// Backups follow a git working tree, not repoDir. In single-repository and monorepo modes those
// are the same directory and `git rev-parse` from repoDir answers correctly.
//
// In polyrepo-member they are NOT the same, and the previous version of this comment claimed a
// guarantee the code could not produce. There, repoDir IS `workspace_root`, which by that mode's
// own definition lies outside every git repo — so `git rev-parse` run from it fails, the `?? repoDir`
// fallback fires, and the backup lands at exactly the untracked location the comment said this
// logic avoids. RI21's acceptance (visible to `git status` in the member repo) went unmet while the
// comment asserted the opposite.
//
// So the polyrepo case resolves through a declared member repo instead. `sibling_repos[].path` in
// repo-profile.yaml names the working trees; the first one that is a real git repo takes the
// backups, because a backup that is reviewable in SOME member tree beats one that is reviewable in
// none. When no member resolves, the fallback stands and says so out loud rather than silently
// producing an untracked file.
function backupRoot(repoDir) {
  const direct = resolveGitRoot(repoDir);
  if (direct) return join(direct, 'workflow', 'backups');

  for (const memberDir of siblingRepoDirs(repoDir)) {
    const root = resolveGitRoot(memberDir);
    if (root) return join(root, 'workflow', 'backups');
  }

  console.warn('  (note: no git working tree resolved for backups — they will be written to');
  console.warn(`   ${join(repoDir, 'workflow', 'backups')}, which "git status" cannot see)`);
  return join(repoDir, 'workflow', 'backups');
}

// Absolute paths of the member repos a polyrepo-member workspace declares. Empty for every other
// mode, and empty when the profile cannot be read — a caller that gets nothing back falls through
// to its own default rather than being told a lie.
function siblingRepoDirs(repoDir) {
  const profile = join(repoDir, 'workflow', 'config', 'repo-profile.yaml');
  if (!existsSync(profile)) return [];
  let content;
  try { content = readFileSync(profile, 'utf8'); } catch { return []; }
  const entries = extractYamlList(content, 'repository.sibling_repos');
  if (!Array.isArray(entries)) return [];
  return entries
    .map((e) => (typeof e === 'object' && e !== null ? e.path : null))
    .filter((v) => typeof v === 'string' && v.length > 0)
    .map((v) => (isAbsolute(v) ? v : join(repoDir, v)));
}

// The governed set (RI18, widened from five configs to eight artifacts by the user's Q3 answer).
// Returns repo-relative paths, forward-slash separated, for the artifacts that actually exist —
// an artifact agentsmyth chose not to place on this platform is not governed, and must not appear
// in the manifest as a missing entry.
//
// `AGENTS.md` is deliberately EXCLUDED. It already carries in-band provenance via its versioned
// `<!-- agentsmyth:X.Y.Z BEGIN -->` marker, which placeAgentsMd() reads and rewrites. Giving it a
// hash entry as well would create two provenance mechanisms for one file that can disagree, and
// the disagreement would be silent.
//
// `pending-setup.yaml` is also excluded, for a sharper reason: the CLI appends to it itself, on
// the very upgrade that would be hashing it. Its digest is guaranteed to drift, so governing it
// would flag it as user-edited on every single upgrade — exactly the outcome the manifest exists
// to prevent.
// True when `filePath` sits inside the repository's `.git` directory. Compares resolved path
// SEGMENTS rather than doing a substring test, so a legitimately-named directory such as
// `tools/.github-actions/` or a repo whose own name contains ".git" is not mistaken for git
// metadata. Works for an absolute `core.hooksPath` outside the repo too, which simply is not inside
// this repo's `.git` and is therefore governable.
function isInsideGitDir(repoDir, filePath) {
  const rel = relative(resolve(repoDir), resolve(filePath));
  if (rel.startsWith('..')) return false;
  return rel.split(sep).includes('.git');
}

function governedArtifacts(repoDir, hookPath) {
  const candidates = [];
  for (const name of ['domain.yaml', 'release.yaml', 'repo-profile.yaml', 'source-of-truth.yaml', 'verification.yaml']) {
    candidates.push(join(repoDir, 'workflow', 'config', name));
  }
  // The pre-commit hook is governed ONLY when it lives outside `.git/`.
  //
  // Q3 put the enforcement gate in the governed set. Refreshing it IS unconditional — but that
  // happens in refreshEnforcementSurfaces(), deliberately outside this list, because for a while it
  // did not: the refresh was routed through this function's output and a hook in `.git/hooks` is not
  // in it, so the gate silently stopped being upgradeable for every consumer who had not set
  // `core.hooksPath`. What is conditional here is only the manifest ENTRY, because a default git
  // repo puts the hook at
  // `.git/hooks/pre-commit`, which `workflow/config/repo-profile.yaml` declares protected
  // (`pattern: .git/**`, reason: repository metadata). Recording a digest of it, and later backing
  // it up into a committed `workflow/backups/` tree, would copy protected-path content into version
  // control — which is precisely what that declaration exists to forbid.
  //
  // Nothing is lost by the exclusion. The manifest answers "did the user edit this file", and for
  // the hook the marker block already answers that by construction: content inside the markers is
  // agentsmyth's, content outside is the user's, and Phase 7 replaces only the former. A hook is
  // also fully regenerable from its template, so there is nothing to preserve that a backup would
  // preserve.
  //
  // A repo that sets `core.hooksPath` to a tracked directory — this repository itself does, via
  // `npm run hooks:install` pointing at `.githooks/` — puts the hook outside `.git/`, where it is
  // both trackable and safe to govern. Those repos get a manifest entry for it.
  if (hookPath && !isInsideGitDir(repoDir, hookPath)) candidates.push(hookPath);
  candidates.push(join(repoDir, '.cursor', 'rules', 'agentsmyth.mdc'));
  candidates.push(join(repoDir, '.github', 'copilot-instructions.md'));

  return candidates
    .filter((p) => existsSync(p))
    .map((p) => relative(repoDir, p).split(sep).join('/'));
}

function isDeterministicAdapter(rel) {
  return rel.endsWith('.mdc') || rel.endsWith('copilot-instructions.md');
}

function adapterSourceFor(pkgRootDir, rel) {
  return rel.endsWith('.mdc')
    ? join(pkgRootDir, 'src', 'assets', 'adapters', 'cursor', 'rules', 'index.mdc')
    : join(pkgRootDir, 'src', 'assets', 'adapters', 'copilot', 'copilot-instructions.md');
}

// True when the file on disk IS what agentsmyth would render there. The only authorship evidence
// available for a file that carries no markers.
//
// Compared through normalizeForHash, not with a bare `===`. The governed CONFIG path has always
// normalised — that is what `normalization: lf-single-trailing-newline` in the manifest declares,
// and the repo ships no .gitattributes, so nothing else states a line-ending contract. This path
// did not, and the asymmetry was silent and permanent: on a CRLF working tree the Cursor adapter
// never matched its LF render, so it was excluded from the manifest on every baseline and every
// upgrade, reclassified `newly-governed` each time, and left untouched with no reconcile item and no
// error. A future content change to that template could never reach a Windows consumer at all.
function matchesAdapterRender(repoDir, pkgRootDir, rel) {
  try {
    const rendered = renderAdapterTemplate(readFileSync(adapterSourceFor(pkgRootDir, rel), 'utf8'), buildAdapterTokens(repoDir));
    return normalizeForHash(readFileSync(join(repoDir, rel), 'utf8')) === normalizeForHash(rendered);
  } catch {
    return false;
  }
}

// Builds a manifest from what is on disk RIGHT NOW and writes it. This is a baseline, not a
// comparison: it asserts "this is what agentsmyth last wrote", so every caller must be at a moment
// where that is actually true.
//
// There are exactly two such moments, and missing the second is the failure this whole phase
// exists to prevent. (1) The end of `init`, once every governed artifact has been placed. (2) The
// end of the agent-driven setup skill, because setup FILLS the config files the CLI scaffolded —
// `src/setup/SKILL.md` Phase 3 rewrites all five — so a baseline taken only at (1) describes
// placeholder templates, and the repo would reach its first upgrade with every config reading as
// user-edited. A feature that exists to tell edits from staleness would then report drift on a
// repo nobody had touched.
function recordProvenanceBaseline(repoDir, pkgVersion, hookPath, pkgRootDir) {
  const entries = [];
  for (const rel of governedArtifacts(repoDir, hookPath)) {
    // Existence is not authorship. `placeDeterministicAdapters()` is skip-if-exists, and on macOS it
    // never writes the Copilot file at all — so a repo that already had its own
    // `.github/copilot-instructions.md` (a standard Copilot convention file) would otherwise have
    // that file adopted into the manifest as though agentsmyth had written it. It would then read as
    // `pristine` on the next upgrade, entirely correctly, and be replaced with template content.
    //
    // A marker-bounded file needs no such test: its markers say which span is agentsmyth's. For the
    // two markerless adapters the only available proof of authorship is that the content IS what
    // agentsmyth renders. Anything else is the user's and stays ungoverned — never hashed, never
    // backed up, never touched.
    if (pkgRootDir && isDeterministicAdapter(rel) && !matchesAdapterRender(repoDir, pkgRootDir, rel)) continue;
    const sha256 = digestFile(join(repoDir, rel));
    if (sha256) entries.push({ path: rel, sha256, written_by_version: pkgVersion });
  }
  // Carry forward any markers already raised. Re-baselining asserts a new digest truth; it does
  // NOT un-ask a question the user has already been asked. Dropping them here would make
  // `upgrade --baseline` a way to resurrect every prompt the repo had ever resolved.
  const existing = readProvenance(repoDir);
  writeProvenance(repoDir, {
    version: 1,
    kind: 'provenance',
    format_version: provenanceFormatVersion(),
    written_by_version: pkgVersion,
    normalization: provenanceNormalization(),
    reconcile_raised: existing.ok ? existing.manifest.reconcile_raised : [],
    entries,
  });
  return entries.length;
}

// Preserves the user's version of a file before anything overwrites it.
//
// Two rules, and the second is the one that is easy to get wrong.
//
// WHERE (RI7). Under `workflow/backups/`, resolved through the git working tree — never under
// `workflow/config/` and never under `workflow/artifacts/`. Both of those are walked RECURSIVELY by
// validators (`check-config.mjs` globs every `.yaml` beneath the config dir), and a backup is by
// definition an old-schema document. Parking one there would fail `npm run validate` the first time
// a schema tightened, in every consumer repo at once, for a file nobody is even using.
//
// HOW MANY (RI20). At most one per governed file, superseded in place. The version segment stays in
// the path because it is the only human-legible record of what the backup came from — but before
// writing a new one, any earlier backup of the SAME file under ANY version segment is removed.
// Without that, a consumer upgrading across five releases accumulates five full copies of every
// file they ever edited, in committed version control, with nothing owning cleanup.
//
// The delete used to be described as "deliberately narrow" — under this repo's backup root and an
// exact relpath match. That narrowness was the defect, not the safeguard. It swept EVERY top-level
// entry under `workflow/backups/`, agentsmyth's own or not, so a consumer with their own
// `workflow/backups/nightly/` tree lost any file whose relative path happened to coincide with a
// governed artifact's. Two conditions now bound it, and both are necessary:
//
//   (a) the directory name must parse as a version agentsmyth itself could have written, so the set
//       of directories this loop may touch is closed and checkable rather than "whatever is there";
//   (b) the backup must not be the one an OPEN reconcile item points at. RI20 names two deletion
//       triggers — superseded on upgrade, deleted when the item resolves — and never orders them.
//       They collide: edit, upgrade, edit again, upgrade, and the first backup is destroyed while
//       `pending-setup.yaml` still carries an open item naming it, leaving the router's step 9
//       diffing against nothing. Resolution wins. Supersession skips.
function writeBackup(repoDir, rel, fromVersion, openBackupPaths) {
  const root = backupRoot(repoDir);
  const dest = join(root, fromVersion, rel);

  // Read-side containment (the same hole as the write side). readFileSync dereferences, so a
  // governed path that is a symlink to `.env` or anything matching `**/*secret*` would otherwise
  // copy that content into `workflow/backups/` — a tree this design deliberately COMMITS. Refuse
  // anything that is not a regular file inside the repo.
  const src = join(repoDir, rel);
  const st = lstatSync(src);
  if (st.isSymbolicLink()) {
    const real = realpathSync(src);
    if (!isInside(repoDir, real)) {
      throw new Error(`${rel} is a symbolic link resolving to ${real}, outside the repository; refusing to copy it into a committed backup`);
    }
  } else if (!st.isFile()) {
    throw new Error(`${rel} is not a regular file; refusing to back it up`);
  }
  const content = readFileSync(src, 'utf8');

  // Supersede: drop this file's backup under any OTHER agentsmyth-written version segment, unless
  // an open reconcile item still points at it.
  const protectedPaths = new Set(openBackupPaths ?? []);
  if (existsSync(root)) {
    for (const versionDir of readdirSync(root)) {
      if (versionDir === fromVersion) continue;
      if (!isVersionString(versionDir)) continue; // not a directory agentsmyth wrote
      const stale = join(root, versionDir, rel);
      if (!existsSync(stale)) continue;
      if (protectedPaths.has(relative(repoDir, stale).split(sep).join('/'))) continue;
      rmSync(stale, { force: true });
    }
  }

  atomicWriteFileSync(dest, content, undefined, root);
  return relative(repoDir, dest).split(sep).join('/');
}

// Orders two dotted version strings. Numeric segment-by-segment, so 1.10.0 sorts after 1.9.0 —
// a lexical compare would get that backwards, and the first release to reach a two-digit minor
// would have silently skipped every descriptor in between.
function compareVersions(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

// Every descriptor that applies to a move from `fromVersion` to `toVersion`, in order.
//
// The version GAP is the point. A consumer who skips two releases needs both steps applied, in
// sequence, or the second descriptor operates on a shape the first was supposed to produce. So this
// returns a chain, not a single match, and orders it by `from` rather than trusting directory
// listing order.
//
// Reads from src/assets/ — see that directory's README for why the publish boundary forces it there
// rather than into src/workflow/.
function loadMigrations(pkgRootDir, fromVersion, toVersion, targetRel) {
  const root = join(pkgRootDir, 'src', 'assets', 'workflow', 'migrations');
  if (!existsSync(root)) return [];

  const found = [];
  for (const dir of readdirSync(root)) {
    const match = dir.match(/^(.+)-to-(.+)$/);
    if (!match) continue;
    const [, from, to] = match;
    // A descriptor applies when its RESULT lands inside the span being upgraded across:
    // `to` ∈ (fromVersion, toVersion]. Keying on `from >= fromVersion` instead was wrong in the one
    // direction that matters — a repo at 1.0.1 silently skipped a `1.0.0-to-1.1.0` descriptor, and
    // 1.0.1 is the published version, so the first descriptor anyone authored that way would have
    // missed the entire installed base. Silently: nothing named the directory it passed over.
    if (compareVersions(to, fromVersion) <= 0) continue;
    if (compareVersions(to, toVersion) > 0) continue;

    const file = join(root, dir, `${basename(targetRel)}`);
    if (!existsSync(file)) continue;
    found.push({ from, to, file, id: `${dir}/${basename(targetRel)}` });
  }

  // A descriptor that exists for this target but falls outside the span is normal. A descriptor
  // DIRECTORY that parses and contains a file for this target while matching no span is worth a
  // word — it is the shape an authoring mistake takes, and silence is how the wrong predicate above
  // stayed invisible.
  if (found.length === 0) {
    const nearMiss = readdirSync(root).filter((dir) => /^(.+)-to-(.+)$/.test(dir) && existsSync(join(root, dir, basename(targetRel))));
    if (nearMiss.length > 0) {
      console.warn(`  (note: ${nearMiss.length} migration descriptor(s) exist for ${targetRel} but none apply to ${fromVersion} → ${toVersion}: ${nearMiss.join(', ')})`);
    }
  }

  return found.sort((x, y) => compareVersions(x.from, y.from));
}

// Applies one descriptor's changes to a config file's text.
//
// Line-anchored, for the reason the descriptor README gives: the CLI has no YAML parser. Each op is
// deliberately conservative about the user's content:
//   ensure-key       adds only when absent — never overwrites a value the user may have set
//   set-machine-owned overwrites unconditionally — agentsmyth authored it, the user never did
//   rename-key       moves the key and KEEPS the user's value, which is the whole reason
//                    descriptors exist: without it a rename looks like a delete plus an add, and a
//                    merge either drops the user's value or resurrects a stale one
function applyChanges(text, changes) {
  let out = text;
  for (const change of changes) {
    const key = change.key;
    const keyLine = new RegExp(`^(\\s*)${key}:.*$`, 'm');

    if (change.op === 'rename-key') {
      out = out.replace(keyLine, (line, indent) => `${indent}${change.to}:${line.slice(line.indexOf(':') + 1)}`);
    } else if (change.op === 'set-machine-owned') {
      if (keyLine.test(out)) out = out.replace(keyLine, (line, indent) => `${indent}${key}: ${change.value}`);
      else out = `${out.replace(/\n*$/, '')}\n${key}: ${change.value}\n`;
    } else if (change.op === 'ensure-key') {
      if (keyLine.test(out)) continue; // present — the user's value stands
      const anchor = change.after ? new RegExp(`^(\\s*)${change.after}:.*$`, 'm') : null;
      if (anchor && anchor.test(out)) {
        out = out.replace(anchor, (line, indent) => `${line}\n${indent}${key}: ${change.value}`);
      } else {
        out = `${out.replace(/\n*$/, '')}\n${key}: ${change.value}\n`;
      }
    }
  }
  return out;
}

// Brings one governed artifact current, returning what was done.
//
// Three strategies, chosen by what the artifact IS rather than by a flag:
//
//   hook      marker-block refresh. It can be embedded inside a hook the user wrote themselves, so
//             only the marked span is agentsmyth's to replace.
//   adapter   whole-file re-render, gated on the caller passing state === 'pristine'. These have no
//             markers and agentsmyth owns a pristine one entirely, so "pristine" from the manifest is
//             exactly the guarantee a marker would have given — and the ABSENCE of that guarantee is
//             exactly when re-rendering is destructive. A `newly-governed` adapter is a file the user
//             wrote before agentsmyth governed it (a pre-existing .github/copilot-instructions.md is
//             the common case); overwriting it would be silent data loss.
//   config    descriptor-driven key-level delta. Never a whole-file replace: three of the five
//             templates carry unfilled <PLACEHOLDER> tokens and three are written with
//             environment-dependent inference substitutions, so there is no version-stable
//             canonical form to replace them with.
// Every action an apply or a refresh can report, and — the half that was missing — which of them
// mean the file's content was REWRITTEN.
//
// This existed as three independent decisions in three functions with nothing holding them in
// agreement: applyUpgradeTo() returned 'no-change' for any hook path, refreshEnforcementSurfaces()
// reported 'gate-refreshed', and the reconcile filter matched a hardcoded 'delta-applied' ||
// 're-rendered'. A drifted pre-commit hook therefore landed in the no-op bucket, its backup was
// deleted as a false no-op, and the user was never told their edit had been overwritten — reachable
// in any repo that points core.hooksPath outside .git/, which is exactly the configuration that
// puts the hook in the governed set in the first place.
//
// Deriving the filter from this set rather than from a literal is what stops a fourth action string
// being added later that nothing recognises. This is the third instance of that coupling in this
// feature; the other two were fixed pointwise.
const REWRITE_ACTIONS = new Set(['delta-applied', 're-rendered', 'gate-refreshed', 'marker-refreshed']);

function applyUpgradeTo(repoDir, pkgRootDir, rel, state, fromVersion, toVersion) {
  const abs = join(repoDir, rel);
  const descriptors = loadMigrations(pkgRootDir, fromVersion, toVersion, rel);

  // The hook is handled by refreshEnforcementSurfaces(), not here — it must run whether or not the
  // hook is in the governed set, and in a default repo it never is.
  if (rel.endsWith('/pre-commit') || basename(rel) === 'pre-commit') {
    return { rel, action: 'no-change', descriptors: [] };
  }

  if (isDeterministicAdapter(rel)) {
    // Only a file agentsmyth demonstrably wrote may be replaced wholesale. Anything else is the
    // user's, and the caller has already backed it up and raised a reconcile item for it.
    if (state !== 'pristine') return { rel, action: 'left-for-reconcile', descriptors: [] };
    const tokens = buildAdapterTokens(repoDir);
    const rendered = renderAdapterTemplate(readFileSync(adapterSourceFor(pkgRootDir, rel), 'utf8'), tokens);
    if (rendered === readFileSync(abs, 'utf8')) return { rel, action: 'no-change', descriptors: [] };
    atomicWriteFileSync(abs, rendered, undefined, repoDir);
    return { rel, action: 're-rendered', descriptors: [] };
  }

  if (descriptors.length === 0) return { rel, action: 'no-change', descriptors: [] };

  const before = readFileSync(abs, 'utf8');
  let text = before;
  for (const d of descriptors) {
    const doc = readFileSync(d.file, 'utf8');
    validateDescriptor(doc, d.id, rel);
    text = applyChanges(text, parseDescriptorChanges(doc, d.id));
  }
  if (text === before) return { rel, action: 'no-change', descriptors: descriptors.map((d) => d.id) };
  atomicWriteFileSync(abs, text, undefined, repoDir);
  return { rel, action: 'delta-applied', descriptors: descriptors.map((d) => d.id) };
}

// Refreshes the two surfaces that carry the mandatory gate text: the pre-commit hook and AGENTS.md.
//
// Deliberately OUTSIDE the governed-set loop, and this is the fix for the worst defect this package
// shipped. Both are marker-bounded, so refreshing them needs no digest — the markers already say
// which span is agentsmyth's. Routing them through `governedArtifacts` coupled them to a question
// that has nothing to do with whether they can be refreshed: a hook in `.git/hooks` is excluded from
// the manifest because `.git/**` is a protected path and a BACKUP of it would leak protected content
// into version control. That is a correct reason not to hash it, and no reason at all not to refresh
// it. `init` never sets `core.hooksPath`, so the coupling disabled the gate refresh for essentially
// every consumer — while a comment and a CHANGELOG entry both claimed it was unconditional.
function refreshEnforcementSurfaces(repoDir, pkgRootDir) {
  const done = [];

  // Read the hook before and after, because installPreCommitHook() returns its target path whether
  // or not it wrote anything — including from its own explicit no-op branch. Reporting
  // 'gate-refreshed' off a non-null return made the action true on every run, which would turn the
  // REWRITE_ACTIONS fix into the opposite error: a reconcile item raised for a hook nobody touched.
  // The action now means what its name says.
  const hookProbe = (p) => {
    try { return p && existsSync(p) ? readFileSync(p, 'utf8') : null; } catch { return null; }
  };
  const provisionalHook = join(resolveHooksDir(repoDir), 'pre-commit');
  const hookBefore = hookProbe(provisionalHook);
  const hookPath = installPreCommitHook(repoDir, pkgRootDir);
  const hookAfter = hookProbe(hookPath);
  if (hookPath && hookAfter !== null && hookAfter !== hookBefore) {
    done.push({ rel: relative(repoDir, hookPath).split(sep).join('/'), action: 'gate-refreshed' });
  }

  // AGENTS.md is excluded from the manifest because it carries its own in-band provenance, and that
  // exclusion had the same side effect: placeAgentsMd() ran only in `init`, so the stamp the Phase 9
  // check reads could never move, which left that check as dead as the one it replaced.
  const agentsMdBefore = existsSync(join(repoDir, 'AGENTS.md')) ? readFileSync(join(repoDir, 'AGENTS.md'), 'utf8') : null;
  placeAgentsMd(repoDir, pkgRootDir, hookPath);
  const agentsMdAfter = existsSync(join(repoDir, 'AGENTS.md')) ? readFileSync(join(repoDir, 'AGENTS.md'), 'utf8') : null;
  if (agentsMdAfter !== null && agentsMdAfter !== agentsMdBefore) done.push({ rel: 'AGENTS.md', action: 'marker-refreshed' });

  return done;
}

// The three operations applyChanges() implements, as one declared set.
//
// Declared rather than restated at each site because the dispatch used to be three `===` tests with
// no default branch, so an op string matching none of them was silently dropped: no error, no
// warning, the file compared equal to itself, and the upgrade reported `no-change` for a file that
// needed a migration.
const DESCRIPTOR_OPS = ['ensure-key', 'set-machine-owned', 'rename-key'];

// Minimal reader for a descriptor's `changes:` list. Same matched-pair reasoning as the manifest
// reader: descriptors are authored against a schema, so the shape reaching a consumer is known.
//
// Two things the first version got wrong, both silent. It stripped the double quote and not the
// single, so `op: 'rename-key'` — legal YAML, and unconstrained by migration.schema.yaml, which
// placed no pattern on the string — parsed as the literal `"'rename-key'"` and matched no branch.
// And an unrecognised op fell through to nothing rather than failing. Both are now loud: quotes of
// either style are stripped, and an op outside DESCRIPTOR_OPS throws. A descriptor naming an
// operation this CLI does not implement is a hard error — the alternative is applying part of a
// migration and reporting success.
function parseDescriptorChanges(doc, sourceId) {
  const changes = [];
  const marker = doc.indexOf('changes:');
  if (marker === -1) return changes;
  const block = doc.slice(marker);
  for (const chunk of block.split(/^\s*- /m).slice(1)) {
    const field = (name) => {
      const raw = chunk.match(new RegExp(`^\\s*${name}:\\s*(.+?)\\s*$`, 'm'))?.[1];
      if (raw === undefined) return undefined;
      const unquoted = raw.replace(/^(["'])([\s\S]*)\1$/, '$2');
      return unquoted.trim();
    };
    const op = field('op');
    if (!op) continue;
    if (!DESCRIPTOR_OPS.includes(op)) {
      throw new Error(`migration descriptor ${sourceId ?? '(unknown)'} declares op "${op}", which is not one of ${DESCRIPTOR_OPS.join(', ')}`);
    }
    changes.push({ op, key: field('key'), to: field('to'), value: field('value'), after: field('after') });
  }
  return changes;
}

// Checks a descriptor document against the shape migration.schema.yaml declares, before any of it
// is applied.
//
// R5's acceptance says "a descriptor validates against its own schema". Nothing enforced it:
// migration.schema.yaml self-registered by $id and no validator, code path or test ever ran a
// descriptor through it — the only artefact asserting the validation existed was README prose. The
// check lives HERE rather than in a validator because loading is where a descriptor is actually
// used, so a consumer whose upgrade pulls a malformed descriptor fails at the point of use rather
// than at a `check` they may never run.
function validateDescriptor(doc, sourceId, targetRel) {
  const scalar = (key) => doc.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^(["'])([\s\S]*)\1$/, '$2');
  const problems = [];
  for (const key of ['kind', 'from', 'to', 'target']) {
    if (scalar(key) === undefined) problems.push(`${key} is missing`);
  }
  if (scalar('kind') !== undefined && scalar('kind') !== 'migration') problems.push(`kind is "${scalar('kind')}", expected "migration"`);
  for (const key of ['from', 'to']) {
    const v = scalar(key);
    if (v !== undefined && !isVersionString(v)) problems.push(`${key} "${v}" is not a version string`);
  }
  const target = scalar('target');
  if (target !== undefined && basename(target) !== basename(targetRel)) {
    problems.push(`target "${target}" does not name ${basename(targetRel)}`);
  }
  if (!/^changes:/m.test(doc)) problems.push('changes is missing');
  if (problems.length > 0) {
    throw new Error(`migration descriptor ${sourceId} is invalid: ${problems.join('; ')}`);
  }
}

// Backup paths named by reconcile items that are still `open`.
//
// Read from pending-setup.yaml rather than tracked in the manifest, because the item is the thing
// that makes a backup load-bearing: while it is open, the backup is the user's only copy of their
// edit. Once resolved, the backup is free to be superseded or removed. A file that cannot be read
// yields the empty set, and the caller then supersedes as before — an unreadable pending file is
// already reported loudly elsewhere, and failing the whole upgrade here would be a worse trade.
function openReconcileBackupPaths(repoDir) {
  const pendingPath = join(repoDir, 'workflow', 'config', 'pending-setup.yaml');
  if (!existsSync(pendingPath)) return [];
  let content;
  try { content = readFileSync(pendingPath, 'utf8'); } catch { return []; }

  const open = [];
  for (const item of content.split(/^  - id:/m).slice(1)) {
    const status = item.match(/^\s*status:\s*(.+?)\s*$/m)?.[1]?.trim();
    if (status !== 'open') continue;
    const raw = item.match(/^\s*backup_path:\s*(.+?)\s*$/m)?.[1];
    if (!raw) continue;
    open.push(raw.trim().replace(/^(["'])([\s\S]*)\1$/, '$2'));
  }
  return open;
}

// The marker that makes a reconcile item idempotent (RI9).
//
// It encodes BOTH the file and the version it drifted from, and neither dimension is optional.
// A family-level marker (`reconcile.`) silently drops the second file's item, because the guard is
// a substring test and the first item already matched. A per-file marker fixes that and still
// silently drops the SAME file drifting again at a later version, for the same reason. Only
// file-and-version distinguishes every item that should exist.
function reconcileMarker(fromVersion, rel) {
  return `reconcile.${fromVersion}.${rel}`;
}

// Raises one pending item per drifted file, and exactly one.
//
// Two independent guards, because they fail in different directions. The pending-setup content
// check stops a duplicate while the item is still in the file. The manifest's `reconcile_raised`
// ledger stops a RESURRECTION after the item has been resolved and pruned — the case the content
// check cannot see, because pruning takes the marker with it.
function raiseReconcileItems(repoDir, drifted, backupsByPath, descriptorsByPath, fromVersion, toVersion, manifest) {
  const configDir = join(repoDir, 'workflow', 'config');
  const alreadyRaised = new Set(manifest.reconcile_raised ?? []);
  const raised = [];
  const refused = [];

  for (const rel of drifted) {
    const marker = reconcileMarker(fromVersion, rel);
    if (alreadyRaised.has(marker)) continue;

    // `migration_id` names the descriptor that explains the shape change. Without it the router's
    // step 9 instruction — "when migration_id is present, read that descriptor first" — could never
    // fire, so a value that merely MOVED would look to the agent like one the user set.
    const descriptorIds = descriptorsByPath?.get(rel) ?? [];
    const spec = {
      config: rel.split('/').pop(),
      field: marker,
      question: `Your edits to ${rel} were preserved at ${backupsByPath.get(rel)} before this upgrade rewrote it. Re-apply anything you still want, then mark this item resolved.`,
      hint: `Compare ${backupsByPath.get(rel)} against the current ${rel}. Values you set by hand are in the backup; values agentsmyth owns have been brought current.`,
      backup_path: backupsByPath.get(rel),
      upgrade_from: fromVersion,
      upgrade_to: toVersion,
    };
    if (descriptorIds.length > 0) spec.migration_id = descriptorIds.join(' ');

    // A zero return is ambiguous on its own — it means either "already present" or "this file
    // cannot take an append". Distinguish them, because the second is a silent loss of the only
    // durable channel and the caller must be able to say so.
    const pendingPath = join(configDir, 'pending-setup.yaml');
    const before = existsSync(pendingPath) ? readFileSync(pendingPath, 'utf8') : null;
    if (appendPendingItems(configDir, [spec], marker) > 0) raised.push(marker);
    else if (before === null || !before.includes(marker)) refused.push(marker);
  }

  return { raised, refused };
}

// The five manifest states (RI5). Never two, and in particular never "absent or unparseable" as
// one branch: collapsing those two is the single path in this whole design that loses user edits
// without a trace. An unparseable manifest read as absent means the repo ADOPTS the user's edited
// files as pristine, and the next upgrade then overwrites them with no backup, because by then the
// manifest says they were never touched.
function classifyManifest(repoDir) {
  const read = readProvenance(repoDir);
  if (read.absent) return { state: 'absent' };
  if (!read.ok) return { state: 'unparseable', reason: read.reason };
  if (read.manifest.format_version > provenanceFormatVersion()) {
    return { state: 'newer-than-cli', found: read.manifest.format_version, supported: provenanceFormatVersion() };
  }
  return { state: 'valid', manifest: read.manifest };
}

// Per-artifact classification, once the manifest itself is known good. Four outcomes, and the
// distinction between `drifted` and `missing` is the one that matters: both differ from the
// recorded digest, but a file the user deleted has nothing to preserve, so backing it up would
// write an empty backup and raise a reconcile item about edits that do not exist.
function classifyGoverned(repoDir, hookPath, manifest) {
  const recorded = new Map(manifest.entries.map((e) => [e.path, e]));
  const present = governedArtifacts(repoDir, hookPath);
  const results = [];

  for (const rel of present) {
    const entry = recorded.get(rel);
    if (!entry) {
      // Governed now, absent from the manifest — a newly governed artifact, typically because a
      // release widened the governed set. Adopt it rather than treating it as drift: the user
      // never had a chance to edit something agentsmyth was not yet tracking.
      results.push({ path: rel, state: 'newly-governed' });
      continue;
    }
    const actual = digestFile(join(repoDir, rel));
    results.push({ path: rel, state: actual === entry.sha256 ? 'pristine' : 'drifted', recorded: entry.sha256, actual });
  }

  // Recorded but no longer on disk. Deliberately a distinct state from `drifted`.
  const presentSet = new Set(present);
  for (const entry of manifest.entries) {
    if (!presentSet.has(entry.path)) results.push({ path: entry.path, state: 'missing' });
  }

  return results;
}

function renderProvenance(manifest) {
  const lines = [
    '# Written by agentsmyth. Machine-managed — do not edit by hand.',
    '# Records what agentsmyth last wrote to each governed file, so an upgrade can tell a pristine',
    '# file from one you edited. Editing this by hand makes that distinction wrong.',
    'version: 1',
    'kind: provenance',
    `format_version: ${manifest.format_version}`,
    `written_by_version: ${manifest.written_by_version}`,
    `normalization: ${manifest.normalization}`,
  ];
  // Omitted entirely when empty rather than written as `reconcile_raised: []`. The schema makes it
  // optional, and a manifest from a repo that has never had a drifted file should not carry an
  // empty list implying it might have.
  if (manifest.reconcile_raised?.length > 0) {
    lines.push('reconcile_raised:');
    for (const marker of manifest.reconcile_raised) lines.push(`  - ${marker}`);
  }
  lines.push('entries:');
  for (const entry of manifest.entries) {
    lines.push(`  - path: ${entry.path}`);
    lines.push(`    sha256: ${entry.sha256}`);
    lines.push(`    written_by_version: ${entry.written_by_version}`);
  }
  return `${lines.join('\n')}\n`;
}

function writeProvenance(repoDir, manifest) {
  atomicWriteFileSync(provenancePath(repoDir), renderProvenance(manifest), undefined, repoDir);
}

// Strict reader for the shape renderProvenance() emits. A general YAML parser is not available
// here — bin/ has none and deliberately does not import lib.mjs — but none is needed: this file is
// machine-written and machine-read, never hand-authored, so the emitter and reader are a matched
// pair and any deviation from that shape means the file was tampered with or truncated.
//
// Returns { ok: true, manifest } or { ok: false, reason }. It deliberately does NOT classify
// absent/valid/unparseable/newer-than-CLI — that state machine is RI5 and belongs to the upgrade
// command, which is the only caller that can act on the difference. Reporting a reason rather than
// throwing is what lets that caller hard-stop with something a human can act on, instead of
// treating an unparseable manifest as an absent one and silently adopting edited files as pristine.
function readProvenance(repoDir) {
  const filePath = provenancePath(repoDir);
  if (!existsSync(filePath)) return { ok: false, reason: 'absent', absent: true };

  let text;
  try {
    text = readFileSync(filePath, 'utf8');
  } catch (err) {
    return { ok: false, reason: `unreadable: ${err.message}` };
  }

  const scalar = (key) => text.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim() ?? null;
  const version = scalar('version');
  const kind = scalar('kind');
  const formatVersion = scalar('format_version');
  const writtenBy = scalar('written_by_version');
  const normalization = scalar('normalization');

  // A missing key and a wrong value are reported differently on purpose: the recovery differs, and
  // `format_version "null" is not an integer` sends a reader looking for a value that is not there
  // to be wrong.
  const describe = (name, value) => (value === null ? `${name} is missing` : `${name} is "${value}"`);
  if (kind !== 'provenance') return { ok: false, reason: `${describe('kind', kind)}, expected "provenance"` };
  if (version !== '1') return { ok: false, reason: `${describe('version', version)}, expected "1"` };
  if (!/^\d+$/.test(formatVersion ?? '')) {
    return { ok: false, reason: formatVersion === null ? 'format_version is missing' : `format_version "${formatVersion}" is not an integer` };
  }
  // Format-validated, not merely present. This scalar becomes a filesystem path segment in
  // writeBackup(); see isVersionString() for what that cost when only truthiness was checked.
  if (!writtenBy) return { ok: false, reason: 'written_by_version is missing' };
  if (!isVersionString(writtenBy)) {
    return { ok: false, reason: `written_by_version "${writtenBy}" is not a version string` };
  }
  if (!normalization) return { ok: false, reason: 'normalization is missing' };

  const raised = [];
  const raisedBlock = text.match(/^reconcile_raised:\n((?:  - .+\n)+)/m);
  if (raisedBlock) {
    for (const line of raisedBlock[1].split('\n')) {
      const m = line.match(/^  - (.+)$/);
      if (m) raised.push(m[1].trim());
    }
  }

  // Entries are split on the list-item marker and their keys read in ANY order.
  //
  // The previous reader required path, sha256, written_by_version in exactly that sequence, while
  // provenance.schema.yaml places no ordering constraint — so a reordered entry was schema-valid and
  // the reader silently dropped it. The file was then classified `newly-governed`, its digest
  // comparison skipped entirely, and the entry re-authored with no error, no backup, and "Upgrade
  // complete" printed. Any YAML re-serialiser (an IDE key-sort, `yq`, a formatter) triggered it.
  //
  // The self-consistency guard could not catch it either, because it counted declared entries with
  // the SAME order-dependent assumption: both numbers undercounted in lockstep and agreed. Splitting
  // on the marker makes declared and parsed independent again — declared counts items, parsing reads
  // each item's keys — so the guard can actually fire. And a malformed item is now a hard stop
  // rather than an omission, which is what this manifest's own schema description has always
  // claimed: treating an unreadable entry as absent adopts the user's edited file as pristine and
  // loses it on the following upgrade.
  // Take everything after the `entries:` line and stop at the next TOP-LEVEL key (a line starting
  // in column zero). A lookahead-terminated match is the wrong tool here: `\s*$` under the `m` flag
  // matches at the end of the very first line, so a lazy body captured nothing and every entry
  // vanished. Walking lines says what it means and cannot be read two ways.
  const allLines = text.split('\n');
  const entriesIdx = allLines.findIndex((l) => /^entries:\s*$/.test(l));
  const entryLines = [];
  if (entriesIdx !== -1) {
    for (const line of allLines.slice(entriesIdx + 1)) {
      if (/^\S/.test(line)) break;
      entryLines.push(line);
    }
  }
  const items = entryLines.join('\n').split(/^ {2}- /m).slice(1);
  const entries = [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const field = (name) => item.match(new RegExp(`(?:^|\\n)\\s*${name}:\\s*(.+?)\\s*$`, 'm'))?.[1] ?? null;
    const entryPath = field('path');
    const sha256 = field('sha256');
    const entryVersion = field('written_by_version');
    const bad = (why) => ({ ok: false, reason: `entry ${i + 1} ${why}` });
    if (entryPath === null) return bad('has no path');
    if (!isSafeRelPath(entryPath)) return bad(`names path "${entryPath}", which escapes the repository`);
    if (sha256 === null) return bad(`(${entryPath}) has no sha256`);
    if (!/^[0-9a-f]{64}$/.test(sha256)) return bad(`(${entryPath}) has sha256 "${sha256}", which is not a hex digest`);
    if (entryVersion === null) return bad(`(${entryPath}) has no written_by_version`);
    if (!isVersionString(entryVersion)) return bad(`(${entryPath}) has written_by_version "${entryVersion}", which is not a version string`);
    entries.push({ path: entryPath, sha256, written_by_version: entryVersion });
  }

  // Kept even though every malformed item now hard-stops above: this catches an item the split
  // produced that parsing dropped for a reason nothing above anticipated, which is the failure mode
  // a matched emitter/reader pair is least able to predict about itself.
  const declared = items.length;
  if (declared !== entries.length) {
    return { ok: false, reason: `declares ${declared} entr(ies) but only ${entries.length} parsed cleanly` };
  }

  return {
    ok: true,
    manifest: {
      version: 1,
      kind: 'provenance',
      format_version: Number(formatVersion),
      written_by_version: writtenBy,
      normalization,
      reconcile_raised: raised,
      entries,
    },
  };
}

// Adapter token substitution — a deterministic implementation of the same 8-token map and
// TODO-fallback rule setup/references/token-map.md and SKILL.md Step 5a.1 already document as
// agent-executed prose. Used only by placeDeterministicAdapters() below, for the two tools no
// global gate can ever cover (Cursor, non-macOS Copilot) — everything else stays agent-driven.
function adapterTodoFallback() { return '<!-- TODO: see pending-setup.yaml -->'; }

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
        : `Direct commits to \`${tokens.DEFAULT_BRANCH ?? adapterTodoFallback()}\` permitted.`;
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
    // so they fall back to adapterTodoFallback(), per the user's "final call is from interview
    // setup only" instruction for anything requiring judgment.
  } catch { /* domain.yaml unreadable — leave these tokens for the fallback */ }

  return tokens;
}

// Renders a {{TOKEN}}-templated adapter source against a token map, substituting
// adapterTodoFallback() for any token with no resolvable value.
function renderAdapterTemplate(templateContent, tokens) {
  return templateContent.replace(/\{\{([A-Z_]+)\}\}/g, (_match, name) => tokens[name] ?? adapterTodoFallback());
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

// Where git will look for hooks in this repo: an explicit core.hooksPath (absolute, or relative to
// the repo) when one is configured, otherwise .git/hooks. Single caller by design —
// installPreCommitHook(), which returns the path it actually wrote so placeAgentsMd() can advertise
// that value rather than re-deriving it. The earlier fix for F2 had both functions call this and
// agree by construction; returning the written path is strictly stronger, because it also carries
// the one thing a shared resolver cannot express — whether a hook was written at all (F5).
function resolveHooksDir(repoDir) {
  try {
    const configured = execFileSync('git', ['config', 'core.hooksPath'], {
      cwd: repoDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    if (configured) return isAbsolute(configured) ? configured : join(repoDir, configured);
  } catch { /* not a git repo, or core.hooksPath unset — fall through below */ }

  // Ask git where the hooks directory IS rather than assuming `.git` is a directory. In a linked
  // worktree `.git` is a FILE pointing at the common dir, so joining `.git/hooks` produced a path
  // whose creation threw ENOTDIR — caught, non-fatal, hook install skipped. The consequence was not
  // merely a missed refresh: placeAgentsMd() then wrote "the gate is not installed" into the
  // worktree's AGENTS.md, which is false. The hook is live, shared through the common dir, and does
  // enforce commits there. Telling a user the core safety mechanism is off when it is on is worse
  // than not refreshing it.
  try {
    const gitPath = execFileSync('git', ['rev-parse', '--git-path', 'hooks'], {
      cwd: repoDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    if (gitPath) return isAbsolute(gitPath) ? gitPath : join(repoDir, gitPath);
  } catch { /* not a git repo at all — the literal default below is the only answer left */ }

  return join(repoDir, '.git', 'hooks');
}

// Root AGENTS.md — the generic fallback (WP-R23) for every agent tool that has no first-class
// adapter. Unlike the two placements above, this one is deliberately NOT skip-if-exists: a repo that
// already has an AGENTS.md is the common case this exists to serve, and skipping would mean the block
// never arrives. The write is bounded by markers instead — nothing outside them is touched (R3).
//
// The stamp is matched by PATTERN, never by the literal current version. A literal match would make
// 1.2.0 fail to find a block that 1.1.0 wrote and append a second one, so every release would ADD a
// block rather than replace the previous one — turning a version stamp from a migration aid into a
// per-release duplication bug. Matching any stamp is also what lets a later release read which
// version wrote a block and migrate it, which is the whole reason the stamp is there (brief Q1, R2).
//
// Both this and installPreCommitHook() now refresh a stale marked block rather than returning
// early on marker presence; they differ only in what bounds the block. R2 requires replace-in-place, so this one
// replaces. The extra-block sweep exists because R2's acceptance is "exactly one marker pair" — a
// file that somehow carries two (a hand-copy, or a block written by a version with this bug) is
// collapsed to one rather than left to accumulate.
// The middle is a TEMPERED match: "any character, so long as another BEGIN does not start here".
// A plain [\\s\\S]*? silently destroys user content. If the file carries an orphan BEGIN with no END
// (a truncated write, a killed process, a pasted fragment), the first init appends a well-formed
// block, and the second init then matches from the ORPHAN BEGIN to the new block's END and deletes
// everything between them — the user's own text included. Reproduced before this guard existed.
// Tempering makes the match start at the LAST BEGIN before an END, so an orphan is left untouched
// as the stray text it is. Nothing outside a well-formed pair is ever ours to remove (R3).
function agentsBlockPattern() {
  return '<!-- agentsmyth:[^\\s>]+ BEGIN -->' +
  '(?:(?!<!-- agentsmyth:[^\\s>]+ BEGIN -->)[\\s\\S])*?' +
  '<!-- agentsmyth:[^\\s>]+ END -->';
}
function agentsBlockRe() { return new RegExp(agentsBlockPattern()); }
function agentsBlockReAll() { return new RegExp(agentsBlockPattern(), 'g'); }

// The gate paragraph has two forms because only one of them is ever true, and which one is decided
// by whether installPreCommitHook() actually wrote a hook. It used to name `.git/hooks/pre-commit`
// even when no hook had been installed, sending every agent that reads the block to a file nobody
// created. Same class as F2 one step further out: F2 named the wrong path, this named a path for a
// hook that does not exist. Review finding F5.
//
// The absent form is deliberately CAUSE-NEUTRAL, and that is finding F8. Its first version said
// "found no git repository here", but installPreCommitHook() returns null from three places and
// only one of them is that: the other two — an unwritable hooks directory and a failed hook write —
// are both reachable inside a perfectly good git repo, where that sentence tells the reader to make
// a git repo out of a directory that already is one. A return value of null carries "no hook", not
// "here is why", so the paragraph may not claim a cause the call site never established. `init`
// prints the real reason on the same run; the block points at it instead of guessing.
//
// This is why extending the return value to carry a reason was NOT the fix taken: it would rework
// the F5 arrangement, which this pass is fenced out of. If a future pass wants per-cause wording,
// that is the shape to build — and it must keep the property F5 bought, that the block cannot be
// written before the hook's fate is known.
//
// Wrapped to the asset's own column width so the rendered block keeps its shape, and the installed
// form keeps the literal phrase "pre-commit hook at `...`" because agents-md:test A4/A5 locate the
// advertised path through it.
function gateParagraphInstalled(hookPath) {
  return   '**The gate is enforced, not advised.** A pre-commit hook at `' + hookPath + '` rejects any commit whose\n' +
  'changed files are not covered by a lifecycle artifact in the required phase state. Skipping a phase\n' +
  'does not produce a warning; it produces a failed commit.';
}

function gateParagraphAbsent() {
  return   '**The gate is not installed.** No pre-commit hook was written, so nothing refuses a commit that\n' +
  'skips a phase. `agentsmyth init` printed the reason on the run that produced this block — fix that\n' +
  'and run it again. Until then the phase order holds, but only because you hold it.';
}

function agentsMdBlock(version, body) {
  return `<!-- agentsmyth:${version} BEGIN -->\n${body.trim()}\n<!-- agentsmyth:${version} END -->`;
}

// `hookPath` is installPreCommitHook()'s return value: the file it wrote, or null when it warned
// and skipped. Taking it as a parameter — rather than re-deriving it — is what makes the block
// unable to advertise a hook that was never installed, and is why the call order in `init` is
// hook-first (F5).
// Finds agentsmyth's own block sitting in a file WITHOUT markers, and returns the file with that
// span replaced by the marked block. Returns null when there is nothing to adopt, which is the
// ordinary case and leaves the caller's append path untouched.
//
// Anchored on the first and last non-empty lines of the body actually being written, matched by
// whole-line equality. Prefix matching would be wrong here: `# agentsmyth` is a heading somebody
// else could plausibly have written, and claiming their content would be worse than duplicating.
function adoptUnmarkedAgentsBlock(existing, body, block) {
  const bodyLines = body.split('\n').map((l) => l.trim()).filter(Boolean);
  if (bodyLines.length < 2) return null;
  const firstLine = bodyLines[0];
  const lastLine = bodyLines[bodyLines.length - 1];

  const lines = existing.split('\n');
  const spans = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() !== firstLine) continue;
    for (let j = i + 1; j < lines.length; j += 1) {
      if (lines[j].trim() === lastLine) { spans.push([i, j]); i = j; break; }
    }
  }
  if (spans.length === 0) return null;

  const [start, end] = spans[0];
  const rebuilt = [...lines.slice(0, start), ...block.split('\n'), ...lines.slice(end + 1)];
  return { text: `${rebuilt.join('\n').replace(/\n*$/, '')}\n`, remaining: spans.length - 1 };
}

function placeAgentsMd(repoDir, pkgRootDir, hookPath) {
  const dest = join(repoDir, 'AGENTS.md');

  // Reads are INSIDE the try on purpose. installPreCommitHook() reads its template outside its own
  // try, so an unreadable template there takes init down; the degradation this function's catch
  // promises is only real if the reads it depends on are covered by it too.
  try {
    const version = JSON.parse(readFileSync(join(pkgRootDir, 'package.json'), 'utf8')).version;
    // renderAdapterTemplate() is load-bearing here, not ceremony for consistency's sake: the asset
    // carries {{GATE_PARAGRAPH}}, and substituting it is the whole of the F5 fix — the installed
    // variant also embeds the real hook path that closed F2. A6 in agents-md:test guards the
    // failure mode this introduces, an unrendered {{TOKEN}} reaching a consumer's file.
    // The advertised path is displayed repo-relative; an absolute core.hooksPath outside the repo
    // stays absolute, which is still the true location.
    const displayed = hookPath ? relative(repoDir, hookPath) : null;
    const tokens = {
      ...buildAdapterTokens(repoDir),
      GATE_PARAGRAPH: displayed === null
        ? gateParagraphAbsent()
        : gateParagraphInstalled(displayed.startsWith('..') ? hookPath : displayed),
    };
    const body = renderAdapterTemplate(
      readFileSync(join(pkgRootDir, 'src', 'assets', 'AGENTS.md'), 'utf8'),
      tokens,
    );
    const block = agentsMdBlock(version, body);

    if (!existsSync(dest)) {
      writeFileSync(dest, block + '\n');
      return;
    }
    const existing = readFileSync(dest, 'utf8');
    if (agentsBlockRe().test(existing)) {
      // Function replacement, not a string: a '$' in the block body would otherwise be read as a
      // replacement pattern ($&, $1) and silently corrupt the written block.
      let first = true;
      writeFileSync(dest, existing.replace(agentsBlockReAll(), () => {
        if (!first) return '';
        first = false;
        return block;
      }));
      return;
    }
    // No MARKED block — but the body may already be in the file UNMARKED, and appending then makes
    // the file say the same thing twice: once as the user's copy, once inside the version marker.
    // Reachable without doing anything odd: paste the block out of the docs before running init,
    // copy an AGENTS.md from a repo where agentsmyth wrote one and lose the HTML comments on the
    // way, or run it through a formatter that strips them. The duplication is one-time rather than
    // compounding — every later upgrade finds the marked block and leaves the stray copy alone —
    // which is worse in one way, because nothing ever surfaces it again.
    //
    // Adopt rather than append. The span is matched on agentsmyth's OWN first and last body lines,
    // compared whole rather than by prefix: this file's opening heading is generic enough that a
    // prefix test would claim a heading somebody else wrote. Both anchors are derived from the
    // rendered body, so they cannot drift from what is actually being written.
    const adopted = adoptUnmarkedAgentsBlock(existing, body, block);
    if (adopted) {
      writeFileSync(dest, adopted.text);
      if (adopted.remaining > 0) {
        console.warn(`  (note: AGENTS.md carried ${adopted.remaining + 1} unmarked copies of the agentsmyth block; the first is now`);
        console.warn('   marked and managed, and the rest were left alone because they are not agentsmyth\'s to remove)');
      }
      return;
    }

    writeFileSync(dest, existing.endsWith('\n') ? `${existing}\n${block}\n` : `${existing}\n\n${block}\n`);
  } catch (err) {
    // A missing or unreadable asset, an unparseable package.json, or an unwritable repo root all
    // land here and degrade to a warning: init must still scaffold config and artifacts.
    console.warn(`agentsmyth: could not write AGENTS.md at ${dest} — skipping.`);
    console.warn(`  ${err.message}`);
  }
}

function hookBeginMarker() { return '# >>> agentsmyth:mandatory-lifecycle-gate >>>'; }
function hookEndMarker() { return '# <<< agentsmyth:mandatory-lifecycle-gate <<<'; }

// Installs the mandatory local pre-commit lifecycle gate — called only from `init` (never
// `runPrepare()`, which writes zero repo-level files by design). Tool-agnostic by construction:
// this hooks git itself, the one action every supported AI tool's output must pass through
// regardless of which tool produced the diff. Idempotent (re-running `init` doesn't duplicate
// the marker block) and never clobbers a user's own pre-existing hook (RI2) — appends instead.
// Never fails `init` itself: a non-git directory or unwritable hooks path degrades to a warning
// (RI4), since `init` must still be usable to scaffold config/artifacts even without git.
//
// RETURNS the absolute path of the hook that is now installed, or null when this function warned
// and skipped. placeAgentsMd() renders its gate paragraph from that return value, so every `return`
// below must answer the question honestly: null means "no hook exists at any path", and a path
// means "a hook is in place here" — including the idempotent case, where a previous run installed
// it and this one had nothing to do (F5).
function installPreCommitHook(repoDir, pkgRootDir) {
  const hooksPath = resolveHooksDir(repoDir);

  if (!existsSync(join(repoDir, '.git')) && !existsSync(hooksPath)) {
    console.warn('agentsmyth: not a git repository (or hooks path unavailable) — skipping mandatory pre-commit hook install.');
    console.warn('  Lifecycle coverage will not be enforced at commit time until this repo is a git repo.');
    return null;
  }

  try {
    mkdirSync(hooksPath, { recursive: true });
  } catch (err) {
    console.warn(`agentsmyth: could not create hooks directory at ${hooksPath} — skipping pre-commit hook install.`);
    console.warn(`  ${err.message}`);
    return null;
  }

  const target = join(hooksPath, 'pre-commit');
  const template = readFileSync(join(pkgRootDir, 'src', 'assets', 'hooks', 'pre-commit'), 'utf8');

  try {
    if (!existsSync(target)) {
      atomicWriteFileSync(target, template, { mode: 0o755 }, dirname(target));
      return target;
    }
    const existing = readFileSync(target, 'utf8');
    if (existing.includes(hookBeginMarker())) {
      // REFRESH the marked block rather than returning early (RI19).
      //
      // The early return made this function idempotent in the narrow sense — running it twice did
      // not duplicate anything — while making the enforcement gate permanently un-upgradeable: a
      // repo that installed the hook at 1.0.0 kept the 1.0.0 gate script through every subsequent
      // release, forever, because the marker it checks for was already there. A delta-upgrade
      // feature whose own enforcement mechanism cannot be delta-upgraded is the wrong shape, and
      // the gate is this product's central claim.
      //
      // Only the marked span is replaced. Everything outside it is the user's — a hook they wrote
      // themselves that `init` appended to, or their own additions afterwards — and survives
      // byte-for-byte. That boundary is what makes refreshing safe where whole-file replacement
      // would not be.
      const begin = existing.indexOf(hookBeginMarker());
      const end = existing.indexOf(hookEndMarker());
      if (end === -1 || end < begin) {
        // A begin marker with no matching end means the block was hand-edited into a shape this
        // cannot safely bound. Refusing to touch it is right; refusing silently is not — the gate
        // would then sit frozen with nothing having said so.
        console.warn(`agentsmyth: the agentsmyth block in ${target} has no closing marker — leaving it untouched.`);
        console.warn('  The lifecycle gate in this repo will not be updated until the block is repaired.');
        return target;
      }
      const current = template.slice(template.indexOf(hookBeginMarker()));
      const refreshed = existing.slice(0, begin) + current.trimEnd() + '\n' + existing.slice(end + hookEndMarker().length).replace(/^\n/, '');
      if (refreshed !== existing) atomicWriteFileSync(target, refreshed, { mode: 0o755 }, dirname(target));
      return target;
    }
    const block = template.slice(template.indexOf(hookBeginMarker()));
    const appended = existing.endsWith('\n') ? existing + block : existing + '\n' + block;
    atomicWriteFileSync(target, appended, { mode: 0o755 }, dirname(target));
    return target;
  } catch (err) {
    console.warn(`agentsmyth: could not write pre-commit hook at ${target} — skipping.`);
    console.warn(`  ${err.message}`);
    return null;
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

  // Stamp the installed version INTO the global tree.
  //
  // Without this a validator running from ~/.agentsmyth/workflow/validators/ has no way to learn
  // which agentsmyth is installed. check-setup-complete first tried probing for a package.json
  // relative to its own location, which resolves in the SOURCE tree and nowhere a consumer runs:
  // neither ~/.agentsmyth/workflow/validators/ nor .agentsmyth/validators/ has one at any probed
  // depth. The version check therefore passed its unit test - which runs the validator from src/ -
  // and was inert everywhere it actually ships, degrading to the same near-tautological
  // stamp-vs-stamp comparison it had been written to replace. Test caught it; the unit test could
  // not, because it exercised a path that does not exist in deployment.
  //
  // A plain file rather than an env var or a CLI argument, because the validator is also run
  // directly by a user (README documents `node workflow/validators/check-setup-complete.mjs`) and
  // must answer the same way then. Rewritten on every prepare, so it cannot lag the tree it
  // describes - prepare is the only thing that writes either.
  writeFileSync(join(globalDir, 'workflow', 'installed-version.txt'), `${version}\n`);

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

// NOTE ON PLACEMENT — historical, and no longer load-bearing. This block used to be REQUIRED to
// sit below the shared helpers, because installPreCommitHook() and renderAdapterTemplate() closed
// over `const` values (HOOK_BEGIN_MARKER, HOOK_END_MARKER, ADAPTER_TODO_FALLBACK) declared in that
// region. A `const` does not hoist, so calling them from a dispatch above their declaration threw
// "Cannot access 'X' before initialization" at runtime — which the upgrade path did, on both
// consts in turn, despite the file already carrying that warning twice for intentStartId() and
// intentItemSpecs().
//
// Moving the block was the weaker of the two available fixes and is no longer what protects this.
// Nothing stopped a future reorganisation — plausible in a file this size — from moving a command
// dispatch back above those declarations, and the file's own history says it had already happened
// twice. Every one of those values is now a hoisted `function` instead, the same remedy already
// applied to intentStartId() and intentItemSpecs(), so position cannot reintroduce the hazard.
//
// The block stays here for readability, not for correctness. If you move it, run the suites; they
// will still pass, and that is now a fact about the code rather than about where the block sits.

// ─── upgrade ───────────────────────────────────────────────────────────────
// Brings an already-set-up repo current with the installed agentsmyth version.
//
// This is a separate verb rather than an extension of `init`, and the two reasons are worth
// stating here because neither is the obvious one. First, `init`'s very first act is to refuse
// when `.agentsmyth/` exists, and it re-scaffolds `.agentsmyth/` on every run — which makes
// `agentsmyth check` exit 1 until an agent deletes it, so every init-as-upgrade knowingly breaks
// the gate. Second, and decisively: an upgrade MUST refresh the global definitions install, and
// both `runPrepare` call sites fire only when the global tree is ABSENT, never when it is stale.
// A separate verb can call it unconditionally without changing `init`'s contract for every
// fresh-install user.
//
// `init` itself remains what it always was: first-time setup, inert on a repo that already has
// config. That is not a defect being preserved, it is the correct behavior for that verb.

if (command === 'upgrade') {
  const upgradeRoot = resolveExistingRepoRoot();
  const upgradeArgs = process.argv.slice(3);
  const baselineOnly = upgradeArgs.includes('--baseline');
  const dryRun = upgradeArgs.includes('--dry-run');
  const pkgVersion = pkgVersionForProvenance(pkgRoot);

  if (!existsSync(join(upgradeRoot, 'workflow', 'config', 'repo-profile.yaml'))) {
    console.error('agentsmyth: no workflow/config/repo-profile.yaml here — this repo has not been set up.');
    console.error('  Run "agentsmyth init" first; "upgrade" brings an already-set-up repo current.');
    process.exit(1);
  }

  // `--baseline` re-records what is on disk as the new truth. It is what the setup skill runs at
  // its final step, once it has filled the config files `init` could only scaffold as templates.
  // It deliberately does NOT run prepare or classify anything: it is an assertion about the
  // current repo, not an upgrade.
  if (baselineOnly) {
    // Classify FIRST, even here. `--baseline` legitimately skips classifying the FILES — it is an
    // assertion about the current repo, not an upgrade — but it must not skip classifying the
    // MANIFEST. It did, and the two hard stops bare `upgrade` performs were therefore reachable on
    // one entry point of two: run against a manifest a newer CLI wrote, an older CLI silently
    // stamped format_version and written_by_version back down to what it supports, discarding the
    // newer manifest's claims with no warning and no backup. `--baseline` is not an obscure recovery
    // flag — src/setup/SKILL.md makes it the mandatory final action of every setup session, so
    // ordinary onboarding on a trailing CLI hit this.
    const pre = classifyManifest(upgradeRoot);
    if (pre.state === 'unparseable') {
      console.error('');
      console.error('agentsmyth: workflow/provenance.yaml exists but could not be read.');
      console.error(`  ${pre.reason}`);
      console.error('  Refusing to overwrite it. Restore it from version control, or delete it and');
      console.error('  re-run this command to record the current files as a fresh baseline.');
      process.exit(1);
    }
    if (pre.state === 'newer-than-cli') {
      console.error('');
      console.error(`agentsmyth: workflow/provenance.yaml is format_version ${pre.found}, but this CLI supports ${pre.supported}.`);
      console.error('  It was written by a newer agentsmyth than the one installed here.');
      console.error('  Refusing to overwrite it with an older format. Upgrade the agentsmyth package,');
      console.error('  then re-run.');
      process.exit(1);
    }

    const hookPath = join(resolveHooksDir(upgradeRoot), 'pre-commit');
    const count = recordProvenanceBaseline(upgradeRoot, pkgVersion, existsSync(hookPath) ? hookPath : null, pkgRoot);
    console.log(`agentsmyth: recorded provenance baseline for ${count} governed file(s) → workflow/provenance.yaml`);
    process.exit(0);
  }

  // RI6 — unconditionally, and FIRST. The manifest's own schema lives in the definitions root, so
  // reading it against a stale global install is exactly the version-skew failure this package
  // exists to fix. Doing this before anything else is the whole reason `upgrade` is its own verb.
  try {
    runPrepare(pkgRoot);
  } catch (err) {
    console.error('');
    console.error('agentsmyth: could not refresh the global lifecycle definitions.');
    console.error(`  ${err.message}`);
    console.error('  Nothing in this repo was changed. Fix the issue above and re-run "agentsmyth upgrade".');
    process.exit(1);
  }

  const classified = classifyManifest(upgradeRoot);

  if (classified.state === 'unparseable') {
    console.error('');
    console.error('agentsmyth: workflow/provenance.yaml exists but could not be read.');
    console.error(`  ${classified.reason}`);
    console.error('');
    console.error('  Refusing to continue. This file records what agentsmyth last wrote to each');
    console.error('  governed file, and an upgrade that cannot read it cannot tell your edits from');
    console.error('  staleness. Continuing would adopt your current files as pristine and overwrite');
    console.error('  them, with no backup, on the NEXT upgrade.');
    console.error('');
    console.error('  Recover by restoring the file from version control, or delete it and run');
    console.error('  "agentsmyth upgrade --baseline" to re-record your current files as the baseline.');
    process.exit(1);
  }

  if (classified.state === 'newer-than-cli') {
    console.error('');
    console.error(`agentsmyth: workflow/provenance.yaml is format_version ${classified.found}, but this CLI supports ${classified.supported}.`);
    console.error('  It was written by a newer agentsmyth than the one installed here.');
    console.error('');
    console.error('  Refusing to continue. Compared naively, every entry would read as mismatched,');
    console.error('  and this older CLI would back up and overwrite files that are already current.');
    console.error('  Upgrade the agentsmyth package itself, then re-run.');
    process.exit(1);
  }

  const hookPath = join(resolveHooksDir(upgradeRoot), 'pre-commit');
  const resolvedHook = existsSync(hookPath) ? hookPath : null;

  if (classified.state === 'absent') {
    // Every version published to date predates the manifest, so this is not an edge case — it is
    // the entire installed base on the day this ships. It must not read as "every file drifted".
    //
    // The adopt path also refreshes the two marker-bounded gate surfaces and the version stamp.
    // Skipping them meant `agentsmyth check` kept printing the version-skew warning immediately
    // after the user ran the command that warning names as the cure, and a SECOND `upgrade` was
    // needed to converge. Both surfaces are marker-bounded, so refreshing them needs no manifest —
    // which is exactly why they can be brought current on the one path that has no manifest to read.
    const count = recordProvenanceBaseline(upgradeRoot, pkgVersion, resolvedHook, pkgRoot);
    const refreshed = refreshEnforcementSurfaces(upgradeRoot, pkgRoot);
    writeDefinitionsRoot(upgradeRoot, PORTABLE_DEFINITIONS_ROOT, pkgVersion);
    console.log('');
    console.log(`agentsmyth: no provenance manifest found — adopted the current state of ${count} governed file(s) as the baseline.`);
    console.log('  Nothing was backed up and no governed file was changed: with no record of what');
    console.log('  agentsmyth last wrote, your files are the only truth available, so they become the');
    console.log('  baseline. The next upgrade will be able to tell your edits from staleness.');
    if (refreshed.length > 0) {
      console.log('');
      console.log('  Brought current:');
      for (const a of refreshed) console.log(`    ${a.action.padEnd(17)} ${a.rel}`);
    }
    console.log(`  Version stamp set to v${pkgVersion} — "agentsmyth check" will stop reporting skew.`);
    process.exit(0);
  }

  const results = classifyGoverned(upgradeRoot, resolvedHook, classified.manifest);
  const by = (state) => results.filter((r) => r.state === state);

  // Rollback is the consumer's git history, and nothing here checked whether they have one.
  // Backups cover `drifted` files by design — a `pristine` file, the majority case in a real repo,
  // has no safety net if a descriptor mis-applies — so an uncommitted tree is the difference between
  // a recoverable mistake and an unrecoverable one. Warned, not blocked: refusing would break CI
  // upgrades and this is the user's call to make, but making it silently is not.
  if (!dryRun) {
    const dirty = gitWorkingTreeDirty(upgradeRoot);
    if (dirty === true) {
      console.warn('');
      console.warn('  WARNING: this working tree has uncommitted changes.');
      console.warn('  Only files recorded as edited are backed up; files agentsmyth wrote are rewritten');
      console.warn('  in place, and git history is the only way back. Commit first, or run with');
      console.warn('  --dry-run to see what this would do.');
    }
  }

  console.log('');
  console.log(`agentsmyth upgrade (v${pkgVersion}) — ${upgradeRoot}`);
  console.log(`  manifest written by v${classified.manifest.written_by_version}, format_version ${classified.manifest.format_version}`);
  console.log('');
  for (const r of results) {
    const label = {
      pristine: 'unchanged since agentsmyth wrote it',
      drifted: 'edited since agentsmyth wrote it',
      missing: 'recorded but no longer on disk',
      'newly-governed': 'newly governed by this version',
    }[r.state];
    console.log(`  ${r.state.padEnd(15)} ${r.path}  (${label})`);
  }
  console.log('');
  console.log(`  ${by('pristine').length} unchanged, ${by('drifted').length} edited, ${by('missing').length} missing, ${by('newly-governed').length} newly governed`);

  const fromVersion = classified.manifest.written_by_version;

  // --dry-run stops here, after classification and before the first write. Classification is the
  // expensive, interesting half and it is entirely read-only, so a preview costs a run of exactly
  // the code the real thing would run — not a separate model of it that can drift from the real one.
  if (dryRun) {
    const descriptorPreview = results
      .filter((r) => r.state !== 'missing')
      .map((r) => ({ rel: r.path, ids: loadMigrations(pkgRoot, fromVersion, pkgVersion, r.path).map((d) => d.id) }))
      .filter((d) => d.ids.length > 0);

    // Split the drifted set by whether anything would ACTUALLY rewrite the file. A drifted file
    // with no descriptor and no re-render is backed up, found unchanged, and its backup removed —
    // no item, no loss. Saying "would raise a reconcile item" for all of them would make the
    // preview promise more than the run delivers, which is the one thing a preview must not do.
    const withDescriptors = new Set(descriptorPreview.map((d) => d.rel));
    const wouldRewrite = by('drifted').filter((r) => withDescriptors.has(r.path) || isDeterministicAdapter(r.path));
    const wouldNotRewrite = by('drifted').filter((r) => !withDescriptors.has(r.path) && !isDeterministicAdapter(r.path));

    console.log('');
    console.log(`  DRY RUN — nothing was written. Upgrading would take this repo from v${fromVersion} to v${pkgVersion}.`);
    if (wouldRewrite.length > 0) {
      console.log('');
      console.log('  These would be backed up, then brought current, and would each raise a reconcile item:');
      for (const r of wouldRewrite) console.log(`    ${r.path}`);
    }
    if (wouldNotRewrite.length > 0) {
      console.log('');
      console.log('  These are edited but this version has no change for them, so they would be left');
      console.log('  exactly as they are — no rewrite, no reconcile item:');
      for (const r of wouldNotRewrite) console.log(`    ${r.path}`);
    }
    if (descriptorPreview.length > 0) {
      console.log('');
      console.log('  These migration descriptors would apply:');
      for (const d of descriptorPreview) console.log(`    ${d.rel}  ←  ${d.ids.join(', ')}`);
    } else {
      console.log('');
      console.log('  No migration descriptors apply to this version span.');
    }
    console.log('');
    console.log('  The pre-commit hook and the AGENTS.md marker block would be refreshed, and the');
    console.log(`  version stamp set to v${pkgVersion}.`);
    process.exit(0);
  }

  // Back up BEFORE anything is written — that ordering is the safety property, and it does not
  // depend on knowing yet whether a delta exists. Only `drifted` artifacts: a `missing` file has
  // nothing to preserve, and backing one up would write an empty backup implying edits that never
  // happened.
  // Backups an OPEN reconcile item still names. writeBackup() must not supersede these: the item
  // tells the agent to diff `backup_path` against the current file, and a deleted backup makes that
  // instruction point at nothing, silently and unrecoverably. RI20 names supersession and resolution
  // as deletion triggers without ordering them; resolution wins.
  const openBackupPaths = openReconcileBackupPaths(upgradeRoot);

  const backups = [];
  for (const r of by('drifted')) {
    try {
      backups.push({ path: r.path, backup: writeBackup(upgradeRoot, r.path, fromVersion, openBackupPaths) });
    } catch (err) {
      console.error('');
      console.error(`agentsmyth: could not back up ${r.path} — stopping before anything is overwritten.`);
      console.error(`  ${err.message}`);
      console.error('  No governed file has been modified. Fix the issue above and re-run.');
      process.exit(1);
    }
  }

  // Apply. `missing` is skipped deliberately: a file the user deleted is not brought back by an
  // upgrade. Re-creating it would silently undo a deliberate removal.
  const applied = [];
  for (const r of results) {
    if (r.state === 'missing') continue;
    try {
      applied.push(applyUpgradeTo(upgradeRoot, pkgRoot, r.path, r.state, fromVersion, pkgVersion));
    } catch (err) {
      console.error('');
      console.error(`agentsmyth: failed while bringing ${r.path} current.`);
      console.error(`  ${err.message}`);
      console.error('  Your edits are preserved in workflow/backups/ and the manifest was not');
      console.error('  refreshed, so re-running is safe and will retry from the same state.');
      process.exit(1);
    }
  }

  // The two marker-bounded gate surfaces, refreshed independently of the governed set.
  applied.push(...refreshEnforcementSurfaces(upgradeRoot, pkgRoot).map((a) => ({ ...a, descriptors: [] })));

  // Machine-owned scalars. Without this the version stamp never moves, so `agentsmyth check` keeps
  // printing the skew warning after an upgrade — and that warning now tells the user to run the
  // very command they just ran. This is what makes its advice true.
  writeDefinitionsRoot(upgradeRoot, PORTABLE_DEFINITIONS_ROOT, pkgVersion);

  // Reconcile items are raised ONLY for files an apply actually rewrote. A drifted file whose
  // upgrade produced no change needs nothing from the user: raising an item there sends the agent
  // to merge a file against a byte-identical copy of itself, and leaves a redundant backup behind.
  let outcomeRaised = [];
  const rewritten = new Set(applied.filter((a) => REWRITE_ACTIONS.has(a.action)).map((a) => a.rel));
  const needReconcile = backups.filter((b) => rewritten.has(b.path) || by('drifted').some((r) => r.path === b.path && isDeterministicAdapter(r.path)));
  const noop = backups.filter((b) => !needReconcile.some((n) => n.path === b.path));

  for (const b of noop) {
    // Nothing was rewritten, so the backup serves no item. Remove it rather than leaving a
    // committed duplicate of a file that still matches it.
    try { rmSync(join(upgradeRoot, b.backup), { force: true }); } catch { /* best effort */ }
  }

  if (needReconcile.length > 0) {
    console.log('');
    console.log('  Your edits were preserved before anything was touched:');
    for (const b of needReconcile) console.log(`    ${b.path}  →  ${b.backup}`);

    // Two channels, deliberately, and this is the WP-R8 pattern rather than a new invention. The
    // line above is recoverable from scrollback; the pending item below is recoverable without it.
    // The CLI records and never prompts: the only existing CLI prompt fails closed on a non-TTY,
    // which would hard-fail every CI upgrade, and its branches are untestable without a pty
    // dependency the zero-runtime-dependency invariant forbids. The agent prompts, at the start of
    // the next session, through the router pass that already exists.
    const backupsByPath = new Map(needReconcile.map((b) => [b.path, b.backup]));
    const descriptorsByPath = new Map(applied.map((a) => [a.rel, a.descriptors ?? []]));
    const outcome = raiseReconcileItems(
      upgradeRoot,
      needReconcile.map((b) => b.path),
      backupsByPath,
      descriptorsByPath,
      fromVersion,
      pkgVersion,
      classified.manifest,
    );

    if (outcome.raised.length > 0) {
      outcomeRaised = outcome.raised;
      console.log('');
      console.log(`  Added ${outcome.raised.length} reconcile item(s) to workflow/config/pending-setup.yaml.`);
      console.log('  Your agent will offer to resolve them at the start of the next session.');
    } else if (outcome.refused.length > 0) {
      // The only durable notification channel is unavailable. Saying nothing would leave the user
      // with a backup nothing points at and no idea it exists.
      console.warn('');
      console.warn(`  Could NOT record ${outcome.refused.length} reconcile item(s): workflow/config/pending-setup.yaml is missing or cannot take an append.`);
      console.warn('  Your edits are safe in the backup paths listed above, but nothing will prompt you');
      console.warn('  about them. Restore or repair that file, then re-run "agentsmyth upgrade".');
    } else {
      console.log('');
      console.log('  No new reconcile items — each of these was already raised for this version.');
    }
  }

  const changedActions = applied.filter((a) => a.action !== 'no-change');
  if (changedActions.length > 0) {
    console.log('');
    console.log('  Brought current:');
    for (const a of changedActions) {
      const detail = a.descriptors.length > 0 ? ` via ${a.descriptors.join(', ')}` : '';
      console.log(`    ${a.action.padEnd(15)} ${a.rel}${detail}`);
    }
  }

  // Manifest LAST, after every file has landed. A crash between a file write and this refresh
  // leaves the manifest describing the older content, so the next run reads the file as edited and
  // takes the conservative branch — back it up, flag it — rather than silently overwriting a real
  // edit. The reverse ordering inverts that.
  //
  // TARGETED, not a blanket re-baseline. Only entries for files this run actually wrote are
  // refreshed. A blanket re-baseline would hash whatever is on disk — including a file the user
  // edited that this upgrade had no change for — and record it as "what agentsmyth last wrote".
  // That silently erases the drift, so a LATER version that does ship a change for that file would
  // see it as pristine and overwrite the user's edit with no backup and no prompt. The manifest
  // means "what agentsmyth wrote"; a file agentsmyth did not write must keep its old entry.
  const written = new Set(applied.filter((a) => a.action !== 'no-change' && a.action !== 'left-for-reconcile').map((a) => a.rel));
  const finalHook = existsSync(hookPath) ? hookPath : null;
  const governedNow = new Set(governedArtifacts(upgradeRoot, finalHook));
  const kept = [];
  for (const entry of classified.manifest.entries) {
    if (!governedNow.has(entry.path)) continue; // deleted or no longer governed — drop it
    if (written.has(entry.path)) {
      const sha256 = digestFile(join(upgradeRoot, entry.path));
      if (sha256) kept.push({ path: entry.path, sha256, written_by_version: pkgVersion });
    } else {
      kept.push(entry); // untouched by this run — its recorded truth still stands
    }
  }
  // Newly governed files agentsmyth authored, plus anything refreshed that had no prior entry.
  for (const rel of governedNow) {
    if (kept.some((e) => e.path === rel)) continue;
    if (isDeterministicAdapter(rel) && !matchesAdapterRender(upgradeRoot, pkgRoot, rel)) continue;
    const sha256 = digestFile(join(upgradeRoot, rel));
    if (sha256) kept.push({ path: rel, sha256, written_by_version: pkgVersion });
  }

  writeProvenance(upgradeRoot, {
    version: 1,
    kind: 'provenance',
    format_version: provenanceFormatVersion(),
    written_by_version: pkgVersion,
    normalization: provenanceNormalization(),
    reconcile_raised: [...(classified.manifest.reconcile_raised ?? []), ...(typeof outcomeRaised !== 'undefined' ? outcomeRaised : [])],
    entries: kept,
  });
  console.log('');
  console.log(`  Provenance refreshed for ${kept.length} governed file(s). Upgrade complete.`);
  process.exit(0);
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

// Mandatory local lifecycle gate (R1): installed unconditionally, no separate opt-in step.
// Tool-agnostic — enforces at the git-commit layer, not any single AI tool's own mechanism.
const installedHookPath = installPreCommitHook(cwd, pkgRoot);

// Generic AGENTS.md fallback (WP-R23): the one enumerated placement that is create-or-replace rather
// than skip-if-exists, because the repos that already have an AGENTS.md are exactly the ones this is
// for. Runs after placeDeterministicAdapters() so it renders from the same resolved token set, and
// after installPreCommitHook() because the block's gate paragraph is written FROM that call's
// result. The order is not stylistic and cannot be swapped back in isolation: the argument does not
// exist until the hook's fate is decided, which is the structural half of F5's fix.
placeAgentsMd(cwd, pkgRoot, installedHookPath);

// Provenance baseline (WP-R18). Runs LAST among the placements on purpose: it hashes what is on
// disk, so every governed artifact — the five configs, the pre-commit hook, and the two
// deterministic adapters — must already be written. Moving this call above
// placeDeterministicAdapters() or installPreCommitHook() would silently produce a short manifest,
// and a governed artifact absent from the manifest is simply never upgraded.
//
// This is the FIRST of the two baseline moments. The second is the end of the agent-driven setup
// skill, which fills the config files this one has just hashed as placeholder templates — see
// recordProvenanceBaseline()'s own comment, and src/setup/SKILL.md's closing step.
//
// Degrades to a warning rather than failing init, matching placeAgentsMd(): a repo without a
// manifest still works exactly as it does today, it simply cannot be delta-upgraded until one
// exists. Failing init outright would be a worse trade for a file nothing yet reads.
try {
  // Re-running `init` on a repo that already has a manifest must NOT re-baseline it.
  //
  // `init`'s only re-entry gate is the `.agentsmyth/` scaffold directory, which setup deletes as its
  // final step — so once a repo is set up, re-running `init` (the pre-1.1 update instinct, since
  // `upgrade` did not exist) left config content alone but re-hashed whatever was on disk NOW.
  // Any hand-edit made since setup was adopted as content agentsmyth wrote; the next upgrade read
  // the file as `pristine`, and the edit the whole drift-detection feature exists to protect was
  // gone, with no backup and no reconcile item. Zero attacker, one keystroke.
  //
  // The same targeted-re-baseline reasoning was already applied to the upgrade path; this is where
  // the blanket version survived. `upgrade` is the verb that brings an existing repo current, and it
  // is what this now points at.
  if (existsSync(provenancePath(cwd))) {
    console.log('  workflow/provenance.yaml already exists — left untouched.');
    console.log('    Re-baselining it here would adopt any edit made since setup as agentsmyth\'s own');
    console.log('    content, erasing the drift a later upgrade needs to see. Run "agentsmyth upgrade"');
    console.log('    to bring this repo current, or "agentsmyth upgrade --baseline" to deliberately');
    console.log('    re-record the current files as the baseline.');
  } else {
    const provEntries = recordProvenanceBaseline(cwd, pkgVersionForProvenance(pkgRoot), installedHookPath, pkgRoot);
    console.log(`  recorded provenance for ${provEntries} governed file(s) → workflow/provenance.yaml`);
  }
} catch (err) {
  console.warn(`agentsmyth: could not record the provenance baseline — skipping.`);
  console.warn(`  ${err.message}`);
  console.warn('  Delta upgrades will not work in this repo until "agentsmyth upgrade --baseline" is run.');
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
console.log('  workflow/config/*.yaml, pending-setup.yaml, workflow/artifacts/, and');
console.log('  workflow/learnings/ are already scaffolded.');
console.log('');
console.log('Next step: open your AI agent and say:');
console.log('  "run the agentsmyth setup"');
console.log('');
console.log('The agent will resolve the open items in pending-setup.yaml,');
console.log('fill in the remaining workflow configs, and remove .agentsmyth/ when done.');
console.log('');
