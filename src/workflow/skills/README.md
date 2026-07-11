# Skills

Skills are phase playbooks. They define what an agent must load, decide, write, and report for a lifecycle phase.

## Lifecycle Skills

| Skill | Phase |
|---|---|
| `lifecycle-think` | Think |
| `lifecycle-plan` | Plan |
| `lifecycle-build` | Build |
| `lifecycle-review` | Review |
| `lifecycle-test` | Test |
| `lifecycle-ship` | Ship |
| `lifecycle-reflect` | Reflect |

## Power Skills

| Skill | Purpose |
|---|---|
| `decompose-requirements` | Create or backfill requirement manifest entries. |
| `restore-context` | Rebuild lifecycle state from artifacts, config, git, and source references. |
| `dispatch-subagents` | Define safe optional parallel workstreams. |
| `waiver-completeness-check` | Validate every claimed waiver carries all 6 required fields. |
| `coverage-tracer` | Trace every active R/RI into a covered/deferred/waived/dropped ledger. |
| `evidence-auditor` | Confirm every verified-fact claim cites a resolvable evidence source. |
| `scope-fence` | Assert Build's actual diff is a subset of the active plan phase's declared touches. |
| `verify-manifest-coverage` | Cross-check Review's declared manifest_ids against actual diff scope. |
| `skipped-check-accountant` | Force every skipped/unevidenced check into a risk entry with an owner. |
| `release-readiness-gate` | Aggregate verify/review/coverage/waiver state into one go/hold/blocked recommendation. |
| `requirement-phase-mapper` | Map every active R/RI to exactly one build phase with a binary exit gate. |
| `plan-assumption-verifier` | Cross-verify planning assumptions against repo evidence, raising blocking questions when unresolved. |
| `verification-matrix-builder` | Build the R/RI to method to evidence to status verification matrix. |
| `follow-up-owner-assigner` | Ensure every follow-up has an owner and persist it to the durable open-items ledger. |
| `repo-alignment-scan` | Explore the actual repo/stack and surface requirement misalignment before framing. |
| `architecture-decision-advisor` | Force a recorded whole-repo architecture call on high-complexity requirements. |
| `constraint-conflict-scan` | Cross-check the request against domain.yaml constraints and protected paths. |
| `interface-contract-designer` | Focused expert for interface/contract design across REST, GraphQL, gRPC, WebSocket, CLI, SDK routes. |
| `data-schema-designer` | Focused expert for data/schema design across relational, document, key-value, graph, migration, event-schema routes. |

## Rules

- Load the selected skill after `workflow/router.md`, `workflow/lifecycle.md`, `workflow/rules.md`, and relevant config.
- Load only the references needed for the current phase.
- Follow the skill output schema.
- Do not collapse reference files into `SKILL.md`; references are part of the contract.
