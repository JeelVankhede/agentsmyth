#!/usr/bin/env node
// verify-manifest-coverage. For review artifacts, compares the
// frontmatter manifest_ids against the manifest IDs actually touched per the upstream task
// artifact's Changed Files section. Flags any delta (declared-not-touched or
// touched-not-declared) as scope creep or stale coverage.
import { finish, listFiles, parseFrontmatter, parseIdList, readText, wf } from './lib.mjs';

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

// A parenthetical counts as a real ID tag only when its ENTIRE content is a comma-separated
// list of valid IDs — not merely containing an ID as a substring. This is what excludes a
// prose parenthetical that happens to mention other words alongside an ID, while still
// accepting a bare "(RI4)" or "(R9, RI3)" tag, a convention confirmed genuinely common (31
// instances) across this repo's own existing task artifacts — narrower call sites like
// "(partial)" from a Manifest IDs line never reach this function at all.
// The ID-shape regex below is intentionally duplicated in lib.mjs's parseIdList() — keep both
// in sync if the ID shape ever changes.
function isPureIdTag(raw) {
  const segments = raw.split(',').map((s) => s.trim());
  return segments.length > 0 && segments.every((s) => /^R(I)?[0-9]+(-[a-zA-Z0-9]+)?$/.test(s));
}

// Scans the structured positions a Changed Files/Verification Items section actually uses to
// tag manifest IDs — a trailing "— ID:"/"— IDs:" tag (per lifecycle-build's own
// output-schema.md convention), a markdown table row whose first cell holds one or more
// comma-separated IDs (e.g. "| R9, RI3, RI4 | ... |"), or a bare parenthetical tag whose
// entire content is ID(s) (e.g. "...with zero intermediate breakage (RI4)") — instead of
// matching any ID-shaped substring anywhere in the section's prose. The prior free-prose scan
// matched inside unrelated compound tokens (e.g. "WP-R7-T7.2") and inside incidental
// sentences with no coverage-claim intent (e.g. "...so R6 has an explicit phase-map entry") —
// both found as real false positives while dogfooding the WP-R7 chain. Two earlier versions
// of this fix regressed against this repo's own existing artifacts before landing here: one
// only matched a single bare ID per table cell (dropping every ID in a multi-ID cell like the
// one above), the other missed the bare-parenthetical convention entirely — both found by
// running against the full existing tree, not just the new false-positive fixtures.
function taskDerivedIds(section) {
  const ids = new Set();
  for (const m of section.matchAll(/[—-]\s*IDs?:\s*([^\n]+)/g)) {
    for (const id of parseIdList(m[1])) ids.add(id);
  }
  for (const line of section.split('\n')) {
    const rowMatch = line.match(/^\|\s*([^|]+?)\s*\|/);
    if (rowMatch) {
      for (const id of parseIdList(rowMatch[1])) ids.add(id);
    }
  }
  for (const m of section.matchAll(/\(([^)]+)\)/g)) {
    if (isPureIdTag(m[1])) {
      for (const id of m[1].split(',').map((s) => s.trim())) ids.add(id);
    }
  }
  return ids;
}

for (const file of artifactFiles) {
  const dir = file.split('/').slice(-2, -1)[0];
  if (dir !== 'reviews') continue;

  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  const slug = parsed.frontmatter.slug;
  const taskCandidates = listFiles(`${artifactsDir}/tasks`).filter((f) =>
    new RegExp(`/${slug}-v[0-9]+(?:-p[0-9]+)?\\.md$`).test(f)
  );
  if (taskCandidates.length === 0) {
    errors.push(`${file} has no corresponding task in ${artifactsDir}/tasks/ — cannot verify manifest coverage`);
    continue;
  }

  const declared = new Set(parsed.frontmatter.manifest_ids ?? []);
  const taskDerived = new Set();
  for (const taskFile of taskCandidates) {
    const taskText = readText(taskFile);
    let taskParsed;
    try {
      taskParsed = parseFrontmatter(taskText, taskFile);
    } catch {
      continue;
    }
    const changedSection = namedSection(taskParsed.body, 'Changed Files');
    if (changedSection) {
      for (const id of taskDerivedIds(changedSection)) taskDerived.add(id);
    }
    // Verification-only IDs (e.g. "all commands pass", "no adapter diff") are legitimately never
    // tied to a changed file — they're evidenced in Verification Items instead. Credit those too,
    // or every review covering a verification-outcome requirement false-fails. Found by dogfooding
    // this validator against this chain's own review artifact (not a fixture) after the P1 fix.
    const verificationSection = namedSection(taskParsed.body, 'Verification Items');
    if (verificationSection) {
      for (const id of taskDerivedIds(verificationSection)) taskDerived.add(id);
    }
  }

  if (taskDerived.size === 0) continue; // task has no per-file ID tagging yet — nothing to compare

  for (const id of declared) {
    if (!taskDerived.has(id)) {
      errors.push(`${file} declares manifest_id ${id} but no task Changed Files entry touches it`);
    }
  }
  for (const id of taskDerived) {
    if (!declared.has(id)) {
      errors.push(`${file} does not declare manifest_id ${id}, but a task Changed Files entry touches it`);
    }
  }

  details.push(`checked ${file} against ${taskCandidates.length} task artifact(s)`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

finish('check-manifest-coverage', errors, details);
