import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

export const repoRoot = process.cwd();

// Detect workflow root: consumer repos use workflow/, dev source uses the dotted variant.
// Constructed without a literal dot+workflow string so the consumer-facing copy stays clean.
const _wf = existsSync(join(repoRoot, 'workflow')) ? 'workflow' : ['.', 'workflow'].join('');

export const artifactContracts = [
  {
    artifact: 'brief',
    dir: 'briefs',
    phase: 'think',
    nextPhase: 'plan',
    role: 'Architect',
    starterBlock: `${_wf}/skills/lifecycle-think/references/output-schema.md`,
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
    starterBlock: `${_wf}/skills/lifecycle-plan/references/output-schema.md`,
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
    starterBlock: `${_wf}/skills/lifecycle-build/references/output-schema.md`,
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
    starterBlock: `${_wf}/skills/lifecycle-review/references/output-schema.md`,
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
    starterBlock: `${_wf}/skills/lifecycle-test/references/output-schema.md`,
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
    starterBlock: `${_wf}/skills/lifecycle-ship/references/output-schema.md`,
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
    starterBlock: `${_wf}/skills/lifecycle-reflect/references/output-schema.md`,
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
  return readFileSync(repoPath(pathFromRoot), 'utf8');
}

export function pathExists(pathFromRoot) {
  return existsSync(repoPath(pathFromRoot));
}

export function relPath(absPath) {
  return relative(repoRoot, absPath).replaceAll('\\', '/');
}

export function listFiles(pathFromRoot) {
  const root = repoPath(pathFromRoot);
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

export function trackedFiles() {
  try {
    return execFileSync('git', ['ls-files'], {
      cwd: repoRoot,
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean)
      .sort();
  } catch {
    return listFiles('.');
  }
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

export function parseYaml(text, pathForError = '<yaml>') {
  const lines = text
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
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === '~') return null;
  if (/^-?[0-9]+$/.test(value)) return Number(value);
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
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
  for (const file of listFiles(`${_wf}/schemas`).filter((file) => file.endsWith('.yaml'))) {
    const schema = loadYaml(file);
    if (schema.$id) {
      registry[schema.$id] = schema;
    }
  }
  return registry;
}
