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

// Extracts the ## Skipped Checks section body — a verify artifact's own structured location for
// a waiver-adjacent disclosure (its "Blocks Ship" column's `waiver-required` value is a legitimate
// enum from verification.yaml, not unstructured prose).
function skippedChecksSection(body) {
  const match = body.match(/## Skipped Checks\s*\n([\s\S]*?)(?=\n## |\n---|\s*$)/);
  return match ? match[1] : null;
}

// Extracts the ## Risk And Rollback section body — a ship artifact's designated location for
// applying waiver policy (lifecycle-ship/SKILL.md Workflow step 8: "Apply waiver policy for any
// unresolved risk... in Risk And Rollback"). Prose-based, not a table, so "substantive" means
// non-empty and not the literal "none" placeholder, not "has parseable table rows."
function riskAndRollbackSection(body) {
  const match = body.match(/## Risk And Rollback\s*\n([\s\S]*?)(?=\n## |\n---|\s*$)/);
  return match ? match[1] : null;
}

function isSubstantive(sectionText) {
  const trimmed = (sectionText ?? '').trim();
  return trimmed.length > 0 && !/^none$/i.test(trimmed);
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

// Flags lines outside the ## Waivers/## Skipped Checks/## Risk And Rollback sections that look
// like an unstructured waiver claim. If the document already has at least one real row in either
// structured table, or a substantive Risk And Rollback section (a ship artifact's designated
// waiver-policy location, prose not table), further prose mentions elsewhere in the same document
// are treated as legitimate cross-references to that already-recorded entry, not a hidden,
// never-structured claim — the P2 scenario this check exists to catch is a waiver mentioned in
// prose with ZERO structured disclosure anywhere in the document, not every incidental mention
// once a real disclosure already exists. Found via dogfooding: a real verify artifact's own
// "Skipped Checks" row plus Architecture Notes referencing it, and separately a real ship
// artifact's Architecture Notes referencing its own substantive Risk And Rollback section, were
// both false-flagged before these fixes (workflow/artifacts/{verify,ship}/power-skills-wave2-v1.md).
function unstructuredWaiverMentions(body) {
  const withoutStructuredSections = body
    .replace(/## Waivers\s*\n[\s\S]*?(?=\n## |\n---|\s*$)/, '')
    .replace(/## Skipped Checks\s*\n[\s\S]*?(?=\n## |\n---|\s*$)/, '')
    .replace(/## Risk And Rollback\s*\n[\s\S]*?(?=\n## |\n---|\s*$)/, '');

  const hasStructuredRow =
    parseTableRows(waiversSection(body) ?? '').length > 0 ||
    parseTableRows(skippedChecksSection(body) ?? '').length > 0 ||
    isSubstantive(riskAndRollbackSection(body));

  const flagged = [];
  for (const rawLine of withoutStructuredSections.split('\n')) {
    const line = rawLine.replace(/hold-with-waiver/gi, ''); // legitimate enum value, not a claim
    if (!/\bwaiv(?:er|ed|ing)\b/i.test(line)) continue;
    if (/\bno\b.{0,15}\bwaiv|\bwithout\b.{0,10}\bwaiv|\bnot\b.{0,10}\bwaiv|waiver-completeness-check|check-waivers/i.test(line)) continue;
    if (!/\b(R|RI)\d+\b|\bgate\b/i.test(line)) continue;
    if (hasStructuredRow) continue; // already recorded elsewhere in this same document
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

  // Reflect artifacts are retrospective narrative — they report on waivers already declared and
  // resolved elsewhere in the chain (task/verify/ship), never declare a new active one themselves
  // (no Reflect exemplar has ever had a ## Waivers table). Scanning them for "unstructured claims"
  // misapplies a check meant for artifacts that can actively hold an unresolved waiver. Found via
  // dogfooding: workflow/artifacts/reflect/power-skills-wave2-v1.md's "What Worked"/"What Did Not
  // Work" prose, both discussing an already-resolved historical waiver, false-flagged before this.
  const isReflect = file.split('/').slice(-2, -1)[0] === 'reflect';
  const unstructured = isReflect ? [] : unstructuredWaiverMentions(parsed.body);
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
