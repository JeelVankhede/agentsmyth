#!/usr/bin/env node
// check-council-record (WP-R21). Validates the RECORD a council run leaves behind — not the council.
//
// The name is deliberate. This validator can prove the loop ran, that findings were attributed and
// dispositioned, that citations meet their class's contract, that rounds tapered coherently, and
// that the run terminated for a stated reason. It cannot prove a finding was correct, that the
// council found what a human would have found, that a rejection reason was a good one, or that a
// `web` quote was genuinely present at the URL it names. See README.md for the full non-claims list.
//
// A green result here means the record is well-formed and internally consistent. It does not mean
// the thinking was good.
import { dataPath, defsPath, finish, listFiles, loadYaml, parseFrontmatter, pathExists, readText, repoRoot, wf } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

// Resolve council config global-then-repo-local, the same two-root shape as definitions_root.
// Without this the max_rounds bound and the sandbox fence are prose, and prose is exactly what an
// agent drifts from — which is the failure this whole feature exists to prevent.
function resolveCouncilConfig() {
  const defaults = { max_rounds: 4, sandbox_root: '~/.agentsmyth/sandbox', default_fan_out: 3 };
  let global = {};
  let repo = {};
  try { global = loadYaml(defsPath('agent-behavior.yaml'))?.council ?? {}; } catch { /* absent is fine */ }
  try { repo = loadYaml(dataPath('config/repo-profile.yaml'))?.tuning?.council ?? {}; } catch { /* absent is fine */ }
  return { ...defaults, ...global, ...repo };
}
const councilConfig = resolveCouncilConfig();
// Indirection so the fence helpers above can read the resolved config without a forward reference.
const councilConfigRef = { value: councilConfig };

// Tilde expansion shared by both fences. HOME being unset must not silently turn an absolute
// sandbox path into a relative-looking one, so an unexpandable "~" is left intact and will fail
// the absolute-path test rather than passing by accident.
function expandHome(p) {
  const home = process.env.HOME;
  return home ? p.replace(/^~(?=\/|$)/, home) : p;
}

// A sandbox path is inside the repo when it is relative, or absolute-and-under the repo root.
// Resolved via lib.mjs's repoRoot — NOT process.cwd(), which is the invocation directory and
// differs from the repo root whenever a validator runs from a package subdirectory of a monorepo
// (WP-R5 supports exactly that). Review P2-1.
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
const TERMINATIONS = ['resolved', 'user-decision-required', 'max-rounds', 'no-progress'];

// Running totals for the summary line. A bare pass invites skipping; a number that varies invites
// reading, and the ratios below are how a reader sees how much of a brief rests on classes this
// validator cannot verify.
const totals = { briefs: 0, rounds: 0, findings: 0, rejections: 0, recallUnconfirmed: 0, resolved: 0, shapeOnly: 0 };

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
    // A bare path with no extension is still a path — saying "names no file path" for
    // `src/workflow/skills` was untrue and sent a reader looking for the wrong problem (P3-2).
    const pathMatch = citation.match(/`?((?:[\w.-]+\/)*[\w.-]+)`?/);
    if (!pathMatch) {
      errors.push(`${file} finding ${id} is evidence_class repo but its citation names no file path`);
      return;
    }
    const cited = pathMatch[1];
    if (!pathExists(cited)) {
      errors.push(`${file} finding ${id} cites repo path "${cited}" which does not exist`);
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
  if (file.split('/').slice(-2, -1)[0] !== 'briefs') continue;

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

  totals.briefs++;
  const mode = council.mode;

  // --- R-1: re-derive the firing decision from its recorded inputs ------------------------
  // R1 and R7 are agent behaviour, so without the inputs a validator can only confirm what mode
  // was written down — never whether that mode was the correct consequence of the config. With
  // them, the decision becomes reproducible: the same three values must always yield the same
  // mode, and disagreement is a defect rather than a matter of opinion.
  const res = council.resolution;
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
  const rounds = tableRows(subSection(logSection, 'Rounds')).map((cells) => ({
    round: intOf(cells[0]),
    researchers: intOf(cells[1]),
    challengers: intOf(cells[2]),
    openIn: intOf(cells[3]),
    openOut: intOf(cells[4]),
    closed: idsOf(cells[5]),
    rationale: (cells[6] ?? '').trim(),
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
  const classRows = tableRows(subSection(logSection, 'Requirement Classification'));
  if (classRows.length === 0) {
    errors.push(`${file} council log has no "### Requirement Classification" subsection; every active R/RI must be classified with the evidence class that would settle it`);
  } else {
    const classified = new Map(classRows.map((c) => [c[0], (c[2] ?? '').toLowerCase()]));
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
  const members = tableRows(subSection(logSection, 'Members')).map((cells) => ({
    id: cells[0],
    role: (cells[1] ?? '').toLowerCase(),
    round: intOf(cells[2]),
    capabilities: (cells[3] ?? '').toLowerCase(),
    sandbox: (cells[4] ?? '').trim(),
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
    if (curTotal < prevTotal && prev.openOut !== null && prev.openIn !== null && prev.openOut >= prev.openIn) {
      errors.push(`${file} round ${cur.round} reduced fan-out after round ${prev.round} closed nothing (open ${prev.openIn} → ${prev.openOut}); shrinking the council asserts convergence the open-item count does not corroborate`);
    }
  }

  // --- survivors escalate rather than expiring --------------------------------------------
  // Review P1-2: this rule used to read survivors out of free text, so a run could terminate
  // "max-rounds" and simply delete the line — the escape was one keystroke, which left the rule
  // enforcing good behaviour only in runs that were already behaving. The declaration is now
  // MANDATORY for the two terminations that imply unfinished business, so silence fails before
  // the survivor comparison is even reached.
  const terminationText = subSection(logSection, 'Termination') ?? '';
  const survivorLine = terminationText.match(/Surviving items[^:]*:\s*(.*)/i)?.[1];
  const impliesUnfinished = council.termination_reason === 'max-rounds' || council.termination_reason === 'no-progress';

  if (impliesUnfinished && (survivorLine === undefined || !survivorLine.trim())) {
    errors.push(`${file} terminated "${council.termination_reason}" without declaring its surviving items; a termination that implies unfinished business must state what was left unfinished, and omitting the line is not a way to have left nothing`);
  }

  if (rounds.length > 1) {
    const closedEver = new Set(rounds.flatMap((r) => r.closed));
    const survivors = idsOf(survivorLine ?? '').filter((id) => !closedEver.has(id));
    if (council.termination_reason === 'max-rounds' && survivors.length > 0) {
      errors.push(`${file} terminated "max-rounds" while ${survivors.join(', ')} survived every round without closing; a survivor is evidence the council cannot resolve it, so the run must terminate "user-decision-required"`);
    }
  }

  // --- findings ---------------------------------------------------------------------------
  const findings = tableRows(subSection(logSection, 'Findings')).map((cells) => ({
    id: cells[0],
    member: cells[1],
    role: (cells[2] ?? '').toLowerCase(),
    surface: cells[3],
    cls: (cells[4] ?? '').toLowerCase(),
    citation: cells[5] ?? '',
    disposition: (cells[6] ?? '').toLowerCase(),
    reason: cells[7] ?? '',
  }));

  totals.findings += findings.length;

  // --- R-2: repo integrity across the run, filesystem-scoped ------------------------------
  // Required whenever any member declared a sandbox, i.e. whenever a trial could have written
  // anything. The digest deliberately covers gitignored build outputs — `git status` reports clean
  // for dist/, which is exactly what consumers install, so a git-scoped check passes green where
  // the damage is invisible.
  const anySandbox = members.some((m) => m.sandbox);
  const integrity = council.repo_integrity;
  if (anySandbox) {
    if (!integrity) {
      errors.push(`${file} declares sandbox-using member(s) but records no council.repo_integrity; a run that could write must carry a before/after repo digest (see validators/repo-digest.mjs)`);
    } else if (integrity.before !== integrity.after) {
      errors.push(`${file} council.repo_integrity before (${integrity.before}) and after (${integrity.after}) differ — the repository changed across the council run, which no member is permitted to do`);
    } else if (!/sha256/i.test(String(integrity.algorithm ?? ''))) {
      errors.push(`${file} council.repo_integrity.algorithm "${integrity.algorithm}" is not a recognised digest; use the algorithm string printed by validators/repo-digest.mjs so the value is reproducible`);
    }
  }

  const memberIds = new Set(members.map((m) => m.id));
  const bySurface = new Map();
  for (const f of findings) {
    if (!f.member) errors.push(`${file} finding ${f.id} has no source member — unattributed findings are invalid`);
    else if (members.length > 0 && !memberIds.has(f.member)) {
      errors.push(`${file} finding ${f.id} names source member "${f.member}" which is not declared in Members`);
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
  const webFindings = findings.filter((f) => f.cls === 'web');
  if (webFindings.length > 0) {
    const spotCheck = findings.some((f) => f.role === 'challenger' && /spot-?check/i.test(f.surface + f.citation + f.reason));
    if (!spotCheck) {
      errors.push(`${file} has ${webFindings.length} web finding(s) but no recorded challenger spot-check; web is the only class with no mechanical floor, so sampling is the only way a fabricated quote is caught`);
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
  const qSectionRaw = namedSection(parsed.body, 'Questions For User');
  if (qSectionRaw === null) {
    errors.push(`${file} declares council mode but has no "## Questions For User" section; the escalation checks would pass vacuously rather than verifying anything`);
  }
  const qSection = qSectionRaw ?? '';
  const findingIds = new Set(findings.map((f) => f.id));

  // Bullets wrap. Reading one physical line at a time meant a question whose evidence references
  // sat on a continuation line looked unevidenced — which is exactly how this validator rejected
  // its own first real council record. Fold each bullet back into one logical line first.
  const qLines = [];
  for (const raw of qSection.split('\n')) {
    if (/^\s*[-*]\s/.test(raw) || qLines.length === 0) qLines.push(raw);
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
    if (refClasses.length > 0 && refClasses.every((c) => c === 'recall')) {
      errors.push(`${file} ${qId}'s recommendation rests only on recall findings (${refIds.join(', ')}); recall may raise a hypothesis but never resolve one`);
    }
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
if (totals.briefs > 0) {
  details.push(
    `summary: ${totals.briefs} council brief(s), ${totals.rounds} round(s), ${totals.findings} finding(s), ` +
    `${totals.rejections} rejection(s), ${totals.recallUnconfirmed} recall-only hypothes(es) accepted without corroboration, ` +
    `${totals.resolved} citation(s) mechanically resolved vs ${totals.shapeOnly} shape-checked only`
  );
}

finish('check-council-record', errors, details);
