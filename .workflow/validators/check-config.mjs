#!/usr/bin/env node
import {
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

for (const schemaPath of listFiles('.workflow/schemas').filter((file) => file.endsWith('.yaml'))) {
  const schema = loadYaml(schemaPath);
  if (!schema.$schema) errors.push(`${schemaPath} missing $schema`);
  if (!schema.$id) errors.push(`${schemaPath} missing $id`);
  if (!schema.title) errors.push(`${schemaPath} missing title`);
  if (!schema.type) errors.push(`${schemaPath} missing type`);
  if (schema.type === 'object' && !schema.properties) {
    errors.push(`${schemaPath} object schema missing properties`);
  }
}

for (const configPath of listFiles('.workflow/config').filter((file) => file.endsWith('.yaml'))) {
  const config = loadYaml(configPath);
  if (!config.kind) {
    errors.push(`${configPath} missing kind`);
    continue;
  }

  const schemaPath = `.workflow/schemas/${config.kind}.schema.yaml`;
  if (!pathExists(schemaPath)) {
    errors.push(`${configPath} has no matching schema ${schemaPath}`);
    continue;
  }

  const schema = loadYaml(schemaPath);
  validateSchema(config, schema, configPath, errors, schemas, schema);
  details.push(`checked ${configPath} against ${schemaPath}`);
}

finish('check-config', errors, details);
