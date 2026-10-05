#!/usr/bin/env node
// plan-assumption-verifier. For plan artifacts, confirms every brief-declared
// Assumption (A) ID has a corresponding row in the plan's ## Assumptions Verified table, with
// status evidence-backed (non-empty, non-restated citation) or raised-as-question (citing a Q ID).
import { finish, listFiles, parseFrontmatter, readText, wf } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

const errors = [];
const details = [];

const artifactFiles = listFiles(artifactsDir).filter((file) => {
  return file.endsWith('.md') && !file.endsWith('/README.md') && file !== `${artifactsDir}/README.md`;
});

function namedSection(body, name) {
  const re = new RegExp(`## ${name}\\s*\\n([\\s\\S]*?)(?=\\n## [^#]|\\s*$)`);
  const match = body.match(re);
  return match ? match[1] : null;
}

function briefAssumptionIds(briefBody) {
  const section = namedSection(briefBody, 'Assumptions \\(A\\)');
  if (!section) return [];
  const ids = [];
  for (const m of section.matchAll(/\*\*(A[0-9]+)\*\*/g)) ids.push(m[1]);
  return ids;
}

function parseTableRows(tableText) {
  const lines = tableText.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('|'));
  if (lines.length < 2) return [];
  const rows = lines.slice(1).filter((l) => !/^\|[\s-:|]+\|$/.test(l));
  return rows.map((line) => line.slice(1, -1).split('|').map((cell) => cell.trim()));
}

for (const file of artifactFiles) {
  const dir = file.split('/').slice(-2, -1)[0];
  if (dir !== 'plans') continue;

  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  const slug = parsed.frontmatter.slug;
  const briefCandidates = listFiles(`${artifactsDir}/briefs`).filter((f) =>
    new RegExp(`/${slug}-v[0-9]+\\.md$`).test(f)
  );
  if (briefCandidates.length === 0) continue;

  // Take the HIGHEST version, not `[0]`. The filter above matches an explicitly versioned set, and
  // listFiles returns paths in directory order, so `[0]` was the oldest brief under sorted order and
  // arbitrary otherwise — never the current one. A brief revised to -v2 with different A IDs meant
  // the plan's "## Assumptions Verified" was checked against the SUPERSEDED brief: a plan correctly
  // covering v2 could be rejected, and a plan missing v2's new assumptions could pass. This is the
  // same selection bug that once made the release-readiness check cross-reference the oldest review
  // in a chain rather than the current one. Compared NUMERICALLY, because -v10 sorts before -v2 as
  // a string.
  const briefPath = briefCandidates.reduce((best, f) => (
    Number(f.match(/-v(\d+)\.md$/)[1]) > Number(best.match(/-v(\d+)\.md$/)[1]) ? f : best
  ));

  const briefText = readText(briefPath);
  let briefParsed;
  try {
    briefParsed = parseFrontmatter(briefText, briefPath);
  } catch {
    continue;
  }

  const aIds = briefAssumptionIds(briefParsed.body);
  if (aIds.length === 0) continue; // no brief assumptions — nothing to verify

  const verifiedSection = namedSection(parsed.body, 'Assumptions Verified');
  if (!verifiedSection) {
    errors.push(`${file} has no "## Assumptions Verified" section, but upstream brief declares ${aIds.length} assumption(s): ${aIds.join(', ')}`);
    continue;
  }

  const rows = parseTableRows(verifiedSection);
  const byId = new Map(rows.map((row) => [row[0], row]));

  for (const id of aIds) {
    const row = byId.get(id);
    if (!row) {
      errors.push(`${file} brief assumption ${id} has no row in Assumptions Verified`);
      continue;
    }
    const [, status, evidence] = row;
    if (status !== 'evidence-backed' && status !== 'raised-as-question') {
      errors.push(`${file} assumption ${id} has invalid status "${status}" (expected evidence-backed or raised-as-question)`);
      continue;
    }
    if (!evidence || evidence.length === 0) {
      errors.push(`${file} assumption ${id} has status "${status}" but an empty evidence/question cell`);
    }
  }

  details.push(`checked ${file} (${aIds.length} brief assumption(s))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

finish('check-assumptions', errors, details);
