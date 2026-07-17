---
slug: src-audit-remediation
version: 1
artifact: brief
status: ready-for-next-phase
created: 2026-07-15T12:00:57Z
updated: 2026-07-15T13:20:00Z
manifest_ids:
  - R1
  - R2
  - R3
  - R4
  - R5
  - R6
  - R7
  - R8
  - R9
  - R10
  - R11
  - R12
  - R13
  - RI1
  - RI2
  - RI3
  - RI4
upstream:
  - user-request
orchestration:
  phase: think
  status: ready-for-next-phase
  next_phase: plan
  blockers: []
  user_checkpoint: approved
skill_trigger_log:
  - skill: repo-alignment-scan
    signals:
      task_class: complex
      new_surface: false
    decision: ran
    reason: >-
      task_class != trivial. The audit that seeds this brief was itself a whole-repo alignment
      scan — every finding is anchored to a real file:line in src/ and cross-checked against the
      schemas, validators, and reference implementations, not inferred.
  - skill: architecture-decision-advisor
    signals:
      task_class: complex
      touches_contract: true
    decision: ran
    reason: >-
      touches_contract — R4 changes lifecycle-contract semantics (how a waived Test phase reaches
      Ship). The whole-repo decision is recorded in Architecture Notes (define a waived-Test that
      still writes a verify artifact with waived matrix rows, rather than special-casing the phase
      gate). The narrower strengthen-validator-vs-correct-docs choice for R6 is design detail
      deferred to Plan.
  - skill: constraint-conflict-scan
    signals:
      task_class: complex
      touches_protected: false
    decision: ran
    reason: >-
      task_class != trivial. Cross-checked against domain.yaml (provider-neutrality-1/2, safety-*)
      and the CLAUDE.md zero-dep + adapter-sync invariants. No conflict: all fixes are
      documentation/contract-accuracy and adapter-parity work; none introduce a provider, a runtime
      dependency, or destructive behavior.
---

# Src Content Audit Remediation — Brief

## Source Links

- User request (this session): run a deep audit of shipped `src/` content, then "invoke lifecycle
  and schedule above items as fixes."
- The audit findings (this session) are the substantive input. Each requirement below traces to a
  confirmed finding anchored at a real `src/` path.
- Classification: **Complex** — multiple independent workstreams (setup-reference doc-sync,
  lifecycle-contract semantics, adapter parity, validator-enforcement accuracy) that can be built
  in parallel; R4 touches the lifecycle contract. All phases required including Test.

## Problem

A deep audit of the shipped `src/` tree found the runtime lifecycle spine (router → lifecycle →
7 phase skills → validators) internally consistent and mechanically verified, but surfaced one
critical hallucination cluster and several consistency gaps that will derail agents:

1. **Setup references describe a config shape that does not exist.** `src/setup/references/config-map.md`,
   `src/setup/references/token-map.md`, and three examples in `src/setup/SKILL.md` route interview
   answers to fields the schemas reject (`additionalProperties: false` throughout). Concretely:
   - `config-map.md:23-26` → `sources[].kind/.location`, `resolution_order[]`; schema has
     `source_of_truth.providers[]` with `{id,type,enabled,location…}` and no `resolution_order`.
   - `config-map.md:61-66` → `commands.build/.test_unit/.test_integration/.lint`,
     `required_before_ship[]`, `evidence_policy.*`; `verification.commands` is an **array** of
     `{id,command,cwd,required,phases}` and the other two keys do not exist.
   - `config-map.md:79-81` → `release.process/.rollback/.targets[]`; `release.schema` has
     `gates.*` + top-level `rollback`, no `process`/`targets`.
   - `token-map.md` → `{{REPO_NAME}}` sourced from `repository.root` (renders `"."`);
     `{{VERIFICATION_CMDS}}` from `commands[].run` (field is `command`); `{{CONSTRAINTS}}` from
     `domain.constraints[]` (actual shape is categorized `constraints.product[]/safety[]`).
   - `SKILL.md:92,111,118` pending-setup examples use `commands[0].run` and `providers[0].read_url`
     (fields are `command` and `location`).
   Phase 4's mandatory `check-config` run catches the breakage, but the setup agent then rebuilds
   configs from schema errors instead of from the interview mapping — answers can be dropped or
   misplaced, and weaker models loop. This is the primary "hallucinating items that derail agents"
   failure class.

2. **"Test skippable with waiver" has no operational path.** `agent-behavior.yaml` and
   `router.md:45` allow Standard work to skip Test with a waiver, but `check-lifecycle.mjs --phase
   ship` hard-requires a ready `verify` artifact, `lifecycle-ship/SKILL.md` lists verify under
   "Required" and makes a missing verify artifact a stop condition, and `router.md:79` calls a
   non-zero gate exit "an unconditional stop." Nothing states what a waived Test produces. An agent
   that legitimately waives Test hits a documented dead-end at Ship.

3. **`check-skill-triggers.mjs` under-enforces its own documented claim.** It only schema-validates
   a `skill_trigger_log` when the key is present (`if (log === undefined) continue`); omitting the
   log entirely passes silently. `agent-behavior.yaml`'s comment and `lifecycle-think`'s Exit Gate
   claim it audits "a decision recorded for every triggered skill." No starter block includes a
   `skill_trigger_log` key to remind the agent it exists.

4. **Soft prose vs hard gate.** `lifecycle.md`'s phase table lists Test's upstream as "review when
   available", but the phase gate hard-requires a ready review artifact before test.

5. **Adapter gate drift.** `cursor/rules/index.mdc` and `windsurf/.windsurfrules` omit the
   "Never skip this gate. Never mark a phase complete without evidence." lines that
   claude/codex/copilot carry (those three are md5-identical). CLAUDE.md rule 3 requires all five
   adapters to carry the same mandatory-gate content.

6. **Low-severity consistency defects:** starter block says `role: Lead Architect` while
   `lifecycle-think/SKILL.md` says `role: Architect`; shipped `AGENTS.md` step 3 omits that
   skipping Test needs a waiver (compounds #2); nothing states A/Q IDs must not enter `manifest_ids`
   (schema pattern allows only `R`/`RI`), a predictable first-artifact validation failure;
   `format: date-time` in schemas is unenforced by `lib.mjs` while all artifacts use bare dates.

7. **All seven phase starter blocks carry an `upstream:` shape the schema rejects.** (Found during
   Plan; scope corrected by the exhaustive sweep below.) An exhaustive frontmatter sweep of every
   starter block against `artifact-frontmatter.schema.yaml` shows: plan/build/review/test/ship/reflect
   use `upstream:` as a **map** (`brief: <path>`) → type error; and **think** uses `upstream: []`
   which violates `minItems: 1`. So an agent copying **any** of the seven verbatim produces
   frontmatter that fails `check-artifacts` — the earlier "only Think is correct" was wrong. Uncaught
   because `check-starter-blocks.mjs` only asserts a `## Starter Block` heading exists, never
   validating the block's frontmatter against the schema. Same drift class as findings #1 and #4.

8. **`check-waivers.mjs` false-positives on waiver-*subject-matter* prose.** Its heuristic flags any
   line with `waiv*` plus an R-id or "gate" as a hidden waiver claim, unless the artifact has a
   structured `## Waivers`/`## Skipped Checks` row (`hasStructuredRow`). Two consequences: (a) briefs
   and plans have **no `## Waivers` section in their contract**, so that suppression path is
   structurally unreachable — any brief/plan whose topic is the waiver mechanism (like this chain)
   trips it; and (b) the **shipped verify starter block's** verification-matrix template row
   `| R1 | … waiver | | … waived | |` uses `waiver`/`waived` as legitimate method/status **enum
   values** — so a verify artifact instantiated verbatim from the shipped block fails check-waivers
   whenever its Skipped Checks table is empty. These enum tokens are exactly analogous to the
   `hold-with-waiver` value the check already exempts. (Found during Build + dry-run.)

9. **The `-p<P>` task sub-versioning is documented but rejected by the validators.**
   `lifecycle.md:23-29` documents `tasks/<slug>-v<N>-p<P>.md` for split Build phases, but
   `check-artifacts.mjs:71` (`^(.+)-v([0-9]+)\.md$`) and `check-lifecycle`'s slug-detection regex
   only accept `-v<N>.md`. A `-p<P>` task file fails validation. Never caught because every prior
   dogfood chain used single-file tasks. (Found during Build.) Same doc↔validator drift class.

10. **Root cause across findings #1/#4/#7/#8/#9: there is no contract-conformance guard.** Every one
    of these is "a validator disagrees with a documented contract," a class invisible to reading and
    to running the suite on already-healthy artifacts. It is only exposed by instantiating each
    contract fresh and running the validators against it. Nothing does that today, which is why the
    defects surfaced one at a time during the lifecycle run instead of all at once.

11. **Plan starter block's phase body format is rejected by `check-phase-map.mjs`.** The block shows
    phase labels plain (`- Manifest IDs:` / `- Exit gate:`), but the validator requires **bold**
    `**Manifest IDs:**` / `**Exit gate:**`; a plan authored verbatim from the starter block fails
    `check-phase-map` with every ID read as an orphan. Same class as #7/#8/#9 but in body format,
    which the frontmatter-only R12 guard does not cover. (Found by running the full suite against
    this chain's own plan.)

## Goals

- Make every setup-reference field match the real schemas so a fresh `npx agentsmyth init` converges
  on the first pass instead of correcting against `check-config` errors.
- Give a waived Test phase one documented, gate-passing path to Ship.
- Bring the enforcement docs and the validator into agreement, and make the honor-system
  `skill_trigger_log` discoverable via the starter blocks.
- Restore the four/soft-hard and adapter-parity consistency gaps.
- Add a source-level check that pins setup-reference field accuracy so this drift class cannot
  recur silently (the highest-leverage recurrence guard identified by the audit).

## Non-Goals

- Do not redesign the config schemas, the lifecycle phase order, or the skill-scoring model — the
  fix is to make the docs/contract match what already exists, not to change the design.
- Do not implement `format: date-time` enforcement in `lib.mjs` — capture it as a tracked
  low-severity item only; adding format checking is a separate, riskier change (would mass-break
  existing bare-date artifacts) and is out of scope here.
- Do not touch the runtime lifecycle spine that the audit verified green (router/lifecycle skills'
  core behavior, the 8 Wave-1 validators, `check-artifacts`/`check-lifecycle` core logic) beyond
  the specific consistency lines named above.
- Do not add any runtime dependency.

## User Impact

Consumer repos running `npx agentsmyth init` today are routed by `config-map.md`/`token-map.md` to
write config fields their own schema rejects, forcing an error-correction loop during first-time
setup — the product's own onboarding flow. Agents that correctly waive Test on Standard work reach
an undocumented dead-end at Ship. Both are live friction on the two moments an agent most needs a
straight line: first setup and first shipped change.

## Success Metrics

- Every field named in `config-map.md` and `token-map.md` resolves to a real key in the
  corresponding schema, verified by a source-level check that fails on drift.
- A worked example of a Standard chain that waives Test reaches a `ship` recommendation without a
  gate error.
- `npm run validate`, `npm run violations:test`, `npm run setup-checks:test`, and
  `npm run root-resolution:test` all pass after the changes; `dist/` and `src/assets/adapters/`
  are in sync with source.
- All five adapters carry identical mandatory-gate content (parity check passes).

## Requirements

See Requirement Manifest below.

## Constraints

- Zero runtime dependencies (CLAUDE.md invariant).
- Edit source (`src/`) only; rebuild with `npm run build` after any `src/workflow`, `src/setup`, or
  `src/adapters` change — never hand-edit `dist/`, root `validators/`, `src/assets/adapters/`, or
  `workflow/schemas/`.
- All five adapters must stay in sync (CLAUDE.md rule 3); `src/assets/adapters/` is a build product
  of `src/adapters/` and must remain identical.
- `[provider-neutrality-1/2]` and `[safety-*]` from `domain.yaml`: no fix may make a provider
  mandatory or introduce destructive behavior. Verified clean by `constraint-conflict-scan` (none
  do — all are doc/contract/parity work).
- Preserve the schemas as the single source of truth: reference docs bend to the schema, not the
  reverse.

## Risks

- **R4 semantics could weaken the Test gate if done loosely.** Defining "waived Test still writes a
  verify artifact" must keep the waiver visible as residual risk (per `rules.md` Evidence) and must
  not let a waiver fabricate a passing verify — mitigated by reusing the existing 6-field waiver
  schema and `waiver-completeness-check`, and by making the waived matrix rows explicitly `waived`,
  not `pass`.
- **The R8 source-level pin could be brittle** if it hard-codes field lists — mitigated by driving
  it off the actual schema files (the same two-root resolver validators already use), so it tracks
  schema changes automatically.
- **R1–R3 doc rewrites could introduce a new wrong field** if done by hand — mitigated by landing
  R8 (the pin) first or alongside, so the corrected docs are themselves checked.

## Open Questions

- Q1 (non-blocking): For R6, resolve the `check-skill-triggers` over-claim by *strengthening the
  validator* (fail when a triggered skill has no log entry) or by *softening the doc language* to
  match honor-system reality? Owner: user/decision-owner. Blocking: no — Plan can frame both; the
  audit leans toward softening the doc + adding the starter-block key (cheaper, no false-fail risk
  on the un-runtime-computable predicate), but either satisfies R6's acceptance.

## Requirement Manifest

### Explicit (R)

- **R1** - Rewrite `src/setup/references/config-map.md` so every target field matches the real
  schema shape for `source-of-truth`, `verification`, and `release` (providers[] array;
  commands[] array of `{id,command,cwd,required,phases}`; `gates.*` + `rollback`).
  - Acceptance: every field token in `config-map.md` resolves to a key present in the matching
    `src/workflow/schemas/*.schema.yaml`; the R8 check passes against it.

- **R2** - Correct `src/setup/references/token-map.md` sources: `{{REPO_NAME}}`,
  `{{VERIFICATION_CMDS}}` (`commands[].command`), `{{CONSTRAINTS}}` (categorized
  `constraints.product[]/safety[]`), and any other token whose field is wrong.
  - Acceptance: each token's Config/Field row names a key that exists in the referenced schema and
    template; `render-adapters.mjs` still renders all 8 tokens without change in behavior.

- **R3** - Fix the pending-setup examples in `src/setup/SKILL.md` (`commands[].command`,
  `providers[].location`, not `.run`/`.read_url`).
  - Acceptance: every dot-path in the SKILL.md examples matches a real schema field; no example
    references a nonexistent key.

- **R4** - Define one documented, gate-passing path for a waived Test phase to reach Ship: a waived
  Test still writes a `verify` artifact whose matrix rows are recorded as `waived` (not `pass`),
  carrying the 6-field waiver. Reflect this in `lifecycle-test`, `lifecycle-ship`, and the shipped
  `AGENTS.md`/`router.md` wording as needed.
  - Acceptance: a worked Standard example that waives Test produces a verify artifact that
    `check-lifecycle --phase ship` accepts and `release-readiness-gate` aggregates to a valid
    recommendation, with the waiver visible as residual risk.

- **R5** - Restore adapter gate parity: `cursor/rules/index.mdc` and `windsurf/.windsurfrules`
  carry the same mandatory-gate assertion as claude/codex/copilot; rebuild `src/assets/adapters/`.
  - Acceptance: all five source adapters carry the mandatory-gate content; `src/assets/adapters/`
    is byte-identical to the rebuilt output; `render-adapters` parity check passes.

- **R6** - **Strengthen `check-skill-triggers.mjs`** (Q1 resolved: strengthen the validator, not
  soften the docs) so it fails when an artifact whose phase *mandates* trigger evaluation is missing
  a `skill_trigger_log`, or the log omits a phase-mandated skill. The validator drives off a static
  phase→required-skills map (e.g. Think mandates `repo-alignment-scan`,
  `architecture-decision-advisor`, `constraint-conflict-scan` per `lifecycle-think`), which is
  mechanically checkable. It does **not** attempt to re-derive the `skill_scoring` predicate/score
  (no runtime can compute `path~globs`/`complexity_score`) — that boundary stays honor-system, and
  the docs' claim is narrowed to exactly what the validator now enforces (presence + completeness of
  the log for phase-mandated triggers). Also add a `skill_trigger_log` stub to the phase-skill
  starter blocks so authors see the key.
  - Acceptance: `check-skill-triggers.mjs` exits non-zero on a fixture Think-phase artifact that
    omits the log (or omits a mandated skill) and exits zero on one that records all mandated
    skills; the `agent-behavior.yaml` comment + `lifecycle-think` Exit Gate wording match the
    validator's actual (now-enforcing) behavior; the Think starter block shows a `skill_trigger_log`
    stub. Wired into `npm run validate`.

- **R7** - Reconcile `lifecycle.md`'s "review when available" Test-upstream wording with the phase
  gate that hard-requires a ready review artifact.
  - Acceptance: `lifecycle.md`'s phase table and `check-lifecycle`'s `UPSTREAM` map describe the
    same required-vs-optional upstream for Test.

- **R8** - Add a source-level validator (or extend an existing one) that checks every field named in
  `config-map.md`/`token-map.md` exists in the schemas, wired into `npm run validate`.
  - Acceptance: `npm run validate` runs the check; it fails on a seeded wrong field and passes on
    the corrected docs.

- **R9** - Fix the `upstream:` frontmatter shape in **all seven** starter blocks
  (`lifecycle-*/references/output-schema.md`): the six map-form blocks → array-of-strings, and the
  `think` block's `upstream: []` reconciled with the schema (either give the brief block a real
  1-item upstream such as `- user-request`, or relax `artifact-frontmatter.schema.yaml` `upstream`
  `minItems` to 0 for briefs — chosen in Plan). Found during Plan; scope corrected by the sweep.
  - Acceptance: an artifact created by copying **any** of the seven starter blocks verbatim passes
    `check-artifacts` (frontmatter valid). Enforced by R12's guard.

- **R10** - Fix `check-waivers.mjs`'s false-positive surface (finding #8): (a) exempt framing
  artifacts — briefs and plans — from the unstructured-waiver scan (parallel to the existing Reflect
  exemption; justified because their contract has no `## Waivers` section and they frame rather than
  execute a gate); and (b) stop treating the verification-matrix's `waiver`/`waived` **enum tokens**
  as claims (extend the existing `hold-with-waiver` exemption to these method/status values).
  - Acceptance: `check-waivers` passes this chain's own brief/plan and a verify artifact instantiated
    verbatim from the shipped starter block (empty Skipped Checks); it still fails on a genuine
    prose waiver claim with zero structured disclosure in a task/verify/ship artifact (a fixture
    proves the real P2 detection is preserved). Wired in `npm run validate` (already is).

- **R11** - Honor the documented `-p<P>` task suffix: make `check-artifacts.mjs` and
  `check-lifecycle.mjs` accept `tasks/<slug>-v<N>-p<P>.md` (filename regex + slug detection), so the
  `lifecycle.md`-documented capability actually validates. (Align reality to the documented contract
  rather than deleting the doc, consistent with treating docs/schema as truth.)
  - Acceptance: a `-p<P>` task artifact passes `check-artifacts`, and `check-lifecycle --phase review`
    resolves its slug; a fixture covers it. Enforced by R12's guard.

- **R12** - Add the missing **contract-conformance guard** (finding #10 — the systemic fix): a
  source-level check/test that instantiates every phase starter block (and the `-p<P>` task form)
  and asserts the validators accept it — the "cook from every recipe" test that would have caught
  R9/R10/R11 at once. Implemented by strengthening `check-starter-blocks.mjs` to validate each
  starter block's frontmatter against `artifact-frontmatter.schema.yaml` (absorbing R9's originally-
  planned guard) plus a fixture-backed test for the `-p<P>` filename form and the check-waivers
  starter-block cases. Wired into `npm run validate`.
  - Acceptance: the guard runs in `npm run validate`; it fails against a seeded broken starter block
    (e.g. map-form `upstream`) and passes once R9/R10/R11 land; re-introducing any of those defects
    turns `npm run validate` red.
  - **Boundary (documented residual):** R12's guard validates starter-block *frontmatter*. Body-format
    contracts (see R13) are a separate dimension the guard does not fully cover — closing the whole
    body-format surface mechanically would require instantiating and content-filling every artifact,
    out of scope here. Named as a follow-up.

- **R13** - Fix the plan starter block's **phase body format** to match `check-phase-map.mjs`: the
  block shows phase labels plain (`- Manifest IDs:` / `- Exit gate:`), but the validator requires
  **bold** `**Manifest IDs:**` / `**Exit gate:**` — so a plan authored by copying the starter block
  verbatim fails `check-phase-map` (every ID reads as an orphan). Same doc↔validator class as R9,
  in the body rather than the frontmatter; found by running the full suite against this chain's own
  plan (finding #11).
  - Acceptance: the plan starter block uses the bold labels; a plan authored from it passes
    `check-phase-map`. (This chain's own plan is the worked proof once corrected.)

### Implicit (RI)

- **RI1** - Rebuild bundles after source edits so `dist/` and `src/assets/` are not stale.
  - Acceptance: `npm run build` run after edits; `git status` shows `dist/`, root `validators/`,
    `src/assets/adapters/`, and `workflow/schemas/` regenerated, not hand-edited.

- **RI2** - No regression to the existing green test/validator suite.
  - Acceptance: `npm run validate`, `violations:test` (20/20), `setup-checks:test`,
    `root-resolution:test` all pass after the change.

- **RI3** - Low-severity consistency defects are resolved or explicitly tracked: `role:` label
  aligned between starter block and `lifecycle-think`; shipped `AGENTS.md` step 3 notes the Test-skip
  waiver requirement; a one-line "A/Q IDs never go in `manifest_ids`" note added where authors will
  see it; `format: date-time` captured as a Reflect follow-up (not fixed — see Non-Goals).
  - Acceptance: the first three are corrected in source; the date-time item appears as a named
    follow-up candidate.

- **RI4** - No new runtime dependency.
  - Acceptance: `package.json` `dependencies` unchanged; any new validator uses only `node:*`
    builtins and `lib.mjs` helpers.

### Assumptions (A)

- **A1 (CONFIRMED 2026-07-15)** - The schemas are correct and the reference docs are what drifted.
  User asked to confirm rather than assume; confirmed with current-turn evidence:
  `check-config` passes all five config templates against their schemas; every corrected R1–R3
  target field (`providers[].location`, `verification.commands[].command`, `release.gates.*` +
  `rollback`, `repository.default_branch`, `domain.constraints.product[]/safety[]`) is present in
  the schemas; and every current *wrong* doc field (`resolution_order`, `required_before_ship`,
  `evidence_policy`, `release.targets`, `.run`, `.read_url`) returns **0 schema hits**. The docs are
  unambiguously the wrong side. No longer an open assumption.
- **A2 (SUPERSEDED by Q1)** - The earlier assumption that R6 would be resolved by *softening* the
  docs is void. Q1 is resolved as **strengthen the validator**; R6 now enforces log
  presence/completeness for phase-mandated triggers and narrows the docs to match that (see R6).

### Open Questions (Q)

- **Q1 (RESOLVED 2026-07-15)** - R6 resolution: **strengthen the validator** (user decision). The
  strengthening is scoped to what is mechanically checkable — fail on a missing/incomplete
  `skill_trigger_log` for phases that mandate trigger evaluation — not to re-deriving the
  un-computable `skill_scoring` predicate. Captured in R6. Owner: user. Blocking: no.

## Questions For User

- None outstanding. Q1 resolved (strengthen the validator); A1 confirmed with evidence; A2
  superseded. Ready for Plan.

## Architecture Notes

- role: Architect
- decisions:
  - Treat the schemas as the fixed source of truth; every fix bends the reference docs/contract
    wording to the existing schema shape (A1). This keeps the change to documentation/contract
    accuracy and avoids a schema redesign the audit did not call for.
  - **Waived-Test contract (R4):** a skipped Test phase still produces a `verify` artifact whose
    verification-matrix rows are `waived` (carrying the 6-field waiver), rather than special-casing
    the phase gate to accept a missing artifact. This preserves the invariant that every phase
    transition is backed by a durable, gate-checkable artifact, and keeps the waiver visible as
    residual risk per `rules.md`. Rejected alternative: a waiver-aware branch inside
    `check-lifecycle --phase ship` that skips the verify requirement — rejected because it makes the
    gate's contract conditional and invisible in the artifact chain, exactly the "chat-only waiver"
    failure mode the router forbids.
  - **Recurrence guard (R8):** pin setup-reference accuracy with a schema-driven source-level check
    rather than a one-time manual sweep, mirroring the `audit-validator-fixture-gaps` precedent
    ("don't leave a defect class only manually caught").
- constraints: zero-dep; edit-source-then-rebuild; five-adapter parity; provider-neutrality and
  safety constraints unviolated (constraint-conflict-scan: clean).
- tradeoffs: R6 (Q1 resolved) strengthens the validator to enforce log presence/completeness for
  phase-mandated triggers — closing the "omit the log, pass silently" hole — while deliberately not
  attempting to evaluate the `skill_scoring` predicate/score (no runtime can). This is a real
  strengthening on the mechanically-checkable boundary; the score-correctness boundary stays
  honor-system by necessity. Plan must not over-scope R6 into building a score evaluator.
- downstream: Plan should split into independent workstreams — (a) setup-reference sync R1–R3+R8,
  (b) waived-Test contract R4, (c) adapter parity R5, (d) enforcement/consistency R6–R7+RI3 — and
  sequence R8 first-or-with R1–R3 so the corrected docs are themselves checked. Build must rebuild
  bundles (RI1) after each source edit. Test must exercise the waived-Test path (R4 acceptance) and
  the seeded-wrong-field R8 case, and re-run the full existing suite (RI2).

## Exit Gate

- [x] Every active R and RI has acceptance criteria.
- [x] No blocking Q IDs; `orchestration.blockers` is empty (Q1 is non-blocking).
- [x] User directed scheduling these items as fixes ("invoke lifecycle and schedule above items as
      fixes"); `status` set to `ready-for-next-phase`, `next_phase: plan`.
- [x] Architecture notes capture the two contract decisions (waived-Test path, recurrence guard) and
      downstream workstream split.
- [x] `repo-alignment-scan`, `architecture-decision-advisor`, and `constraint-conflict-scan`
      triggers each evaluated and recorded in `skill_trigger_log`.
