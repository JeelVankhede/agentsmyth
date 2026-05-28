#!/usr/bin/env node
import { finish, readText, trackedFiles } from './lib.mjs';

const errors = [];
const term = (...parts) => parts.join('');

const excluded = [
  /^docs\/migration-from-reference-workspace\.md$/,
  /^docs\/phase-[^/]+\.md$/,
  /^examples\//,
  /^scripts\//,
  /^\.workflow\/validators\/.*\.mjs$/,
];

const textFilePattern = /\.(md|mdc|yaml|yml|mjs|js|json|txt|rules)$/;
const placeholderPatterns = [
  term('Placeholder for a later ', 'phase'),
  term('Do not treat this as final workflow ', 'behavior'),
];
const leakagePatterns = [
  term('AI ', 'Recipes'),
  term('ai-recipes', '-workspace'),
  term('engineering-', 'research-repo'),
  term('frontend-ai-', 'starter-recipes'),
  term('backend-ai-', 'starter-recipes'),
  term('Fa', 're'),
  term('Ba', 're'),
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

function isExcluded(file) {
  return excluded.some((pattern) => pattern.test(file));
}

function shouldScan(file) {
  return textFilePattern.test(file) || file === 'AGENTS.md' || file === 'README.md';
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
}

finish('check-domain-placeholders', errors);
