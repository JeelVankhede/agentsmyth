#!/usr/bin/env node
import { artifactContracts, finish, headings, pathExists, readText } from './lib.mjs';

const errors = [];
const details = [];

for (const contract of artifactContracts) {
  if (!pathExists(contract.starterBlock)) {
    errors.push(`${contract.starterBlock} is missing`);
    continue;
  }

  const text = readText(contract.starterBlock);
  const h2 = headings(text);

  if (!h2.includes('Starter Block')) {
    errors.push(`${contract.starterBlock} is missing a "## Starter Block" section`);
  }

  details.push(`checked ${contract.starterBlock}`);
}

finish('check-starter-blocks', errors, details);
