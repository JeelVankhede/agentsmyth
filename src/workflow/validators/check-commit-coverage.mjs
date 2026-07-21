#!/usr/bin/env node
// Fast pre-commit proxy invoked as `agentsmyth check --staged` by the mandatory local git hook
// (installed by `init` — see bin/agentsmyth.mjs's installPreCommitHook()). Deliberately narrower
// than check-lifecycle.mjs's full chain-status validation: this only asks whether a real,
// non-stub task artifact even exists covering each staged, non-safe file — not whether that
// chain's Review/Ship gates would pass. Keeping the rule this narrow is what lets it run on
// every commit without re-running the whole validator suite.
import { execFileSync } from 'node:child_process';
import { finish, listFiles, parseFrontmatter, readText, repoRoot, wf } from './lib.mjs';

const errors = [];
const details = [];

// Anything under these prefixes, or any Markdown file, never requires a covering task artifact —
// config/docs/artifact bookkeeping is exactly the kind of change the lifecycle produces as a
// byproduct of itself, and gating it would make the chain unable to record its own state.
const SAFE_PREFIXES = ['workflow/', 'docs/', '.cursor/', '.claude/', '.github/'];

// Small, single-file diffs are treated as Trivial per the router's own "single-location, no
// architectural impact" heuristic — a git hook can't do the router's LLM-driven judgment, so
// this is a conservative, explainable mechanical stand-in for that one class only.
const TRIVIAL_MAX_FILES = 1;
const TRIVIAL_MAX_LINES = 15;

function stagedFiles() {
  try {
    return execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM'], {
      cwd: repoRoot, encoding: 'utf8',
    }).split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function stagedLineCount(path) {
  try {
    const out = execFileSync('git', ['diff', '--cached', '--numstat', '--', path], {
      cwd: repoRoot, encoding: 'utf8',
    }).trim();
    if (!out) return 0;
    const [added, removed] = out.split('\t');
    const a = Number(added) || 0;
    const r = Number(removed) || 0;
    return a + r;
  } catch {
    return Infinity;
  }
}

function isSafe(path) {
  if (path.endsWith('.md')) return true;
  return SAFE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

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

function isCovered(path, touches) {
  return touches.some((t) => {
    if (t === path) return true;
    if (t.endsWith('/') && path.startsWith(t)) return true;
    if (!t.endsWith('/') && t.endsWith('*') && path.startsWith(t.slice(0, -1))) return true;
    return false;
  });
}

// Collects every path any real (non-stub) task artifact declares in its own "Changed Files"
// section. "Real" excludes status: draft and orchestration.status: blocked-for-user — a task
// artifact that hasn't actually started being planned yet doesn't count as coverage.
function coveredPaths(artifactsDir) {
  const covered = [];
  const taskFiles = listFiles(`${artifactsDir}/tasks`).filter((f) => f.endsWith('.md') && !f.endsWith('/README.md'));
  for (const file of taskFiles) {
    const text = readText(file);
    let parsed;
    try {
      parsed = parseFrontmatter(text, file);
    } catch {
      continue;
    }
    if (parsed.frontmatter.status === 'draft') continue;
    if (parsed.frontmatter.orchestration?.status === 'blocked-for-user') continue;

    const changedSection = namedSection(parsed.body, 'Changed Files');
    if (!changedSection) continue;
    covered.push(...changedFilePaths(changedSection));
  }
  return covered;
}

const profileExists = listFiles(`${wf}/config`).some((f) => f.endsWith('repo-profile.yaml'));
if (!profileExists) {
  finish('check-commit-coverage', [], ['no workflow/config/repo-profile.yaml — repo not agentsmyth-initialized, nothing to gate']);
} else {
  const staged = stagedFiles();
  const gated = staged.filter((p) => !isSafe(p));

  if (gated.length === 0) {
    finish('check-commit-coverage', [], ['all staged files are safe (workflow/docs/config or Markdown) — nothing to gate']);
  } else if (gated.length <= TRIVIAL_MAX_FILES && stagedLineCount(gated[0]) <= TRIVIAL_MAX_LINES) {
    finish('check-commit-coverage', [], [`trivial-size escape: ${gated[0]} (<= ${TRIVIAL_MAX_LINES} changed lines)`]);
  } else {
    const touches = coveredPaths(`${wf}/artifacts`);
    for (const path of gated) {
      if (isCovered(path, touches)) {
        details.push(`${path} — covered by a task artifact's Changed Files`);
      } else {
        errors.push(
          `${path} — no task artifact's Changed Files covers this path. Add it to an existing ` +
          `task's scope, run the agentsmyth lifecycle to create one, or bypass intentionally ` +
          `with 'git commit --no-verify'.`
        );
      }
    }
    finish('check-commit-coverage', errors, details);
  }
}
