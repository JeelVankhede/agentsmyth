# Waiver Policy

A waiver is explicit user acceptance of a known risk.

Required waiver fields:

- waived gate or requirement ID
- reason
- residual risk
- owner
- follow-up action
- expiry or revisit condition when applicable
- exact user approval evidence

Rules:

- Only the user or configured decision owner can approve a waiver.
- A waiver cannot be inferred from silence.
- `hold-with-waiver` is valid only when all required waiver fields are present.
- Waived requirements still appear in Requirement Coverage.
- Waivers move the lifecycle to Reflect but must remain visible as residual risk.

No waiver can justify invented evidence or false claims about external state.
