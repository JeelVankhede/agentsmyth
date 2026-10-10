#!/usr/bin/env node
/**
 * Reports open/resolved/waived counts for workflow/config/pending-setup.yaml.
 * Exits 0 always — open items are tracked debt, not errors.
 * Exits 1 only on malformed entries (missing required fields, bad status value).
 */
import { COUNCIL_TIERS, dataPath, loadYaml, pathExists, resolveCouncilTier } from './lib.mjs';

// `--dir <path>` points the config read at a fixture tree instead of the repo's own
// workflow/config, the same flag check-config.mjs and check-assumptions.mjs already carry and that
// test/run-violation-tests.mjs invokes every validator with. This file was the one validator
// without it: it resolved a hardcoded `join(repoRoot, 'workflow/config/pending-setup.yaml')`, so no
// fixture could reach it and all eight of its rules were unreachable by the negative suite. It also
// derived the same path twice, once absolute and once repo-relative, which is one more way for the
// two to disagree.
const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const configDir = dirArgIdx !== -1 ? `${args[dirArgIdx + 1]}/config` : dataPath('config');
const pendingPath = `${configDir}/pending-setup.yaml`;

if (!pathExists(pendingPath)) {
  console.log('check-pending-setup: no pending-setup.yaml — all items resolved at setup time');
  reportBlockingTier();
  process.exit(0);
}

const errors = [];
const doc = loadYaml(pendingPath);

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

reportBlockingTier();

report();

function report() {
  if (errors.length > 0) {
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }
}

// The counts describe ITEMS. They cannot describe the one setting that blocks, because that setting
// can be unset with no item naming it — a 1.1.0 upgrade left a repo exactly there, and this
// validator read "0 open" while check-lifecycle refused every council phase. So the blocking setting
// is reported by its resolved VALUE, through the same resolver the gate uses. Advisory only: the exit
// code stays 0 and the gate stays the single place that blocks. Called on BOTH exit paths — a repo
// with no pending-setup.yaml at all is told "all items resolved", which is the most misleading
// version of the same message.
function reportBlockingTier() {
  const tierState = resolveCouncilTier(configDir);
  const phases = tierState.councilPhases.join(', ');
  if (tierState.state === 'unset' && phases) {
    console.log(
      `check-pending-setup: note — tuning.council.model_tier is unset while councils are enabled; `
      + `check-lifecycle refuses council phases (${phases}) until it is set (${COUNCIL_TIERS.join(' | ')}) `
      + 'or tuning.council.enabled is disabled',
    );
  } else if (tierState.state === 'invalid' && phases) {
    console.log(
      `check-pending-setup: note — tuning.council.model_tier is "${tierState.tier}", which is not one of `
      + `${COUNCIL_TIERS.join(' | ')}; check-lifecycle refuses council phases (${phases}) until it is corrected`,
    );
  }
}
