#!/usr/bin/env node
// evidence-auditor. For review/verify/ship/reflect artifacts, confirms every
// row in an evidence-bearing table (Command Results, Automated Checks, Verification Items,
// Verification Reviewed) has no empty cell — a structural presence check, not a truthfulness
// check (a hand-rolled validator cannot verify a citation is honest, only that one exists).
import { finish, listFiles, parseFrontmatter, readText, wf } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

const errors = [];
const details = [];

const EVIDENCE_DIRS = new Set(['reviews', 'verify', 'ship', 'reflect']);
const EVIDENCE_SECTIONS = [
  'Command Results',
  'Automated Checks',
  'Verification Items',
  'Verification Reviewed',
];

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

let claimsAudited = 0;

for (const file of artifactFiles) {
  const dir = file.split('/').slice(-2, -1)[0];
  if (!EVIDENCE_DIRS.has(dir)) continue;

  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  for (const sectionName of EVIDENCE_SECTIONS) {
    const section = namedSection(parsed.body, sectionName);
    if (!section) continue;

    const rows = parseTableRows(section);
    for (const [index, row] of rows.entries()) {
      claimsAudited++;
      const emptyCellIdx = row.findIndex((cell) => cell.length === 0);
      if (emptyCellIdx !== -1) {
        errors.push(
          `${file} "${sectionName}" row ${index + 1} has an empty cell (column ${emptyCellIdx + 1}) — a claim with no cited value`
        );
      }
    }
  }

  details.push(`checked ${file}`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}
details.push(`${claimsAudited} evidence row(s) audited total`);

finish('check-evidence-citations', errors, details);
