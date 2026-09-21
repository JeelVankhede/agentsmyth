#!/usr/bin/env node
// check-open-items. Validates the two-file open-items ledger.
//
// Models check-finding-quality.mjs, which solved the same problem first: validate against the schema
// when present, exit 0 with an informative message when absent, and read BOTH files in one validator
// because the interesting failures are invisible from either one alone. An item copied rather than
// moved, or closed and never rotated, cannot be seen from the file it is sitting in.
//
// ONE DELIBERATE DIVERGENCE from that precedent, and it is the whole upgrade story.
// check-finding-quality rejects a closed row left in its active file unconditionally; it shipped new,
// so no repo had legacy rows. This ledger predates rotation by many releases, and every consumer repo
// that has ever run Reflect has a live file full of `done` entries and no archive. So a `done` entry
// in the live ledger is an error ONLY once an archive file exists — the same "no file, exit 0"
// reasoning this validator already applied to the ledger as a whole, applied one level in. The gate
// becomes hard the moment a repo is actually on the new model, which is the first time its own
// Reflect sweeps. Do not "simplify" this into symmetry with check-finding-quality: that single
// conditional is what keeps upgrade a no-op, and a fixture exists specifically to fail if it is
// removed.
import { finish, loadYaml, pathExists, schemaRegistry, validateSchema, wf } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;
const livePath = `${artifactsDir}/open-items.yaml`;
const archivePath = `${artifactsDir}/open-items-archive.yaml`;

const errors = [];
const details = [];

if (!pathExists(livePath) && !pathExists(archivePath)) {
  console.log('check-open-items: no open-items.yaml — no follow-ups persisted yet');
  process.exit(0);
}

// Asymmetric on purpose. A live ledger with no archive is the un-swept repo — the normal state for
// every consumer that has not rotated yet, and legal. An archive with no live ledger is not a state
// any sequence of correct operations produces: rotation moves items OUT of a live file, so the file
// it drained cannot be the one that is missing. It means the live ledger was deleted, and with it
// every unresolved item the repo was still carrying.
if (pathExists(archivePath) && !pathExists(livePath)) {
  errors.push(
    `${archivePath} exists but ${livePath} does not; rotation moves items out of the live ledger, so ` +
    `an archive without one means the live ledger was lost — along with every item still open`
  );
}

const registry = schemaRegistry();
const schema = registry['open-items'];
if (!schema) {
  errors.push(`open-items schema ($id: open-items) not found in schema registry — cannot validate ${livePath}`);
  finish('check-open-items', errors, details);
}

// Both files are described by one schema, distinguished by `kind` — the shape
// finding-quality.schema.yaml established. schemaRegistry() keys by $id, so there is no second
// schema file to keep in sync and no registry entry to add.
function loadLedger(path, expectedKind) {
  if (!pathExists(path)) return null;
  const doc = loadYaml(path);
  if (!doc || doc.kind !== expectedKind) {
    errors.push(`${path}: missing or wrong kind field (expected "${expectedKind}")`);
    return null;
  }
  validateSchema(doc, schema, path, errors, registry, schema);
  return doc;
}

const live = loadLedger(livePath, 'open-items');
const archive = loadLedger(archivePath, 'open-items-archive');

function indexItems(doc, label) {
  const byId = new Map();
  for (const item of doc?.items ?? []) {
    if (!item.id) continue;
    if (byId.has(item.id)) errors.push(`${label}: duplicate item id ${item.id}`);
    byId.set(item.id, item);
  }
  return byId;
}

const liveItems = indexItems(live, livePath);
const archiveItems = indexItems(archive, archivePath);

// Uniqueness holds across the PAIR, not within each half. Splitting the ledger is what makes reuse
// likely rather than unlikely: the live file becomes the lean working file, so an author appending to
// it reaches for the next number it shows rather than the next number ever issued. Duplicate OI-N
// had already happened twice before there was a second file to hide one in.
//
// Two distinct diagnoses, because the reader's next action differs. Same `first_seen_run` on both
// sides means one item exists in two places — a copy where a move was intended, and the fix is to
// delete one. Different `first_seen_run` means two different items were given one id, and the fix is
// to renumber the newer one. The validator cannot be certain which it is, so each message says what
// it inferred and from what.
for (const [id, item] of liveItems) {
  const clash = archiveItems.get(id);
  if (!clash) continue;
  if (clash.first_seen_run === item.first_seen_run) {
    errors.push(
      `${livePath}: item ${id} is also recorded in ${archivePath} with the same first_seen_run ` +
      `"${item.first_seen_run}"; rotation is a move, so an item lives in exactly one file — present in ` +
      `both it is double-counted in any figure spanning them, and no reader can tell which copy is current`
    );
  } else {
    errors.push(
      `${livePath}: item ${id} is already used in ${archivePath} for a different item ` +
      `(first_seen_run "${clash.first_seen_run}" there, "${item.first_seen_run}" here); OI-N is never ` +
      `reused, and the live file being the lean working file is exactly why a fresh id gets taken twice`
    );
  }
}

// The archive holds settled items only. An unresolved item here is unreachable: nothing scans the
// archive looking for work to finish, so it would sit forever while reading as accounted for. This
// direction IS unconditional — no legacy archive exists anywhere, because the archive is new.
for (const [id, item] of archiveItems) {
  if (item.status !== 'done') {
    errors.push(
      `${archivePath}: item ${id} has status "${item.status}", which is not closed; the archive holds ` +
      `settled items only, and nothing reads it looking for work — an unresolved item here is one ` +
      `nobody will ever come back to`
    );
  }
}

// The conditional. See the header. Guarded on the archive FILE existing — deliberately not on it
// parsing. A malformed archive already fails the run on its own kind/schema error, but keying this
// rule on the parsed document meant the un-rotated items went unreported until that error was fixed,
// so a reader saw one problem, fixed it, and was handed a second. The rule as documented is "only
// when an archive file already exists", and this is the condition that says so.
if (pathExists(archivePath)) {
  for (const [id, item] of liveItems) {
    if (item.status === 'done') {
      errors.push(
        `${livePath}: item ${id} has status "done" but is still in the live ledger; a closed item moves ` +
        `to ${archivePath} in the same operation, and the live ledger is what every Reflect re-reads`
      );
    }
  }
}

function tally(items) {
  const counts = { open: 0, done: 0, blocked: 0, deferred: 0 };
  for (const item of items.values()) {
    if (counts[item.status] !== undefined) counts[item.status]++;
  }
  return counts;
}

const liveCounts = tally(liveItems);
details.push(
  `checked ${livePath} against schema $id "open-items" ` +
  `(${liveCounts.open} open, ${liveCounts.done} done, ${liveCounts.blocked} blocked, ${liveCounts.deferred} deferred)`
);

// Reported over both files, not just the live one. Every count this ledger can be asked for — how
// many follow-ups a repo has ever filed, whether the next OI-N is free — is a question about the
// pair. A figure taken from the lean live file describes the current cycle while still looking
// like a total.
//
// Guarded on the archive FILE existing, exactly as the rotation rule above is — and keyed on the
// parsed document it contradicted that rule to the reader's face. An archive present but failing
// its kind or schema check left `archive` null, so the same run printed "this repo has not rotated
// yet, so a done entry is not an error here" directly above an error saying the archive was there
// with the wrong kind, and a second saying the done entry WAS an error. Two of the three statements
// could not both be true, and the one that was wrong was the reassuring one.
//
// A file that failed to parse contributes no indexed items, so its branch reports the same
// `archiveItems.size` the healthy branch does — 0 — without claiming a schema check that did not
// happen. Saying "uncounted" is what makes that 0 readable as "not known" rather than "none".
if (pathExists(archivePath)) {
  details.push(archive
    ? `checked ${archivePath} against schema $id "open-items" (${archiveItems.size} archived) — ` +
      `${liveItems.size + archiveItems.size} item(s) across both files`
    : `read ${archivePath} but it did not parse as an archive (its own error is reported below), so its items are ` +
      `uncounted: ${archiveItems.size} archived, ${liveItems.size + archiveItems.size} item(s) across both files`);
} else {
  details.push(
    `no ${archivePath} — this repo has not rotated yet, so a "done" entry in the live ledger is not ` +
    `an error here; it becomes one once an archive exists`
  );
}

finish('check-open-items', errors, details);
