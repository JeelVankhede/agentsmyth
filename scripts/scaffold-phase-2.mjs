#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

const note = 'Placeholder for a later phase. Do not treat this as final workflow behavior.';
const write = (path, content = null) => {
  if (existsSync(path)) return;
  mkdirSync(dirname(path), { recursive: true });
  const title = path.split('/').pop().replace(/\.(md|mdc|yaml|mjs|gitkeep|windsurfrules)$/u, '').replace(/[-_]/gu, ' ');
  const body = content ?? (path.endsWith('.gitkeep') ? '' : path.endsWith('.yaml') ? `# ${note}\n` : path.endsWith('.mjs') ? `// ${note}\n` : `# ${title}\n\n${note}\n`);
  writeFileSync(path, body, 'utf8');
};

write('README.md', `# agentsmyth\n\nGeneric single-repo AI lifecycle workflow template.\n\n${note}\n`);
write('AGENTS.md', `# agentsmyth Agent Router\n\nUse \`.workflow/\` as the canonical workflow source.\n\n${note}\n`);

['overview','setup-guide','agent-setup-interview','lifecycle-contract','domain-attachment-guide','artifact-contract','source-of-truth-guide','adapter-guide'].forEach((name) => write(`docs/${name}.md`));
['README','router','lifecycle','rules','glossary'].forEach((name) => write(`.workflow/${name}.md`));
['domain','repo-profile','source-of-truth','verification','release','agent-behavior'].forEach((name) => write(`.workflow/config/${name}.yaml`));
['domain','repo-profile','source-of-truth','verification','release','artifact-frontmatter','lifecycle-artifact'].forEach((name) => write(`.workflow/schemas/${name}.schema.yaml`));

const skills = {
  'lifecycle-orchestrator': ['phase-routing','pause-resume-rules','blocker-policy','lifecycle-state-machine','output-contract'],
  'lifecycle-think': ['role','output-schema','exemplar','requirement-discovery','assumption-policy','question-policy','architecture-notes-guide'],
  'lifecycle-plan': ['role','output-schema','exemplar','repo-impact-map','dependency-ordering','risk-register','verification-planning','branch-policy','source-of-truth-planning'],
  'lifecycle-build': ['role','output-schema','exemplar','phase-execution-policy','scope-control','change-safety','git-status-policy','unrelated-changes-policy','verification-recording'],
  'lifecycle-review': ['role','output-schema','exemplar','severity-model','requirement-coverage','review-risk-categories','generated-output-review','source-of-truth-review','verification-review'],
  'lifecycle-test': ['role','output-schema','exemplar','verification-matrix','command-evidence-policy','manual-qa-policy','skipped-check-policy','generated-output-verification'],
  'lifecycle-ship': ['role','output-schema','exemplar','release-gates','source-of-truth-handoff','waiver-policy','rollback-policy','pr-ci-policy','blocked-handoff-format'],
  'lifecycle-reflect': ['role','output-schema','exemplar','coverage-retrospective','learning-capture','raw-session-format','follow-up-policy'],
  'decompose-requirements': ['decision-tree','explicit-requirements','implicit-requirements-library','assumptions-and-questions','manifest-format','output-schema'],
  'restore-context': ['chain-walker','artifact-reader','git-walker','source-of-truth-reader','blocker-reader','summary-format','output-schema'],
  'dispatch-subagents': ['decision-tree-by-phase','independence-rules','phase-caps','worker-ownership-format','logging-format','output-schema']
};
write('.workflow/skills/README.md');
for (const [skill, refs] of Object.entries(skills)) {
  write(`.workflow/skills/${skill}/SKILL.md`, `---\nname: ${skill}\n---\n\n# ${skill}\n\n${note}\n`);
  refs.forEach((ref) => write(`.workflow/skills/${skill}/references/${ref}.md`));
}

write('.workflow/templates/README.md');
['briefs','plans','tasks','reviews','verify','ship','reflect'].forEach((kind) => {
  write(`.workflow/templates/${kind}/template.md`);
  ['frontmatter','architecture-notes','exit-gate'].forEach((section) => write(`.workflow/templates/${kind}/sections/${section}.md`));
  write(`.workflow/artifacts/${kind}/.gitkeep`);
});
write('.workflow/artifacts/README.md');
write('.workflow/learnings/README.md');
write('.workflow/learnings/curated.md');
write('.workflow/learnings/sessions/README.md');
write('.workflow/learnings/sessions/.gitkeep');
['README','check-config','check-lifecycle','check-artifacts','check-domain-placeholders','check-template-contracts'].forEach((name) => write(`.workflow/validators/${name}${name === 'README' ? '.md' : '.mjs'}`));

write('adapters/README.md');
write('adapters/codex/README.md');
write('adapters/codex/AGENTS.md', `# Codex Adapter\n\nUse \`.workflow/\` as canonical.\n\n${note}\n`);
write('adapters/claude/README.md');
write('adapters/claude/CLAUDE.md', `# Claude Adapter\n\nUse \`.workflow/\` as canonical.\n\n${note}\n`);
write('adapters/cursor/README.md');
write('adapters/cursor/rules/index.mdc', `# Cursor Adapter\n\nUse \`.workflow/\` as canonical.\n\n${note}\n`);
write('adapters/copilot/README.md');
write('adapters/copilot/copilot-instructions.md', `# Copilot Adapter\n\nUse \`.workflow/\` as canonical.\n\n${note}\n`);
write('adapters/windsurf/README.md');
write('adapters/windsurf/.windsurfrules', `# Windsurf Adapter\n\nUse \`.workflow/\` as canonical.\n\n${note}\n`);

write('examples/README.md');
['minimal-markdown-source','node-package','product-app'].forEach((name) => write(`examples/${name}/README.md`));
['validate-template','validate-example','render-adapters'].forEach((name) => write(`scripts/${name}.mjs`));

console.log('Phase 2 scaffold placeholders generated. Review and commit generated files as one local commit.');
