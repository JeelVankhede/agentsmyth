#!/usr/bin/env node
// follow-up-owner-assigner's ledger. Models check-pending-setup.mjs directly:
// validates workflow/artifacts/open-items.yaml against its schema when present; exits 0 with an
// informative message when absent (open items are tracked debt, not a build error).
import { finish, loadYaml, pathExists, schemaRegistry, validateSchema, wf } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;
const ledgerPath = `${artifactsDir}/open-items.yaml`;

const errors = [];
const details = [];

if (!pathExists(ledgerPath)) {
  console.log('check-open-items: no open-items.yaml — no follow-ups persisted yet');
  process.exit(0);
}

const doc = loadYaml(ledgerPath);

if (!doc || doc.kind !== 'open-items') {
  errors.push(`${ledgerPath}: missing or wrong kind field (expected "open-items")`);
  finish('check-open-items', errors, details);
}

const registry = schemaRegistry();
const schema = registry['open-items'];
if (!schema) {
  errors.push(`open-items schema ($id: open-items) not found in schema registry — cannot validate ${ledgerPath}`);
  finish('check-open-items', errors, details);
}

validateSchema(doc, schema, ledgerPath, errors, registry, schema);

const seenIds = new Set();
let open = 0, done = 0, blocked = 0, deferred = 0;
for (const item of doc.items ?? []) {
  if (item.id) {
    if (seenIds.has(item.id)) errors.push(`${ledgerPath}: duplicate item id ${item.id}`);
    seenIds.add(item.id);
  }
  if (item.status === 'open') open++;
  if (item.status === 'done') done++;
  if (item.status === 'blocked') blocked++;
  if (item.status === 'deferred') deferred++;
}

details.push(`checked ${ledgerPath} against schema $id "open-items" (${open} open, ${done} done, ${blocked} blocked, ${deferred} deferred)`);

finish('check-open-items', errors, details);
