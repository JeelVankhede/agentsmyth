# Session — wp-r24-enforcement-proof (2026-09-16 → 2026-09-17)

## Context

WP-R24, the seventh and last package of 1.1.0. Publish a real capture of the lifecycle gate refusing a
commit on the README and the docs site home, restate the Spec Kit comparison in verifiable file paths,
and fix a skill-count discrepancy. Standard class, single-agent throughout (councils are Complex-only).
Branch stacked on `feat/wp-r20-ledger-closure` at the user's direction.

## Candidate Learnings

- When a deliverable's value is that it is *real*, the build must include a check that fails if it stops
  being real. `provoke()` throws if the gate ever permits the commit.
- A positive control proves a check can pass, not that it can fail. `--check` said "ok" for a whole phase
  before anyone asked whether it could say anything else; the negative control was added at Review.
- Verify a requirement's premise before building to it. The charter said "one is wrong on a public
  surface"; both numbers were correct in context, and the real defect was an absence.
- An acceptance criterion can be unachievable and still pass review, because criteria are read for intent
  rather than executed. "Byte-identical" died on contact with two rendering contexts.
- Build the demo fixture before designing the demo. A one-line change is not refused at all, and a
  half-built consumer repo drowns the refusal in setup failures.
- Generated content injected into a template inherits that template's evaluation rules — `{{` in a future
  gate message would have been compiled as a Vue expression.

## Raw Notes

- Phase 1's first commit attempt SUCCEEDED: `trivial-size escape: src/app.js (<= 15 changed lines)`.
  The obvious demo would have captured the gate allowing a commit under a caption claiming a refusal.
- Second attempt surfaced the real refusal beneath six `check-setup-complete` failures — unfilled
  placeholders, missing `docs/knowledge-map/`, missing `workflow/learnings/`, no adapter. Fixture
  completeness turned out to be part of RI3, not just paths and banners.
- The published transcript shows the gate *accepting* the artifact's self-reported readiness
  (`→ ready-for-next-phase ✓`) and then failing the approval check. Better argument than planned.
- Think-phase verification of the Spec Kit claims at `1d5106f`: all four survived, two needed re-wording.
  Claim 1's premise was confirmed in the process — the checkbox reading belongs to `implement`, not to
  `check-prerequisites.sh`.
- Validators discovered by failing them: `check-scope-fence` (out-of-repo Touches), `check-scope-fence`
  again (prose active-phase line — third chain in a row), `check-artifacts` (unanchored Requirement
  Manifest regex matched an inline mention of the heading).
- Review found four: `v-pre` missing on generated content in a Vue template; an unguarded recursive
  delete aimed by a config value; "documented steps" that lived only as comments inside the documented
  file; unchecked `git` exit codes in fixture setup.

## Curator Marks

<!-- reserved for the curator; leave empty -->
