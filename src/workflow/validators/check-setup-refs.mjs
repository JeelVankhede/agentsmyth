#!/usr/bin/env node
// check-setup-refs. Recurrence guard for the setup reference docs (R8).
//
// config-map.md and token-map.md route setup-interview answers to config fields. They are the
// primary mapping the setup agent follows in Phase 3, and they are NOT schema-validated by anything
// else (they are docs, not config instances). When they name a field that no schema actually has,
// the setup agent writes a config the schema rejects, and Phase 4's check-config only surfaces the
// breakage after the fact. This validator asserts that every config field these two docs point at
// exists in the corresponding src/workflow/schemas/*.schema.yaml — so the drift class the audit
// found (audit-remediation R1/R2/R3) cannot recur silently.
//
// It is a source-repo-only, structural check (setup/ is never shipped to a consumer), wired into
// scripts/validate-template.mjs's sourceCommands with AGENTSMYTH_WF=src/workflow.
import { defsPath, finish, loadYaml, pathExists, readText } from './lib.mjs';

const setupRefsDir = process.env.AGENTSMYTH_SETUP_REFS || 'src/setup/references';

const errors = [];
const details = [];

// Config filename → its schema. Each config's fields are qualified from that schema's own root.
const CONFIGS = ['domain', 'repo-profile', 'source-of-truth', 'verification', 'release'];
const schemaFor = {};
for (const name of CONFIGS) {
  const p = defsPath('schemas', `${name}.schema.yaml`);
  if (!pathExists(p)) {
    errors.push(`schema not found for ${name}.yaml at ${p}`);
    continue;
  }
  schemaFor[`${name}.yaml`] = loadYaml(p);
}

// Walk a dotted field path against a JSON-schema object. `[]` on a segment means "this field is an
// array; descend into its items for the next segment". A trailing `[]` on the leaf is fine (the
// field is an array and we stop there). Returns true iff every segment resolves through properties.
function fieldExists(schema, dottedPath) {
  let node = schema;
  for (const rawSeg of dottedPath.split('.')) {
    const isArray = rawSeg.endsWith('[]');
    const seg = isArray ? rawSeg.slice(0, -2) : rawSeg;
    if (!node || node.type !== 'object' || !node.properties || !(seg in node.properties)) {
      return false;
    }
    node = node.properties[seg];
    if (isArray) {
      if (node.type !== 'array' || !node.items) return false;
      node = node.items;
    }
  }
  return true;
}

// A backtick token looks like a config field path if it is dotted or array-shaped and is not a
// filename or a doc-section reference. e.g. `commands[].command`, `paths.protected[]`, `domain.name`.
const FIELD_RE = /^[a-z_][a-z0-9_]*(?:\[\]|\.[a-z0-9_]+)*$/;
function fieldTokens(cell) {
  const out = [];
  for (const m of cell.matchAll(/`([^`]+)`/g)) {
    // Drop an inline value annotation (`sources[].kind: decision` → `sources[].kind`) and any
    // trailing prose after whitespace.
    const tok = m[1].split(/[\s:]/)[0].trim();
    if (tok.includes('.md') || tok.includes('.yaml')) continue;
    if (!tok.includes('.') && !tok.endsWith('[]')) continue; // single word like `reason` — skip
    if (FIELD_RE.test(tok)) out.push(tok);
  }
  return out;
}

// ── config-map.md ──────────────────────────────────────────────────────────
// Sectioned by `## ...`. A section header names the config file(s) it writes (backticked *.yaml).
// Every field token in the section body must exist in at least one of those schemas.
const configMapPath = `${setupRefsDir}/config-map.md`;
if (!pathExists(configMapPath)) {
  errors.push(`missing ${configMapPath}`);
} else {
  const text = readText(configMapPath);
  const sections = text.split(/^## /m).slice(1);
  let checked = 0;
  for (const section of sections) {
    const header = section.split('\n', 1)[0];
    const candidateFiles = [...header.matchAll(/`([a-z-]+\.yaml)`/g)].map((m) => m[1]);
    if (candidateFiles.length === 0) continue; // section writes no config (e.g. repo-mental-map only)
    const body = section.slice(header.length);
    for (const line of body.split('\n')) {
      // Only table rows carry the actual field mapping; prose (including counter-examples that name
      // deliberately-wrong fields) is not a routing instruction and must not be validated.
      if (!line.trim().startsWith('|')) continue;
      for (const field of fieldTokens(line)) {
        checked++;
        const hit = candidateFiles.some((f) => schemaFor[f] && fieldExists(schemaFor[f], field));
        if (!hit) {
          errors.push(
            `config-map.md: field \`${field}\` not found in ${candidateFiles.join(' or ')} (section "${header.trim()}")`
          );
        }
      }
    }
  }
  details.push(`config-map.md: ${checked} field reference(s) checked against schemas`);
}

// ── token-map.md ─────────────────────────────────────────────────────────────
// Table rows: | `{{TOKEN}}` | `<...>/config.yaml` | `field.path` |. The Config cell names the file;
// the Field cell's field token(s) must exist in that file's schema.
const tokenMapPath = `${setupRefsDir}/token-map.md`;
if (!pathExists(tokenMapPath)) {
  errors.push(`missing ${tokenMapPath}`);
} else {
  const text = readText(tokenMapPath);
  let checked = 0;
  for (const line of text.split('\n')) {
    if (!/^\|\s*`\{\{/.test(line)) continue; // token rows only
    const cells = line.split('|').map((c) => c.trim());
    // cells: ['', `{{TOKEN}}`, `config.yaml`, `field`, '']
    const fileMatch = cells[2]?.match(/`[^`]*?([a-z-]+\.yaml)`/);
    if (!fileMatch) continue;
    const file = fileMatch[1];
    for (const field of fieldTokens(cells[3] || '')) {
      checked++;
      if (!(schemaFor[file] && fieldExists(schemaFor[file], field))) {
        errors.push(`token-map.md: field \`${field}\` not found in ${file} (token row: ${cells[1]})`);
      }
    }
  }
  details.push(`token-map.md: ${checked} field reference(s) checked against schemas`);
}

finish('check-setup-refs', errors, details);
