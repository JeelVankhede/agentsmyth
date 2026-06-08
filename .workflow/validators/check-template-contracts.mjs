#!/usr/bin/env node
import {
  artifactContracts,
  finish,
  headings,
  listFiles,
  parseFrontmatter,
  pathExists,
  readText,
} from './lib.mjs';

const errors = [];
const details = [];
const placeholderPattern = new RegExp(
  ['Placeholder for a later ' + 'phase', 'Do not treat this as final workflow ' + 'behavior'].join('|'),
);
const requiredSectionFiles = ['frontmatter.md', 'architecture-notes.md', 'exit-gate.md'];

for (const file of listFiles('.workflow/templates').filter((path) => path.endsWith('.md'))) {
  if (placeholderPattern.test(readText(file))) {
    errors.push(`${file} still contains placeholder text`);
  }
}

for (const contract of artifactContracts) {
  if (!pathExists(contract.template)) {
    errors.push(`${contract.template} is missing`);
    continue;
  }

  let parsed;
  try {
    parsed = parseFrontmatter(readText(contract.template), contract.template);
  } catch (error) {
    errors.push(error.message);
    continue;
  }

  const frontmatter = parsed.frontmatter;
  const bodyHeadings = headings(parsed.body);

  if (frontmatter.artifact !== contract.artifact) {
    errors.push(`${contract.template} artifact expected ${contract.artifact}, got ${frontmatter.artifact}`);
  }
  if (frontmatter.orchestration?.phase !== contract.phase) {
    errors.push(`${contract.template} phase expected ${contract.phase}, got ${frontmatter.orchestration?.phase}`);
  }
  if (frontmatter.orchestration?.next_phase !== contract.nextPhase) {
    errors.push(`${contract.template} next_phase expected ${contract.nextPhase}, got ${frontmatter.orchestration?.next_phase}`);
  }
  for (const section of contract.requiredSections) {
    if (!bodyHeadings.includes(section)) {
      errors.push(`${contract.template} missing section "${section}"`);
    }
  }

  for (const sectionFile of requiredSectionFiles) {
    const path = `.workflow/templates/${contract.dir}/sections/${sectionFile}`;
    if (!pathExists(path)) {
      errors.push(`${path} is missing`);
      continue;
    }
    const text = readText(path);
    if (placeholderPattern.test(text)) {
      errors.push(`${path} still contains placeholder text`);
    }
  }

  details.push(`checked ${contract.template}`);
}

finish('check-template-contracts', errors, details);
