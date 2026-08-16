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
import { finish, listFiles, parseFrontmatter, pathExists, readText, wf } from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

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
    const pathMatch = citation.match(/`?([\w./-]+\.[\w]+)`?/);
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
      const lineCount = readText(cited).split('\n').length;
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
  if (rounds.length > 1) {
    const closedEver = new Set(rounds.flatMap((r) => r.closed));
    const everOpen = new Set(rounds.flatMap((r) => idsOf(String(r.openIn === null ? '' : ''))));
    void everOpen;
    const survivors = idsOf(subSection(logSection, 'Termination')?.match(/Surviving items[^:]*:\s*(.*)/i)?.[1] ?? '')
      .filter((id) => !closedEver.has(id));
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

  const bySurface = new Map();
  for (const f of findings) {
    if (!f.member) errors.push(`${file} finding ${f.id} has no source member — unattributed findings are invalid`);
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
  const qSection = namedSection(parsed.body, 'Questions For User') ?? '';
  for (const line of qSection.split('\n')) {
    const qId = line.match(/\b(Q\d+)\b/)?.[1];
    if (!qId) continue;
    const refIds = [...line.matchAll(/\bF\d+\b/g)].map((m) => m[0]);
    if (refIds.length === 0) continue;
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
