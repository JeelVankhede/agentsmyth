# DB Query

## Principles

- **The query plan is ground truth, not the query's apparent simplicity.** A query that "looks
  fine" can still do a full table/collection scan if it's missing an index the planner needs —
  check the actual execution plan (`EXPLAIN` or equivalent) for any new or changed query on a
  table/collection with real data volume.
- **An index has a write cost, not just a read benefit.** Adding an index speeds up reads that use
  it but slows every write to that table/collection — weigh a new index against the actual query
  pattern, not add one reflexively for every new filter.
- **Query cost scales with data volume, not dev-database size.** A query that's instant against a
  thousand-row dev table can be seconds against a hundred-million-row production table — evaluate
  cost against realistic production-scale volume, not what's on the local machine.
- **Fetch only what's needed.** Selecting/projecting all columns/fields when only a few are used,
  or fetching a full result set when only existence/count is needed, wastes both database and
  network work for no benefit.

## Common Pitfalls

- A new query with no supporting index, silently fine at dev-data-volume, slow at production scale.
- `SELECT *` (or the NoSQL equivalent, fetching whole documents) when only specific fields are used downstream.
- Pagination implemented via offset on a large, frequently-mutated table, causing skipped/duplicated
  results under concurrent writes (see `data-schema-designer/references/relational-sql.md`'s
  pagination guidance).
- A query inside application-level loop logic instead of expressing the join/filter in the query
  itself — pulls more data than needed and pushes filtering work to application code.

## Checklist

- [ ] New or changed queries on tables/collections with real data volume were checked against their actual execution plan.
- [ ] New indexes are justified by an actual query pattern, weighed against their write-cost impact.
- [ ] Queries project only the fields/columns actually used downstream, not a blanket `SELECT *`.
- [ ] Filtering/joining logic is expressed in the query, not pulled into application-level loops.
