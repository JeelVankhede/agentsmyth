#!/usr/bin/env node
// check-definitions. Validates each DEFINITIONS file against the schema that describes it.
//
// Why this is its own validator, run under AGENTSMYTH_WF rather than folded into check-config.
// check-config validates repo-local config (`workflow/config/*.yaml`), which is user data and must
// stay on the repo-local root. Definitions — agent-behavior.yaml and the schemas beside it — are
// package SOURCE, and in this repo they live at src/workflow/. Those two live under different roots
// and cannot be checked by one invocation: AGENTSMYTH_WF moves both defsRoot and dataRoot together,
// so pointing check-config at the source would send it looking for src/workflow/config/, which does
// not exist.
//
// The defect this closes. `agent-behavior.schema.yaml` declares a required-key list, two enums and
// numeric bounds, and for a whole release nothing loaded it at all. Wiring it into check-config fixed that
// only for whichever copy the two-root resolver happened to return — on a developer machine that is
// ~/.agentsmyth/workflow, which only moves when `agentsmyth prepare` runs, so a schema change in
// src/ was validated against a STALE copy and reported clean. Meanwhile CI, which has no
// ~/.agentsmyth, fell back to the repo-local copy `npm run build` syncs. Local and CI were
// therefore validating different files, and neither was reliably the source.
//
// Run under AGENTSMYTH_WF=src/workflow this validates the file that actually ships, identically on
// every machine, with no dependency on whether a global install exists or is current.
import { defsPath, finish, listFiles, loadYaml, pathExists, schemaRegistry, validateSchema } from './lib.mjs';

const errors = [];
const details = [];
const schemas = schemaRegistry();

// Definitions files are matched to their schema by `kind`, exactly as check-config matches repo
// config. Listed explicitly rather than globbed: a definitions root also holds skills, references
// and the schemas themselves, and a glob would try to validate all of them.
const DEFINITIONS = ['agent-behavior.yaml'];

for (const name of DEFINITIONS) {
  const filePath = defsPath(name);
  if (!pathExists(filePath)) {
    // Absent is legitimate — a consumer repo linked to a global install has no local copy, and a
    // fresh checkout may not have prepared one. Recorded rather than skipped silently, so a check
    // that did not run never reads as one that passed.
    details.push(`skipped ${name} — not present at ${filePath}`);
    continue;
  }

  const doc = loadYaml(filePath);
  if (!doc?.kind) {
    errors.push(`${filePath} missing kind — cannot select a schema to validate it against`);
    continue;
  }

  const schemaPath = defsPath('schemas', `${doc.kind}.schema.yaml`);
  if (!pathExists(schemaPath)) {
    errors.push(`${filePath} declares kind "${doc.kind}" but no matching schema exists at ${schemaPath}`);
    continue;
  }

  const schema = loadYaml(schemaPath);
  const before = errors.length;
  validateSchema(doc, schema, filePath, errors, schemas, schema);
  details.push(
    errors.length === before
      ? `checked ${filePath} against ${schemaPath}`
      : `checked ${filePath} against ${schemaPath} — ${errors.length - before} violation(s)`
  );
}

// A schema that describes nothing is the same defect one step earlier: it would sit in the tree
// looking like a contract while no document is held to it. Reported as detail rather than an error,
// since a schema for a config file this validator does not own is legitimate.
const definitionKinds = new Set(
  DEFINITIONS.map((name) => (pathExists(defsPath(name)) ? loadYaml(defsPath(name))?.kind : null)).filter(Boolean)
);
if (definitionKinds.size > 0) {
  details.push(`definitions validated by kind: ${[...definitionKinds].join(', ')}`);
}

if (listFiles(defsPath('schemas')).length === 0) {
  details.push(`no schemas found under ${defsPath('schemas')} — nothing to validate against`);
}

finish('check-definitions', errors, details);
