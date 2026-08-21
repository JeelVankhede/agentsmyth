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

// Waivers content is free prose (confirmed by reading real Waivers tables — the "Waived
// Gate/Requirement" column is descriptive text like "scope-fence (Plan Touches list, Phase
// 3)", not a bare ID or a structured tag), so this stays a prose scan rather than switching
// to check-manifest-coverage.mjs's structured-tag approach — doing that here would silently
// stop finding IDs in typical real waivers entirely. The confirmed, narrow fix: exclude a
// match immediately preceded by a hyphen, which is what a hyphenated compound-token mention
// (e.g. a cross-reference like "prefix-R4-suffix") looks like — while still matching a
// genuine bare mention, including inside parentheses like "(RI2)"/"(RI5)" (real instances
// confirmed) since a paren isn't a hyphen. A trailing-hyphen exclusion was tried first but
// rejected during review: it also excluded a hyphenated sub-label reference like "RI5-a",
// which should still credit its base ID "RI5" — the leading-hyphen exclusion alone already
// fully covers the real compound-token cases, so the trailing exclusion was pure
// over-correction.
function waiverIds(body) {
  const match = body.match(/## Waivers\s*\n([\s\S]*?)(?=\n## |\n---|\s*$)/);
  if (!match) return new Set();
  const ids = new Set();
  for (const m of match[1].matchAll(/(?<!-)\b(R(?:I)?[0-9]+)\b/g)) ids.add(m[1]);
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

  // A drop is a STATUS, so it must be read as one. This used to scan the whole row, which meant any
  // incidental prose containing "dropped" was read as a drop claim — a row reading "availability
  // recorded, never silently dropped" was rejected as "marked dropped/removed", i.e. the validator
  // concluded the exact opposite of what the cell said. Same false-positive class as the
  // "rather than ... a waiver" waiver bug and the compound-token manifest-ID bug: a keyword matched
  // without regard to its clause.
  //
  // Now a cell must *begin* with the status token to count. That still catches a real drop written
  // as "dropped — superseded by R9", while prose that merely mentions the word does not match.
  const droppedStatus = /^(dropped|removed|out of scope|removed from scope)\b/i;
  const isDropClaim = (row) =>
    row
      .split('|')
      .map((cell) => cell.trim().replace(/^\*+|\*+$/g, ''))
      .some((cell) => droppedStatus.test(cell));

  for (const id of manifestIds) {
    const idPattern = new RegExp(`\\b${id}\\b`);
    const rowMatch = section.split('\n').find((line) => line.includes('|') && idPattern.test(line));
    if (!rowMatch) {
      errors.push(`${file} manifest ID ${id} has no row in the coverage table`);
      continue;
    }
    if (isDropClaim(rowMatch) && !waived.has(id)) {
      errors.push(`${file} manifest ID ${id} is marked dropped/removed with no matching Waivers entry`);
    }
  }

  details.push(`checked ${file} (${manifestIds.length} manifest ID(s))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

finish('check-coverage-ledger', errors, details);
