#!/usr/bin/env node
// check-council-record. Validates the RECORD a council run leaves behind — not the council.
//
// The name is deliberate. This validator can prove the loop ran, that findings were attributed and
// dispositioned, that citations meet their class's contract, that rounds tapered coherently, and
// that the run terminated for a stated reason. It cannot prove a finding was correct, that the
// council found what a human would have found, that a rejection reason was a good one, or that a
// `web` quote was genuinely present at the URL it names. See README.md for the full non-claims list.
//
// A green result here means the record is well-formed and internally consistent. It does not mean
// the thinking was good.
import { homedir } from 'node:os';
import { dataPath, defsPath, finish, listFiles, loadYaml, parseFrontmatter, pathExists, readText, repoRoot, wf } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

// Resolve council config global-then-repo-local, the same two-root shape as definitions_root.
// Without this the max_rounds bound and the sandbox fence are prose, and prose is exactly what an
// agent drifts from — which is the failure this whole feature exists to prevent.
function resolveCouncilConfig() {
  // No default_fan_out here: fan-out is per phase now (council.per_phase.<phase>), and a
  // phase-agnostic fallback in this file would show a reader a contract the package no longer has.
  // Nothing in this validator reads fan-out — the cap is checked against the artifact's own
  // cap_resolved — so the key was dead as well as stale.
  const defaults = { max_rounds: 4, sandbox_root: '~/.agentsmyth/sandbox' };
  let global = {};
  let repo = {};
  try { global = loadYaml(defsPath('agent-behavior.yaml'))?.council ?? {}; } catch { /* absent is fine */ }
  // When --dir scopes artifact discovery, config must be scoped with it. Otherwise a fixture run
  // silently resolves against the HOST repo's profile: the same fixture passes or fails depending
  // on which machine runs it, which is the opposite of what a fixture is for. A fixture directory
  // that declares no config simply keeps the defaults.
  const repoProfile = dirArgIdx !== -1
    ? `${artifactsDir}/config/repo-profile.yaml`
    : dataPath('config/repo-profile.yaml');
  try { repo = loadYaml(repoProfile)?.tuning?.council ?? {}; } catch { /* absent is fine */ }
  return { ...defaults, ...global, ...repo };
}
const councilConfig = resolveCouncilConfig();
// Indirection so the fence helpers above can read the resolved config without a forward reference.
const councilConfigRef = { value: councilConfig };

// Tilde expansion shared by both fences. HOME being unset must not silently change either fence's
// verdict with the environment, so expansion falls back to homedir(), which reads the OS user
// database. The earlier behaviour — leave "~" literal and let it fail the absolute-path test —
// is gone: it rejected a valid sandbox path whenever $HOME was absent. A "~" survives unexpanded
// only when both sources are empty, which no supported platform produces.
function expandHome(p) {
  const home = process.env.HOME || homedir();
  return home ? p.replace(/^~(?=\/|$)/, home) : p;
}

// A sandbox path is inside the repo when it is relative, or absolute-and-under the repo root.
// Resolved via lib.mjs's repoRoot — NOT process.cwd(), which is the invocation directory and
// differs from the repo root whenever a validator runs from a package subdirectory of a monorepo
// (a supported repository shape).
function isOutsideRepo(p) {
  if (!p) return false;
  const norm = expandHome(p);
  return norm.startsWith('/') && !norm.startsWith(repoRoot.replace(/\/$/, '') + '/');
}

// R11's actual requirement: the declared path must lie under the RESOLVED sandbox_root, not merely
// somewhere outside the repo. Review P1-1 — the resolved value was loaded and never compared
// against, so "outside the repo" was standing in for a fence it does not enforce. Both checks are
// kept: a sandbox_root misconfigured to a path inside the repo must fail both.
function isUnderSandboxRoot(p) {
  if (!p) return false;
  const root = expandHome(String(councilConfigRef.value.sandbox_root ?? '')).replace(/\/$/, '');
  if (!root) return false;
  const norm = expandHome(p).replace(/\/$/, '');
  return norm === root || norm.startsWith(root + '/');
}

const errors = [];
const details = [];

const EVIDENCE_CLASSES = ['repo', 'trial', 'web', 'recall'];
const DISPOSITIONS = ['accepted', 'merged', 'rejected-with-reason'];
// Two reasons, not four. `max-rounds` and `no-progress` were enum values no valid record could
// carry: both imply unfinished business, the survivor declaration was mandatory for both, and any
// declared survivor forced the run to terminate `user-decision-required` instead — so the only
// record that passed under either was one declaring no survivors, which contradicts what the two
// words mean. A run that hits the bound either closed everything (`resolved`) or did not
// (`user-decision-required`); the bound is recorded by `rounds_run` against `max_rounds`, not by a
// termination reason that cannot be used.
const TERMINATIONS = ['resolved', 'user-decision-required'];

// Running totals for the summary line. A bare pass invites skipping; a number that varies invites
// reading, and the ratios below are how a reader sees how much of a brief rests on classes this
// validator cannot verify.
const totals = { briefs: 0, reviews: 0, rounds: 0, findings: 0, rejections: 0, recallUnconfirmed: 0, resolved: 0, shapeOnly: 0 };

function namedSection(body, name) {
  const re = new RegExp(`## ${name}\\s*\\n([\\s\\S]*?)(?=\\n## [^#]|\\s*$)`);
  return body.match(re)?.[1] ?? null;
}

function subSection(sectionText, name) {
  const re = new RegExp(`### ${name}\\s*\\n([\\s\\S]*?)(?=\\n#{2,3} |\\s*$)`);
  return sectionText?.match(re)?.[1] ?? null;
}

function tableRows(text) {
  if (!text) return [];
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('|'));
  if (lines.length < 2) return [];
  return lines
    .slice(1)
    .filter((l) => !/^\|[\s\-:|]+\|$/.test(l))
    .map((l) => l.slice(1, -1).split('|').map((c) => c.trim()))
    .filter((cells) => cells.some((c) => c.length > 0));
}

// Rows keyed by HEADER NAME rather than by position. The Think and Review records share this
// validator but not a column layout: a review's Findings table carries a Risk category column and
// its Members table carries Input and Status, so every fixed index after an insertion point would
// read the wrong cell — and do it silently, which is worse than failing. Header keys make adding a
// column a non-event instead of a cross-record corruption.
function tableObjects(text) {
  if (!text) return [];
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('|'));
  if (lines.length < 2) return [];
  const headers = lines[0].slice(1, -1).split('|').map((c) => c.trim().toLowerCase());
  return tableRows(text).map((cells) => {
    const row = {};
    headers.forEach((h, i) => { if (h) row[h] = cells[i] ?? ''; });
    return row;
  });
}

// The declared COLUMN NAMES of a section's table, lowercased. Reading the header line is the only
// way to ask "does this table declare column X": a scan for the word anywhere in the section is
// answered by any row whose prose happens to use it, and `tableObjects(...)[0]` is a data row, so an
// empty-but-declared table answers `undefined`. Both mistakes shipped in this file — a Round-column
// requirement satisfied by a rationale reading "in the first round", and a Fix-column ban that
// passed the one record it most needed to reject. Line selection mirrors tableObjects exactly, so
// the two never disagree about which line is the header.
function headerCells(sectionText) {
  if (!sectionText) return [];
  const line = sectionText.split('\n').map((l) => l.trim()).find((l) => l.startsWith('|'));
  return line ? line.slice(1, -1).split('|').map((c) => c.trim().toLowerCase()) : [];
}

// First header present wins, so one reader serves both records where they name the same concept
// differently — Think dispatches "researchers", Review dispatches "reviewers".
function col(row, ...names) {
  for (const name of names) {
    if (row[name] !== undefined) return row[name];
  }
  return '';
}

function intOf(raw) {
  const m = String(raw ?? '').match(/-?\d+/);
  return m ? Number(m[0]) : null;
}

function idsOf(raw) {
  return String(raw ?? '').split(/[,\s]+/).map((s) => s.trim()).filter((s) => /^[A-Za-z]+\d+$/.test(s));
}

// --- per-class citation contract -------------------------------------------------------------
// Enforced at the strongest level each class permits. `repo` resolves against the filesystem;
// `trial` and `web` are shape-checked; `recall` carries no citation by definition.
function checkCitation(file, id, cls, citation) {
  if (cls === 'repo') {
    // A citation is prose that CONTAINS a path, not a path with decoration. Matching the first
    // word-like token made `see \`src/x.mjs\` line 40` resolve to "see" and fail; every fixture
    // happened to open with the path, so nothing caught it. Collect every candidate token and
    // accept if any one resolves — backticked spans first, since a citation that bothers to
    // backtick its path is naming it deliberately.
    //
    // A bare path with no extension is still a path: "names no file path" was untrue for
    // `src/workflow/skills` and sent a reader looking for the wrong problem.
    const backticked = [...citation.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    const bare = [...citation.matchAll(/(?:^|\s)((?:[\w.-]+\/)+[\w.-]+)/g)].map((m) => m[1]);
    const candidates = [...backticked, ...bare].filter((c) => !/\s/.test(c));
    if (candidates.length === 0) {
      errors.push(`${file} finding ${id} is evidence_class repo but its citation names no file path`);
      return;
    }
    const cited = candidates.find((c) => pathExists(c));
    if (!cited) {
      errors.push(`${file} finding ${id} cites repo path "${candidates[0]}" which does not exist`);
      return;
    }
    const range = citation.match(/[:L](\d+)\s*[-–]\s*(\d+)/);
    if (range) {
      // readText throws on a directory. A citation naming one must produce a validator error,
      // never a stack trace — a crash reads as a broken validator rather than a bad citation.
      let lineCount;
      try {
        lineCount = readText(cited).split('\n').length;
      } catch {
        errors.push(`${file} finding ${id} cites "${cited}" with a line range, but it is not a readable file`);
        return;
      }
      if (Number(range[2]) > lineCount) {
        errors.push(`${file} finding ${id} cites ${cited} lines ${range[1]}-${range[2]} but the file has ${lineCount} lines`);
        return;
      }
    }
    totals.resolved++;
  } else if (cls === 'trial') {
    if (!/`[^`]+`/.test(citation) || !/→|->|output|result/i.test(citation)) {
      errors.push(`${file} finding ${id} is evidence_class trial but its citation lacks a command and observed output`);
      return;
    }
    totals.shapeOnly++;
  } else if (cls === 'web') {
    const hasUrl = /https?:\/\/\S+/.test(citation);
    const hasDate = /\d{4}-\d{2}-\d{2}/.test(citation);
    const hasQuote = /["“][^"”]{8,}["”]/.test(citation);
    if (!hasUrl || !hasDate || !hasQuote) {
      const missing = [!hasUrl && 'URL', !hasDate && 'retrieval date', !hasQuote && 'verbatim quote'].filter(Boolean);
      errors.push(`${file} finding ${id} is evidence_class web but its citation is missing: ${missing.join(', ')}`);
      return;
    }
    totals.shapeOnly++;
  }
}

const artifactFiles = listFiles(artifactsDir).filter(
  (f) => f.endsWith('.md') && !f.endsWith('/README.md')
);

for (const file of artifactFiles) {
  // Briefs AND reviews. The Think council writes into a brief's council log, the Review council into
  // a review's, and both are the same record against the same contract — which is why one validator
  // serves them rather than two that drift. Anything else in artifacts/ has no council log and is
  // skipped.
  const artifactDir = file.split('/').slice(-2, -1)[0];
  if (artifactDir !== 'briefs' && artifactDir !== 'reviews') continue;

  let parsed;
  try {
    parsed = parseFrontmatter(readText(file), file);
  } catch {
    continue;
  }

  const council = parsed.frontmatter.council;
  const logSection = namedSection(parsed.body, 'Council Log');

  // Presence symmetry. A Council Log without a council block, or council mode without its log,
  // means the record disagrees with itself.
  if (!council) {
    if (logSection && /\S/.test(logSection.replace(/<!--[\s\S]*?-->/g, ''))) {
      errors.push(`${file} has a "## Council Log" section but no council: block in frontmatter`);
    }
    continue;
  }

  // Counted by artifact type. Reporting a review as a "brief" was the smaller half of F2; the
  // larger half is that a reader cannot tell which councils actually ran from a single number.
  const isReviewRecord = artifactDir === 'reviews';
  if (isReviewRecord) totals.reviews++; else totals.briefs++;
  const mode = council.mode;

  // --- R-1: re-derive the firing decision from its recorded inputs ------------------------
  // R1 and R7 are agent behaviour, so without the inputs a validator can only confirm what mode
  // was written down — never whether that mode was the correct consequence of the config. With
  // them, the decision becomes reproducible: the same three values must always yield the same
  // mode, and disagreement is a defect rather than a matter of opinion.
  const res = council.resolution;
  if (!res && mode === 'council') {
    // The schema keeps this optional so briefs written before the field existed still validate.
    // The validator does not: a council-mode record without it means the firing decision cannot be
    // re-derived, and skipping the check on absence would make deleting six lines a way to disable
    // it — the same one-keystroke escape the survivor-line rule already had to close.
    errors.push(`${file} declares council mode but records no council.resolution; without the resolved dispatch_enabled, council_enabled and task_class the firing decision cannot be re-derived, only asserted`);
  }
  if (res) {
    let expectedMode = 'council';
    let expectedReason = null;
    if (res.dispatch_enabled === 'disabled') {
      expectedMode = 'refused';
      expectedReason = 'dispatch-disabled';
    } else if (res.council_enabled === 'disabled') {
      expectedMode = 'refused';
      expectedReason = 'council-disabled';
    } else if (res.task_class !== 'complex') {
      expectedMode = 'refused';
      expectedReason = 'not-complex';
    }

    if (mode !== expectedMode) {
      errors.push(`${file} council.mode is "${mode}" but its recorded resolution inputs (dispatch_enabled: ${res.dispatch_enabled}, council_enabled: ${res.council_enabled}, task_class: ${res.task_class}) require "${expectedMode}"`);
    } else if (expectedReason && council.refusal_reason && council.refusal_reason !== expectedReason) {
      errors.push(`${file} council.refusal_reason is "${council.refusal_reason}" but the recorded resolution inputs require "${expectedReason}" — the kill switch is checked before council.enabled, which is checked before task class`);
    }
  }

  if (mode === 'refused') {
    if (!council.refusal_reason) {
      errors.push(`${file} records council mode "refused" without a refusal_reason — silence cannot distinguish "not applicable" from "failed to fire"`);
    }
    details.push(`checked ${file} (council refused: ${council.refusal_reason ?? 'unstated'})`);
    continue;
  }

  if (mode !== 'council') {
    details.push(`checked ${file} (council mode: ${mode})`);
    continue;
  }

  // --- council mode: summary fields must be complete --------------------------------------
  for (const key of ['authorization', 'cap_resolved', 'cap_source', 'dispatch_depth', 'rounds_run', 'termination_reason']) {
    if (council[key] === undefined || council[key] === null || council[key] === '') {
      errors.push(`${file} council mode requires frontmatter council.${key}`);
    }
  }

  if (council.dispatch_depth !== undefined && Number(council.dispatch_depth) !== 1) {
    errors.push(`${file} council.dispatch_depth is ${council.dispatch_depth}; council members must not dispatch, so depth is always 1`);
  }

  if (council.termination_reason && !TERMINATIONS.includes(council.termination_reason)) {
    errors.push(`${file} council.termination_reason "${council.termination_reason}" is not one of ${TERMINATIONS.join(', ')}`);
  }

  if (!logSection) {
    errors.push(`${file} declares council mode "council" but has no "## Council Log" section`);
    continue;
  }

  // --- rounds: non-increasing fan-out, coherent taper -------------------------------------
  const rounds = tableObjects(subSection(logSection, 'Rounds')).map((r) => ({
    round: intOf(col(r, 'round')),
    researchers: intOf(col(r, 'researchers', 'reviewers')),
    challengers: intOf(col(r, 'challengers')),
    openIn: intOf(col(r, 'open in')),
    openOut: intOf(col(r, 'open out')),
    closed: idsOf(col(r, 'items closed')),
    rationale: col(r, 'sizing rationale').trim(),
  }));

  if (rounds.length === 0) {
    errors.push(`${file} council log has no rounds recorded`);
  }
  totals.rounds += rounds.length;

  if (council.rounds_run !== undefined && rounds.length !== Number(council.rounds_run)) {
    errors.push(`${file} council.rounds_run is ${council.rounds_run} but the Rounds table has ${rounds.length} row(s)`);
  }

  // R13 — the backstop bound, resolved from config rather than assumed.
  const maxRounds = Number(councilConfig.max_rounds);
  if (Number.isFinite(maxRounds) && rounds.length > maxRounds) {
    errors.push(`${file} ran ${rounds.length} round(s) against a resolved council.max_rounds of ${maxRounds}`);
  }

  // R9 — requirement classification. Deciding what kind of evidence would settle a requirement,
  // before going to look, is what stops research becoming an undirected read of whatever is nearby.
  const classifiedById = new Map();
  const classRows = tableRows(subSection(logSection, 'Requirement Classification'));
  if (classRows.length === 0) {
    errors.push(`${file} council log has no "### Requirement Classification" subsection; every active R/RI must be classified with the evidence class that would settle it`);
  } else {
    const classified = new Map(classRows.map((c) => [c[0], (c[2] ?? '').toLowerCase()]));
    for (const [id, classes] of classified) classifiedById.set(id, classes);
    for (const id of parsed.frontmatter.manifest_ids ?? []) {
      if (!classified.has(id)) {
        errors.push(`${file} manifest ID ${id} has no Requirement Classification entry`);
        continue;
      }
      const named = EVIDENCE_CLASSES.filter((c) => classified.get(id).includes(c));
      if (named.length === 0) {
        errors.push(`${file} Requirement Classification for ${id} names no evidence class (expected one or more of ${EVIDENCE_CLASSES.join(', ')})`);
      }
    }
  }

  // R2 / R11 — member capability and the sandbox fence.
  const members = tableObjects(subSection(logSection, 'Members')).map((m) => ({
    id: col(m, 'member'),
    role: col(m, 'role').toLowerCase(),
    round: intOf(col(m, 'round')),
    capabilities: col(m, 'capabilities').toLowerCase(),
    input: col(m, 'input').toLowerCase(),
    status: col(m, 'status').toLowerCase(),
    sandbox: col(m, 'sandbox').trim(),
  }));

  if (members.length === 0) {
    errors.push(`${file} council log has no "### Members" subsection; findings cannot be attributed to members that are never declared`);
  }

  const OUTWARD = /\b(write|post|comment|create-issue|publish|mutate|send)\b/;
  const sandboxByRound = new Map();
  for (const m of members) {
    // The carve-out fires unprompted, so an unprompted agent acting in the user's name is fenced
    // separately from the repo fence. Explicit authorization lifts only the outward axis.
    if (council.authorization === 'carve-out' && OUTWARD.test(m.capabilities)) {
      errors.push(`${file} member ${m.id} was fired under authorization "carve-out" but declares outward-action capability "${m.capabilities}"; carve-out members get read, fetch, and search only`);
    }
    if (m.sandbox) {
      if (!isOutsideRepo(m.sandbox)) {
        errors.push(`${file} member ${m.id} declares sandbox "${m.sandbox}" which does not resolve outside the repository; the no-repo-mutation guarantee is structural, not advisory`);
      } else if (!isUnderSandboxRoot(m.sandbox)) {
        errors.push(`${file} member ${m.id} declares sandbox "${m.sandbox}" which is outside the repo but not under the resolved council.sandbox_root "${councilConfig.sandbox_root}"; confinement is to the configured root, not merely to "somewhere else"`);
      }
      const key = `${m.round}::${m.sandbox}`;
      if (sandboxByRound.has(key)) {
        errors.push(`${file} members ${sandboxByRound.get(key)} and ${m.id} share sandbox path "${m.sandbox}" in round ${m.round}; RI1 relaxes read overlap, never write overlap`);
      }
      sandboxByRound.set(key, m.id);
    }
  }

  const cap = Number(council.cap_resolved);
  for (const r of rounds) {
    // Stages are capped independently — researchers run, then challengers review their output —
    // so the cap governs peak concurrency within a stage, never the round total.
    if (Number.isFinite(cap)) {
      if (r.researchers > cap) errors.push(`${file} round ${r.round} dispatched ${r.researchers} researchers against a resolved cap of ${cap}`);
      if (r.challengers > cap) errors.push(`${file} round ${r.round} dispatched ${r.challengers} challengers against a resolved cap of ${cap}`);
    }
    if (r.round > 1 && !r.rationale) {
      errors.push(`${file} round ${r.round} has no recorded sizing rationale — every round after the first must state what remained open and why this size`);
    }
  }

  for (let i = 1; i < rounds.length; i++) {
    const prev = rounds[i - 1];
    const cur = rounds[i];
    const prevTotal = (prev.researchers ?? 0) + (prev.challengers ?? 0);
    const curTotal = (cur.researchers ?? 0) + (cur.challengers ?? 0);
    if (curTotal > prevTotal) {
      errors.push(`${file} round ${cur.round} fan-out (${curTotal}) exceeds round ${prev.round} (${prevTotal}); fan-out is non-increasing — needing more capacity is an escalation, not a dispatch decision`);
    }
    if (curTotal < prevTotal && prev.closed.length === 0) {
      errors.push(`${file} round ${cur.round} reduced fan-out after round ${prev.round} closed no items; shrinking the council asserts convergence, and the Items closed column has to corroborate it`);
    }
  }

  // --- survivors escalate rather than expiring --------------------------------------------
  // Review P1-2 made the survivor declaration mandatory rather than free-text-optional. The second
  // external review showed the rule as written could only ever be satisfied vacuously, because it
  // hung off two termination reasons that are now gone (see TERMINATIONS). It hangs off the two
  // that remain instead, and both directions are reachable:
  //   - `user-decision-required` must say WHAT it escalates — silence is not "nothing survived".
  //   - `resolved` must have closed everything it declared — a survivor contradicts the word.
  // No entered-every-round inference is attempted. The Rounds table carries open counts, not open
  // IDs, so "entered every round" is not derivable from it; declaring an item as surviving is the
  // author's own claim that it did, and the check tests that claim against the closed-ID cells.
  const terminationText = subSection(logSection, 'Termination') ?? '';
  const survivorLine = terminationText.match(/Surviving items[^:]*:\s*(.*)/i)?.[1];

  const declaredSurvivorIds = idsOf(survivorLine ?? '');

  if (council.termination_reason === 'user-decision-required') {
    if (survivorLine === undefined || !survivorLine.trim()) {
      errors.push(`${file} terminated "user-decision-required" without declaring its surviving items; an escalation must state what is being escalated, and omitting the line is not a way to have left nothing`);
    } else if (declaredSurvivorIds.length === 0) {
      // "none" is a non-empty line that names nothing, which satisfied the presence test while
      // saying exactly what the presence test exists to prevent. An escalation with no item to
      // escalate is not an escalation — a run that closed everything terminates "resolved".
      errors.push(`${file} terminated "user-decision-required" but its surviving-items line names no item ID ("${survivorLine.trim()}"); an escalation must name what the user is being asked about, and a run with nothing left open terminates "resolved" instead`);
    }
  }

  const closedEver = new Set(rounds.flatMap((r) => r.closed));
  const survivors = declaredSurvivorIds.filter((id) => !closedEver.has(id));
  if (council.termination_reason === 'resolved') {
    if (survivors.length > 0) {
      errors.push(`${file} terminated "resolved" while ${survivors.join(', ')} appear as surviving items closed in no round; a survivor is evidence the council could not resolve it, so the run must terminate "user-decision-required"`);
    } else {
      // The survivor comparison can only test IDs the author volunteered, so declaring none leaves
      // nothing to compare and "resolved" becomes the cheapest way to record an unfinished run.
      // The final round's own `Open out` is the number the author already wrote down: resolved
      // means nothing was left open, and the table has to agree.
      const finalOut = rounds.length > 0 ? rounds[rounds.length - 1].openOut : null;
      if (finalOut !== 0) {
        errors.push(`${file} terminated "resolved" but round ${rounds[rounds.length - 1]?.round ?? '(none)'} records "Open out" of ${finalOut ?? '(unrecorded)'}; "resolved" asserts nothing was left open, and the Rounds table is what corroborates that — an item left open escalates as "user-decision-required"`);
      }
    }
  }

  // --- findings ---------------------------------------------------------------------------
  // Round is a column, not an inference. The spot-check duty is stated per round, and deriving a
  // finding's round from the Members table only works while every member appears in exactly one.
  const findings = tableObjects(subSection(logSection, 'Findings')).map((f) => ({
    id: col(f, 'finding'),
    member: col(f, 'member'),
    role: col(f, 'role').toLowerCase(),
    round: intOf(col(f, 'round')),
    riskCategory: col(f, 'risk category').toLowerCase(),
    surface: col(f, 'surface'),
    cls: col(f, 'evidence class').toLowerCase(),
    citation: col(f, 'citation'),
    disposition: col(f, 'disposition').toLowerCase(),
    reason: col(f, 'reason / merged into', 'reason'),
  }));

  totals.findings += findings.length;

  // --- R-2: repo integrity across the run, filesystem-scoped ------------------------------
  // Required whenever any member declared a sandbox, i.e. whenever a trial could have written
  // anything. The digest deliberately covers gitignored build outputs — `git status` reports clean
  // for dist/, which is exactly what consumers install, so a git-scoped check passes green where
  // the damage is invisible.
  const anySandbox = members.some((m) => m.sandbox);
  const integrity = council.repo_integrity;
  // The digest is REQUIRED when a member could write (a declared sandbox) or when the council read
  // the repository it is judging (a review). The comparison, by contrast, is unconditional whenever
  // a digest exists: it used to sit inside the sandbox branch, so a Review council — whose members
  // are read-only and declare no sandbox — recorded before/after values that were never compared.
  // A record could state that the repository changed and pass. Requiring presence while never
  // checking the values is the shape this package exists to prevent.
  const integrityRequired = anySandbox || isReviewRecord;
  if (integrityRequired && !integrity) {
    errors.push(`${file} ${isReviewRecord ? 'is a council-mode review' : 'declares sandbox-using member(s)'} but records no council.repo_integrity; a run that could write, or that reads the repository it is judging, must carry a before/after repo digest (see validators/repo-digest.mjs)`);
  }
  if (integrity) {
    if (integrity.before !== integrity.after) {
      errors.push(`${file} council.repo_integrity before (${integrity.before}) and after (${integrity.after}) differ — the repository changed across the council run, which no member is permitted to do`);
    } else if (!/sha256/i.test(String(integrity.algorithm ?? ''))) {
      errors.push(`${file} council.repo_integrity.algorithm "${integrity.algorithm}" is not a recognised digest; use the algorithm string printed by validators/repo-digest.mjs so the value is reproducible`);
    }
  }

  const memberIds = new Set(members.map((m) => m.id));
  const memberRounds = new Set(members.map((m) => `${m.id}::${m.round}`));
  const roundNumbers = new Set(rounds.map((r) => r.round));
  const bySurface = new Map();
  for (const f of findings) {
    if (!f.member) errors.push(`${file} finding ${f.id} has no source member — unattributed findings are invalid`);
    else if (members.length > 0 && !memberIds.has(f.member)) {
      errors.push(`${file} finding ${f.id} names source member "${f.member}" which is not declared in Members`);
    }
    // The Round column drives the per-round spot-check rule, so an unchecked value decides a rule
    // while answering to nothing: a missing round parsed to null and formed its own bucket, and a
    // round nobody dispatched read as a round that happened. Cross-check against the Rounds table
    // first, then against the member's own declaration — a member producing a finding in a round it
    // was not dispatched for is either a mis-typed row or a member that outlived its round.
    if (!roundNumbers.has(f.round)) {
      errors.push(`${file} finding ${f.id} declares round ${f.round ?? '(none)'} which is not a row in the Rounds table; the Round column is what the per-round duties are evaluated against`);
    } else if (f.member && memberIds.has(f.member) && !memberRounds.has(`${f.member}::${f.round}`)) {
      errors.push(`${file} finding ${f.id} is attributed to member "${f.member}" in round ${f.round}, but Members declares that member only for round(s) ${members.filter((m) => m.id === f.member).map((m) => m.round).join(', ')}`);
    }
    // R11 — a trial finding is an empirical claim about something that was run somewhere. Without
    // a declared sandbox there is nothing to audit and nothing bounding where it ran.
    if (f.cls === 'trial') {
      const owner = members.find((m) => m.id === f.member);
      if (!owner?.sandbox) {
        errors.push(`${file} finding ${f.id} is evidence_class trial but member "${f.member}" declares no sandbox path`);
      }
    }
    if (!EVIDENCE_CLASSES.includes(f.cls)) {
      errors.push(`${file} finding ${f.id} has evidence_class "${f.cls}" (expected one of ${EVIDENCE_CLASSES.join(', ')})`);
    } else if (f.cls !== 'recall') {
      checkCitation(file, f.id, f.cls, f.citation);
    } else if (f.disposition === 'accepted') {
      totals.recallUnconfirmed++;
    }

    if (!DISPOSITIONS.includes(f.disposition)) {
      errors.push(`${file} finding ${f.id} has disposition "${f.disposition}" (expected one of ${DISPOSITIONS.join(', ')})`);
    }
    if (f.disposition === 'rejected-with-reason') {
      totals.rejections++;
      if (!f.reason) {
        errors.push(`${file} finding ${f.id} is rejected-with-reason but its reason is empty — "rejected" without a reason is indistinguishable from "ignored"`);
      }
    }
    if (f.surface) {
      if (!bySurface.has(f.surface)) bySurface.set(f.surface, []);
      bySurface.get(f.surface).push(f);
    }
  }

  // --- reconcile contract: the precondition that licenses overlap at all ------------------
  // independence-rules.md permits read-only workers to share a surface ONLY when the parent
  // declares a dedupe-and-reconcile contract in the active artifact before dispatch. Conflict
  // recording is the teeth; this is the condition. Enforcing the teeth while leaving the condition
  // unrecorded meant overlap was in practice unconditional.
  //
  // Challengers are excluded from the overlap count. A challenger filing against the surface of the
  // researcher it attacks is the challenge pass working as designed — it is not the dispatch-time
  // bucket overlap RI1's exception governs, and counting it made the contract a tax on challenging.
  const overlapped = [...bySurface.entries()].filter(
    ([, fs]) => new Set(fs.filter((f) => f.role !== 'challenger').map((f) => f.member).filter(Boolean)).size >= 2
  );
  if (overlapped.length > 0) {
    const contract = (subSection(logSection, 'Reconcile Contract') ?? '').replace(/<!--[\s\S]*?-->/g, '').trim();
    const names = overlapped.map(([s]) => `"${s}"`).join(', ');
    // Non-emptiness let "we will reconcile" satisfy the exact check the starter block says it must
    // not. Both halves have to be stated, because they are different guarantees: collapsing
    // duplicates is what makes overlap cheap, surfacing disagreement is what makes it safe.
    const statesDedupe = /\b(duplicat\w*|dedup\w*|collaps\w*|merg\w*)\b/i.test(contract);
    const statesDisagreement = /\b(disagree\w*|conflict\w*|dissent\w*|contradict\w*)\b/i.test(contract);
    if (!contract) {
      errors.push(`${file} has members overlapping on surface ${names} but records no "### Reconcile Contract"; overlap is permitted only when the parent declared before dispatch how duplicates collapse and how disagreements surface`);
    } else if (!statesDedupe || !statesDisagreement) {
      const missing = [!statesDedupe && 'how duplicates collapse', !statesDisagreement && 'how disagreements surface'].filter(Boolean);
      errors.push(`${file} has members overlapping on surface ${names} and its "### Reconcile Contract" does not state ${missing.join(' or ')}; "we will reconcile" is a promise, not a contract`);
    }
  }

  // --- conflicts: present as an assertion, even when empty --------------------------------
  const conflictsText = subSection(logSection, 'Conflicts');
  if (conflictsText === null) {
    errors.push(`${file} council log has no "### Conflicts" subsection; it is required even when empty, so that "no conflicts" is an assertion rather than an omission`);
  } else {
    const conflictSurfaces = new Set(tableRows(conflictsText).map((c) => c[0]));
    for (const [surface, fs] of bySurface) {
      const accepted = fs.filter((f) => f.disposition === 'accepted');
      const rejected = fs.filter((f) => f.disposition === 'rejected-with-reason');
      if (accepted.length > 0 && rejected.length > 0 && !conflictSurfaces.has(surface)) {
        errors.push(`${file} surface "${surface}" has both accepted and rejected findings but no Conflicts entry; a parent that silently picks one produces a wrong answer with a complete audit trail`);
      }
    }
  }

  // --- web spot-check duty ----------------------------------------------------------------
  // Per ROUND, which is what the skill and the README actually say. Satisfying every round from a
  // single challenger finding anywhere in the brief made the rule weaker than its own statement:
  // a later round could introduce web findings nobody sampled.
  const webRounds = new Set(findings.filter((f) => f.cls === 'web').map((f) => f.round));
  for (const r of [...webRounds].sort((a, b) => a - b)) {
    const sampled = findings.some(
      (f) => f.round === r && f.role === 'challenger' && /spot-?check/i.test(f.surface + f.citation + f.reason)
    );
    if (!sampled) {
      errors.push(`${file} round ${r} has web finding(s) but no challenger spot-check in that round; web is the only class with no mechanical floor, so sampling is the only way a fabricated quote is caught`);
    }
  }

  // --- recall may not stand alone ----------------------------------------------------------
  // Scan each Q line for finding references wherever they appear. An earlier version required them
  // parenthesised, which real briefs do not reliably do — the check silently passed anything
  // written in another style, which is the worst failure mode for a rule this load-bearing.
  // R5 — a surviving Q must carry a recommendation, and that recommendation must rest on findings
  // that exist and are not exclusively recall. Escalating without a recommendation is the exact
  // behaviour the council was built to remove.
  // A council-mode brief with no Questions For User section is a record that fails OPEN: every
  // check below silently evaluates to nothing and the artifact passes having proved nothing. Found
  // while researching how this validator would behave on a review artifact, which has no such
  // section at all.
  // Escalation is a BRIEF concern. A review artifact has no "Questions For User" section — its
  // escalation surface is Recommendation and Residual Risk — so requiring one there would reject
  // every council-mode review the moment the Review council ships.
  //
  // INERT TODAY, deliberately. The file loop above skips anything not under `briefs/`, so nothing
  // that reaches here is anything but a brief. The gate is written now because widening that filter
  // is a one-line change the Review council will make, and a filter widened without this guard would reject
  // every council-mode review on its first run. Preparation, not a live branch.
  const isBrief = parsed.frontmatter.artifact === 'brief';
  const qSectionRaw = isBrief ? namedSection(parsed.body, 'Questions For User') : null;
  if (isBrief && qSectionRaw === null) {
    errors.push(`${file} declares council mode but has no "## Questions For User" section; the escalation checks would pass vacuously rather than verifying anything`);
  }
  const qSection = qSectionRaw ?? '';
  const findingIds = new Set(findings.map((f) => f.id));

  // Fold wrapped bullets back into one logical line — a question whose evidence references sat on
  // a continuation line looked unevidenced, which is how this validator rejected its own first
  // real council record.
  //
  // Folding stops at any line that introduces its own question, and at a table row. Folding those
  // in meant a table- or paragraph-formatted section collapsed into one entry: only the first Q id
  // was read, every F reference attached to it, and the remaining questions passed unexamined.
  const qLines = [];
  for (const raw of qSection.split('\n')) {
    const startsEntry = /^\s*[-*]\s/.test(raw) || /^\s*\|/.test(raw) || /^\s*\**Q\d+\b/.test(raw);
    const introducesOwnQ = /\bQ\d+\b/.test(raw) && qLines.length > 0 && /\bQ\d+\b/.test(qLines[qLines.length - 1]);
    if (startsEntry || introducesOwnQ || qLines.length === 0) qLines.push(raw);
    else qLines[qLines.length - 1] += ' ' + raw.trim();
  }

  for (const line of qLines) {
    const qId = line.match(/\b(Q\d+)\b/)?.[1];
    if (!qId) continue;
    const refIds = [...line.matchAll(/\bF\d+\b/g)].map((m) => m[0]);

    const prose = line.replace(/\bQ\d+\b/g, '').replace(/\bF\d+\b/g, '').replace(/[-*|\s]/g, '');
    if (prose.length < 12) {
      errors.push(`${file} ${qId} reaches the user with no recommendation; a surviving question must carry a recommended answer and the evidence it rests on`);
      continue;
    }
    if (refIds.length === 0) {
      // A question can legitimately have no evidence — when the bucket assigned to it never
      // completed. That question must still reach the user; it is the one they most need. What must
      // not happen is silence: an unevidenced question indistinguishable from a researched one.
      // So an explicit no-evidence declaration passes, and a bare reference-free question fails.
      // Found by running a real council whose third member died twice on an API 529 (2026-08-17).
      if (/\b(no finding|unresearched|not researched|never ran|bucket failed)\b/i.test(line)) continue;
      errors.push(`${file} ${qId} carries a recommendation with no finding references; cite the findings it rests on, or state explicitly that it rests on none and why`);
      continue;
    }
    const unknown = refIds.filter((id) => !findingIds.has(id));
    if (unknown.length > 0) {
      errors.push(`${file} ${qId} references finding(s) ${unknown.join(', ')} that do not exist in the Findings table`);
      continue;
    }
    const refClasses = refIds.map((id) => findings.find((f) => f.id === id)?.cls).filter(Boolean);
    if (refClasses.length === 0) continue;
    // The two rules used to be separate `every` tests, which left a gap exactly between them: a Q
    // resting on one recall finding and one web finding was "not only recall" and "not only web",
    // so it escaped both and decided a repo-shaped question on evidence that never touched the
    // repo. They are one rule about the same thing — whether anything under the recommendation was
    // mechanically grounded — so they are computed from one predicate.
    const grounded = refClasses.filter((c) => c === 'repo' || c === 'trial');
    if (grounded.length === 0) {
      if (refClasses.every((c) => c === 'recall')) {
        errors.push(`${file} ${qId}'s recommendation rests only on recall findings (${refIds.join(', ')}); recall may raise a hypothesis but never resolve one`);
        continue;
      }
      // `web` may corroborate a repo-shaped question but never decide it: the repo is present and
      // `repo` citations resolve mechanically, so the class with no mechanical floor stays confined
      // to questions where it is the only option.
      //
      // Joined PER QUESTION, not brief-wide. The earlier rule fired whenever ANY classification row
      // named repo, because a Q line named findings and the classification table is keyed by
      // manifest ID, so there was no join to make — a genuinely external question in an otherwise
      // repo-shaped brief was flagged, and the error had to admit it. The Q line now names the
      // manifest ID(s) whose buckets it rests on, which is the join, so the rule judges the
      // question in front of it rather than the brief around it.
      // Anchored to an explicit `bucket` marker rather than scraping every R<n> token from the
      // line. Unanchored, a question mentioning a work package in passing had "R21" read as a
      // declared bucket — and, worse, an incidental token SATISFIED the requirement, masking the
      // real error. Keyword matching without regard to clause is the failure this repo has shipped
      // twice; the same file argues that eighty lines below.
      const bucketDecl = line.match(/bucket[s]?\s*[:\s]\s*((?:RI?\d+[,\s]*)+)/i)?.[1] ?? '';
      const bucketIds = [...bucketDecl.matchAll(/\b(RI?\d+)\b/g)].map((m) => m[1]);
      if (bucketIds.length === 0) {
        // Only demanded of a question the rule would actually judge. A recommendation grounded in
        // repo or trial evidence never reaches here and needs no bucket; one resting on web or
        // recall alone cannot be judged without knowing what kind of question it is, and guessing
        // is what this change removes.
        errors.push(`${file} ${qId} rests on no repo or trial finding and declares no bucket; write "(bucket R3)" naming the manifest ID(s) whose Requirement Classification covers this question, so "would repo evidence settle it" is answerable for this question rather than approximated from the brief`);
        continue;
      }
      const unknownBuckets = bucketIds.filter((id) => !classifiedById.has(id));
      if (unknownBuckets.length > 0) {
        errors.push(`${file} ${qId} names bucket(s) ${unknownBuckets.join(', ')} with no Requirement Classification entry; a bucket reference that resolves to nothing cannot say what would settle the question`);
        continue;
      }
      const thisQuestionIsRepoShaped = bucketIds.some((id) => classifiedById.get(id).includes('repo'));
      if (thisQuestionIsRepoShaped) {
        errors.push(`${file} ${qId}'s recommendation (${refIds.join(', ')}) rests on no repo or trial finding, while its own bucket(s) ${bucketIds.join(', ')} name repo as a settling class; web may corroborate a repo-shaped question but not decide it`);
      }
    }
  }

  // --- Review-specific rules ---------------------------------------------------------------
  // Gated on the artifact type, not on the presence of a section: a review that simply omits the
  // Members `Input` column would otherwise pass the input fence by leaving it out, which is the
  // omission escape the survivor rule already had to close once.
  if (isReviewRecord) {
    // R2 — reviewers see the diff and the manifest, never the Build session transcript. A reviewer
    // that reads the author's reasoning reviews the intention rather than the artefact, which is
    // the whole failure this council exists to remove.
    for (const m of members) {
      if (!m.input) {
        errors.push(`${file} member ${m.id} records no declared input; a Review council member must state what it was given, and "diff+manifest" is the only permitted value`);
      } else if (m.input !== 'diff+manifest') {
        // A closed enum, because that is what the message and the output schema both state. The
        // earlier four-word blocklist let any free text through — including "the whole repo plus my
        // notes from the build" — so the rule enforced was narrower than the rule declared.
        const looksLikeTranscript = /transcript|session|conversation|chat|notes/i.test(m.input);
        errors.push(`${file} member ${m.id} declares input "${m.input}"; "diff+manifest" is the only permitted value${looksLikeTranscript ? ', and this one names the Build session rather than the diff — a reviewer that reads the author\'s reasoning reviews the intention rather than the change' : ''}`);
      }
    }

    // RI17 — categories are the unit of assignment and are disjoint. Two reviewers holding one
    // category read the same ground twice, which means another category went unread.
    // Presence is checked first. Iterating an absent subsection yields an empty list, so the
    // disjointness rule passed vacuously for a record that simply deleted it — the same omission
    // escape closed one rule earlier for the Input column, reintroduced here.
    const assignmentSection = subSection(logSection, 'Risk Category Assignment');
    if (assignmentSection === null) {
      errors.push(`${file} is a council-mode review but has no "### Risk Category Assignment" subsection; coverage that is not recorded cannot be audited, and an absent section satisfies the disjointness rule by having nothing in it`);
    }
    // Keyed by ROUND. A category legitimately moves between reviewers across rounds — that is what
    // a taper does, and what happens when a member fails and another picks its categories up.
    // Keying globally rejected the hand-off while leaving the rule the requirement actually states
    // ("in the same round") unexpressible.
    const categoryOwner = new Map();
    // Separate from categoryOwner on purpose. categoryOwner is category -> member and is only sound
    // while the partition holds; the moment two members share a category the last write wins, so
    // reading a member's own assignment back out of it reports the wrong answer for exactly the
    // records that violate disjointness. assignedByMember is member -> categories and is correct
    // either way.
    const assignedByMember = new Map();
    // The Round column is required, not defaulted. `?? 1` used to stand in for a missing column,
    // which quietly collapsed every round into round 1: a round-2 reassignment of a category read in
    // round 1 was then reported as an overlap that never happened, and the record it was reading had
    // no column to be wrong about. lifecycle-review's output schema has always declared the column;
    // nothing produced it and nothing asked for it.
    // Asked of the HEADER, not of the section. The first form of this check tested every table line
    // for `\bround\b`, so a record that deleted the column and wrote "the diff changes a schema in
    // the first round" in a rationale cell satisfied it — and then every row collapsed to round 1,
    // which is precisely the outcome the error below describes. Rationales mention rounds; that is
    // how rationales are written.
    if (tableObjects(assignmentSection).length > 0 && !headerCells(assignmentSection).includes('round')) {
      errors.push(`${file} "### Risk Category Assignment" has no Round column; disjointness is a per-round property, and without the round every row is read as round 1 — which turns a legitimate round-2 reassignment into a reported overlap`);
    }
    for (const row of tableObjects(assignmentSection)) {
      const member = col(row, 'member');
      const roundKey = intOf(col(row, 'round')) ?? 1;
      for (const cat of col(row, 'risk categories').split(',').map((c) => c.trim().toLowerCase()).filter(Boolean)) {
        if (!assignedByMember.has(member)) assignedByMember.set(member, new Set());
        assignedByMember.get(member).add(cat);
        const key = `${roundKey}::${cat}`;
        if (categoryOwner.has(key) && categoryOwner.get(key) !== member) {
          errors.push(`${file} risk category "${cat}" is assigned to both ${categoryOwner.get(key)} and ${member} in round ${roundKey}; categories are partitioned disjointly within a round, and two reviewers sharing one means another category went unread`);
        }
        categoryOwner.set(key, member);
      }
    }

    // N2 — a finding's risk_category must be one its own member was assigned. The field was parsed
    // and discarded; review-council's output schema declares the rule ("a `risk_category` that member
    // was assigned") and only the source_member half was enforced. categoryOwner is already built.
    for (const f of findings) {
      if (f.role === 'challenger' || !f.member || !f.riskCategory) continue;
      const owned = [...(assignedByMember.get(f.member) ?? [])];
      if (owned.length > 0 && !owned.includes(f.riskCategory)) {
        errors.push(`${file} finding ${f.id} declares risk category "${f.riskCategory}" but member ${f.member} was assigned ${owned.map((c) => `"${c}"`).join(', ')}; a finding filed outside its member's assignment means either the assignment or the finding is wrong, and the coverage claim rests on the assignment`);
      }
    }

    // N1 — coverage is claimed by review-risk-categories.md ("A category assigned to nobody ...
    // is recorded as a skipped check") and was enforced nowhere. With the Review default at 2
    // reviewers over ten categories, under-coverage is the DEFAULT configuration, not an edge case.
    // The ten names are read from their source file rather than restated here, the same anti-drift
    // shape as r22-fan-out-defaults-agree: a list copied into a validator is a list that rots.
    const skippedRows = tableObjects(subSection(logSection, 'Skipped Checks'));
    const SKIPPED_FIELDS = ['check', 'why skipped', 'risk', 'owner', 'blocks ship', 'manifest ids'];
    const categoriesPath = defsPath('skills/lifecycle-review/references/review-risk-categories.md');
    const categoriesDoc = pathExists(categoriesPath) ? readText(categoriesPath) : null;
    if (!categoriesDoc) {
      // Gate, don't skip. An unreadable categories doc used to disable the coverage rule outright,
      // so the one condition under which coverage cannot be established reported the same green as
      // full coverage. check-definitions refuses to report `ok` having validated nothing for exactly
      // this reason; a checker that cannot check must say so, not pass.
      errors.push(`${file} is a council-mode review but the risk-category list at ${categoriesPath} could not be read; coverage is claimed against that list, and a run that cannot read it cannot establish coverage — it can only fail to notice a gap`);
    } else {
      const known = [...categoriesDoc.matchAll(/^- ([a-z][a-z-]*):/gm)].map((m) => m[1]);
      const assigned = new Set([...categoryOwner.keys()].map((k) => k.split('::')[1]));
      // Read the CHECK COLUMN as a comma-separated category list — the shape review-council's output
      // schema declares (`check: <the risk categories left unread>`) — and match tokens exactly.
      // The first form of this rule ran `includes()` over the whole lowercased section, so a row
      // about an unrelated deferred check counted as coverage for every category its prose happened
      // to name: "a release risk", "the security posture", "maintainability of the generated-output
      // path" silently accounted for four categories that row does not cover. Keyword matching
      // without regard to clause is the failure this repo has shipped twice; this rule was the
      // third, and it was worse than absent because it reported coverage it had not established.
      const skippedCategories = new Set(
        skippedRows.flatMap((r) => col(r, 'check').split(',').map((c) => c.trim().toLowerCase())).filter(Boolean)
      );
      const unaccounted = known.filter((c) => !assigned.has(c) && !skippedCategories.has(c));
      if (unaccounted.length > 0) {
        errors.push(`${file} risk category ${unaccounted.map((c) => `"${c}"`).join(', ')} is neither assigned to a reviewer nor named in the Check column of "### Skipped Checks"; a category nobody read is a coverage gap, and with a two-reviewer default over ten categories that is the normal case rather than an unusual one. Naming the category in a Why skipped or Risk cell does not account for it — the Check column is the list of what went unread`);
      }
    }

    // RI18 — a member that failed must have its unread categories recorded as a skipped check. A
    // council that lost a member and says nothing reports the same coverage as one that did not,
    // which is the more dangerous of the two because it reads as complete.
    for (const m of members.filter((x) => x.status === 'failed')) {
      // The predicate used to end `|| col(r, 'check')`, which is true for any row with a non-empty
      // Check cell — so a single unrelated skipped check covered every failed member and the
      // attribution half never ran. Matching is now exact-token, so member m1 is not satisfied by a
      // row mentioning m10, and a row may also cover by naming one of that member's categories.
      const memberCategories = [...(assignedByMember.get(m.id) ?? [])];
      const namesMember = (text) => new RegExp(`(^|[^A-Za-z0-9])${m.id}([^A-Za-z0-9]|$)`).test(text);
      const covering = skippedRows.filter((r) => {
        const text = Object.values(r).join(' ');
        return namesMember(text) || memberCategories.some((cat) => text.toLowerCase().includes(cat));
      });
      if (skippedRows.length === 0 || covering.length === 0) {
        errors.push(`${file} member ${m.id} is recorded "failed" but no "### Skipped Checks" entry records what went unread; a lost member with no skipped check reports the same coverage as one that never failed`);
        continue;
      }
      for (const row of covering) {
        const missing = SKIPPED_FIELDS.filter((f) => !col(row, f).trim());
        if (missing.length > 0) {
          errors.push(`${file} skipped-check entry for failed member ${m.id} is missing ${missing.join(', ')}; verification.yaml requires all six fields`);
          break;
        }
      }
    }

    // RI19's presence requirement is enforced with the digest comparison above, where
    // `integrityRequired` already covers `isReviewRecord`. It used to be duplicated here, which the
    // attribution sweep caught the moment it ran: fixture `dv` emitted two errors for one defect,
    // and a fixture rejected twice keeps passing when the rule it targets regresses.
  }

  // R3 — the parent consolidates, and consolidation must SHOW its sources. A review whose body
  // Findings section says "none" while its Council Log records accepted findings has dropped them
  // silently, which is the single behaviour the brief's goals name as the reason for a disposition
  // contract at all. Checked only for accepted/merged findings: a rejected one is accounted for by
  // its reason and need not reach the body.
  if (isReviewRecord) {
    const surviving = findings.filter((f) => f.disposition === 'accepted' || f.disposition === 'merged');
    if (surviving.length > 0) {
      const bodyFindings = namedSection(parsed.body, 'Findings') ?? '';
      const stripped = bodyFindings.replace(/<!--[\s\S]*?-->/g, '').trim();
      if (!stripped || /^none$/i.test(stripped)) {
        errors.push(`${file} records ${surviving.length} accepted or merged council finding(s) but its "## Findings" section says nothing; the parent consolidates, and a finding that reaches no consolidation has been dropped rather than dispositioned`);
      } else {
        const citedMembers = new Set(surviving.map((f) => f.member).filter(Boolean));
        const uncited = [...citedMembers].filter((m) => !new RegExp(`(^|[^A-Za-z0-9])${m}([^A-Za-z0-9]|$)`).test(bodyFindings));
        if (uncited.length > 0) {
          errors.push(`${file} consolidation does not cite member(s) ${uncited.join(', ')}, each of which produced an accepted or merged finding; a reviewer whose work is not cited cannot be told from one that was ignored`);
        }
      }
    }
  }

  // RI2 — a council-log finding states what is wrong and where; it carries no fix recommendation,
  // because proposing a fix switches the candidate to Build scope. Enforced STRUCTURALLY, against a
  // declared column, rather than by scanning reason prose for imperative phrasing: this repo has
  // been bitten twice by keyword matching without regard to clause (a coverage cell reading "never
  // silently dropped", a waiver cell reading "rather than a waiver"). The limit is stated in
  // README.md rather than papered over — prose smuggled into a reason field is not detectable here.
  // Scoped to reviews, matching the requirement: the rule is about a READ-ONLY reviewer proposing an
  // edit. A Think council brief has no reviewer, so binding briefs was stricter than specified.
  // Read the HEADER LINE, not tableObjects(...)[0]. tableObjects returns data rows keyed by header,
  // so an empty table yields no rows and `[0]` is undefined — and this rule then silently passed the
  // one record it most needs to reject: a Findings table that declares a `Fix` column and has not
  // been filled in yet. The column is the violation; whether anyone has written a row under it is
  // not the question. The header read goes through the shared `headerCells` helper, so this rule and
  // the Round-column rule above cannot drift into disagreeing about which line is the header.
  const findingsSection = isReviewRecord ? subSection(logSection, 'Findings') : null;
  const fixColumn = headerCells(findingsSection).find((h) => /\bfix\b|recommendation/.test(h));
  if (fixColumn) {
    errors.push(`${file} council-log Findings table declares a "${fixColumn}" column; a council finding states what is wrong and where, and a fix recommendation switches the candidate to Build scope. The parent's consolidated "## Findings" entries carry fixes — council-log rows do not`);
  }

  // --- evidence-class availability ---------------------------------------------------------
  const declared = council.evidence_classes ?? {};
  for (const f of findings) {
    if (EVIDENCE_CLASSES.includes(f.cls) && declared[f.cls] === undefined) {
      errors.push(`${file} has a ${f.cls} finding but council.evidence_classes records no status for "${f.cls}"`);
    }
  }

  details.push(`checked ${file} (${rounds.length} round(s), ${findings.length} finding(s))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}

// Texture, not a bare pass. The resolved-vs-shape-checked ratio is how a reader sees how much of a
// brief rests on classes this validator cannot verify.
if (totals.briefs > 0 || totals.reviews > 0) {
  details.push(
    `summary: ${totals.briefs} council brief(s), ${totals.reviews} council review(s), ` +
    `${totals.rounds} round(s), ${totals.findings} finding(s), ` +
    `${totals.rejections} rejection(s), ${totals.recallUnconfirmed} recall-only hypothes(es) accepted without corroboration, ` +
    `${totals.resolved} citation(s) mechanically resolved vs ${totals.shapeOnly} shape-checked only`
  );
}

finish('check-council-record', errors, details);
