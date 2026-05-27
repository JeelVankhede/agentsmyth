# Blocker Reader

Collect blockers from all evidence sources.

Sources:

- `orchestration.blockers`
- open `Q` IDs
- failed phase exit gates
- Review `P0`/`P1` findings
- Test failed/skipped checks that block Ship
- Ship `hold` recommendation
- blocked handoff entries
- dirty git state overlapping scope
- missing required artifact or upstream link
- unresolved user checkpoint

For each blocker, record:

- ID or label
- source artifact/path
- owner
- blocked phase
- exact action needed
- waiver status

If the user's latest answer resolves a blocker, report that it appears resolved but do not mutate files in restore-context.
