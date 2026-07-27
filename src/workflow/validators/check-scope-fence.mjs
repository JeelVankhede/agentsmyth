#!/usr/bin/env node
// scope-fence. For task artifacts, confirms every path listed in Changed Files
// is covered by the upstream plan's declared phase Touches (exact file match or directory
// prefix match), or by a Waivers entry. Flags files outside both as out-of-scope.
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
  const re = new RegExp(`## ${name}\\s*\\n([\\s\\S]*?)(?=\\n## |\\n---|\\s*$)`);
  const match = body.match(re);
  return match ? match[1] : null;
}

// Changed Files lines look like: "- `path` — description — IDs: R1, R2"
function changedFilePaths(section) {
  const paths = [];
  for (const m of section.matchAll(/^-\s*`([^`]+)`/gm)) paths.push(m[1]);
  return paths;
}

// The task's "## Active Phase" section names the active phase, e.g. "- Phase: Phase 2 - ..."
// or "Phase 1 of 1." — extract just the phase number, tolerant of either phrasing.
function activePhaseNumber(taskBody) {
  const section = namedSection(taskBody, 'Active Phase');
  if (!section) return null;
  const m = section.match(/Phase\s+(\d+)/);
  return m ? m[1] : null;
}

// Extracts the backtick-quoted paths from one "### Phase N ..." block's own "Touches:" field —
// not the whole plan body. A prior version scanned the entire plan body for backticks, which
// meant a file could pass by being mentioned anywhere in the plan (another phase's Touches,
// Architecture Notes prose, Risk Register, etc.) instead of any phase's actual declared scope.
// Fixed after Review found this (workflow/artifacts/reviews/power-skills-spine-v1.md P1 finding).
//
// The boundary lookahead also tolerates an optional "- " bullet-dash directly before the
// Work/Exit gate/Why first label, matching this repo's own plan convention (see the Starter
// Block in lifecycle-plan/references/output-schema.md: "- Touches:", "- Work:",
// "- **Exit gate:**"). Without it, a bullet-dash-prefixed label on a phase's own Work/Exit gate
// line fails to match the boundary, and — for a plan's LAST phase specifically, where there is no
// following "### Phase" heading to fall back on — the Touches capture instead runs to the end of
// the phase block, silently absorbing any backtick-quoted path mentioned in that phase's own
// Work/Exit gate prose as though it were a declared Touches target (OI-37).
function phaseTouches(block) {
  const touchesMatch = block.match(
    /Touches:\*{0,2}\s*([\s\S]*?)(?=\n\s*(?:-\s*)?\*{0,2}(?:Work|Exit gate|Why first)\*{0,2}:|\n### |$)/i
  );
  if (!touchesMatch) return [];
  const touches = [];
  for (const m of touchesMatch[1].matchAll(/`([^`]+)`/g)) touches.push(m[1]);
  return touches;
}

// A task artifact's Changed Files section accumulates across every phase completed so far
// (confirmed against the real system-level-install-v1 precedent and this chain's own task
// artifact) — "Active Phase" names only the most recent one. So the correct scope boundary is
// the UNION of every phase's Touches from Phase 1 through the active phase (inclusive), not the
// active phase in isolation — otherwise a multi-phase task artifact false-rejects its own
// earlier-phase files once a later phase becomes active.
function planTouches(planBody, activePhaseNumber) {
  if (!activePhaseNumber) return [];
  const activeNum = Number(activePhaseNumber);

  const phaseBlocks = planBody.split(/\n(?=### Phase\s)/);
  const touches = [];
  for (const block of phaseBlocks) {
    const m = block.match(/^### Phase\s+(\d+)/);
    if (!m) continue;
    if (Number(m[1]) > activeNum) continue;
    touches.push(...phaseTouches(block));
  }
  return touches;
}

function isCovered(path, touches) {
  return touches.some((t) => {
    if (t === path) return true;
    if (t.endsWith('/') && path.startsWith(t)) return true;
    if (!t.endsWith('/') && t.endsWith('*') && path.startsWith(t.slice(0, -1))) return true;
    return false;
  });
}

function waivedPaths(body) {
  const match = body.match(/## Waivers\s*\n([\s\S]*?)(?=\n## |\n---|\s*$)/);
  if (!match) return new Set();
  const paths = new Set();
  for (const m of match[1].matchAll(/`([^`]+)`/g)) paths.add(m[1]);
  return paths;
}

for (const file of artifactFiles) {
  const dir = file.split('/').slice(-2, -1)[0];
  if (dir !== 'tasks') continue;

  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  const changedSection = namedSection(parsed.body, 'Changed Files');
  if (!changedSection) continue;
  const changed = changedFilePaths(changedSection);
  if (changed.length === 0) continue;

  const slug = parsed.frontmatter.slug;
  const planCandidates = listFiles(`${artifactsDir}/plans`).filter((f) =>
    new RegExp(`/${slug}-v[0-9]+\\.md$`).test(f)
  );
  if (planCandidates.length === 0) {
    errors.push(`${file} has no corresponding plan in ${artifactsDir}/plans/ — cannot verify scope`);
    continue;
  }

  const planText = readText(planCandidates[0]);
  let planParsed;
  try {
    planParsed = parseFrontmatter(planText, planCandidates[0]);
  } catch {
    continue;
  }
  const phaseNumber = activePhaseNumber(parsed.body);
  if (!phaseNumber) {
    errors.push(`${file} has no parseable phase number in its "## Active Phase" section — cannot verify scope`);
    continue;
  }

  const touches = planTouches(planParsed.body, phaseNumber);
  const waived = waivedPaths(parsed.body);

  for (const path of changed) {
    if (isCovered(path, touches) || waived.has(path)) continue;
    errors.push(`${file} changed file "${path}" is outside Phase ${phaseNumber}'s declared Touches and has no Waivers entry`);
  }

  details.push(`checked ${file} (${changed.length} changed file(s) against ${planCandidates[0]})`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

finish('check-scope-fence', errors, details);
