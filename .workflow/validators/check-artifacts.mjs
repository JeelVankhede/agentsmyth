#!/usr/bin/env node
import {
  artifactContracts,
  finish,
  headings,
  listFiles,
  loadYaml,
  parseFrontmatter,
  readText,
  schemaRegistry,
  validateSchema,
} from './lib.mjs';

const errors = [];
const details = [];
const contractsByArtifact = new Map(artifactContracts.map((contract) => [contract.artifact, contract]));
const contractsByDir = new Map(artifactContracts.map((contract) => [contract.dir, contract]));
const schemas = schemaRegistry();
const frontmatterSchema = loadYaml('.workflow/schemas/artifact-frontmatter.schema.yaml');
const placeholderPattern = new RegExp(
  ['Placeholder for a later ' + 'phase', 'Do not treat this as final workflow ' + 'behavior'].join('|'),
);

const artifactFiles = listFiles('.workflow/artifacts').filter((file) => {
  return file.endsWith('.md') && !file.endsWith('/README.md') && file !== '.workflow/artifacts/README.md';
});

for (const file of artifactFiles) {
  const text = readText(file);
  if (placeholderPattern.test(text)) {
    errors.push(`${file} contains placeholder text`);
  }

  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch (error) {
    errors.push(error.message);
    continue;
  }

  validateSchema(parsed.frontmatter, frontmatterSchema, `${file}.frontmatter`, errors, schemas, frontmatterSchema);

  const contract = contractsByArtifact.get(parsed.frontmatter.artifact);
  if (!contract) {
    errors.push(`${file} has unknown artifact ${parsed.frontmatter.artifact}`);
    continue;
  }

  const [, dir, filename] = file.match(/^\.workflow\/artifacts\/([^/]+)\/([^/]+)$/) ?? [];
  const dirContract = contractsByDir.get(dir);
  if (!dirContract) {
    errors.push(`${file} is in unknown artifact directory ${dir}`);
  } else if (dirContract.artifact !== parsed.frontmatter.artifact) {
    errors.push(`${file} directory ${dir} does not match artifact ${parsed.frontmatter.artifact}`);
  }

  const filenameMatch = filename?.match(/^(.+)-v([0-9]+)\.md$/);
  if (!filenameMatch) {
    errors.push(`${file} filename must match <slug>-v<N>.md`);
  } else {
    const [, slug, version] = filenameMatch;
    if (parsed.frontmatter.slug !== slug) {
      errors.push(`${file} slug ${parsed.frontmatter.slug} does not match filename slug ${slug}`);
    }
    if (String(parsed.frontmatter.version) !== version) {
      errors.push(`${file} version ${parsed.frontmatter.version} does not match filename version ${version}`);
    }
  }

  if (parsed.frontmatter.orchestration?.phase !== contract.phase) {
    errors.push(`${file} phase expected ${contract.phase}`);
  }
  if (
    parsed.frontmatter.orchestration?.next_phase !== contract.nextPhase &&
    parsed.frontmatter.status !== 'blocked' &&
    parsed.frontmatter.status !== 'blocked-for-user'
  ) {
    errors.push(`${file} unblocked next_phase expected ${contract.nextPhase}`);
  }
  if (parsed.frontmatter.architecture_notes?.role !== contract.role) {
    errors.push(`${file} role expected ${contract.role}`);
  }

  const bodyHeadings = headings(parsed.body);
  for (const section of contract.requiredSections) {
    if (!bodyHeadings.includes(section)) {
      errors.push(`${file} missing section "${section}"`);
    }
  }

  details.push(`checked ${file}`);
}

if (artifactFiles.length === 0) {
  details.push('no lifecycle artifact files found under .workflow/artifacts');
}

finish('check-artifacts', errors, details);
