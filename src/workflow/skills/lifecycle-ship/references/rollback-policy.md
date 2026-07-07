# Rollback Policy

Every Ship artifact must record rollback readiness when release, deployment, publish, or external handoff is in scope.

Required rollback fields:

- area
- risk
- rollback trigger
- rollback action
- owner
- evidence or command when configured
- limits of rollback

Examples of rollback actions:

- revert commit or PR
- restore previous config
- unpublish or deprecate release when supported
- roll forward with a patch
- update source-of-truth handoff with corrected status

Rules:

- Do not invent rollback commands.
- If rollback is not applicable, explain why.
- If rollback requires human or external access, record blocked handoff and owner.
- A missing rollback plan for a configured release gate should produce `hold` or waiver.
