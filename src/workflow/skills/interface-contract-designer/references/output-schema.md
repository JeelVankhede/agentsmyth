# Output Schema

`interface-contract-designer` writes into the invoking phase's Architecture Notes (Plan/Build) or
review notes (Review) — it does not create a separate artifact.

Return shape:

```text
skill: interface-contract-designer
route_selected: rest | graphql | grpc | websocket | cli | sdk-library
recommendation:
  surface_shape: <endpoint/RPC/CLI signature described>
  versioning: <approach — e.g. URL-path version, header version, schema-evolution rules>
  compatibility_impact: none | additive | breaking
  rationale: <why>
raised_question: <Q id, only if a breaking change has no accepted mitigation>
skill_trigger_log_entry:
  skill: domain.interface-contract-designer
  signals: { matched_globs: <bool>, touches_contract: <bool> }
  decision: ran | skipped
  reason: <why>
```

Rules:

- `compatibility_impact: breaking` requires either a `raised_question` or an explicit,
  already-accepted migration note in the recommendation — never silent.
- `route_selected` must match a file signal actually present in the diff, not an assumption.
