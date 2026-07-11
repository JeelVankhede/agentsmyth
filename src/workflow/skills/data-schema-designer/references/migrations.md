# Migrations

## Principles

- **Every migration is either forward-only or has a real rollback — decide which and say so.** A
  destructive migration (dropped column, dropped table) usually cannot have a real rollback once
  applied and data has flowed through the new shape; state that explicitly rather than writing a
  rollback script that would silently lose data if actually run.
- **Migrations run against production-shaped data volume in mind, not dev-database volume.** A
  migration that's instant on a 100-row dev table can lock a 100-million-row production table for
  minutes — the safety analysis must consider the real table/collection size this will run against.
- **Schema change and data backfill are separate migrations when the table has live traffic.**
  Combining "add column" and "backfill every existing row" in one migration either locks for the
  full backfill duration or isn't atomic — split into (1) add nullable column, (2) backfill in
  batches, (3) add constraint, as separate deploys.
- **A migration is code, and code has a review bar.** The same scrutiny applied to application
  logic (does it handle partial failure? is it idempotent if re-run?) applies to a migration script.

## Common Pitfalls

- No idempotency check — a migration that fails partway through and gets re-run either double-applies changes or errors confusingly instead of resuming cleanly.
- Combining a schema change with a large data backfill in one transaction/migration on a live table.
- No tested rollback path for a genuinely reversible change (adding an index, adding a nullable
  column) — even reversible migrations should have their rollback actually exercised, not assumed
  to work.
- Migration order dependencies not made explicit — two migrations that must run in a specific order
  relative to each other need that dependency stated, not inferred from filenames/timestamps alone.

## Safety Classification

State one of these explicitly for every migration in scope:
- **none-needed** — no schema or data change, or change is to an empty/new table.
- **additive** — new column/table/index with no impact on existing reads/writes; safe to deploy
  ahead of application code that uses it.
- **destructive-with-mitigation** — data loss or lock risk exists, but is mitigated (backup taken,
  backfill batched, maintenance window scheduled, or the "risk" is against data confirmed unused).
- **destructive-unmitigated** — real data-loss or extended-lock risk with no mitigation in place;
  this must be raised as a `Q`, never silently shipped.

## Checklist

- [ ] Every migration's safety classification is stated explicitly (see above), not left implicit.
- [ ] Schema changes and large backfills on live tables are split into separate deploys.
- [ ] The migration is idempotent (or the deployment process guarantees exactly-once application).
- [ ] Rollback path is stated — either a real rollback exists and is tested, or the migration is explicitly documented as forward-only with the reason why.
- [ ] Migration-ordering dependencies are stated explicitly if any exist.
