# Security Scan

## Principles

- **A clean scan result on unchanged files says nothing about this diff.** Confirm the scan
  actually covered the new/changed files and any new dependency introduced — a scan run against a
  cached or stale dependency graph can report clean while missing exactly what changed.
- **New dependencies are a security-relevant change even with no code changes of your own.** Adding
  a new third-party package expands the attack surface (its own dependencies, its maintenance
  status, its own vulnerability history) — this is in scope for adequacy review even when the diff
  itself has no obviously security-sensitive logic.
- **Severity triage needs a real decision, not a default "acceptable."** A scan flagging a
  medium/high finding needs an explicit disposition (fixed, false-positive with reasoning,
  accepted-risk with owner) — silently ignoring a flagged finding because the scan still "passed
  overall" is not adequate.
- **Secrets/credential scanning is a distinct check from dependency vulnerability scanning** — both
  matter, and a change touching config/env-handling code specifically needs the secrets-scan
  evidence checked, not just the dependency scan.

## What "Adequate" Means Here

- The scan's evidence explicitly covers this diff's changed files and any newly introduced
  dependency, not just an unrelated repo-wide baseline.
- Every medium-or-higher severity finding introduced or newly surfaced by this diff has an explicit
  disposition (fixed, false-positive with reasoning, or accepted-risk with a named owner) — not silence.
- If the diff touches config, environment-variable handling, or credential-adjacent code, secrets
  scanning evidence is present, not just dependency scanning.

## Checklist

- [ ] Scan evidence explicitly covers this diff's changed/new files and dependencies.
- [ ] Every new medium+ severity finding has an explicit disposition, not silence.
- [ ] Secrets/credential scanning evidence is present for config/env-handling changes specifically.
- [ ] New third-party dependencies are reviewed for maintenance status, not only automated scan output.
