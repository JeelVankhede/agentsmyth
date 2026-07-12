#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  artifactContracts,
  defsPath,
  finish,
  listFiles,
  loadYaml,
  parseFrontmatter,
  readText,
  repoRoot,
  trackedFiles,
  wf,
} from './lib.mjs';

const args = process.argv.slice(2);
const phaseArgIdx = args.indexOf('--phase');
const slugArgIdx = args.indexOf('--slug');
const targetPhase = phaseArgIdx !== -1 ? args[phaseArgIdx + 1] : null;
const targetSlug = slugArgIdx !== -1 ? args[slugArgIdx + 1] : null;

// ── Phase gate check (--phase mode) ───────────────────────────────────────
// Checks that the required upstream artifact exists and is ready before the
// named phase begins. Used by the consumer pre-commit hook.
if (args.includes('--phase')) {
  const errors = [];
  const details = [];

  // phase → { upstream artifact dir, accepted statuses }
  const UPSTREAM = {
    plan:    { dir: 'briefs',   ready: ['ready-for-next-phase'] },
    build:   { dir: 'plans',    ready: ['ready-for-next-phase'] },
    review:  { dir: 'tasks',    ready: ['ready-for-next-phase'] },
    test:    { dir: 'reviews',  ready: ['ready-for-next-phase'] },
    ship:    { dir: 'verify',   ready: ['ready-for-next-phase'] },
    reflect: { dir: 'ship',     ready: ['ready-for-next-phase'] },
  };

  const validPhases = ['think', ...Object.keys(UPSTREAM)];

  if (!validPhases.includes(targetPhase)) {
    console.error(`check-lifecycle: unknown phase "${targetPhase}". Valid: ${validPhases.join(', ')}`);
    process.exit(1);
  }

  // think has no upstream — always passes
  if (targetPhase === 'think') {
    finish('check-lifecycle --phase think', [], ['think: no upstream required']);
    process.exit(0);
  }

  const upstream = UPSTREAM[targetPhase];

  // Resolve slug — from arg or detected from staged artifact files
  // Note: unlike trackedFiles() elsewhere in this file (which callers can pass a
  // resolveGitCwd()-derived cwd to once an artifact's frontmatter is known), this specific call
  // has no frontmatter to resolve target_repo from yet — finding the artifact IS what this block
  // does. For a polyrepo-member repo, staged-file auto-detection stays scoped to repoRoot (this
  // member's own checkout); explicit --slug bypasses this block entirely. No real polyrepo
  // fixture exists to exercise this further — documented as a known boundary, not fixed silently.
  let slug = targetSlug;
  if (!slug) {
    let staged = [];
    try {
      staged = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM'], {
        cwd: repoRoot, encoding: 'utf8',
      }).split('\n').filter(Boolean);
    } catch { /* not in a git repo or no staged files */ }

    const artifactRe = new RegExp(`^${wf}/artifacts/[^/]+/(.+)-v[0-9]+\\.md$`);
    const slugsFound = new Set(
      staged.flatMap(f => { const m = f.match(artifactRe); return m ? [m[1]] : []; })
    );

    if (slugsFound.size === 0) {
      // No artifact files staged — Trivial commit, skip the gate
      console.log('check-lifecycle: no lifecycle artifacts staged — skipping phase gate (trivial commit)');
      process.exit(0);
    }

    if (slugsFound.size > 1) {
      errors.push(`multiple slugs in staged artifacts: ${[...slugsFound].join(', ')} — use --slug <slug> to specify`);
      finish(`check-lifecycle --phase ${targetPhase}`, errors, details);
      process.exit(1);
    }

    slug = [...slugsFound][0];
  }

  const label = `check-lifecycle --phase ${targetPhase} --slug ${slug}`;

  // Find the latest upstream artifact for this slug
  const upstreamDir = `${wf}/artifacts/${upstream.dir}`;
  const candidates = listFiles(upstreamDir)
    .filter(f => new RegExp(`/${slug}-v[0-9]+\\.md$`).test(f))
    .sort((a, b) => {
      const va = parseInt(a.match(/-v([0-9]+)\.md$/)?.[1] ?? '0');
      const vb = parseInt(b.match(/-v([0-9]+)\.md$/)?.[1] ?? '0');
      return vb - va;
    });

  if (candidates.length === 0) {
    errors.push(`${targetPhase}: no "${upstream.dir}" artifact found for slug "${slug}" — the upstream phase must complete before ${targetPhase} can begin`);
    finish(label, errors, details);
    process.exit(1);
  }

  const latestFile = candidates[0];

  let parsed;
  try {
    parsed = parseFrontmatter(readText(latestFile), latestFile);
  } catch (e) {
    errors.push(`${latestFile}: ${e.message}`);
    finish(label, errors, details);
    process.exit(1);
  }

  const status = parsed.frontmatter.orchestration?.status ?? parsed.frontmatter.status;

  if (!upstream.ready.includes(status)) {
    const blockers = parsed.frontmatter.orchestration?.blockers ?? [];
    const blockerNote = blockers.length > 0 ? ` — blockers: ${blockers.join(', ')}` : '';
    errors.push(
      `${targetPhase}: upstream ${latestFile} has status "${status}"${blockerNote}` +
      ` (need ${upstream.ready.join(' or ')} before ${targetPhase} can proceed)`
    );
  } else {
    details.push(`${targetPhase}: ${latestFile} → ${status} ✓`);
  }

  finish(label, errors, details);
  process.exit(0);
}

// ── Static contract check (original behavior) ─────────────────────────────
// Validates that agent-behavior.yaml artifact chain matches lib.mjs contracts
// and that the artifact-frontmatter schema enums are consistent.
const errors = [];
const details = [];

const behavior = loadYaml(defsPath('agent-behavior.yaml'));
const chain = behavior.lifecycle?.artifact_chain ?? [];

if (chain.length !== artifactContracts.length) {
  errors.push(`agent-behavior artifact_chain expected ${artifactContracts.length} entries, got ${chain.length}`);
}

artifactContracts.forEach((contract, index) => {
  const item = chain[index];
  if (!item) return;
  if (item.artifact !== contract.artifact) {
    errors.push(`artifact_chain[${index}].artifact expected ${contract.artifact}, got ${item.artifact}`);
  }
  if (item.phase !== contract.phase) {
    errors.push(`artifact_chain[${index}].phase expected ${contract.phase}, got ${item.phase}`);
  }
  if (item.next_phase !== contract.nextPhase) {
    errors.push(`artifact_chain[${index}].next_phase expected ${contract.nextPhase}, got ${item.next_phase}`);
  }
  // artifact_chain paths are consumer-facing — always workflow/ regardless of build context
  const consumerWf = existsSync(join(repoRoot, 'workflow')) ? 'workflow' : ['.', 'workflow'].join('');
  const expectedPath = `${consumerWf}/artifacts/${contract.dir}/<slug>-v<N>.md`;
  if (item.path !== expectedPath) {
    errors.push(`artifact_chain[${index}].path expected ${expectedPath}, got ${item.path}`);
  }
});

const frontmatterSchema = loadYaml(defsPath('schemas', 'artifact-frontmatter.schema.yaml'));
const artifactEnum = frontmatterSchema.properties?.artifact?.enum ?? [];
const phaseEnum = frontmatterSchema.properties?.orchestration?.properties?.phase?.enum ?? [];
const nextPhaseEnum = frontmatterSchema.properties?.orchestration?.properties?.next_phase?.enum ?? [];

for (const contract of artifactContracts) {
  if (!artifactEnum.includes(contract.artifact)) {
    errors.push(`artifact-frontmatter schema missing artifact ${contract.artifact}`);
  }
  if (!phaseEnum.includes(contract.phase)) {
    errors.push(`artifact-frontmatter schema missing phase ${contract.phase}`);
  }
  if (!nextPhaseEnum.includes(contract.nextPhase)) {
    errors.push(`artifact-frontmatter schema missing next_phase ${contract.nextPhase}`);
  }
}

details.push('checked agent-behavior artifact chain');
details.push('checked artifact-frontmatter schema enums');

// ── RI1 — Artifact-location guard ─────────────────────────────────────────
// Flags artifact-shaped files (*-v<N>.md with lifecycle frontmatter) that
// have landed outside the expected workflow/artifacts/ tree.
const artifactsRoot = `${wf}/artifacts`;
const artifactSlugRe = /-v[0-9]+\.md$/;
const strayFiles = trackedFiles().filter(f => {
  if (!artifactSlugRe.test(f)) return false;
  if (f.startsWith(artifactsRoot + '/')) return false;
  // examples/ are worked consumer repos — they have their own workflow/artifacts/
  if (f.startsWith('examples/')) return false;
  // src/ is workflow source code — version numbers in filenames are coincidental
  if (f.startsWith('src/')) return false;
  // dev workspace dogfood artifacts are valid (only present in the source repo)
  if (f.startsWith('workflow/artifacts/')) return false;
  // test fixtures are exempt
  if (f.startsWith('test/fixtures/')) return false;
  return true;
});

for (const f of strayFiles) {
  // Only flag files that actually contain lifecycle artifact frontmatter
  try {
    const text = readText(f);
    const parsed = parseFrontmatter(text, f);
    if (parsed.frontmatter.artifact) {
      errors.push(`RI1: artifact-shaped file outside ${artifactsRoot}/: ${f}`);
    }
  } catch { /* not parseable as frontmatter — not an artifact */ }
}

if (strayFiles.length === 0) {
  details.push('RI1: no stray artifact files found outside artifacts tree');
}

finish('check-lifecycle', errors, details);
