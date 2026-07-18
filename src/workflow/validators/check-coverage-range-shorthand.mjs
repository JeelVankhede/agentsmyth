#!/usr/bin/env node
// For any artifact's Requirement Coverage / Manifest Coverage (or Manifest Coverage
// Retrospective) table, flags a row whose Manifest ID cell uses dash-range shorthand (e.g.
// "R1-R4") instead of listing each covered ID. Scoped narrowly to this one table position —
// not free text anywhere in a document — because that shorthand is legitimate, widely-used
// narrative convention everywhere else (e.g. "Active manifest IDs: R1-R7"); only inside this
// specific table does it hide a real per-ID coverage gap from the row-lookup other validators
// rely on. Must not flag a hyphenated sub-label (e.g. "RI5-a", a real convention for
// decomposing one requirement into per-phase sub-parts) or a comma-separated multi-ID cell
// (e.g. "R9, RI3, RI4") — both are legitimate and distinct from a range.
import { finish, listFiles, parseFrontmatter, readText, wf } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

const errors = [];
const details = [];

const artifactFiles = listFiles(artifactsDir).filter((file) => {
  return file.endsWith('.md') && !file.endsWith('/README.md') && file !== `${artifactsDir}/README.md`;
});

function coverageSection(body) {
  const match = body.match(/## (?:Requirement Coverage|Manifest Coverage(?: Retrospective)?)\s*\n([\s\S]*?)(?=\n## |\n---|\s*$)/);
  return match ? match[1] : null;
}

// A range is two full ID tokens joined by a hyphen/en-dash, e.g. "R1-R4" or "RI2–RI5". This
// intentionally does NOT match "RI5-a" (suffix after the hyphen is not itself an R/RI token)
// or "R9, RI3, RI4" (comma-separated, no hyphen between two ID tokens).
const RANGE_PATTERN = /\bR(I)?[0-9]+[–-]R(I)?[0-9]+\b/;

for (const file of artifactFiles) {
  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  const section = coverageSection(parsed.body);
  if (!section) continue;

  let rowCount = 0;
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const firstCell = line.split('|')[1]?.trim() ?? '';
    if (!firstCell || /^-+$/.test(firstCell) || /^manifest id$/i.test(firstCell)) continue;
    rowCount++;
    if (RANGE_PATTERN.test(firstCell)) {
      errors.push(`${file} Requirement/Manifest Coverage row uses range shorthand "${firstCell}" as its Manifest ID cell — list each covered ID instead (e.g. "R1, R2, R3, R4")`);
    }
  }
  if (rowCount > 0) details.push(`checked ${file} (${rowCount} coverage row(s))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

finish('check-coverage-range-shorthand', errors, details);
