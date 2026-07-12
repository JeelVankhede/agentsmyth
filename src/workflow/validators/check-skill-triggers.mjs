#!/usr/bin/env node
// check-skill-triggers. For any artifact carrying a skill_trigger_log frontmatter
// array, schema-validates every entry (skill, decision: ran|skipped, reason). This validator
// audits that a triggered skill's decision was RECORDED and justified — it cannot re-derive or
// verify the skill_scoring predicate itself, since agentsmyth has no runtime to compute scores
// mechanically (see agent-behavior.yaml's skill_scoring comment).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  defsPath,
  finish,
  listFiles,
  loadYaml,
  parseFrontmatter,
  readText,
  repoRoot,
  validateSchema,
} from './lib.mjs';

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const wf = process.env.AGENTSMYTH_WF
  || (existsSync(join(repoRoot, 'workflow')) ? 'workflow' : ['.', 'workflow'].join(''));
const artifactsDir = dirArgIdx !== -1 ? args[dirArgIdx + 1] : `${wf}/artifacts`;

const errors = [];
const details = [];

const frontmatterSchema = loadYaml(defsPath('schemas', 'artifact-frontmatter.schema.yaml'));
const skillTriggerLogSchema = frontmatterSchema.properties.skill_trigger_log;

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
  if (log === undefined) continue; // no log present — trivial pass, nothing was triggered/recorded

  logsChecked++;
  validateSchema(log, skillTriggerLogSchema, `${file}.skill_trigger_log`, errors, {}, skillTriggerLogSchema);
  details.push(`checked ${file} (${Array.isArray(log) ? log.length : 0} entr(y/ies))`);
}

if (artifactFiles.length === 0) {
  details.push(`no lifecycle artifact files found under ${artifactsDir}`);
}
details.push(`${logsChecked} skill_trigger_log(s) checked total`);

finish('check-skill-triggers', errors, details);
