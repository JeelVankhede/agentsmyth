#!/usr/bin/env node
// Wave 2 (B6) — verification-matrix-builder. For verify artifacts, confirms every active R/RI
// (from frontmatter manifest_ids) has a "## Manifest Coverage" row with a named method, and that
// no row claiming a pass Result has an empty Evidence cell.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { finish, listFiles, parseFrontmatter, readText, repoRoot } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const wf = process.env.AGENTSMYTH_WF
  || (existsSync(join(repoRoot, 'workflow')) ? 'workflow' : ['.', 'workflow'].join(''));
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
  if (dir !== 'verify') continue;

  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  const activeIds = parsed.frontmatter.manifest_ids ?? [];
  if (activeIds.length === 0) continue;

  const matrixSection = namedSection(parsed.body, 'Manifest Coverage');
  if (!matrixSection) {
    errors.push(`${file} has no "## Manifest Coverage" section, but declares ${activeIds.length} manifest ID(s)`);
    continue;
  }

  // Columns: Manifest ID | How Verified | Evidence | Result | Notes
  const rows = parseTableRows(matrixSection);
  const byId = new Map(rows.map((row) => [row[0], row]));

  for (const id of activeIds) {
    const row = byId.get(id);
    if (!row) {
      errors.push(`${file} manifest ID ${id} has no row in Manifest Coverage`);
      continue;
    }
    const [, method, evidence, result] = row;
    if (!method || method.length === 0) {
      errors.push(`${file} manifest ID ${id} has no named verification method (How Verified is empty)`);
    }
    if (result === 'pass' && (!evidence || evidence.length === 0)) {
      errors.push(`${file} manifest ID ${id} claims pass with an empty Evidence cell`);
    }
  }

  details.push(`checked ${file} (${activeIds.length} manifest ID(s), ${rows.length} matrix row(s))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

finish('check-verify-matrix', errors, details);
