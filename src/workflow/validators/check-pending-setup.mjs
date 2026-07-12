#!/usr/bin/env node
/**
 * Reports open/resolved/waived counts for workflow/config/pending-setup.yaml.
 * Exits 0 always — open items are tracked debt, not errors.
 * Exits 1 only on malformed entries (missing required fields, bad status value).
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadYaml, repoRoot } from './lib.mjs';

const pendingPath = join(repoRoot, 'workflow/config/pending-setup.yaml');

if (!existsSync(pendingPath)) {
  console.log('check-pending-setup: no pending-setup.yaml — all items resolved at setup time');
  process.exit(0);
}

const errors = [];
const doc = loadYaml('workflow/config/pending-setup.yaml');

if (!doc || doc.kind !== 'pending-setup') {
  errors.push('pending-setup.yaml: missing or wrong kind field');
}

if (!Array.isArray(doc?.items)) {
  errors.push('pending-setup.yaml: items must be an array');
  report();
  process.exit(errors.length > 0 ? 1 : 0);
}

let open = 0, resolved = 0, waived = 0;

for (const item of doc.items) {
  if (!item.id)       errors.push(`item missing id`);
  if (!item.config)   errors.push(`${item.id ?? '?'}: missing config`);
  if (!item.field)    errors.push(`${item.id ?? '?'}: missing field`);
  if (!item.question) errors.push(`${item.id ?? '?'}: missing question`);

  const validStatuses = ['open', 'resolved', 'waived'];
  if (!validStatuses.includes(item.status)) {
    errors.push(`${item.id ?? '?'}: invalid status "${item.status}"`);
  }

  if (item.status === 'resolved' && !item.resolved_by) {
    errors.push(`${item.id}: status is resolved but resolved_by is not set`);
  }

  if (item.status === 'open')     open++;
  if (item.status === 'resolved') resolved++;
  if (item.status === 'waived')   waived++;
}

if (open > 0) {
  process.stderr.write(`  ⚠  ${open} pending setup item(s) still open — router will attempt resolution at next session start\n`);
}

console.log(`check-pending-setup: ${open} open, ${resolved} resolved, ${waived} waived`);

report();

function report() {
  if (errors.length > 0) {
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }
}
