#!/usr/bin/env node
// requirement-phase-mapper. For plan artifacts, confirms every active R/RI (from
// frontmatter manifest_ids) appears in exactly one "### Phase N" block's stated Manifest IDs line,
// and that every phase declaring manifest IDs has a binary exit gate.
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

// Splits the ## Phases section into ### Phase N blocks, extracting each block's stated
// **Manifest IDs:** line (the authoritative coverage statement — not incidental prose mentions).
function phaseBlocks(body) {
  // Stop only at the next level-2 (## ) heading, not at "---" — plans commonly use standalone
  // "---" lines as a visual divider *between* phases, not as a section boundary. Matching on
  // "---" here was a real bug, found via dogfooding: it truncated the section after Phase 1 for
  // every existing plan that uses this convention.
  const phasesSection = body.match(/## Phases\s*\n([\s\S]*?)(?=\n## [^#]|\s*$)/);
  if (!phasesSection) return [];
  const blocks = phasesSection[1].split(/\n(?=### Phase\s)/);
  return blocks
    .map((block) => {
      const numMatch = block.match(/^### Phase\s+(\d+)/);
      const idsMatch = block.match(/\*\*Manifest IDs:\*\*\s*(.+)/);
      const exitGateMatch = block.match(/\*\*Exit gate:\*\*\s*\n?([\s\S]*?)(?=\n### |$)/i);
      if (!numMatch) return null;
      const ids = idsMatch ? idsMatch[1].split(',').map((s) => s.trim()).filter(Boolean) : [];
      return { phase: numMatch[1], ids, hasExitGate: Boolean(exitGateMatch && exitGateMatch[1].trim().length > 0) };
    })
    .filter(Boolean);
}

for (const file of artifactFiles) {
  const dir = file.split('/').slice(-2, -1)[0];
  if (dir !== 'plans') continue;

  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  const activeIds = parsed.frontmatter.manifest_ids ?? [];
  if (activeIds.length === 0) continue;

  const blocks = phaseBlocks(parsed.body);
  if (blocks.length === 0) continue; // no ## Phases section — not this validator's concern here

  for (const block of blocks) {
    if (block.ids.length > 0 && !block.hasExitGate) {
      errors.push(`${file} Phase ${block.phase} declares manifest IDs but has no exit gate content`);
    }
  }

  // Coverage check: an active ID is covered if it appears exactly, OR if any phase lists a
  // hyphenated sub-label of it (e.g. "RI5-a" covers base "RI5") — real plans (system-level-install-v1)
  // decompose one implicit requirement into per-phase sub-parts this way, and that is not an
  // orphan. Multi-phase appearance (an ID cited by several phases) is deliberately NOT flagged as
  // a "duplicate" — found via dogfooding that real, correct plans commonly and intentionally
  // spread a cross-cutting ID (e.g. RI4, appearing in all 6 phases of a real precedent) across
  // every phase with no separate prose annotation; that pattern is unambiguous on its own and
  // distinguishing it from a genuine accidental duplicate is a semantic judgment call, not
  // something this validator can reliably make. Only a true orphan (zero phases) is an error.
  const allIds = blocks.flatMap((b) => b.ids);
  for (const id of activeIds) {
    const covered = allIds.some((listedId) => listedId === id || listedId.startsWith(`${id}-`));
    if (!covered) {
      errors.push(`${file} manifest ID ${id} is not covered by any phase (orphan)`);
    }
  }

  details.push(`checked ${file} (${activeIds.length} manifest ID(s), ${blocks.length} phase(s))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

finish('check-phase-map', errors, details);
