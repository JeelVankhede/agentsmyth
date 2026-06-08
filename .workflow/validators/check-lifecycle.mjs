#!/usr/bin/env node
import {
  artifactContracts,
  finish,
  loadYaml,
  parseFrontmatter,
  readText,
} from './lib.mjs';

const errors = [];
const details = [];

const behavior = loadYaml('.workflow/config/agent-behavior.yaml');
const chain = behavior.lifecycle?.artifact_chain ?? [];

if (chain.length !== artifactContracts.length) {
  errors.push(`agent-behavior artifact_chain expected ${artifactContracts.length} entries, got ${chain.length}`);
}

artifactContracts.forEach((contract, index) => {
  const item = chain[index];
  if (!item) return;
  if (item.artifact !== contract.artifact) {
    errors.push(`artifact_chain[${index}].artifact expected ${contract.artifact}, got ${item.artifact}`);
  }
  if (item.phase !== contract.phase) {
    errors.push(`artifact_chain[${index}].phase expected ${contract.phase}, got ${item.phase}`);
  }
  if (item.next_phase !== contract.nextPhase) {
    errors.push(`artifact_chain[${index}].next_phase expected ${contract.nextPhase}, got ${item.next_phase}`);
  }
  const expectedPath = `.workflow/artifacts/${contract.dir}/<slug>-v<N>.md`;
  if (item.path !== expectedPath) {
    errors.push(`artifact_chain[${index}].path expected ${expectedPath}, got ${item.path}`);
  }

  const parsed = parseFrontmatter(readText(contract.template), contract.template);
  if (parsed.frontmatter.artifact !== item.artifact) {
    errors.push(`${contract.template} artifact does not match artifact_chain`);
  }
  if (parsed.frontmatter.orchestration?.phase !== item.phase) {
    errors.push(`${contract.template} phase does not match artifact_chain`);
  }
  if (parsed.frontmatter.orchestration?.next_phase !== item.next_phase) {
    errors.push(`${contract.template} next_phase does not match artifact_chain`);
  }
});

const frontmatterSchema = loadYaml('.workflow/schemas/artifact-frontmatter.schema.yaml');
const artifactEnum = frontmatterSchema.properties?.artifact?.enum ?? [];
const phaseEnum = frontmatterSchema.properties?.orchestration?.properties?.phase?.enum ?? [];
const nextPhaseEnum = frontmatterSchema.properties?.orchestration?.properties?.next_phase?.enum ?? [];

for (const contract of artifactContracts) {
  if (!artifactEnum.includes(contract.artifact)) {
    errors.push(`artifact-frontmatter schema missing artifact ${contract.artifact}`);
  }
  if (!phaseEnum.includes(contract.phase)) {
    errors.push(`artifact-frontmatter schema missing phase ${contract.phase}`);
  }
  if (!nextPhaseEnum.includes(contract.nextPhase)) {
    errors.push(`artifact-frontmatter schema missing next_phase ${contract.nextPhase}`);
  }
}

details.push('checked agent-behavior artifact chain');
details.push('checked template frontmatter against lifecycle chain');
details.push('checked artifact-frontmatter schema enums');

finish('check-lifecycle', errors, details);
