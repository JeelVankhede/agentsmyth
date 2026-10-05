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
let checked = 0;
let skipped = 0;
const schemas = schemaRegistry();

// Definitions files are matched to their schema by `kind`, exactly as check-config matches repo
// config. Listed explicitly rather than globbed: a definitions root also holds skills, references
// and the schemas themselves, and a glob would try to validate all of them.
const DEFINITIONS = ['agent-behavior.yaml'];

for (const name of DEFINITIONS) {
  const filePath = defsPath(name);
  if (!pathExists(filePath)) {
    // Absent is legitimate for a CONSUMER repo linked to a global install. It is not legitimate
    // here: this validator runs under AGENTSMYTH_WF against the package source, where the file
    // always exists. Reporting `ok` after validating nothing is the failure this validator was
    // created to fix, one level up — so absence is counted, and a run that validated nothing at
    // all fails below rather than passing quietly.
    details.push(`skipped ${name} — not present at ${filePath}`);
    skipped++;
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
  checked++;
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

// A validator that reports success having checked nothing is indistinguishable from one that
// checked everything and found nothing wrong. That ambiguity is precisely what this file exists to
// remove, so it refuses to be an instance of it.
if (checked === 0) {
  errors.push(`check-definitions validated no definitions file (${skipped} skipped, ${listFiles(defsPath('schemas')).length} schema(s) found under ${defsPath('schemas')}); reporting ok here would be a pass that exercised nothing`);
}

finish('check-definitions', errors, details);
