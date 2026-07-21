#!/usr/bin/env node
// release-readiness-gate. For ship artifacts, confirms the Ship Status section
// declares exactly one of ship/hold/hold-with-waiver, and that a "ship" declaration is not
// contradicted by unresolved orchestration.blockers or an unwaived P0/P1 in the upstream review.
import { finish, listFiles, parseFrontmatter, readText, wf } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
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

// Reads the actual declared value off the "- Recommendation: <value>" line specifically — the
// output-schema.md Starter Block's own canonical format, which every artifact written to schema
// uses — rather than scanning the whole Ship Status section for any occurrence of a recommendation
// word. A section can legitimately mention "hold" elsewhere for context (e.g. "Verification
// recommendation: hold, now resolved by Ship below") without that being the artifact's own declared
// recommendation — a prior whole-section substring scan misdetected exactly that case, silently
// skipping every check below it gates (found while closing out wp-r11-docs-site-v1's ship
// artifact). Falls back to the old whole-section scan only when the canonical line is genuinely
// absent, for the small number of pre-schema-convention artifacts that declared their
// recommendation in free prose (e.g. "Ready to ship. All requirements met...") instead of the
// structured bullet — regressing those would violate RI1 for no benefit, since they have no
// competing "hold" mention to misdetect in the first place. Checks RECOMMENDATION_WORDS
// longest-first so "hold-with-waiver" doesn't get truncated to "hold" within the matched text.
function declaredRecommendation(section) {
  const lineMatch = section.match(/^-\s*Recommendation:\s*(.+)$/im);
  if (lineMatch) {
    const value = lineMatch[1].toLowerCase();
    for (const word of RECOMMENDATION_WORDS) {
      if (value.includes(word)) return word;
    }
    return null;
  }
  const lower = section.toLowerCase();
  for (const word of RECOMMENDATION_WORDS) {
    if (lower.includes(word)) return word;
  }
  return null;
}

// Recognizes a Review finding explicitly marked resolved in the one real, already-established
// position this repo's shipped review artifacts actually use: immediately after the severity
// label inside a bold-inline Findings-list entry (e.g. "**P1, confirmed and fixed post-Test**" or
// "**P2 (fixed) — ..."). Deliberately narrow, not a general Findings-list parser: this repo has at
// least two other real Findings formats in use (a "### P1 — ..." heading style, and a bare
// "- P2 `path` [RI1] — ..." dash-bullet style per lifecycle-review's own exemplar) that this
// function does not attempt to parse — for those, or for any bold-inline entry lacking one of the
// two established resolved-markers below, callers must keep requiring a waiver, matching prior
// (safe) behavior. A looser match (e.g. "contains the word fix anywhere in the finding's body")
// was rejected: every finding, resolved or not, legitimately carries a "Fix:"/"Fix recommendation:"
// field, which would make a body-wide match always true and defeat the check entirely — confirmed
// against the real `o-ship-with-open-p1` violation fixture's "Fix recommendation: fixture only."
// line, which must keep this function returning false for that fixture's genuinely-open finding.
const RESOLVED_MARKERS = /\(fixed\)|confirmed and fixed/i;

function severityResolvedInBoldFindings(body, severity) {
  const spanPattern = new RegExp(`\\*\\*${severity}\\b[^*]*\\*\\*`, 'g');
  const spans = body.match(spanPattern);
  if (!spans || spans.length === 0) return false; // format not recognized — fall back to blocking
  return spans.every((span) => RESOLVED_MARKERS.test(span));
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
        // A non-zero count is only a real blocker if it isn't fully accounted for by findings
        // explicitly marked resolved in the one recognized position (see
        // severityResolvedInBoldFindings) — a "confirmed and fixed" P1 is a completed,
        // independently-verified fix per lifecycle-ship/SKILL.md's own step 6a, not an open risk
        // requiring a waiver. Per-severity, not a blanket "any P0/P1 resolved clears both".
        const unresolvedSeverities = ['P0', 'P1'].filter((sev) => {
          if (counts[sev] === 0) return false;
          return !severityResolvedInBoldFindings(reviewParsed.body, sev);
        });
        if (unresolvedSeverities.length > 0) {
          const waived = /## Waivers\s*\n[\s\S]*?\bP[01]\b/i.test(reviewParsed.body) || /## Waivers\s*\n[\s\S]*?\bP[01]\b/i.test(parsed.body);
          if (!waived) {
            errors.push(`${file} declares "ship" but upstream review Severity Summary shows an open P0/P1 (P0: ${counts.P0}, P1: ${counts.P1}) with no matching Waivers entry and no recognized resolved-finding marker for: ${unresolvedSeverities.join(', ')}`);
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
