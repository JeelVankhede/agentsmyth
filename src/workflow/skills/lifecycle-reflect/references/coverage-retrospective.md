# Coverage Retrospective

Reflect must trace every active `R` and `RI` from brief to Ship.

Required fields:

- manifest ID
- shipped as scoped: yes, no, partial, waived, or deferred
- verified: yes, no, skipped, failed, or waived
- ship status: shipped, deferred, blocked, waived, or not applicable
- post-ship issues
- notes and evidence

Rules:

- Deferred and waived IDs must also appear in Follow-Ups or Deferred.
- Missing verification must be called out even when Ship accepted a waiver.
- Do not mark an ID shipped just because Build changed files.
- If an ID changed scope, cite the artifact version or decision that changed it.
