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

// Parses a "## Checkpoint Approval" body section, if present. Deliberately requires a real,
// quoted user statement rather than trusting orchestration.status alone — an artifact's own
// status/user_checkpoint fields are written by the same agent whose work they're supposed to
// gate, so a status of "ready-for-next-phase" on its own proves nothing about whether the user
// actually saw and approved this specific artifact. See workflow/rules.md's "## Approval"
// section, which stated this rule in prose before this mechanical check existed and was not
// sufficient on its own to prevent a real violation (an agent treated answering earlier
// clarifying questions as blanket approval for a later, distinct plan-review checkpoint it
// never actually surfaced) — this function is the hard-blocking backstop for that prose rule,
// not a replacement for it. Cannot itself prove authenticity of the quoted text (nothing
// file-based can, since the same agent authors the file) — see workflow/rules.md's explicit
// instruction that the agent must never author this evidence itself, only copy the user's real
// words verbatim.
function checkpointApprovalSection(body) {
  const match = body.match(/## Checkpoint Approval\s*\n([\s\S]*?)(?=\n## |\n---|\s*$)/);
  if (!match) return null;
  const section = match[1];
  const checkpoint = section.match(/^-\s*Checkpoint:\s*(.+)$/im)?.[1]?.trim();
  const status = section.match(/^-\s*Status:\s*(.+)$/im)?.[1]?.trim();
  // The terminator used to be `(?=\n-\s|\n*$)`, and under /m the `$` matched at the FIRST
  // line end — so a multi-line verbatim quote truncated to its opening line, which then usually
  // tripped the length<10 placeholder guard below. Users approve in multi-line messages routinely,
  // which put "quote the user verbatim" in direct tension with what could be stored.
  // Now terminates only on the next bullet at column 0, or at true end-of-string, so indented
  // continuation lines and blank lines inside a quote are preserved.
  const evidenceMatch = section.match(/^-[ \t]*User'?s? own words[^:]*:[ \t]*([\s\S]*?)(?=\n-[ \t]|$(?![\s\S]))/im);
  const evidence = evidenceMatch?.[1]?.trim().replace(/^"|"$/g, '');
  if (!checkpoint || !status) return null;
  return { checkpoint, status, evidence };
}

const PLACEHOLDER_EVIDENCE = /^(tbd|n\/a|na|-|none|pending|todo|<[^>]*>)$/i;

// Hard-blocking gate: if the upstream artifact declares a real (non-"none") user_checkpoint,
// it must carry a matching, approved, evidenced "## Checkpoint Approval" section before the
// next phase may begin — regardless of what orchestration.status says. Pushes to `errors`
// directly (same array the phase-readiness check above uses) so a missing/invalid checkpoint
// approval blocks phase progression exactly like a not-ready status does.
function requireCheckpointApproval(parsed, partFile, targetPhase, errors, details) {
  const checkpoint = parsed.frontmatter.orchestration?.user_checkpoint;
  if (!checkpoint || checkpoint === 'none') return;

  const approval = checkpointApprovalSection(parsed.body);
  if (!approval) {
    errors.push(
      `${targetPhase}: upstream ${partFile} declares user_checkpoint "${checkpoint}" but has no ` +
      `"## Checkpoint Approval" section — real user approval cannot be verified. Do not self-author ` +
      `this evidence (workflow/rules.md's Approval section); present the artifact to the user and wait.`
    );
  } else if (approval.checkpoint !== checkpoint) {
    errors.push(
      `${targetPhase}: upstream ${partFile}'s "## Checkpoint Approval" section names checkpoint ` +
      `"${approval.checkpoint}", but orchestration.user_checkpoint is "${checkpoint}" — mismatch.`
    );
  } else if (approval.status !== 'approved') {
    errors.push(
      `${targetPhase}: upstream ${partFile}'s checkpoint "${checkpoint}" is not marked approved ` +
      `(status: "${approval.status}").`
    );
  } else if (!approval.evidence || approval.evidence.length < 10 || PLACEHOLDER_EVIDENCE.test(approval.evidence)) {
    errors.push(
      `${targetPhase}: upstream ${partFile}'s checkpoint "${checkpoint}" has no real evidence quote ` +
      `— empty or placeholder text is not acceptable.`
    );
  } else {
    details.push(`${targetPhase}: ${partFile} checkpoint "${checkpoint}" → approved ✓`);
  }
}

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

    // Accept the optional `-p<P>` Build-phase suffix (lifecycle.md "Build Phase Sub-Versioning");
    // the slug capture excludes it so a split task resolves to its parent slug.
    const artifactRe = new RegExp(`^${wf}/artifacts/[^/]+/(.+)-v[0-9]+(?:-p[0-9]+)?\\.md$`);
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
    .filter(f => new RegExp(`/${slug}-v[0-9]+(?:-p[0-9]+)?\\.md$`).test(f))
    .sort((a, b) => {
      const va = parseInt(a.match(/-v([0-9]+)(?:-p[0-9]+)?\.md$/)?.[1] ?? '0');
      const vb = parseInt(b.match(/-v([0-9]+)(?:-p[0-9]+)?\.md$/)?.[1] ?? '0');
      return vb - va;
    });

  if (candidates.length === 0) {
    errors.push(`${targetPhase}: no "${upstream.dir}" artifact found for slug "${slug}" — the upstream phase must complete before ${targetPhase} can begin`);
    finish(label, errors, details);
    process.exit(1);
  }

  // When a Build phase was split into `-p<P>` parts (lifecycle.md "Build Phase Sub-Versioning"),
  // several files share the latest version. The gate must require EVERY part of that latest version
  // to be ready — not just an arbitrary one — otherwise a later phase could start while a sibling
  // build-phase task is still incomplete. Select all files at the highest version and check each.
  const latestVersion = parseInt(candidates[0].match(/-v([0-9]+)(?:-p[0-9]+)?\.md$/)?.[1] ?? '0');
  const latestParts = candidates.filter(
    f => parseInt(f.match(/-v([0-9]+)(?:-p[0-9]+)?\.md$/)?.[1] ?? '0') === latestVersion
  );

  for (const partFile of latestParts) {
    let parsed;
    try {
      parsed = parseFrontmatter(readText(partFile), partFile);
    } catch (e) {
      errors.push(`${partFile}: ${e.message}`);
      continue;
    }

    const status = parsed.frontmatter.orchestration?.status ?? parsed.frontmatter.status;
    if (!upstream.ready.includes(status)) {
      const blockers = parsed.frontmatter.orchestration?.blockers ?? [];
      const blockerNote = blockers.length > 0 ? ` — blockers: ${blockers.join(', ')}` : '';
      errors.push(
        `${targetPhase}: upstream ${partFile} has status "${status}"${blockerNote}` +
        ` (need ${upstream.ready.join(' or ')} before ${targetPhase} can proceed)`
      );
    } else {
      details.push(`${targetPhase}: ${partFile} → ${status} ✓`);
    }

    requireCheckpointApproval(parsed, partFile, targetPhase, errors, details);
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
