---
slug: wp-r12-local-install-fixes
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-21
updated: 2026-07-21
manifest_ids: [R1, R2, R3, R4, RI1, RI2, RI3, RI4, RI5]
upstream:
  - user-request
  - notion-wp-r12-local-install-fixes
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: brief-review
skill_trigger_log:
  - skill: repo-alignment-scan
    decision: ran
    reason: new_surface=true (agentsmyth has never installed anything under a global, personal AI-tool config directory like `~/.claude/skills/` before — `prepare` only ever wrote gate files into existing config files) and task_class=complex — scanned real repo state (`bin/agentsmyth.mjs`'s `runPrepare()`/`placeDeterministicAdapters()`, `package.json`'s `files` allowlist, `scripts/build-bundle.mjs`); found the packaging bug (R1) and reused this scan's own evidence for R2/R3's root cause.
  - skill: architecture-decision-advisor
    decision: ran
    reason: new_surface=true — R4 raises a whole-repo-consistent decision (5 different file formats/locations across 5 adapters for one logical capability) recorded below; R1's fix touches the same `src/assets/adapters` vs `src/adapters` boundary this repo's own CLAUDE.md already documents as the deliberate publish/source split.
  - skill: constraint-conflict-scan
    decision: ran
    reason: task_class=complex (!= trivial) — checked all three `domain.yaml` constraint arrays and `repo-profile.yaml` protected paths; no conflict found (no provider-neutrality issue — these are AI-tool config locations already user-chosen by installing that tool, not a provider agentsmyth is defaulting to; no protected-path overlap).
---

# WP-R12 — Local Install Fixes (Packaging Bug + Validator Fixes + Invocation Command) - Brief

## Source Links

- Notion: [WP-R12 — Local Install Fixes (Packaging Bug + Missing Invocation Skill)](https://app.notion.com/p/3a4972bdebbb81579974dbf2a10b15c0) — the work package spec this brief implements (written before this brief; scope refined here based on real research and user decisions this turn).
- Notion: [Work Packages database row](https://app.notion.com/p/3a4972bdebbb81ba9968ce824ca126e4) — status tracking.
- User's own real testing evidence (this session): a genuine `agentsmyth init` crash against a real packed/published install in a separate repo (`JeelVankhede.github.io`), full stack trace captured and reproduced.
- `bin/agentsmyth.mjs` — `placeDeterministicAdapters()` (lines 443-461) and `runPrepare()` (lines 471-533) — ground truth for R1's 6 broken call sites.
- `package.json` `files` field — ground truth that `src/adapters/` is excluded from the publish allowlist while `src/assets/` (the build-mirrored copy) is included.
- `src/workflow/validators/check-release-readiness.mjs` — ground truth for R2/R3, found and root-caused while closing out WP-R11's Ship artifact (not hypothetical — reproduced via `node src/workflow/validators/check-release-readiness.mjs` against a real Ship artifact).
- `src/workflow/skills/lifecycle-ship/SKILL.md` Workflow step 6a (resolved-fix vs. open-risk classification) — the already-documented design intent `check-release-readiness.mjs` fails to implement (R3).
- Web research this session (WebSearch, multiple corroborating sources per tool, cited in Architecture Notes) — Claude Code Skills, Codex custom prompts, Cursor commands, Windsurf workflows, Copilot prompt files.

## Problem

Two real, independent defects surfaced when the user tested agentsmyth as a real consumer would — installing the actual package into an unrelated repo — rather than only dogfooding from inside this repo's own dev checkout, where the source/published-package distinction cannot be exercised:

1. **`agentsmyth init`/`prepare` crash for every real (non-dev-tree) install.** `bin/agentsmyth.mjs` reads 6 adapter files directly from `src/adapters/`, a path `package.json`'s `files` allowlist deliberately excludes from what npm publishes — while `src/assets/adapters/` (the build-mirrored, publish-included copy of the exact same files) sits unused right next to it.
2. **No user-invokable command exists to start the lifecycle orchestrator** after a global install — only a passive CLAUDE.md-style gate that depends on the agent noticing `workflow/` already exists, which cannot fire in a repo that hasn't been `init`'d yet, and depends on the agent proactively reading a static instruction rather than the user having an explicit, discoverable action.

A third, related defect was found while closing out WP-R11's own Ship artifact this session (not part of the original consumer-testing report, but the same "real dogfooding surfaces real gaps" pattern): **`check-release-readiness.mjs` has two compounding bugs** — a substring-priority `declaredRecommendation()` that can misdetect a real "ship" declaration as "hold" from unrelated prose, silently skipping its own real checks; and, once that's fixed, a P0/P1 cross-check with no way to recognize a finding explicitly marked resolved, contradicting `lifecycle-ship/SKILL.md`'s own already-documented step 6a. Both are real, reproduced bugs, not hypothetical — see `workflow/artifacts/open-items.yaml` OI-40.

## Goals

- `agentsmyth init` and `agentsmyth prepare` work correctly against a real packed/published install, not just this repo's own dev source tree.
- `check-release-readiness.mjs` correctly detects a Ship artifact's actual declared recommendation, and correctly distinguishes a resolved P0/P1 finding from a genuinely open one, without requiring a fabricated waiver.
- A user can type one explicit, discoverable command in their AI tool of choice (across all 5 adapters agentsmyth already supports) to start or resume the agentsmyth lifecycle in the repo they're currently in.

## Non-Goals

- Antigravity (Google's Antigravity CLI/IDE) support — not a currently-supported agentsmyth adapter; explicitly dropped from this WP by user direction. Building it would mean a full 6th adapter (global-gate.md, per-repo placement, `prepare`/`init` wiring) from scratch, not just a command file — real future work, not this WP's scope.
- Redesigning or replacing the existing passive CLAUDE.md-style global gate mechanism — R4 adds an explicit trigger alongside it, not a replacement.
- The user's separate suggestion (raised, then not pursued further this session) to install agentsmyth globally as a dev dependency rather than per-repo `--save-dev` — real design work on its own (changes `pkgRootDir`/target-repo resolution), not bundled into this WP.
- Any broader rewrite of `check-release-readiness.mjs` beyond its two named bugs (R2/R3) — its other checks (blockers, no-Ship-Status-section detection) are already correct and out of scope to touch.
- Any change to `src/workflow/skills/lifecycle-*` phase-skill content itself (R3's fix teaches a validator to recognize an already-documented convention; it does not change what Review/Ship are supposed to do).

## User Impact

`agentsmyth init` stops crashing for real installs — the single most important first-run command in the whole product. Once set up, users across any of the 5 supported AI tools get one explicit, memorable command to (re)start agentsmyth's lifecycle, instead of relying on the agent noticing repo state on its own. `check-release-readiness.mjs` stops producing false blockers (or false passes, pre-fix) for legitimate Ship declarations, restoring trust in `npm run validate`'s gate.

## Success Metrics

- A real `npm pack` + install (not a dev-tree symlink) of this package, run through `agentsmyth prepare` and `agentsmyth init` with an isolated `$HOME`, completes with zero ENOENT.
- `check-release-readiness.mjs`, re-run against every existing shipped Ship artifact plus a new synthetic regression case, correctly detects recommendations and correctly distinguishes resolved from open P0/P1 findings.
- All 5 adapters (claude, codex, cursor, windsurf, copilot) receive a working invocation file, installed by `agentsmyth prepare`, with consistent instructional content.

## Requirements

See Requirement Manifest below; every `R`/`RI` carries its own acceptance criterion.

## Constraints

- CLAUDE.md golden rule 3 (adapter sync) — R4 must keep instructional content equivalent across all 5 adapters even though file format/location is necessarily tool-specific; a difference in wording that isn't justified by the tool's own mechanism is a defect, not a stylistic choice.
- CLAUDE.md golden rule 4 (zero runtime dependencies) — none of R1-R4 may add an npm dependency; all are file-placement/parsing logic using already-imported Node built-ins.
- CLAUDE.md's source-vs-published-package split (`src/` vs `dist/`/`src/assets/`) — R1's fix must read from the already-existing, already-build-synced `src/assets/adapters/` rather than introduce a new copy mechanism.
- `repo-profile.yaml` → `paths.protected`: `.git/**`, `.env*`, `**/*secret*` — none of this work's file surfaces match; no conflict.
- `domain.yaml` → `[provider-neutrality-1]`/`[provider-neutrality-2]` — considered and found not applicable: R4 writes to config locations of AI tools the user has already chosen to install (Claude Code, Codex, Cursor, Windsurf, Copilot are agentsmyth's own already-existing supported adapter list, not a new provider default being introduced).
- `src/workflow/validators/` is explicitly in scope for R2/R3 in this WP — unlike WP-R11, which excluded it — since fixing exactly these two named, reproduced bugs is this WP's own stated purpose, not incidental scope creep.

## Risks

- **R4's 5 file formats/locations are based on external research (WebSearch, multiple corroborating sources per tool), not first-hand verification against each tool's live client** — this environment has no access to actually open Cursor, Windsurf, VS Code+Copilot, or Codex CLI and confirm the command appears and fires correctly. Build/Test can verify file placement, path correctness, and frontmatter shape, but cannot claim to have observed the command working in each tool's real UI. This must be stated plainly in Verify/Ship, not glossed over.
- **Codex's mechanism (`~/.codex/prompts/`, custom prompts) is explicitly documented by OpenAI as deprecated in favor of a "skills" concept**, per this session's research. Building against a working-but-deprecated mechanism is a real, disclosed risk — it may need to be redone if/when OpenAI removes custom-prompt support. Accepted as current-state risk (A5), not a blocker, since the alternative (waiting for Codex's own skills feature to stabilize) has no timeline.
- **R3's resolved-finding detection could theoretically mask a genuinely open P0/P1 if a future Review artifact uses resolved-sounding language for something not actually fixed.** Mitigated by scoping the detection to the small set of already-established, real phrasings found via this session's own survey of shipped review artifacts (`(fixed)`, `confirmed and fixed`), not an open-ended fuzzy match — and by erring toward still requiring a waiver/block whenever the language is ambiguous.
- **R1's fix must not silently mask the underlying "some files aren't published" class of bug for future adapter additions.** A regression test (or at minimum a documented manual-check step) verifying the CLI works against `npm pack`'s actual file list, not just the dev tree, is the real fix for this risk class — a one-time path swap alone would only fix today's 6 call sites, not prevent a 7th one appearing later.

## Open Questions

All resolved this turn — see the Q entries below for the recorded resolutions.

## Requirement Manifest

### Explicit (R)

- **R1**: Fix `bin/agentsmyth.mjs`'s packaging path bug — all 6 call sites reading `join(pkgRootDir, 'src', 'adapters', ...)` (`placeDeterministicAdapters()`'s cursor/copilot reads; `runPrepare()`'s claude/codex/windsurf/copilot global-gate reads) must read from `join(pkgRootDir, 'src', 'assets', 'adapters', ...)` instead, matching the path `package.json`'s `files` allowlist actually publishes.
  Acceptance: zero remaining `join(pkgRootDir, 'src', 'adapters', ...)` references in `bin/agentsmyth.mjs`; a real `npm pack` + `npm install --install-links` into a scratch consumer repo, run with an isolated `$HOME`, completes `agentsmyth prepare` (all 4 global gates installed, verified by content) and `agentsmyth init` (deterministic Cursor adapter placed, verified by content) with zero ENOENT. (Already implemented and verified this session — see Build.)
- **R2**: Fix `check-release-readiness.mjs`'s `declaredRecommendation()` substring-priority bug — it must parse the actual `- Recommendation: <value>` line from the Ship Status section, not scan the whole section for any occurrence of `hold-with-waiver`/`hold`/`ship`.
  Acceptance: a Ship artifact whose Ship Status section legitimately mentions "hold" elsewhere (e.g. citing Verify's own prior recommendation for context) is still correctly detected as declaring whatever its own `- Recommendation:` line actually says; re-run against every existing shipped Ship artifact in `workflow/artifacts/ship/`, every previously-reported `recommendation:` value is unchanged.
- **R3**: Fix `check-release-readiness.mjs`'s P0/P1 cross-check to recognize a Review finding explicitly marked resolved (matching this repo's own real, already-shipped conventions — `(fixed)`, `confirmed and fixed`, found via survey of shipped review artifacts), instead of treating any non-zero P0/P1 Severity Summary count as an unwaived open blocker.
  Acceptance: a Ship artifact declaring "ship" against a Review whose only non-zero P0/P1 findings are all explicitly marked resolved passes without a fabricated `## Waivers` entry; a synthetic Review with a genuinely open, unmarked P0/P1 still correctly blocks (regression case, not just the positive case).
- **R4**: Add a global invocation mechanism, installed by `agentsmyth prepare`, giving the user an explicit `/agentsmyth` command to start/resume the lifecycle orchestrator in whatever repo they're currently in (bootstrapping via `agentsmyth check`-equivalent logic first if `workflow/config/` doesn't exist yet), across all 5 currently-supported adapters.
  Acceptance: `agentsmyth prepare` writes, for each adapter, a correctly-formatted file at that tool's own real global-command location with equivalent instructional content (bootstrap-if-absent, then load `~/.agentsmyth/workflow/router.md` + `agent-behavior.yaml`, same as the existing passive gate already instructs):
  - Claude Code: `~/.claude/skills/agentsmyth/SKILL.md` (frontmatter: `name: agentsmyth`, `description: ...`).
  - Codex: `~/.codex/prompts/agentsmyth.md` (frontmatter: `description: ...`; flagged in Ship as built against a mechanism OpenAI's own docs mark deprecated).
  - Cursor: `~/.cursor/commands/agentsmyth.md` (plain markdown, no required frontmatter per Cursor's own format).
  - Windsurf: `~/.codeium/windsurf/global_workflows/agentsmyth.md` (title + description + steps, per Windsurf's own workflow format).
  - Copilot (macOS + VS Code only, matching the existing gate's own platform condition): `~/Library/Application Support/Code/User/prompts/agentsmyth.prompt.md` (YAML frontmatter, same directory as the existing `agentsmyth.instructions.md` gate file).

### Implicit (RI)

- **RI1**: No regression to `check-release-readiness.mjs`'s already-correct existing behavior (blockers check; no-Ship-Status-section error; already-correct `hold`/`hold-with-waiver` detection when that's genuinely what's declared).
  Acceptance: full re-run against every existing shipped Ship artifact after R2/R3's fix; zero newly-introduced errors on files that previously passed cleanly for the right reason.
- **RI2**: Zero new runtime dependency (CLAUDE.md golden rule 4).
  Acceptance: `git diff package.json` after this WP shows no `dependencies` or `devDependencies` change.
- **RI3**: `agentsmyth prepare`'s global-only invariant (writes zero repo-level files) holds for R4's new per-adapter files too.
  Acceptance: after `agentsmyth prepare` runs in a scratch consumer repo (isolated `$HOME`), `git status`/`ls` in that repo's working tree shows zero new repo-level files attributable to R4; all 5 new files exist only under the isolated `$HOME`.
- **RI4**: R4's 5 adapter files carry equivalent instructional content despite differing format/location per tool's own mechanism (golden rule 3's spirit, applied to this new gate-adjacent artifact).
  Acceptance: Build's Changed Files/Architecture Notes states the shared instructional content explicitly and confirms each of the 5 files carries it, adapted only for that tool's required frontmatter/structure.
- **RI5**: Codex's deprecated-mechanism risk (see Risks) is disclosed, not silently built as if permanent.
  Acceptance: Ship's artifact explicitly names this risk with owner and follow-up, per this brief's own Risks section.

### Assumptions (A)

- **A1**: Slug `wp-r12-local-install-fixes` for this lifecycle chain, following this repo's `wp-r<N>-<slug>` convention.
- **A2**: R2/R3's fix is scoped narrowly to `check-release-readiness.mjs`'s two named bugs, not a broader rewrite — minimizes blast radius on a validator whose other checks (blockers, missing-section detection) already work correctly.
- **A3**: R3's resolved-finding detection is scoped to the small set of already-established, real phrasings found via this session's survey of shipped review artifacts (`(fixed)`, `confirmed and fixed`) — conservative by design; a genuinely ambiguous case still requires a real waiver or blocks, per the risk asymmetry noted in Risks.
- **A4**: R4's 5 file paths/formats are based on this session's WebSearch research (multiple corroborating sources per tool), not first-hand verification against each tool's live client, since none is available in this environment — Build/Verify must state this limitation plainly rather than claim direct observation.
- **A5**: Codex's "custom prompts deprecated in favor of skills" status (per OpenAI's own docs, found this session) is accepted as current-state risk, not a blocker for R4 — built against the currently-working mechanism now, with a disclosed follow-up if OpenAI removes it before agentsmyth revisits.

### Open Questions (Q)

- **Q1 — resolved this turn**: New command/skill name. **Answer: `agentsmyth`** (i.e. `/agentsmyth` in every tool that supports bare `/<name>` invocation; `/prompts:agentsmyth` for Codex's own `prompts:` namespace convention). Chosen over `/workflow` for being unambiguous and matching the package name exactly.
- **Q2 — resolved this turn**: Antigravity scope. **Answer: dropped entirely from this WP** — not a currently-supported adapter; building it means a full 6th adapter, real separate future work.
- **Q3 — resolved this turn**: Whether Codex should be included alongside Claude/Cursor/Windsurf/Copilot for R4. **Answer: yes**, for consistency with the existing 5-adapter sync convention (golden rule 3).
- **Q4 — resolved this turn (via a prior AskUserQuestion, before this brief was written)**: Whether to bundle R1-R4 into one WP-R12 or split R4 into a separate WP-R13. **Answer: bundle all 4 into WP-R12** — Build may still sub-version phases independently if needed, matching WP-R11's own `-p1`..`-p9` pattern.

## Questions For User

None outstanding — Q1-Q4 were resolved this turn via direct questions; Plan may start.

## Architecture Notes

- role: Architect
- decision: R1's fix is a pure path swap (`src/adapters` → `src/assets/adapters`) at all 6 call sites, not a new file-resolution mechanism — the correct, already-existing, already-build-synced target already exists; the bug was never having pointed at it.
- decision: R4's per-adapter format differences (SKILL.md frontmatter vs. plain markdown vs. workflow title/steps vs. prompt-file frontmatter) are treated as required, not incidental — each tool's own real mechanism dictates its file's shape; forcing one shared format across all 5 would make at least some of them not actually work in their respective tool. Rejected alternative: a single shared "invocation file" template rendered identically per adapter — rejected because Cursor/Windsurf/Copilot/Codex do not share Claude Code's Skill frontmatter schema, confirmed via this session's own research (cited in Source Links).
- decision: Reused this session's own already-completed research (WebSearch results for all 5 tools' custom-command mechanisms, all cited with source URLs in the conversation this brief was written from) rather than re-deriving — Build should cite the same evidence rather than re-research, unless verifying a specific claim.
- constraint: `src/workflow/validators/` is in scope for R2/R3 specifically (unlike WP-R11), per explicit user instruction ("fix it in wp-r12") — Build must not extend this into unrelated validator changes.
- tradeoff: R4 is scoped to file-placement + content correctness, not live-UI verification (A4) — the alternative (blocking R4 entirely until each tool can be manually tested) would stall a real, already-diagnosed user-facing gap indefinitely; the tradeoff is disclosed risk, not silent overclaiming.
- downstream: Reflect should note whether the 5-way adapter-parity pattern established here (one logical capability, 5 tool-specific implementations, explicitly reconciled) is worth generalizing into a documented pattern for future cross-adapter features, given this is the first WP to build new *user-facing invocation* surface across all 5 adapters at once (prior adapter work was all passive gate content).

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] Blocking Q IDs appear in orchestration.blockers. (None — all 4 Qs resolved this turn, none blocking.)
- [x] User approved or waiver recorded. (User answered all clarifying questions directly this turn; brief ready for review.)
