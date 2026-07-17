#!/usr/bin/env node
// check-skill-triggers. For any artifact carrying a skill_trigger_log frontmatter
// array, schema-validates every entry (skill, decision: ran|skipped, reason). This validator
// audits that a triggered skill's decision was RECORDED and justified — it cannot re-derive or
// verify the skill_scoring predicate itself, since agentsmyth has no runtime to compute scores
// mechanically (see agent-behavior.yaml's skill_scoring comment).
import {
  defsPath,
  finish,
  listFiles,
  loadYaml,
  parseFrontmatter,
  readText,
  validateSchema,
  wf,
} from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

const errors = [];
const details = [];

const frontmatterSchema = loadYaml(defsPath('schemas', 'artifact-frontmatter.schema.yaml'));
const skillTriggerLogSchema = frontmatterSchema.properties.skill_trigger_log;

// Per-phase skills whose trigger lifecycle-<phase>/SKILL.md mandates be *evaluated* for every
// artifact of that phase (each recorded ran|skipped). Only Think unconditionally mandates a fixed
// set (its Exit Gate names these three); other phases fire skills conditionally on path/score, which
// this validator cannot re-derive. When a phase's artifact records a skill_trigger_log, it must
// cover every mandated skill for that phase — this closes the "log a subset, pass" gap.
//
// Boundary (deliberate, documented): a phase artifact with NO skill_trigger_log at all is still a
// pass. Hard-requiring presence would retroactively fail every brief written before the
// skill-scoring feature existed (the pre-feature dogfood corpus). New artifacts are steered to
// include the log by the phase starter block's stub; completeness is enforced here once present.
const PHASE_MANDATED_SKILLS = {
  think: ['repo-alignment-scan', 'architecture-decision-advisor', 'constraint-conflict-scan'],
};

const artifactFiles = listFiles(artifactsDir).filter((file) => {
  return file.endsWith('.md') && !file.endsWith('/README.md') && file !== `${artifactsDir}/README.md`;
});

let logsChecked = 0;

for (const file of artifactFiles) {
  const text = readText(file);
  let parsed;
  try {
    parsed = parseFrontmatter(text, file);
  } catch {
    continue;
  }

  const log = parsed.frontmatter.skill_trigger_log;
  const phase = parsed.frontmatter.orchestration?.phase;
  const mandated = PHASE_MANDATED_SKILLS[phase] ?? [];

  // Presence: an artifact of a mandating phase (e.g. Think) MUST record a skill_trigger_log — the
  // "omit the log entirely" bypass is closed. Pre-feature artifacts were backfilled so this does not
  // regress the corpus. A non-mandating phase with no log is still a trivial pass.
  if (log === undefined) {
    if (mandated.length > 0) {
      errors.push(
        `${file} phase "${phase}" has no skill_trigger_log — it must record a decision (ran|skipped) ` +
        `for each mandated skill: ${mandated.join(', ')} (lifecycle-${phase} Exit Gate)`
      );
    }
    continue;
  }

  logsChecked++;
  validateSchema(log, skillTriggerLogSchema, `${file}.skill_trigger_log`, errors, {}, skillTriggerLogSchema);

  // Completeness: a mandating phase's log must cover every mandated skill.
  if (mandated.length > 0 && Array.isArray(log)) {
    const logged = new Set(log.map((e) => e?.skill));
    const missing = mandated.filter((s) => !logged.has(s));
    if (missing.length > 0) {
      errors.push(
        `${file} phase "${phase}" records a skill_trigger_log but omits mandated skill(s): ${missing.join(', ')} ` +
        `(each must be recorded ran|skipped — lifecycle-${phase} Exit Gate)`
      );
    }
  }

  details.push(`checked ${file} (${Array.isArray(log) ? log.length : 0} entr(y/ies))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}
details.push(`${logsChecked} skill_trigger_log(s) checked total`);

finish('check-skill-triggers', errors, details);
