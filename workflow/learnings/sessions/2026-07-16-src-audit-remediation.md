---
slug: src-audit-remediation
version: 1
artifact: learning-session
date: 2026-07-16
source: lifecycle-reflect
upstream:
  - workflow/artifacts/reflect/src-audit-remediation-v1.md
---

# Raw Learnings - src-audit-remediation v1

## Context

Remediation of a "validator disagrees with a documented contract" defect class in agentsmyth's shipped
`src/`, found by a deep audit and then (repeatedly) by dogfooding the repo's own lifecycle on the fix.
13 explicit + 4 implicit requirements, shipped as PR #34.

## Candidate Learnings

- Audit contract systems by instantiating each contract and running its validators, not by reading —
  the drift class is invisible to reading and to running the suite on already-healthy artifacts.
- Ship a conformance guard with the fix so "did I find everything?" is a command output, not a
  judgment call.
- Heuristic prose validators false-fire on artifacts *about* the concept they scan; exempt
  framing/retrospective artifacts and key on action patterns (e.g. "waived <X>") not bare keywords.
- An exhaustive sweep enumerating the whole class beats drip-feeding one find per lifecycle phase.

## Raw Notes

- Starter-block `upstream` was broken in all 7 phase blocks (6 map-form, Think empty-array vs
  minItems:1), only exposed by validating instantiated frontmatter.
- `check-waivers` suppression path (`hasStructuredRow`) is unreachable for brief/plan by contract →
  false positives on any waiver-topic framing artifact, and on the shipped verify starter block.
- The `-p<P>` task suffix was documented in lifecycle.md but rejected by check-artifacts /
  check-lifecycle; fixed both, then found the phase gate didn't aggregate multiple parts (review P2),
  fixed that too.
- check-phase-map requires bold `**Manifest IDs:**`/`**Exit gate:**`; the plan starter block shipped
  plain labels — body-format instance of the same class.
- Process: user asked for one comprehensive chain (no v2); R9–R13 folded into the live brief/plan.
- Process feedback captured to memory: when authorized to commit, just `git commit -m` — no `-F`
  file workaround, no extra ceremony.

## Curator Marks

- promoted-to-curated: none
- consolidated-with: none
- rejected-as-not-general: none
