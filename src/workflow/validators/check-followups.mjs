#!/usr/bin/env node
// Wave 2 (B9) — follow-up-owner-assigner. For reflect artifacts, confirms every row in the
// "## Follow-Ups" table has a non-empty Owner that is not the literal placeholder "TBD" —
// the skill's Refusal condition never lets it assign TBD itself, so an artifact reaching this
// check with TBD (or an empty cell) has never actually been through the skill.
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

function parseTableRows(tableText) {
  const lines = tableText.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('|'));
  if (lines.length < 2) return [];
  const rows = lines.slice(1).filter((l) => !/^\|[\s-:|]+\|$/.test(l));
  return rows.map((line) => line.slice(1, -1).split('|').map((cell) => cell.trim()));
}

for (const file of artifactFiles) {
  const dir = file.split('/').slice(-2, -1)[0];
  if (dir !== 'reflect') continue;

  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  const followUpsSection = namedSection(parsed.body, 'Follow-Ups');
  if (!followUpsSection) continue; // no Follow-Ups section — nothing to check

  // Columns: Action | Owner | Suggested Artifact Or Ticket | Status
  const rows = parseTableRows(followUpsSection);
  if (rows.length === 0) {
    details.push(`checked ${file} (0 follow-up rows)`);
    continue;
  }

  for (const row of rows) {
    const [action, owner] = row;
    if (!owner || owner.length === 0 || owner.toUpperCase() === 'TBD') {
      errors.push(`${file} follow-up "${action}" has no owner (owner is empty or TBD)`);
    }
  }

  details.push(`checked ${file} (${rows.length} follow-up row(s))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

finish('check-followups', errors, details);
