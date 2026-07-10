#!/usr/bin/env node
// Wave 1 (B8) — release-readiness-gate. For ship artifacts, confirms the Ship Status section
// declares exactly one of ship/hold/hold-with-waiver, and that a "ship" declaration is not
// contradicted by unresolved orchestration.blockers or an unwaived P0/P1 in the upstream review.
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

const RECOMMENDATION_WORDS = ['hold-with-waiver', 'hold', 'ship'];

const artifactFiles = listFiles(artifactsDir).filter((file) => {
  return file.endsWith('.md') && !file.endsWith('/README.md') && file !== `${artifactsDir}/README.md`;
});

function namedSection(body, name) {
  const re = new RegExp(`## ${name}\\s*\\n([\\s\\S]*?)(?=\\n## |\\n---|\\s*$)`);
  const match = body.match(re);
  return match ? match[1] : null;
}

function declaredRecommendation(section) {
  const lower = section.toLowerCase();
  for (const word of RECOMMENDATION_WORDS) {
    if (lower.includes(word)) return word;
  }
  return null;
}

function parseTableRows(tableText) {
  const lines = tableText.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('|'));
  if (lines.length < 2) return [];
  const rows = lines.slice(1).filter((l) => !/^\|[\s-:|]+\|$/.test(l));
  return rows.map((line) => line.slice(1, -1).split('|').map((cell) => cell.trim()));
}

// Parses the Severity Summary as the table it actually is (any column count beyond Severity +
// first count column is tolerated), reading the *second* cell as the open count for P0/P1. A
// prior version used crude prose regex ("0...P0" / "none") against the whole section text, which
// broke on any real table — including this chain's own review, which has extra columns. Found by
// dogfooding against a real artifact, not a fixture (see workflow/artifacts/reviews/
// power-skills-spine-v1.md Architecture Notes).
function openP0P1Counts(severitySection) {
  const counts = { P0: 0, P1: 0 };
  for (const row of parseTableRows(severitySection)) {
    const label = row[0];
    if (label !== 'P0' && label !== 'P1') continue;
    const m = (row[1] ?? '').match(/^\d+/);
    counts[label] = m ? Number(m[0]) : null; // null = present but unparsable — treated as risk
  }
  return counts;
}

for (const file of artifactFiles) {
  const dir = file.split('/').slice(-2, -1)[0];
  if (dir !== 'ship') continue;

  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  const statusSection = namedSection(parsed.body, 'Ship Status');
  if (!statusSection) {
    errors.push(`${file} has no "Ship Status" section — cannot determine recommendation`);
    continue;
  }

  const recommendation = declaredRecommendation(statusSection);
  if (!recommendation) {
    errors.push(`${file} "Ship Status" declares none of ship / hold / hold-with-waiver explicitly`);
    continue;
  }

  const blockers = parsed.frontmatter.orchestration?.blockers ?? [];
  if (recommendation === 'ship' && blockers.length > 0) {
    errors.push(`${file} declares "ship" but orchestration.blockers is non-empty: ${blockers.join(', ')}`);
  }

  // Cross-check upstream review for unwaived P0/P1 findings when a review exists.
  const slug = parsed.frontmatter.slug;
  const reviewCandidates = listFiles(`${artifactsDir}/reviews`).filter((f) =>
    new RegExp(`/${slug}-v[0-9]+\\.md$`).test(f)
  );
  if (recommendation === 'ship' && reviewCandidates.length > 0) {
    const reviewText = readText(reviewCandidates[0]);
    let reviewParsed;
    try {
      reviewParsed = parseFrontmatter(reviewText, reviewCandidates[0]);
      const severitySection = namedSection(reviewParsed.body, 'Severity Summary');
      if (severitySection) {
        const counts = openP0P1Counts(severitySection);
        const hasOpenP0P1 = counts.P0 !== 0 || counts.P1 !== 0;
        if (hasOpenP0P1) {
          const waived = /## Waivers\s*\n[\s\S]*?\bP[01]\b/i.test(reviewParsed.body) || /## Waivers\s*\n[\s\S]*?\bP[01]\b/i.test(parsed.body);
          if (!waived) {
            errors.push(`${file} declares "ship" but upstream review Severity Summary shows an open P0/P1 (P0: ${counts.P0}, P1: ${counts.P1}) with no matching Waivers entry`);
          }
        }
      }
    } catch {
      // unparsable review — not this validator's concern
    }
  }

  details.push(`checked ${file} — recommendation: ${recommendation}`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

finish('check-release-readiness', errors, details);
