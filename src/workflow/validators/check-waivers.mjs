#!/usr/bin/env node
// Wave 1 (A1) — waiver-completeness-check. Walks artifacts; for each artifact with a
// `## Waivers` markdown table, confirms every row carries all 6 fields required by
// agent-behavior.yaml's waivers.required_fields, in order, non-empty.
//
// Also flags prose OUTSIDE the ## Waivers section that looks like an unstructured waiver claim
// (mentions waiver/waived/waiving together with a manifest ID or "gate") — per the skill's own
// Refusal condition #1, a waiver referenced in prose but never moved into the structured table
// does not count as recorded. This is a heuristic, not a parser: it deliberately excludes the
// literal enum value "hold-with-waiver" (used throughout the lifecycle system as a legitimate
// status, not a claim) and common negations ("no waiver", "without a waiver"). Calibrated against
// this repo's own real artifacts at write time (0 false positives across workflow/artifacts/**)
// but can still misfire on prose not seen during calibration — that risk was accepted explicitly
// when this check was added (see workflow/artifacts/reviews/power-skills-spine-v1.md).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  defsPath,
  finish,
  listFiles,
  loadYaml,
  parseFrontmatter,
  readText,
  repoRoot,
} from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const wf = process.env.AGENTSMYTH_WF
  || (existsSync(join(repoRoot, 'workflow')) ? 'workflow' : ['.', 'workflow'].join(''));
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

const errors = [];
const details = [];

const behavior = loadYaml(defsPath('agent-behavior.yaml'));
const requiredFields = behavior?.waivers?.required_fields ?? [];

const artifactFiles = listFiles(artifactsDir).filter((file) => {
  return file.endsWith('.md') && !file.endsWith('/README.md') && file !== `${artifactsDir}/README.md`;
});

// Extracts the ## Waivers section body (up to the next ## heading or end of doc).
function waiversSection(body) {
  const match = body.match(/## Waivers\s*\n([\s\S]*?)(?=\n## |\n---|\s*$)/);
  return match ? match[1] : null;
}

// Parses a markdown table into an array of row-cell arrays, skipping the header/divider rows.
function parseTableRows(tableText) {
  const lines = tableText.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('|'));
  if (lines.length < 2) return [];
  const rows = lines.slice(1).filter((l) => !/^\|[\s-:|]+\|$/.test(l));
  return rows.map((line) =>
    line.slice(1, -1).split('|').map((cell) => cell.trim())
  );
}

// Flags lines outside the ## Waivers section that look like an unstructured waiver claim.
function unstructuredWaiverMentions(body) {
  const withoutWaiversSection = body.replace(/## Waivers\s*\n[\s\S]*?(?=\n## |\n---|\s*$)/, '');
  const flagged = [];
  for (const rawLine of withoutWaiversSection.split('\n')) {
    const line = rawLine.replace(/hold-with-waiver/gi, ''); // legitimate enum value, not a claim
    if (!/\bwaiv(?:er|ed|ing)\b/i.test(line)) continue;
    if (/\bno\b.{0,15}\bwaiv|\bwithout\b.{0,10}\bwaiv|\bnot\b.{0,10}\bwaiv|waiver-completeness-check|check-waivers/i.test(line)) continue;
    if (!/\b(R|RI)\d+\b|\bgate\b/i.test(line)) continue;
    flagged.push(rawLine.trim());
  }
  return flagged;
}

let waiversChecked = 0;

for (const file of artifactFiles) {
  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue; // structural frontmatter errors are check-artifacts's job, not this validator's
  }

  const unstructured = unstructuredWaiverMentions(parsed.body);
  for (const line of unstructured) {
    errors.push(`${file} has a possible unstructured waiver claim outside the Waivers table: "${line}" — confirm or move it into a ## Waivers row`);
  }

  const section = waiversSection(parsed.body);
  if (!section) continue; // no Waivers section — trivial pass, nothing further to check

  const rows = parseTableRows(section);
  for (const [index, row] of rows.entries()) {
    waiversChecked++;
    if (row.length < requiredFields.length) {
      errors.push(
        `${file} Waivers row ${index + 1} has ${row.length} column(s), expected ${requiredFields.length} (${requiredFields.join(', ')})`
      );
      continue;
    }
    requiredFields.forEach((field, fieldIdx) => {
      const value = row[fieldIdx];
      if (!value || /^(tbd|n\/a|-)$/i.test(value)) {
        errors.push(`${file} Waivers row ${index + 1} missing or placeholder value for "${field}"`);
      }
    });
  }

  details.push(`checked ${file} (${rows.length} waiver row(s))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}
details.push(`${waiversChecked} waiver row(s) checked total`);

finish('check-waivers', errors, details);
