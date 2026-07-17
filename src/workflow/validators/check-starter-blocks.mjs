#!/usr/bin/env node
// check-starter-blocks. Contract-conformance guard (audit-remediation R12).
//
// For every artifact contract, confirms its output-schema.md has a `## Starter Block` and — the part
// that matters — that the block an author would copy actually PARSES and VALIDATES against
// artifact-frontmatter.schema.yaml. This is the "cook from every recipe" check: it instantiates each
// starter block (substituting the obvious placeholders) and runs the real frontmatter schema over it,
// so a starter block that ships an invalid shape (e.g. a map-form `upstream` the schema rejects)
// turns the build red instead of only failing once an agent copies it into a live chain.
//
// Runs as a source check via scripts/validate-template.mjs with AGENTSMYTH_WF=src/workflow.
import {
  artifactContracts,
  defsPath,
  finish,
  loadYaml,
  parseFrontmatter,
  pathExists,
  readText,
  validateSchema,
  schemaRegistry,
} from './lib.mjs';

const errors = [];
const details = [];

// `--file <path>` validates a single output-schema.md's starter block (used by the conformance test
// to prove the guard fails on a seeded broken block); default mode walks every artifact contract.
const fileArgIdx = process.argv.indexOf('--file');
const singleFile = fileArgIdx !== -1 ? process.argv[fileArgIdx + 1] : null;

const frontmatterSchema = loadYaml(defsPath('schemas', 'artifact-frontmatter.schema.yaml'));
const schemas = schemaRegistry();

// Extracts the fenced ```markdown … ``` body that follows the `## Starter Block` heading.
function extractStarterBlock(text) {
  const afterHeading = text.split('## Starter Block')[1];
  if (afterHeading === undefined) return null;
  const fence = afterHeading.match(/```markdown\n([\s\S]*?)```/);
  return fence ? fence[1] : null;
}

// Substitute the placeholders an author is expected to replace, with schema-valid stand-ins, so the
// block can be validated as if instantiated. Only touches angle-bracket placeholders — real values
// (enum statuses, `phase:` names, empty arrays) are left untouched and must pass on their own.
function instantiate(block) {
  return block
    .replace(/<slug>/g, 'example')
    .replace(/-v<N>/g, '-v1')
    .replace(/<YYYY-MM-DD>/g, '2026-01-01');
}

// contract may be null in --file mode (no artifact-vs-contract check without a known contract).
function checkOne(starterBlockPath, contract) {
  if (!pathExists(starterBlockPath)) {
    errors.push(`${starterBlockPath} is missing`);
    return;
  }

  const text = readText(starterBlockPath);
  if (!text.includes('## Starter Block')) {
    errors.push(`${starterBlockPath} is missing a "## Starter Block" section`);
    return;
  }

  const block = extractStarterBlock(text);
  if (!block) {
    errors.push(`${starterBlockPath} has a "## Starter Block" heading but no \`\`\`markdown fenced block`);
    return;
  }

  let parsed;
  try {
    parsed = parseFrontmatter(instantiate(block), starterBlockPath);
  } catch (e) {
    errors.push(`${starterBlockPath} starter block frontmatter does not parse: ${e.message}`);
    return;
  }

  validateSchema(
    parsed.frontmatter,
    frontmatterSchema,
    `${starterBlockPath} starter-block frontmatter`,
    errors,
    schemas,
    frontmatterSchema,
  );

  if (contract && parsed.frontmatter.artifact !== contract.artifact) {
    errors.push(`${starterBlockPath} starter block artifact "${parsed.frontmatter.artifact}" != contract "${contract.artifact}"`);
  }

  details.push(`checked ${starterBlockPath} (frontmatter validates)`);
}

if (singleFile) {
  checkOne(singleFile, null);
} else {
  for (const contract of artifactContracts) {
    checkOne(contract.starterBlock, contract);
  }
}

finish('check-starter-blocks', errors, details);
