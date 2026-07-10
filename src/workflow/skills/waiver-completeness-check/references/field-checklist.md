# Field Checklist

The 6 fields required by `agent-behavior.yaml`'s `waivers.required_fields`. A waiver entry is
complete only when every field below is present and non-empty.

- **`waived_gate_or_requirement_id`** — the exact gate name or manifest ID (`R`/`RI`) being
  waived. Not a description — an ID or named gate that can be traced.
- **`reason`** — why the gate or requirement cannot be satisfied now. Not "not enough time" alone
  — state the concrete blocker.
- **`residual_risk`** — what could go wrong because this was waived. Empty or "none" is only
  acceptable when the waiver genuinely carries zero risk, which is rare; treat "none" claims with
  scrutiny.
- **`owner`** — a named person or configured decision owner accountable for the residual risk.
  Not "team" or "TBD."
- **`follow_up_action`** — the concrete next step that resolves the waived condition, or an
  explicit statement that no follow-up is planned (which itself should raise scrutiny).
- **`approval_evidence`** — proof the waiver was actually approved by one of
  `waivers.approvers` (`user` or `configured_decision_owner`) — a quote, a chat citation, or a
  recorded decision, not an assertion that approval "was implied."

A placeholder value (`TBD`, `N/A`, `-`, empty string) used to dodge a field counts as missing,
not present.
