#!/usr/bin/env node
// Wave 3 (C3) — constraint-conflict-scan. For brief artifacts, confirms every constraint-ID
// citation (a bracketed token like "[safety-2]") appearing in the "## Open Questions (Q)" section
// resolves to a real ID actually present in workflow/config/domain.yaml's constraint arrays — per
// the bracket-prefix convention (constraint-conflict-scan/references/constraint-id-convention.md).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { finish, listFiles, loadYaml, parseFrontmatter, readText, repoRoot } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const wf = process.env.AGENTSMYTH_WF
  || (existsSync(join(repoRoot, 'workflow')) ? 'workflow' : ['.', 'workflow'].join(''));
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

const errors = [];
const details = [];

function namedSection(body, name) {
  const re = new RegExp(`## ${name}\\s*\\n([\\s\\S]*?)(?=\\n## [^#]|\\s*$)`);
  const match = body.match(re);
  return match ? match[1] : null;
}

// Extracts every real constraint ID declared in domain.yaml's bracket-prefix convention.
function realConstraintIds(domainConfigPath) {
  if (!existsSync(join(repoRoot, domainConfigPath))) return new Set();
  const doc = loadYaml(domainConfigPath);
  const ids = new Set();
  for (const category of ['product', 'safety', 'provider_neutrality']) {
    for (const entry of doc?.constraints?.[category] ?? []) {
      const m = String(entry).match(/^\[([a-z][a-z-]*-\d+)\]/);
      if (m) ids.add(m[1]);
    }
  }
  return ids;
}

// Extracts every constraint-ID-shaped citation from the Open Questions section — a bracketed
// token matching the <category>-<n> shape, wherever it appears in that section's prose.
function citedConstraintIds(section) {
  const ids = [];
  for (const m of section.matchAll(/\[([a-z][a-z-]*-\d+)\]/g)) ids.push(m[1]);
  return ids;
}

const domainConfigPath = `${wf}/config/domain.yaml`;
const realIds = realConstraintIds(domainConfigPath);

const artifactFiles = listFiles(artifactsDir).filter((file) => {
  return file.endsWith('.md') && !file.endsWith('/README.md') && file !== `${artifactsDir}/README.md`;
});

let citationsChecked = 0;

for (const file of artifactFiles) {
  const dir = file.split('/').slice(-2, -1)[0];
  if (dir !== 'briefs') continue;

  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  const section = namedSection(parsed.body, 'Open Questions \\(Q\\)') ?? namedSection(parsed.body, 'Open Questions');
  if (!section) continue;

  const cited = citedConstraintIds(section);
  if (cited.length === 0) continue;

  for (const id of cited) {
    citationsChecked++;
    if (!realIds.has(id)) {
      errors.push(`${file} cites constraint ID "${id}" which is not present in ${domainConfigPath}`);
    }
  }

  details.push(`checked ${file} (${cited.length} constraint citation(s))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}
details.push(`${citationsChecked} constraint citation(s) checked total against ${realIds.size} real ID(s)`);

finish('check-constraint-conflicts', errors, details);
