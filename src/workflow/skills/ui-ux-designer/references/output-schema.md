# Output Schema

`ui-ux-designer` writes into the invoking phase's Architecture Notes (Plan/Build) or review notes
(Review) — it does not create a separate artifact.

Return shape:

```text
skill: ui-ux-designer
routes_selected:
  - web | mobile-ios | mobile-android | cross-platform-mobile | desktop | tui
  - accessibility  # always included alongside a platform route
recommendation:
  interaction_states_covered: [default, loading, error, empty, disabled, ...]
  platform_convention_notes: <how this follows or deliberately deviates from platform norms>
  accessibility_notes: <keyboard path, screen-reader labeling, contrast, focus management>
  rationale: <why>
raised_question: <Q id, only if a state or accessibility gap is genuinely unaddressed>
skill_trigger_log_entry:
  skill: domain.ui-ux-designer
  signals: { matched_globs: <bool> }
  decision: ran | skipped
  reason: <why>
```

Rules:

- `accessibility_notes` is never empty when the recommendation covers an interactive element —
  "not applicable" is only valid for genuinely non-interactive, purely decorative changes.
- `interaction_states_covered` must include at minimum default + error for any element that can fail.
