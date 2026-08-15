#!/usr/bin/env node
import {
  defsPath,
  dataPath,
  finish,
  listFiles,
  loadYaml,
  pathExists,
  schemaRegistry,
  validateSchema,
} from './lib.mjs';

const errors = [];
const details = [];
const schemas = schemaRegistry();

// `--dir <path>` points config reads at a fixture tree instead of the repo's own workflow/config.
// Required by test/run-violation-tests.mjs, which invokes every validator that way; without it the
// WP-R8 tuning fixtures could not be exercised by the negative suite at all. Mirrors the same flag
// in check-assumptions.mjs and friends. Definitions reads (schemas, agent-behavior.yaml) are
// unaffected — they still resolve through defsPath.
const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const configDir = dirArgIdx !== -1 ? `${args[dirArgIdx + 1]}/config` : dataPath('config');

// Schemas live on the definitions side (defsPath) — a repo linked to a global install
// (definitions_root set, the default `init` flow) never gets its own local workflow/schemas/;
// only workflow/config/, workflow/artifacts/, and workflow/learnings/ stay repo-local (dataPath).
// This file previously hardcoded a single `workflow/` root for both, which produced false
// "no matching schema" failures for every repo linked to a global install.
for (const schemaPath of listFiles(defsPath('schemas')).filter((file) => file.endsWith('.yaml'))) {
  const schema = loadYaml(schemaPath);
  if (!schema.$schema) errors.push(`${schemaPath} missing $schema`);
  if (!schema.$id) errors.push(`${schemaPath} missing $id`);
  if (!schema.title) errors.push(`${schemaPath} missing title`);
  if (!schema.type) errors.push(`${schemaPath} missing type`);
  if (schema.type === 'object' && !schema.properties) {
    errors.push(`${schemaPath} object schema missing properties`);
  }
}

for (const configPath of listFiles(configDir).filter((file) => file.endsWith('.yaml'))) {
  const config = loadYaml(configPath);
  if (!config.kind) {
    errors.push(`${configPath} missing kind`);
    continue;
  }

  const schemaPath = defsPath('schemas', `${config.kind}.schema.yaml`);
  if (!pathExists(schemaPath)) {
    errors.push(`${configPath} has no matching schema ${schemaPath}`);
    continue;
  }

  const schema = loadYaml(schemaPath);
  validateSchema(config, schema, configPath, errors, schemas, schema);
  details.push(`checked ${configPath} against ${schemaPath}`);

  if (config.kind === 'repo-profile') {
    checkTuningCheckpointUnion(config, configPath);
    checkDerivedKeyProvenance(config, configPath);
  }
}

// WP-R8 RI8: `intent.derived_keys` records which `tuning:` values the agent derived from `intent:`
// rather than the user setting by hand. A later version that changes its derivation rules may
// safely re-derive anything listed; anything under `tuning:` NOT listed was a deliberate manual
// override and must never be silently overwritten.
//
// The failure mode this catches is a STALE entry: a key listed as derived that no longer exists
// under `tuning:`. That means intent and tuning have drifted apart, and the next upgrade would be
// reasoning from provenance that no longer describes the file. Left unchecked it degrades quietly
// — nothing else in the system would ever notice.
function checkDerivedKeyProvenance(config, configPath) {
  const derived = config.intent?.derived_keys;
  if (!Array.isArray(derived) || derived.length === 0) return;

  const stale = derived.filter((dotted) => {
    let node = config.tuning;
    for (const segment of dotted.split('.')) {
      if (node === null || typeof node !== 'object' || !(segment in node)) return true;
      node = node[segment];
    }
    return false;
  });

  if (stale.length > 0) {
    errors.push(
      `${configPath} intent.derived_keys lists ${stale.length} key(s) absent from tuning:: ` +
      `${stale.join(', ')}. Provenance has drifted from the values it describes — a later upgrade ` +
      `would re-derive against a stale map. Remove the entry or restore the tuning value.`
    );
    return;
  }

  details.push(`checked ${configPath} intent.derived_keys provenance (${derived.length} key(s))`);
}

// WP-R8: the ONE tuning rule a schema cannot express.
//
// Four of the five tunable keys resolve by override — the repo-local value simply replaces the
// global one, and the schema alone is enough to keep that safe (the enumeration lives there, and
// nowhere else; see repo-profile.schema.yaml's `tuning` description). The fifth,
// pause_resume.user_checkpoint_required_for, resolves by UNION instead: a repo may add
// checkpoints, never remove one. That is a relationship between two files, so no single-file
// schema can state it — hence this check, and hence the deliberate absence of any key list here.
//
// The failure this prevents is silent and severe: a repo that drops `ship-review` from a tuned
// list would, under override semantics, quietly stop requiring the checkpoint. That is the
// "looser" direction the governing rule forbids, on the one tunable that touches gating.
function checkTuningCheckpointUnion(config, configPath) {
  const tuned = config.tuning?.pause_resume?.user_checkpoint_required_for;
  if (!Array.isArray(tuned)) return;

  const behaviorPath = defsPath('agent-behavior.yaml');
  if (!pathExists(behaviorPath)) {
    // Not an error: a repo may legitimately be validated before its definitions root is
    // resolvable (fresh init, CI checkout without a global install). Recorded rather than
    // silently skipped, so a missing check never reads as a passing one.
    details.push(`skipped tuning checkpoint-union check for ${configPath} — ${behaviorPath} not found`);
    return;
  }

  const global = loadYaml(behaviorPath)?.pause_resume?.user_checkpoint_required_for;
  if (!Array.isArray(global)) return;

  const dropped = global.filter((checkpoint) => !tuned.includes(checkpoint));
  if (dropped.length > 0) {
    errors.push(
      `${configPath} tuning.pause_resume.user_checkpoint_required_for drops ${dropped.length} ` +
      `globally-required checkpoint(s): ${dropped.join(', ')}. This list is append-only — it is ` +
      `resolved by union with ${behaviorPath}, so a repo may add checkpoints but never remove one.`
    );
    return;
  }

  details.push(`checked ${configPath} tuning checkpoint union against ${behaviorPath}`);
}

finish('check-config', errors, details);
