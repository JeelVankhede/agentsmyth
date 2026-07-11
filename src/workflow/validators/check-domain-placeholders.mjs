#!/usr/bin/env node
import { finish, readText, trackedFiles } from './lib.mjs';

const errors = [];
const term = (...parts) => parts.join('');

const excluded = [
  /^docs\/archive\//,
  /^docs\/gap-analysis-[^/]+\.md$/,
  /^examples\//,
  /^scripts\//,
  /^src\/workflow\/validators\/.*\.mjs$/,
  // Dev-workspace dogfood lifecycle artifacts — never shipped (see CLAUDE.md's source vs.
  // workspace vs. shipped table), so leakage/placeholder rules for shipped template content
  // do not apply. Found via audit: "Bare init" (ordinary English, not the old starter naming)
  // and "multi-repo" (legitimate WP-R5 architecture discussion) were false-flagged here.
  /^workflow\/artifacts\//,
];

const textFilePattern = /\.(md|mdc|yaml|yml|mjs|js|json|txt|rules)$/;
const placeholderPatterns = [
  term('Placeholder for a later ', 'phase'),
  term('Do not treat this as final workflow ', 'behavior'),
];

// True source leakage. These name the original multi-repo workspace and must
// never appear in this template, regardless of file.
const leakagePatterns = [
  term('AI ', 'Recipes'),
  term('ai-recipes', '-workspace'),
  term('engineering-', 'research-repo'),
  term('frontend-ai-', 'starter-recipes'),
  term('backend-ai-', 'starter-recipes'),
  term('Fa', 're'),
  term('workspace ', 'root'),
  term('repos', '/'),
  term('Codex', '-only'),
  term('Notion ', 'required'),
  term('npm run check', ':dist as default'),
  term('.agents', '/'),
  term('docs/', 'briefs'),
  term('docs/', 'plans'),
  term('docs/', 'tasks'),
  term('docs/', 'verify'),
  term('docs/', 'ship'),
  term('docs/', 'reflect'),
  term('child ', 'repo'),
  term('multi', '-repo'),
];

// "Bare" (the other half of the old "fare/bare" starter-naming pair) collides with ordinary
// English ("bare init", "bare minimum") far too often to be a standalone pattern — found via
// audit: false-flagged "Bare init" in this repo's own dogfood artifacts. The real leak signal is
// the paired naming, so only flag "Bare" when "Fare" also appears in the same file.
const pairedLeakagePattern = { primary: term('Ba', 're'), requiresAlso: term('Fa', 're') };

// Repo-relative phrasing. Legitimate in setup/ and docs/ (which describe the
// porting process and never get copied), but banned inside workflow/ (shipped content)
// because that content is copied into the target repo and must stay repo-neutral.
const workflowOnlyPatterns = [
  term('this ', 'repository'),
];

function isExcluded(file) {
  return excluded.some((pattern) => pattern.test(file));
}

function shouldScan(file) {
  return textFilePattern.test(file) || file === 'AGENTS.md' || file === 'README.md';
}

function isWorkflowFile(file) {
  // src/workflow/ is source; workflow/ is dev workspace — both are shipped content
  return file.startsWith('src/workflow/') || file.startsWith('workflow/');
}

for (const file of trackedFiles()) {
  if (isExcluded(file) || !shouldScan(file)) continue;
  const text = readText(file);
  for (const pattern of placeholderPatterns) {
    if (text.includes(pattern)) {
      errors.push(`${file} contains placeholder marker "${pattern}"`);
    }
  }
  for (const pattern of leakagePatterns) {
    if (text.includes(pattern)) {
      errors.push(`${file} contains reference-specific term "${pattern}"`);
    }
  }
  if (text.includes(pairedLeakagePattern.primary) && text.includes(pairedLeakagePattern.requiresAlso)) {
    errors.push(`${file} contains reference-specific term "${pairedLeakagePattern.primary}" alongside "${pairedLeakagePattern.requiresAlso}"`);
  }
  if (isWorkflowFile(file)) {
    for (const pattern of workflowOnlyPatterns) {
      if (text.includes(pattern)) {
        errors.push(`${file} contains repo-relative term "${pattern}" (banned in shipped workflow content)`);
      }
    }
  }
}

finish('check-domain-placeholders', errors);
