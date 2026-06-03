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
} from '../.workflow/validators/lib.mjs';

const errors = [];
const details = [];
const schemas = schemaRegistry();
const contractsByArtifact = new Map(artifactContracts.map((contract) => [contract.artifact, contract]));
const contractsByDir = new Map(artifactContracts.map((contract) => [contract.dir, contract]));
const frontmatterSchema = loadYaml('.workflow/schemas/artifact-frontmatter.schema.yaml');
const examples = ['minimal-markdown-source', 'node-package', 'product-app'];
const banned = [
  'AI ' + 'Recipes',
  'ai-recipes' + '-workspace',
  'engineering-' + 'research-repo',
  'frontend-ai-' + 'starter-recipes',
  'backend-ai-' + 'starter-recipes',
  'Fa' + 're',
  'Ba' + 're',
  'workspace ' + 'root',
  'repos' + '/',
  'Codex' + '-only',
  'Notion ' + 'required',
  'npm run check' + ':dist as default',
];
const placeholder = new RegExp(
  ['Placeholder for a later ' + 'phase', 'Do not treat this as final workflow ' + 'behavior'].join('|'),
);

for (const example of examples) {
  const readme = `examples/${example}/README.md`;
  try {
    const text = readText(readme);
    if (!text.startsWith('# ')) errors.push(`${readme} should start with a heading`);
    details.push(`checked ${readme}`);
  } catch {
    errors.push(`${readme} is missing`);
  }
}

for (const file of listFiles('examples')) {
  if (!isTextFile(file)) continue;
  const text = readText(file);
  if (placeholder.test(text)) errors.push(`${file} contains placeholder text`);
  for (const term of banned) {
    if (text.includes(term)) errors.push(`${file} contains reference-specific term "${term}"`);
  }
}

for (const configPath of listFiles('examples').filter((file) => file.includes('/.workflow/config/') && file.endsWith('.yaml'))) {
  const config = loadYaml(configPath);
  if (!config.kind) {
    errors.push(`${configPath} missing kind`);
    continue;
  }
  const schemaPath = `.workflow/schemas/${config.kind}.schema.yaml`;
  const schema = loadYaml(schemaPath);
  validateSchema(config, schema, configPath, errors, schemas, schema);
  details.push(`checked ${configPath}`);
}

const artifactFiles = listFiles('examples').filter((file) => {
  return file.includes('/.workflow/artifacts/') && file.endsWith('.md') && !file.endsWith('/README.md');
});

for (const file of artifactFiles) {
  let parsed;
  try {
    parsed = parseFrontmatter(readText(file), file);
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

  const match = file.match(/\/\.workflow\/artifacts\/([^/]+)\/([^/]+)$/);
  if (!match) {
    errors.push(`${file} is not under an example artifact directory`);
    continue;
  }

  const [, dir, filename] = match;
  const dirContract = contractsByDir.get(dir);
  if (!dirContract) {
    errors.push(`${file} is in unknown artifact directory ${dir}`);
  } else if (dirContract.artifact !== parsed.frontmatter.artifact) {
    errors.push(`${file} directory ${dir} does not match artifact ${parsed.frontmatter.artifact}`);
  }

  const filenameMatch = filename.match(/^(.+)-v([0-9]+)\.md$/);
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
  if (parsed.frontmatter.orchestration?.next_phase !== contract.nextPhase) {
    errors.push(`${file} next_phase expected ${contract.nextPhase}`);
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
  errors.push('examples should include at least one lifecycle artifact');
}

finish('validate-example', errors, details);

function isTextFile(file) {
  return /\.(md|yaml|yml|json|js|mjs|txt)$/.test(file);
}
