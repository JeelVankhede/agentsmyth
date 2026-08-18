#!/usr/bin/env node
// Fails when a shipped schema uses a JSON Schema keyword that lib.mjs's hand-rolled validateSchema
// does not implement.
//
// Why this exists. Three engine gaps surfaced during one work
// package, each by accident: `maximum` was parsed and ignored, so a schema declaring `maximum: 10`
// accepted 99; schema-valued `additionalProperties` was parsed and ignored, so three open maps
// across two schemas were never validated at all. In both cases a schema author wrote a
// declaration in good faith, it silently had no effect, and nothing anywhere reported it. The
// declaration looked like a contract and was decoration.
//
// A documented list of supported keywords would drift the moment someone edits the engine. This
// check cannot: it reads the keyword set from one place and compares it against what the schemas
// actually use, at real schema positions.
//
// Keeping SUPPORTED in sync is a deliberate manual step — adding a keyword to validateSchema means
// adding it here, and that is the point. The failure mode this replaces was silence.
//
// KNOWN ASYMMETRY: only one direction of drift is guarded. Adding a keyword to
// validateSchema without listing it here fails loudly the next time a schema uses it — safe.
// REMOVING a keyword from validateSchema while it stays listed here restores the original silence:
// schemas keep using it, this check keeps passing, and the declaration is decoration again. If you
// delete a branch from validateSchema, delete its entry here in the same commit.
import { defsPath, finish, listFiles, loadYaml } from './lib.mjs';

// Keywords validateSchema actually branches on. Verified against the function body, not assumed.
const SUPPORTED = new Set([
  'type', 'const', 'enum', 'properties', 'required', 'additionalProperties',
  'items', 'minItems', 'minLength', 'minimum', 'maximum', 'pattern',
  'uniqueItems', 'contains', 'allOf', 'oneOf', '$ref', 'if', 'then', 'else',
]);

// Annotations the engine ignores by design — they document, they never constrain. Listed
// explicitly so "ignored on purpose" stays distinguishable from "ignored by accident", which is
// the entire distinction this validator exists to make.
const ANNOTATIONS = new Set([
  '$schema', '$id', 'title', 'description', '$defs', 'kind',
]);

// `x_enforcement` is honoured in exactly one place: directly on a schema-valued
// `additionalProperties` (see validateSchema). Anywhere else it is silently ignored, which would
// make the marker itself an instance of the defect this validator exists to catch — and a
// dangerous one, since its whole purpose is to soften a hard failure into a warning. So it is not
// a general annotation; it is legal at one position and an error everywhere else.
const POSITIONAL = { x_enforcement: 'additionalProperties' };

const errors = [];
const details = [];

// Walks only real schema positions. Values under `properties` are property NAMES whose values are
// schemas; everything else named here is a schema or a list of schemas. Getting this wrong in the
// permissive direction would make the check useless (property names would look like keywords), so
// the walk is explicit rather than heuristic.
function walk(node, schemaPath, file, position = null) {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return;

  for (const key of Object.keys(node)) {
    if (key in POSITIONAL) {
      if (position !== POSITIONAL[key]) {
        errors.push(
          `${file}: ${schemaPath || '<root>'} uses "${key}" outside a schema-valued ` +
          `"${POSITIONAL[key]}" — validateSchema only honours it there, so here it is silently ` +
          `ignored. Move it onto the ${POSITIONAL[key]} schema, or remove it: a marker that looks ` +
          `like it defers enforcement but does not is worse than no marker, because the failure it ` +
          `was meant to soften still happens.`
        );
      }
      continue;
    }
    if (!SUPPORTED.has(key) && !ANNOTATIONS.has(key)) {
      errors.push(
        `${file}: ${schemaPath || '<root>'} uses "${key}", which validateSchema does not implement — ` +
        `it will be silently ignored. Implement it in lib.mjs, or remove the declaration so the ` +
        `schema does not promise a constraint it cannot enforce.`
      );
    }
  }

  if (node.properties && typeof node.properties === 'object') {
    for (const [name, sub] of Object.entries(node.properties)) {
      walk(sub, `${schemaPath}.properties.${name}`, file);
    }
  }
  if (node.$defs && typeof node.$defs === 'object') {
    for (const [name, sub] of Object.entries(node.$defs)) {
      walk(sub, `${schemaPath}.$defs.${name}`, file);
    }
  }
  if (node.items) walk(node.items, `${schemaPath}.items`, file);
  if (node.contains) walk(node.contains, `${schemaPath}.contains`, file);
  // additionalProperties is a schema only in its object form; `true`/`false` are not schemas.
  if (node.additionalProperties && typeof node.additionalProperties === 'object') {
    walk(node.additionalProperties, `${schemaPath}.additionalProperties`, file, 'additionalProperties');
  }
  // if/then/else are schemas too — an unsupported keyword nested inside a conditional branch is
  // exactly as invisible as one at the top level, so the walk has to reach them.
  for (const conditional of ['if', 'then', 'else']) {
    if (node[conditional]) walk(node[conditional], `${schemaPath}.${conditional}`, file);
  }
  for (const combinator of ['allOf', 'oneOf']) {
    if (Array.isArray(node[combinator])) {
      node[combinator].forEach((sub, i) => walk(sub, `${schemaPath}.${combinator}[${i}]`, file));
    }
  }
}

const schemaFiles = listFiles(defsPath('schemas')).filter((f) => f.endsWith('.yaml'));
for (const file of schemaFiles) {
  walk(loadYaml(file), '', file.split('/').pop());
}

details.push(`checked ${schemaFiles.length} schema(s) against ${SUPPORTED.size} supported keyword(s)`);

finish('check-schema-keywords', errors, details);
