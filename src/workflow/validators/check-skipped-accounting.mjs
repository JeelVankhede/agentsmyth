#!/usr/bin/env node
// skipped-check-accountant. For verify artifacts, confirms every
// Skipped Checks row carries all verification.yaml-required fields, and cross-references
// Automated Checks rows with a "not run"/"blocked" outcome against the Skipped Checks table —
// an unaccounted not-run/blocked check (no matching Skipped Checks row) is the hardened part
// of this check, beyond a simple skip-scan.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { dataPath, finish, listFiles, loadYaml, parseFrontmatter, readText, repoRoot } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const wf = process.env.AGENTSMYTH_WF
  || (existsSync(join(repoRoot, 'workflow')) ? 'workflow' : ['.', 'workflow'].join(''));
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

const errors = [];
const details = [];

let requiredFields = ['check', 'why_skipped', 'risk', 'owner', 'blocks_ship', 'manifest_ids'];
try {
  const verificationConfigPath = dataPath('config', 'verification.yaml');
  if (existsSync(verificationConfigPath)) {
    const config = loadYaml(verificationConfigPath);
    requiredFields = config?.skipped_checks?.required_fields ?? requiredFields;
  }
} catch {
  // fall back to the default field list above
}

const artifactFiles = listFiles(artifactsDir).filter((file) => {
  return file.endsWith('.md') && !file.endsWith('/README.md') && file !== `${artifactsDir}/README.md`;
});

function namedSection(body, name) {
  const re = new RegExp(`## ${name}\\s*\\n([\\s\\S]*?)(?=\\n## |\\n---|\\s*$)`);
  const match = body.match(re);
  return match ? match[1] : null;
}

function parseTableRows(tableText) {
  const lines = tableText.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('|'));
  if (lines.length < 2) return [];
  const rows = lines.slice(1).filter((l) => !/^\|[\s-:|]+\|$/.test(l));
  return rows.map((line) => line.slice(1, -1).split('|').map((cell) => cell.trim()));
}

for (const file of artifactFiles) {
  const dir = file.split('/').slice(-2, -1)[0];
  if (dir !== 'verify') continue;

  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  const skippedSection = namedSection(parsed.body, 'Skipped Checks');
  const skippedRows = skippedSection ? parseTableRows(skippedSection) : [];
  const skippedCheckNames = new Set(skippedRows.map((r) => r[0]?.toLowerCase()).filter(Boolean));

  for (const [index, row] of skippedRows.entries()) {
    if (row.length < requiredFields.length) {
      errors.push(
        `${file} Skipped Checks row ${index + 1} has ${row.length} column(s), expected ${requiredFields.length} (${requiredFields.join(', ')})`
      );
      continue;
    }
    requiredFields.forEach((field, fieldIdx) => {
      if (!row[fieldIdx]) {
        errors.push(`${file} Skipped Checks row ${index + 1} missing value for "${field}"`);
      }
    });
  }

  const automatedSection = namedSection(parsed.body, 'Automated Checks');
  if (automatedSection) {
    const automatedRows = parseTableRows(automatedSection);
    for (const [index, row] of automatedRows.entries()) {
      const outcome = row.find((cell) => /^(not run|blocked)$/i.test(cell));
      if (!outcome) continue;
      const checkName = row[0]?.toLowerCase();
      if (!checkName || !skippedCheckNames.has(checkName)) {
        errors.push(
          `${file} Automated Checks row ${index + 1} ("${row[0] ?? 'unnamed'}") is "${outcome}" but has no matching Skipped Checks entry`
        );
      }
    }
  }

  details.push(`checked ${file} (${skippedRows.length} skipped-check row(s))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

finish('check-skipped-accounting', errors, details);
