# Aggregation Rules

How the four inputs combine into one recommendation. This is a hard AND, not a weighted score —
release readiness is not "mostly ready."

| Input | Pass condition | Fail behavior |
|---|---|---|
| Verify sign-off | `ship`, or `hold`/`hold-with-waiver` with a valid waiver | No unwaived `hold` |
| Review open findings | No open P0/P1, or each open P0/P1 has a valid waiver | Any unwaived P0/P1 blocks |
| Coverage ledger | No gaps; no unwaived `dropped` rows | Any gap or unwaived drop blocks |
| Waivers (cross-cutting) | Every waiver consumed above passes `waiver-completeness-check` | An incomplete waiver does not count as clearing its input |

**Recommendation logic:**

- All four inputs pass cleanly (no waivers needed) → `go`.
- One or more inputs pass only because of a valid waiver → `hold-with-waiver` (ship proceeds, but
  the waiver's residual risk is visible, not hidden as a clean `go`).
- One or more inputs fail with no valid waiver → `hold` (or `blocked` if the failure is severe
  enough that even a waiver conversation hasn't happened yet).

P2/P3 review findings do not block `go` on their own — they are tracked, not gating, unless a
specific P2/P3 is explicitly escalated by the user or Review itself.
