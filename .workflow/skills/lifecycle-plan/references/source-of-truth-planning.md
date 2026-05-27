# Source-of-Truth Planning

Read `.workflow/config/source-of-truth.yaml` before planning source reads, updates, or handoff.

Plan one of these outcomes:

- no external source-of-truth update required
- source read only, with exact source link or configured location
- source update required during Ship
- blocked handoff because the agent lacks access or authority
- user-approved waiver

Required details when source handling is in scope:

- provider or source type
- source item or lookup method
- fields/sections to read
- fields/sections to update
- owning lifecycle phase
- whether Ship is blocked by the update
- exact blocked handoff instructions if the update cannot be performed

Do not make Notion, GitHub issues, Jira, Linear, or any other provider mandatory. Use configuration and the user's source-of-truth instructions.
