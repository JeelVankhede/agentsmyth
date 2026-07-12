#!/usr/bin/env node
// coverage-tracer. For plan/review/ship/reflect artifacts, confirms every
// manifest ID declared in the artifact's own frontmatter appears as a row in its
// Requirement Coverage (or Manifest Coverage Retrospective) table, and that any row using
// dropped/removed language is accompanied by a Waivers section entry for that ID.
import { finish, listFiles, parseFrontmatter, readText, wf } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

const errors = [];
const details = [];

const LEDGER_DIRS = new Set(['plans', 'reviews', 'ship', 'reflect']);

const artifactFiles = listFiles(artifactsDir).filter((file) => {
  return file.endsWith('.md') && !file.endsWith('/README.md') && file !== `${artifactsDir}/README.md`;
});

function coverageSection(body) {
  const match = body.match(/## (?:Requirement Coverage|Manifest Coverage Retrospective)\s*\n([\s\S]*?)(?=\n## |\n---|\s*$)/);
  return match ? match[1] : null;
}

function waiverIds(body) {
  const match = body.match(/## Waivers\s*\n([\s\S]*?)(?=\n## |\n---|\s*$)/);
  if (!match) return new Set();
  const ids = new Set();
  for (const m of match[1].matchAll(/\b(R(?:I)?[0-9]+)\b/g)) ids.add(m[1]);
  return ids;
}

for (const file of artifactFiles) {
  const dir = file.split('/').slice(-2, -1)[0];
  if (!LEDGER_DIRS.has(dir)) continue;

  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  const manifestIds = parsed.frontmatter.manifest_ids ?? [];
  if (manifestIds.length === 0) continue;

  const section = coverageSection(parsed.body);
  if (!section) {
    // check-artifacts already enforces section presence for artifact types that require it;
    // this validator only checks per-ID row coverage once the section exists.
    continue;
  }

  const waived = waiverIds(parsed.body);
  const droppedPattern = /dropped|removed from scope|out of scope/i;

  for (const id of manifestIds) {
    const idPattern = new RegExp(`\\b${id}\\b`);
    const rowMatch = section.split('\n').find((line) => line.includes('|') && idPattern.test(line));
    if (!rowMatch) {
      errors.push(`${file} manifest ID ${id} has no row in the coverage table`);
      continue;
    }
    if (droppedPattern.test(rowMatch) && !waived.has(id)) {
      errors.push(`${file} manifest ID ${id} is marked dropped/removed with no matching Waivers entry`);
    }
  }

  details.push(`checked ${file} (${manifestIds.length} manifest ID(s))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

finish('check-coverage-ledger', errors, details);
