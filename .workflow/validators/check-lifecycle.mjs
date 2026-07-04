#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  artifactContracts,
  finish,
  loadYaml,
  repoRoot,
} from './lib.mjs';

const errors = [];
const details = [];

const wf = existsSync(join(repoRoot, 'workflow')) ? 'workflow' : ['.', 'workflow'].join('');
const behavior = loadYaml(`${wf}/config/agent-behavior.yaml`);
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
  const expectedPath = `${wf}/artifacts/${contract.dir}/<slug>-v<N>.md`;
  if (item.path !== expectedPath) {
    errors.push(`artifact_chain[${index}].path expected ${expectedPath}, got ${item.path}`);
  }

});

const frontmatterSchema = loadYaml(`${wf}/schemas/artifact-frontmatter.schema.yaml`);
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
details.push('checked artifact-frontmatter schema enums');

finish('check-lifecycle', errors, details);
