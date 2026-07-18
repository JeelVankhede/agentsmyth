import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';

function _expandTilde(p) {
  if (typeof p === 'string' && p.startsWith('~/')) return join(homedir(), p.slice(2));
  return p ?? null;
}

// Reads repository.mode / repository.workspace_root from repo-profile.yaml using a simple
// regex (same constraint as _readDefinitionsRoot below — no YAML parser available yet at
// this point in the file). Anchored at process.cwd(), not repoRoot, since this runs before
// repoRoot is resolved: a polyrepo-member's own repo-profile.yaml lives at
// <cwd>/workflow/config/repo-profile.yaml, exactly where single-repo's does — the same
// "invoked from the repo root" convention every other mode already assumes.
function _readWorkspaceRoot() {
  const p = join(process.cwd(), 'workflow', 'config', 'repo-profile.yaml');
  if (!existsSync(p)) return null;
  try {
    const text = readFileSync(p, 'utf8');
    const mode = text.match(/^\s*mode:\s*(.+)$/m)?.[1]?.trim();
    if (mode !== 'polyrepo-member') return null;
    const workspaceRoot = text.match(/^\s*workspace_root:\s*(.+)$/m)?.[1]?.trim();
    return workspaceRoot || null;
  } catch { return null; }
}

// Resolution order: a polyrepo-member's shared workflow/ lives outside any single
// git repo, so git-based detection can't find it — the workspace_root pointer takes priority.
// Otherwise, git-top-level detection correctly finds the one shared root for single-repo and
// monorepo alike (both are exactly one git repository spanning everything that matters). Falls
// back to process.cwd() only when git itself is unavailable (not yet a git repo — fresh init).
function _resolveRepoRoot() {
  const workspaceRoot = _readWorkspaceRoot();
  if (workspaceRoot) return _expandTilde(workspaceRoot);
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  } catch {
    return process.cwd();
  }
}

export const repoRoot = _resolveRepoRoot();

// Detect workflow root: consumer repos use workflow/, source repo build scripts override
// via AGENTSMYTH_WF env var (set to src/workflow/), fallback is legacy dotted path.
// Constructed without a literal dot+workflow string so the consumer-facing copy stays clean.
// Exported as `wf` so every validator that needs the bare directory-name string
// (e.g. to build a relative `${wf}/artifacts`-style path for listFiles/readText, which expect
// repo-root-relative input) shares this single derivation instead of re-deriving it locally —
// found duplicated across many validator files in an exhaustive audit.
const _wf = process.env.AGENTSMYTH_WF
  || (existsSync(join(repoRoot, 'workflow')) ? 'workflow' : ['.', 'workflow'].join(''));
export const wf = _wf;

// ── Two-root resolver ──────────────────────────────────────────────────────
// Reads definitions_root from repo-profile.yaml using a simple regex — no YAML
// parser dependency here since the parser is defined later in this file.
function _readDefinitionsRoot() {
  const p = join(repoRoot, 'workflow', 'config', 'repo-profile.yaml');
  if (!existsSync(p)) return null;
  try {
    const m = readFileSync(p, 'utf8').match(/^\s*definitions_root:\s*(.+)$/m);
    return m ? m[1].trim() : null;
  } catch { return null; }
}

// defsRoot: where skills, schemas, validators, and agent-behavior.yaml live.
// dataRoot: where config (user-filled), artifacts, and learnings live (always repo-local).
// Backward-compat theorem: no definitions_root + no AGENTSMYTH_HOME → defsRoot === dataRoot.
const _defsRoot = _expandTilde(_readDefinitionsRoot())
  ?? (process.env.AGENTSMYTH_HOME ? _expandTilde(process.env.AGENTSMYTH_HOME) : null)
  ?? join(repoRoot, _wf);
const _dataRoot = join(repoRoot, _wf);

// Guard: if a non-default definitions root was explicitly requested but does not exist,
// exit cleanly rather than producing an opaque ENOENT stack trace (satisfies RI1).
if (_defsRoot !== join(repoRoot, _wf) && !existsSync(_defsRoot)) {
  console.error(`agentsmyth: global definitions root not found: ${_defsRoot}`);
  console.error('Run "agentsmyth init --system" to install the global definitions.');
  process.exit(1);
}

export function defsPath(...parts) { return join(_defsRoot, ...parts); }
export function dataPath(...parts) { return join(_dataRoot, ...parts); }

export const artifactContracts = [
  {
    artifact: 'brief',
    dir: 'briefs',
    phase: 'think',
    nextPhase: 'plan',
    role: 'Architect',
    starterBlock: defsPath('skills', 'lifecycle-think', 'references', 'output-schema.md'),
    requiredSections: [
      'Source Links',
      'Problem',
      'Goals',
      'Non-Goals',
      'Requirement Manifest',
      'Architecture Notes',
      'Exit Gate',
    ],
  },
  {
    artifact: 'plan',
    dir: 'plans',
    phase: 'plan',
    nextPhase: 'build',
    role: 'Principal Engineer',
    starterBlock: defsPath('skills', 'lifecycle-plan', 'references', 'output-schema.md'),
    requiredSections: [
      'Summary',
      'Requirement Coverage',
      'Repo Impact Map',
      'Source-of-Truth Strategy',
      'Verification Plan',
      'Architecture Notes',
      'Exit Gate',
    ],
  },
  {
    artifact: 'task',
    dir: 'tasks',
    phase: 'build',
    nextPhase: 'review',
    role: 'Senior Engineer',
    starterBlock: defsPath('skills', 'lifecycle-build', 'references', 'output-schema.md'),
    requiredSections: [
      'Active Phase',
      'Branch / Repo Status',
      'Changed Files',
      'Implementation Log',
      'Verification Items',
      'Command Results',
      'Architecture Notes',
    ],
  },
  {
    artifact: 'review',
    dir: 'reviews',
    phase: 'review',
    nextPhase: 'test',
    role: 'Staff Reviewer',
    starterBlock: defsPath('skills', 'lifecycle-review', 'references', 'output-schema.md'),
    requiredSections: [
      'Findings',
      'Severity Summary',
      'Requirement Coverage',
      'Architecture Notes',
      'Verification Reviewed',
      'Residual Risk',
      'Recommendation',
    ],
  },
  {
    artifact: 'verify',
    dir: 'verify',
    phase: 'test',
    nextPhase: 'ship',
    role: 'Senior QA',
    starterBlock: defsPath('skills', 'lifecycle-test', 'references', 'output-schema.md'),
    requiredSections: [
      'Inputs',
      'Automated Checks',
      'Manifest Coverage',
      'Manual QA',
      'Generated Output Evidence',
      'Skipped Checks',
      'Architecture Notes',
      'Sign-Off',
    ],
  },
  {
    artifact: 'ship',
    dir: 'ship',
    phase: 'ship',
    nextPhase: 'reflect',
    role: 'Senior DevOps',
    starterBlock: defsPath('skills', 'lifecycle-ship', 'references', 'output-schema.md'),
    requiredSections: [
      'Ship Status',
      'Requirement Coverage',
      'PR / CI Readiness',
      'Release Readiness',
      'Source-of-Truth Status',
      'Risk And Rollback',
      'Architecture Notes',
      'Exit Gate',
      'Next Phase',
    ],
  },
  {
    artifact: 'reflect',
    dir: 'reflect',
    phase: 'reflect',
    nextPhase: 'done',
    role: 'Project Manager',
    starterBlock: defsPath('skills', 'lifecycle-reflect', 'references', 'output-schema.md'),
    requiredSections: [
      'Outcome',
      'What Worked',
      'What Did Not Work',
      'Manifest Coverage Retrospective',
      'Learning Candidates',
      'Follow-Ups',
      'Raw Session Entry',
      'Architecture Notes',
      'Exit Gate',
    ],
  },
];

export function repoPath(...parts) {
  return join(repoRoot, ...parts);
}

export function readText(pathFromRoot) {
  const abs = isAbsolute(pathFromRoot) ? pathFromRoot : repoPath(pathFromRoot);
  return readFileSync(abs, 'utf8');
}

export function pathExists(pathFromRoot) {
  const abs = isAbsolute(pathFromRoot) ? pathFromRoot : repoPath(pathFromRoot);
  return existsSync(abs);
}

export function relPath(absPath) {
  return relative(repoRoot, absPath).replaceAll('\\', '/');
}

export function listFiles(pathFromRoot) {
  const root = isAbsolute(pathFromRoot) ? pathFromRoot : repoPath(pathFromRoot);
  if (!existsSync(root)) return [];
  const out = [];

  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (stat.isFile()) {
        out.push(relPath(full));
      }
    }
  }

  walk(root);
  return out.sort();
}

// gitCwd defaults to repoRoot, preserving every existing zero-argument call site unchanged
// (single-repo/monorepo). Polyrepo-member callers pass resolveGitCwd(frontmatter) instead.
export function trackedFiles(gitCwd = repoRoot) {
  try {
    return execFileSync('git', ['ls-files'], {
      cwd: gitCwd,
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean)
      .sort();
  } catch {
    return listFiles('.');
  }
}

// Resolves which local git checkout an artifact's git-dependent checks should run against.
// Returns repoRoot unchanged unless the active repo-profile.yaml is mode polyrepo-member AND the
// artifact's frontmatter declares a target_repo — the common case (single-repo, monorepo, or a
// polyrepo-member artifact with no target_repo, meaning the repo this workflow/ install belongs
// to) is a pure passthrough, zero behavior change. On a target_repo that doesn't match any
// sibling_repos[].name, warns and falls back to repoRoot rather than throwing — evidence_policy
// favors graceful degradation over a hard failure here.
export function resolveGitCwd(frontmatter) {
  if (!frontmatter?.target_repo) return repoRoot;
  let profile;
  try {
    profile = loadYaml(dataPath('config', 'repo-profile.yaml'));
  } catch {
    return repoRoot;
  }
  const repository = profile?.repository;
  if (repository?.mode !== 'polyrepo-member' || !repository?.workspace_root) return repoRoot;
  const sibling = (repository.sibling_repos ?? []).find((s) => s.name === frontmatter.target_repo);
  if (!sibling?.path) {
    console.warn(`agentsmyth: target_repo "${frontmatter.target_repo}" not found in repo-profile.yaml's sibling_repos — using repoRoot`);
    return repoRoot;
  }
  return join(_expandTilde(repository.workspace_root), sibling.path);
}

export function assertCondition(condition, message, errors) {
  if (!condition) errors.push(message);
}

export function finish(name, errors, details = []) {
  for (const detail of details) {
    console.log(detail);
  }
  if (errors.length > 0) {
    console.error(`${name}: failed with ${errors.length} issue(s)`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }
  console.log(`${name}: ok`);
}

export function parseFrontmatter(markdown, pathForError) {
  if (!markdown.startsWith('---\n')) {
    throw new Error(`${pathForError} is missing YAML frontmatter`);
  }
  const end = markdown.indexOf('\n---\n', 4);
  if (end === -1) {
    throw new Error(`${pathForError} has unterminated YAML frontmatter`);
  }
  const yaml = markdown.slice(4, end);
  const body = markdown.slice(end + 5);
  return { frontmatter: parseYaml(yaml, pathForError), body };
}

export function headings(markdown) {
  return markdown
    .split('\n')
    .map((line) => line.match(/^##\s+(.+?)\s*$/))
    .filter(Boolean)
    .map((match) => match[1]);
}

// Parses a known, already-isolated comma-separated manifest-ID list — e.g. a plan phase's
// "**Manifest IDs:**" line value, or a task Changed Files entry's "— IDs:" tag value. NOT a
// general-purpose ID extractor for free prose (see check-coverage-ledger.mjs's waiverIds()
// for why free-text content needs a different approach). Strips parenthetical qualifiers
// before splitting on commas — this is what lets "RI2 (partial)" resolve to just "RI2", and
// "RI1 (infra supporting R2, R3, R4, R7 verification)" resolve to just "RI1" instead of
// spuriously picking up the IDs named inside the qualifier's own internal commas — then keeps
// only segments that are exactly an ID, optionally with a hyphenated sub-label suffix (e.g.
// "RI5-a" — real plans decompose one implicit requirement into per-phase sub-parts this way,
// per check-phase-map.mjs's own `startsWith(id + '-')` coverage rule; found via dogfooding
// this exact fix against system-level-install-v1.md, which uses RI5-a/RI5-b/RI5-c and
// regressed under an earlier, stricter version of this filter), discarding any other fragment.
// The ID-shape regex below is intentionally duplicated in check-manifest-coverage.mjs's
// isPureIdTag() (different semantics — whole-parenthetical rejection vs. per-segment
// extraction — so not shared) — keep both in sync if the ID shape ever changes.
export function parseIdList(raw) {
  return raw
    .replace(/\([^)]*\)/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^R(I)?[0-9]+(-[a-zA-Z0-9]+)?$/.test(s));
}

// Converts block scalars (> and |) to escaped double-quoted strings before the main parser
// runs. This keeps the line-based parser intact — block content is collapsed inline.
function preprocessBlockScalars(text) {
  const rawLines = text.split('\n');
  const out = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    // Match: <indent><key>: > or | with optional chomp indicator (- or +)
    const m = line.match(/^( *)([\w$-]+):\s*(>[-+]?|\|[-+]?)\s*$/);

    if (!m) {
      out.push(line);
      i++;
      continue;
    }

    const [, keyIndent, key, indicator] = m;
    const isFolded = indicator[0] === '>';
    const chomp = indicator.slice(1); // '' (clip), '-' (strip), or '+' (keep)

    i++;

    // Collect body lines; detect block indent from first non-empty line
    let blockIndent = -1;
    const collected = []; // { empty: bool, text: string }

    while (i < rawLines.length) {
      const raw = rawLines[i];
      const stripped = raw.trimEnd();

      if (stripped === '') {
        collected.push({ empty: true, text: '' });
        i++;
        continue;
      }

      const lineIndent = raw.match(/^ */)[0].length;
      if (blockIndent === -1) blockIndent = lineIndent;

      // Stop when a non-empty line is at or before the key's indent level
      if (lineIndent <= keyIndent.length) break;

      collected.push({ empty: false, text: raw.slice(blockIndent) });
      i++;
    }

    // Apply chomping: strip trailing empty entries unless keep (+)
    if (chomp !== '+') {
      while (collected.length > 0 && collected[collected.length - 1].empty) collected.pop();
      if (chomp === '') collected.push({ empty: true, text: '' }); // clip: one trailing newline
    }

    let joined;
    if (isFolded) {
      // Folded (>): lines within a paragraph join with a space; blank lines become paragraph breaks
      const parts = [];
      let group = [];
      for (const c of collected) {
        if (c.empty) {
          if (group.length > 0) parts.push(group.join(' '));
          parts.push('');
          group = [];
        } else {
          group.push(c.text.trimEnd());
        }
      }
      if (group.length > 0) parts.push(group.join(' '));
      // Remove lone trailing empty string left by clip
      while (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
      joined = parts.join('\n');
    } else {
      // Literal (|): preserve exact line content and newlines
      joined = collected.map(c => c.text).join('\n');
      if (chomp !== '+') joined = joined.trimEnd();
    }

    // Escape for a double-quoted YAML scalar (backslash must go first)
    const escaped = joined
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');

    out.push(`${keyIndent}${key}: "${escaped}"`);
  }

  return out.join('\n');
}

export function parseYaml(text, pathForError = '<yaml>') {
  const lines = preprocessBlockScalars(text)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((raw, index) => ({
      raw,
      index: index + 1,
      indent: raw.match(/^ */)?.[0].length ?? 0,
      text: raw.trim(),
    }))
    .filter((line) => line.text.length > 0 && !line.text.startsWith('#'));

  if (lines.length === 0) return {};
  const [value, next] = parseBlock(lines, 0, lines[0].indent, pathForError);
  if (next < lines.length) {
    throw new Error(`${pathForError}:${lines[next].index}: unexpected trailing YAML`);
  }
  return value;
}

function parseBlock(lines, start, indent, pathForError) {
  const first = lines[start];
  if (!first || first.indent < indent) return [null, start];
  if (first.text.startsWith('- ')) {
    return parseSequence(lines, start, indent, pathForError);
  }
  return parseMapping(lines, start, indent, pathForError);
}

function parseSequence(lines, start, indent, pathForError) {
  const items = [];
  let i = start;

  while (i < lines.length) {
    const line = lines[i];
    if (line.indent < indent) break;
    if (line.indent !== indent || !line.text.startsWith('- ')) break;

    const itemText = line.text.slice(2).trim();
    i += 1;

    if (itemText.length === 0) {
      const [nested, next] = parseBlock(lines, i, nextIndent(lines, i, indent), pathForError);
      items.push(nested);
      i = next;
      continue;
    }

    if (isMappingFragment(itemText)) {
      const item = {};
      const split = splitKeyValue(itemText, pathForError, line.index);
      const siblingIndent = indent + 2;

      if (split.value.length > 0) {
        item[split.key] = parseScalar(split.value);
      } else if (i < lines.length && lines[i].indent > siblingIndent) {
        const [nestedValue, next] = parseBlock(lines, i, lines[i].indent, pathForError);
        item[split.key] = nestedValue;
        i = next;
      } else {
        item[split.key] = null;
      }

      if (i < lines.length && lines[i].indent === siblingIndent && !lines[i].text.startsWith('- ')) {
        const [nestedSiblings, next] = parseMapping(lines, i, siblingIndent, pathForError);
        Object.assign(item, nestedSiblings);
        i = next;
      }
      items.push(item);
      continue;
    }

    items.push(parseScalar(itemText));
  }

  return [items, i];
}

function parseMapping(lines, start, indent, pathForError) {
  const obj = {};
  let i = start;

  while (i < lines.length) {
    const line = lines[i];
    if (line.indent < indent) break;
    if (line.indent !== indent) break;
    if (line.text.startsWith('- ')) break;

    const split = splitKeyValue(line.text, pathForError, line.index);
    i += 1;

    if (split.value.length > 0) {
      obj[split.key] = parseScalar(split.value);
      continue;
    }

    if (i < lines.length && lines[i].indent > indent) {
      const [nested, next] = parseBlock(lines, i, lines[i].indent, pathForError);
      obj[split.key] = nested;
      i = next;
    } else {
      obj[split.key] = null;
    }
  }

  return [obj, i];
}

function nextIndent(lines, index, fallback) {
  return lines[index]?.indent ?? fallback + 2;
}

function isMappingFragment(text) {
  return /^[^:]+:\s*/.test(text);
}

function splitKeyValue(text, pathForError, lineNumber) {
  const idx = text.indexOf(':');
  if (idx === -1) {
    throw new Error(`${pathForError}:${lineNumber}: expected key/value pair`);
  }
  const key = text.slice(0, idx).trim();
  const value = text.slice(idx + 1).trim();
  if (!key) {
    throw new Error(`${pathForError}:${lineNumber}: empty YAML key`);
  }
  return { key, value };
}

function parseScalar(value) {
  if (value === '[]') return [];
  if (value === '{}') return {};
  // Flow-style array: [a, b, c]. Only scalar elements are supported — this codebase's schemas
  // use flow style solely for short enum/required lists, never nested arrays or objects. Found
  // via dogfooding check-open-items.mjs: pending-setup.schema.yaml has used this same flow-style
  // `required: [...]` syntax since it was written, but nothing had ever run it through
  // validateSchema (check-pending-setup.mjs hand-rolls its own checks instead), so the gap was
  // never exercised until open-items.schema.yaml's identical syntax hit the real schema engine.
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    if (inner.length === 0) return [];
    return inner.split(',').map((part) => parseScalar(part.trim()));
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === '~') return null;
  if (/^-?[0-9]+$/.test(value)) return Number(value);
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\(["\\nt])/g, (_, c) => {
      if (c === 'n') return '\n';
      if (c === 't') return '\t';
      return c; // " or \
    });
  }
  return value;
}

export function loadYaml(pathFromRoot) {
  return parseYaml(readText(pathFromRoot), pathFromRoot);
}

export function validateSchema(value, schema, pathLabel, errors, schemaRegistry = {}, rootSchema = schema) {
  const resolved = resolveRef(schema, schemaRegistry, rootSchema);
  if (resolved !== schema) {
    validateSchema(value, resolved, pathLabel, errors, schemaRegistry, resolved);
    return;
  }

  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${pathLabel} expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${pathLabel} expected one of ${schema.enum.join(', ')}, got ${JSON.stringify(value)}`);
  }

  if (schema.oneOf) {
    const matches = schema.oneOf.filter((candidate) => {
      const nestedErrors = [];
      validateSchema(value, candidate, pathLabel, nestedErrors, schemaRegistry, rootSchema);
      return nestedErrors.length === 0;
    });
    if (matches.length !== 1) {
      errors.push(`${pathLabel} expected exactly one matching schema, got ${matches.length}`);
    }
  }

  if (schema.allOf) {
    for (const candidate of schema.allOf) {
      validateSchema(value, candidate, pathLabel, errors, schemaRegistry, rootSchema);
    }
  }

  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => matchesType(value, type))) {
      errors.push(`${pathLabel} expected type ${types.join(' or ')}, got ${actualType(value)}`);
      return;
    }
  }

  if (schema.pattern && typeof value === 'string') {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(value)) {
      errors.push(`${pathLabel} does not match pattern ${schema.pattern}`);
    }
  }

  if (schema.minLength !== undefined && typeof value === 'string' && value.length < schema.minLength) {
    errors.push(`${pathLabel} is shorter than minLength ${schema.minLength}`);
  }

  if (schema.minimum !== undefined && typeof value === 'number' && value < schema.minimum) {
    errors.push(`${pathLabel} is below minimum ${schema.minimum}`);
  }

  if (schema.minItems !== undefined && Array.isArray(value) && value.length < schema.minItems) {
    errors.push(`${pathLabel} has fewer than ${schema.minItems} item(s)`);
  }

  if (schema.uniqueItems && Array.isArray(value)) {
    const seen = new Set(value.map((item) => JSON.stringify(item)));
    if (seen.size !== value.length) {
      errors.push(`${pathLabel} has duplicate items`);
    }
  }

  if (schema.items && Array.isArray(value)) {
    value.forEach((item, index) => {
      validateSchema(item, schema.items, `${pathLabel}[${index}]`, errors, schemaRegistry, rootSchema);
    });
  }

  if (schema.properties && isPlainObject(value)) {
    for (const required of schema.required ?? []) {
      if (!(required in value)) {
        errors.push(`${pathLabel}.${required} is required`);
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in schema.properties)) {
          errors.push(`${pathLabel}.${key} is not allowed`);
        }
      }
    }

    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in value) {
        validateSchema(value[key], propSchema, `${pathLabel}.${key}`, errors, schemaRegistry, rootSchema);
      }
    }
  }

  if (schema.contains && Array.isArray(value)) {
    const matched = value.some((item, index) => {
      const nestedErrors = [];
      validateSchema(item, schema.contains, `${pathLabel}[${index}]`, nestedErrors, schemaRegistry, rootSchema);
      return nestedErrors.length === 0;
    });
    if (!matched) {
      errors.push(`${pathLabel} does not contain required value`);
    }
  }
}

function resolveRef(schema, schemaRegistry, rootSchema) {
  if (!schema.$ref) return schema;
  const ref = schema.$ref;
  if (ref.startsWith('#/$defs/')) {
    const key = ref.slice('#/$defs/'.length);
    return rootSchema.$defs?.[key] ?? schema;
  }
  return schemaRegistry[ref] ?? schema;
}

function matchesType(value, type) {
  if (type === 'object') return isPlainObject(value);
  if (type === 'array') return Array.isArray(value);
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'number') return typeof value === 'number';
  if (type === 'string') return typeof value === 'string';
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'null') return value === null;
  return true;
}

function actualType(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function schemaRegistry() {
  const registry = {};
  for (const file of listFiles(defsPath('schemas')).filter((file) => file.endsWith('.yaml'))) {
    const schema = loadYaml(file);
    if (schema.$id) {
      registry[schema.$id] = schema;
    }
  }
  return registry;
}
