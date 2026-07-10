# Ledger Format

`workflow/artifacts/open-items.yaml`'s exact shape, matching `open-items.schema.yaml`.

```yaml
version: 1
kind: open-items
items:
  - id: OI-1
    source: follow-up
    owner: user
    next_action: "Design + implement WP-R4 Wave 3"
    status: open
    first_seen_run: power-skills-wave2-v1
  - id: OI-2
    source: requirement
    owner: user
    next_action: "Add minLength: 1 to domain.schema.yaml's summary field"
    status: open
    first_seen_run: audit-validator-fixture-gaps-v1
    manifest_ids: []
```

Rules:

- `id` format is `OI-N`, sequential, never renumbered — same convention as `pending-setup.yaml`'s
  `PS-N`.
- `source: requirement` entries should carry `manifest_ids` naming the affected `R`/`RI`; `source:
  follow-up` entries may omit it.
- `first_seen_run` is the lifecycle chain's `slug-vN` whose Reflect phase created the entry — not
  the current run, if this entry is being carried forward from an earlier one.
- This file is append-only from this skill's perspective — status transitions (`open` → `done`,
  etc.) are a separate, future concern (not in Wave 2's scope) for whoever/whatever eventually
  closes an item.
