#!/usr/bin/env node
// Wave 1 (B5, T4.1) — verify-manifest-coverage. For review artifacts, compares the
// frontmatter manifest_ids against the manifest IDs actually touched per the upstream task
// artifact's Changed Files section. Flags any delta (declared-not-touched or
// touched-not-declared) as scope creep or stale coverage.
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
  const re = new RegExp(`## ${name}\\s*\\n([\\s\\S]*?)(?=\\n## |\\n---|\\s*$)`);
  const match = body.match(re);
  return match ? match[1] : null;
}

function taskDerivedIds(section) {
  const ids = new Set();
  for (const m of section.matchAll(/\b(R(?:I)?[0-9]+)\b/g)) ids.add(m[1]);
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
