# Setup Guide

Use this guide when adopting `agentsmyth` in a target repository.

## 1. Install The Workflow Folder

Copy these repository-local paths into the target repository:

```text
AGENTS.md
.workflow/
docs/
adapters/
```

Keep `.workflow/` as the canonical workflow source. Tool-specific adapter files should point back to `.workflow/`; they should not redefine lifecycle behavior.

## 2. Fill Repository Config

Edit `.workflow/config/repo-profile.yaml`:

- Set `repository.default_branch`.
- Add protected paths and ownership rules.
- Add source, docs, and test roots when known.
- Add generated outputs with source and regeneration command when applicable.
- Leave `package_managers` empty unless the repository actually uses one.

Branch policy defaults are conservative: use a non-default branch, preserve unrelated changes, and stage only approved scope.

## 3. Fill Domain Config

Edit `.workflow/config/domain.yaml`:

- Set the domain name and summary.
- Add glossary terms only when they affect requirements or review.
- Add safety, compatibility, regulatory, or terminology constraints.
- Keep provider-specific rules out unless the user or repository requires them.

See `docs/domain-attachment-guide.md`.

## 4. Fill Source-Of-Truth Config

Edit `.workflow/config/source-of-truth.yaml`:

- Keep `mode: optional` unless external source updates are required.
- Add providers only when the repository has a real source authority.
- Define read and update expectations.
- Keep updates in Ship unless the plan explicitly assigns another phase.
- Require blocked handoff or waiver when an external update cannot be completed.

See `docs/source-of-truth-guide.md`.

## 5. Fill Verification Config

Edit `.workflow/config/verification.yaml`:

- Add exact commands under `commands`.
- Use stable command IDs.
- Set `required: true` only for checks that must block Ship.
- Use manual QA for repeatable checks that commands cannot prove.
- Configure generated-output checks when derived files exist.

Do not invent commands. If a command is unknown, the Plan should mark it unknown and block or use repeatable manual evidence.

## 6. Fill Release Config

Edit `.workflow/config/release.yaml`:

- Keep release gates disabled unless the repository actually ships through that gate.
- Enable PR, CI, release, deployment, package, docs, generated output, source, and rollback gates only when configured or requested.
- Define required evidence for each enabled gate.
- Keep rollback explicit whenever release, deployment, publishing, or external handoff is in scope.

## 7. Use The Agent Setup Interview

Before the first real lifecycle run, answer the questions in `docs/agent-setup-interview.md`. Use the answers to update config files. Unknown answers should remain visible as blockers, not hidden assumptions.

## 8. Run The Lifecycle

For Standard or Complex work:

1. Think writes a brief.
2. Plan maps requirements to phases and verification.
3. Build performs one approved phase at a time.
4. Review records durable findings and coverage.
5. Test writes verification evidence.
6. Ship records release, source, rollback, waiver, or handoff status.
7. Reflect records outcome and learning candidates.

For small read-only questions, a full artifact chain may be unnecessary. When in doubt, use the lifecycle.

## 9. Before Sharing A Change

Check that:

- Artifacts cite exact evidence.
- Skipped checks include risk, owner, and Ship impact.
- Waivers include explicit approval evidence.
- No external update or release is claimed without proof.
- Source, release, and verification gates are marked applicable, not applicable, blocked, or waived.
