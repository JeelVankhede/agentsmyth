#!/usr/bin/env node
// check-finding-quality. Validates the two-file finding-quality ledger.
//
// Models check-open-items.mjs: validate against the schema when present, exit 0 with an informative
// message when absent. A repo that has never run a Review council has no ledger, and that is a valid
// repo — a checker that failed on absence would make the feature mandatory by the back door.
//
// What is specific to this ledger is ROTATION. A row closes in the active file and moves to the
// archive in the same operation, so every row is present in exactly one of the two. Both failure
// directions are checked: a row in both files has been copied rather than moved, and a closed row
// sitting in the active file has not been rotated at all. Neither is visible from either file alone,
// which is why one validator reads both.
import { finish, listFiles, loadYaml, parseFrontmatter, pathExists, readText, schemaRegistry, validateSchema, wf } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;
const activePath = `${artifactsDir}/finding-quality.yaml`;
const archivePath = `${artifactsDir}/finding-quality-archive.yaml`;

const errors = [];
const details = [];

// Every council-mode review's findings, keyed by artifact. This is what makes the ledger's absence
// conditional rather than always-fine: a repo that has never run a Review council legitimately has
// no ledger, but one that HAS run one and recorded no outcomes has lost the record R5 exists to
// keep — and would otherwise pass by simply not creating the file, which is the omission escape
// this package has had to close twice already.
function councilReviewFindings() {
  const out = [];
  for (const file of listFiles(artifactsDir)) {
    if (!file.endsWith('.md') || file.split('/').slice(-2, -1)[0] !== 'reviews') continue;
    let parsed;
    try { parsed = parseFrontmatter(readText(file), file); } catch { continue; }
    if (parsed.frontmatter?.council?.mode !== 'council') continue;
    const log = parsed.body.match(/## Council Log\s*\n([\s\S]*?)(?=\n## [^#]|\s*$)/)?.[1] ?? '';
    const table = log.match(/### Findings\s*\n([\s\S]*?)(?=\n#{2,3} |\s*$)/)?.[1] ?? '';
    for (const line of table.split('\n')) {
      const id = line.trim().match(/^\|\s*(F\d+)\s*\|/)?.[1];
      if (id) out.push({ file, id });
    }
  }
  return out;
}

const councilFindings = councilReviewFindings();

if (!pathExists(activePath) && !pathExists(archivePath)) {
  if (councilFindings.length > 0) {
    const where = [...new Set(councilFindings.map((f) => f.file))].join(', ');
    errors.push(`no finding-quality ledger exists, but ${councilFindings.length} council finding(s) are recorded in ${where}; a council finding whose outcome is never recorded is the measurement R5 exists to produce, and omitting the file is not a way to have had no findings`);
    finish('check-finding-quality', errors, details);
  }
  console.log('check-finding-quality: no finding-quality ledger — no council findings recorded yet');
  process.exit(0);
}

const registry = schemaRegistry();
const schema = registry['finding-quality'];
if (!schema) {
  errors.push(`finding-quality schema ($id: finding-quality) not found in schema registry — cannot validate the ledger`);
  finish('check-finding-quality', errors, details);
}

// The archive is meaningless without the file it drains, and an active ledger whose archive has
// been deleted silently loses every closed row from the baseline. Both must exist together.
for (const [path, other] of [[activePath, archivePath], [archivePath, activePath]]) {
  if (pathExists(other) && !pathExists(path)) {
    errors.push(`${other} exists but ${path} does not; the ledger is two files and a figure computed from one of them is not a baseline`);
  }
}

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

const active = loadLedger(activePath, 'finding-quality');
const archive = loadLedger(archivePath, 'finding-quality-archive');

const CLOSED = new Set(['proved-real', 'waived', 'noise', 'unresolved-at-reflect']);

function indexRows(doc, label) {
  const byId = new Map();
  for (const item of doc?.items ?? []) {
    if (!item.id) continue;
    if (byId.has(item.id)) {
      errors.push(`${label}: duplicate row id ${item.id}`);
    }
    byId.set(item.id, item);
  }
  return byId;
}

// Rows are keyed by artifact AND finding id: finding_id is scoped to its source artifact, not
// globally unique, so two chains can each raise an F1 without colliding.
//
// The artifact half is normalised to its FILENAME rather than compared as a path string. A ledger
// records `workflow/artifacts/reviews/x-v1.md` because that is what the schema asks for, while the
// scan yields whatever `--dir` produced — so string equality matched only when the validator
// happened to be invoked from the repo root. The filename is the stable half: an artifact's name
// carries its slug and version, which is exactly the identity the key needs, and it keeps matching
// if the artifacts tree is ever relocated.
function artifactKey(pathOrName, findingId) {
  const base = String(pathOrName ?? '').split('/').pop();
  return `${base}::${findingId}`;
}

function all_ids(rows) {
  return [...rows.values()].map((row) => artifactKey(row.source_artifact, row.finding_id));
}

const activeRows = indexRows(active, activePath);
const archiveRows = indexRows(archive, archivePath);

// Rotation, direction 1: copied rather than moved. Keyed by the SAME identity the coverage check
// uses — artifact plus finding — not by ledger row id. Keying on FQ-N let a row copied to the
// archive under a fresh id escape the check whose whole job is to catch that, while being counted
// twice in a tally the schema says must span both files. One notion of identity per row.
const archiveKeys = new Set(all_ids(archiveRows));
for (const [id, row] of activeRows) {
  if (archiveKeys.has(artifactKey(row.source_artifact, row.finding_id))) {
    errors.push(`${activePath}: row ${id} names finding ${row.finding_id} of ${row.source_artifact}, which is already recorded in the archive; rotation is a move, so a finding lives in exactly one file — counted from both, it is double-counted in every figure, and a fresh row id does not make it a different finding`);
  }
}

// Rotation, direction 2: closed and never rotated. Left unchecked the active file grows without
// bound, which is the thing the two-file split exists to prevent.
for (const [id, row] of activeRows) {
  if (CLOSED.has(row.outcome)) {
    errors.push(`${activePath}: row ${id} has closed outcome "${row.outcome}" but is still in the active ledger; a row that closes moves to ${archivePath} in the same operation`);
  }
}

// The archive is closed rows only. A pending row there is unreachable: nothing scans the archive
// looking for work to finish, so it would sit unresolved forever while reading as accounted for.
for (const [id, row] of archiveRows) {
  if (!CLOSED.has(row.outcome)) {
    errors.push(`${archivePath}: row ${id} has outcome "${row.outcome}", which is not closed; the archive holds settled rows only, and a pending row here is one nothing will ever come back to`);
  }
}

// R5 — every council finding has a row, in one file or the other. Checked across both because a
// finding closed early in the chain has already rotated to the archive, and demanding it in the
// active file would punish exactly the run that behaved correctly.
const recorded = new Set([...all_ids(activeRows), ...all_ids(archiveRows)]);
for (const finding of councilFindings) {
  if (!recorded.has(artifactKey(finding.file, finding.id))) {
    errors.push(`${finding.file}: council finding ${finding.id} has no finding-quality row; every finding a council raises gets an outcome, or the council's value stays asserted rather than measured`);
  }
}

// The figure this ledger exists to produce, computed over BOTH files. Reported rather than
// enforced: the ratio is an input to a product decision about whether councils earn their cost, not
// a gate. A count drawn from the active file alone would report the current cycle and silently stop
// being a baseline, which is why the total spans both.
const all = [...activeRows.values(), ...archiveRows.values()];
const tally = { pending: 0, 'proved-real': 0, waived: 0, noise: 0, 'unresolved-at-reflect': 0 };
for (const row of all) {
  if (tally[row.outcome] !== undefined) tally[row.outcome]++;
}
const settled = tally['proved-real'] + tally.noise;
const signal = settled > 0 ? `${Math.round((tally['proved-real'] / settled) * 100)}% of settled findings proved real` : 'no settled findings yet';

details.push(
  `checked ${activePath} and ${archivePath} against schema $id "finding-quality" ` +
  `(${activeRows.size} active, ${archiveRows.size} archived)`
);
details.push(
  `finding quality across both files: ${tally['proved-real']} proved real, ${tally.noise} noise, ` +
  `${tally.waived} waived, ${tally['unresolved-at-reflect']} unresolved at reflect, ${tally.pending} pending — ${signal}`
);

finish('check-finding-quality', errors, details);
