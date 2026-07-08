#!/usr/bin/env node
import {
  artifactContracts,
  defsPath,
  finish,
  headings,
  listFiles,
  loadYaml,
  parseFrontmatter,
  readText,
  repoRoot,
  schemaRegistry,
  validateSchema,
} from './lib.mjs';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const wf = process.env.AGENTSMYTH_WF
  || (existsSync(join(repoRoot, 'workflow')) ? 'workflow' : ['.', 'workflow'].join(''));

// --dir <path> overrides the default artifacts root (used for fixture testing)
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

const errors = [];
const details = [];
const contractsByArtifact = new Map(artifactContracts.map((contract) => [contract.artifact, contract]));
const contractsByDir = new Map(artifactContracts.map((contract) => [contract.dir, contract]));
const schemas = schemaRegistry();
const frontmatterSchema = loadYaml(defsPath('schemas', 'artifact-frontmatter.schema.yaml'));
const placeholderPattern = new RegExp(
  ['Placeholder for a later ' + 'phase', 'Do not treat this as final workflow ' + 'behavior'].join('|'),
);
// Matches <artifactsDir>/<subdir>/<file> — built dynamically so --dir works
const artifactPathRe = new RegExp(`^${artifactsDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/([^/]+)/([^/]+)$`);

const artifactFiles = listFiles(artifactsDir).filter((file) => {
  return file.endsWith('.md') && !file.endsWith('/README.md') && file !== `${artifactsDir}/README.md`;
});

// ── Per-artifact checks ────────────────────────────────────────────────────
const parsedByFile = new Map();

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

  const [, dir, filename] = file.match(artifactPathRe) ?? [];
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

  // Ready-for-next-phase must not have unresolved blockers
  if (
    parsed.frontmatter.orchestration?.status === 'ready-for-next-phase' &&
    (parsed.frontmatter.orchestration?.blockers ?? []).length > 0
  ) {
    const blockers = parsed.frontmatter.orchestration.blockers.join(', ');
    errors.push(`${file} claims ready-for-next-phase but has unresolved blockers: ${blockers}`);
  }

  const bodyHeadings = headings(parsed.body);
  for (const section of contract.requiredSections) {
    if (!bodyHeadings.includes(section)) {
      errors.push(`${file} missing section "${section}"`);
    }
  }

  details.push(`checked ${file}`);
  parsedByFile.set(file, { parsed, dir, filename });
}

// ── Cross-artifact checks ──────────────────────────────────────────────────
// Build brief manifest ID map: slug → Set<string> of declared IDs (e.g. R1, RI2)
const briefManifestIds = new Map();
for (const [file, { parsed, dir }] of parsedByFile) {
  if (dir !== 'briefs') continue;
  const slug = parsed.frontmatter.slug;
  const manifestSection = parsed.body.match(/## Requirement Manifest[\s\S]*?(?=\n## |\n---|\s*$)/)?.[0] ?? '';
  const ids = new Set();
  for (const m of manifestSection.matchAll(/\*\*(R(?:I)?[0-9]+)\*\*/g)) ids.add(m[1]);
  // Keep the latest-version brief per slug
  const existing = briefManifestIds.get(slug);
  if (!existing || (parsed.frontmatter.version ?? 0) > (existing.version ?? 0)) {
    briefManifestIds.set(slug, { ids, version: parsed.frontmatter.version });
  }
}

// Check task artifacts: every manifest_id must appear in the upstream brief
for (const [file, { parsed, dir }] of parsedByFile) {
  if (dir !== 'tasks') continue;
  const slug = parsed.frontmatter.slug;
  const briefEntry = briefManifestIds.get(slug);
  if (!briefEntry) {
    errors.push(`${file} has no corresponding brief in ${artifactsDir}/briefs/ — cannot validate manifest IDs`);
    continue;
  }
  for (const id of (parsed.frontmatter.manifest_ids ?? [])) {
    if (!briefEntry.ids.has(id)) {
      errors.push(`${file} manifest_id ${id} is not declared in the upstream brief for slug "${slug}"`);
    }
  }
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

finish('check-artifacts', errors, details);
