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

for (const configPath of listFiles(dataPath('config')).filter((file) => file.endsWith('.yaml'))) {
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
}

finish('check-config', errors, details);
