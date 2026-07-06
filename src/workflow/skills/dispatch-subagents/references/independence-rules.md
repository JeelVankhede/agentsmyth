# Independence Rules

Work is independent only when one worker's output cannot invalidate another worker's assumptions.

Use this checklist before dispatching. A single "yes" to any item means the candidates are **not** independent.

## Build Independence Checklist

- [ ] Do the candidates touch any of the same files or directories?
- [ ] Do the candidates share any import, export, module boundary, or package entry point?
- [ ] Do the candidates share a schema, config file, fixture, migration, or test file?
- [ ] Do the candidates share a generated-output source file or generated target path?
- [ ] Do the candidates share a public contract or documented API surface?
- [ ] Do the candidates share a docs promise, changelog entry, or release note?
- [ ] Do the candidates share a source-handoff surface, source item, or release artifact?
- [ ] Do the candidates both need to read or write the same branch state or git index?
- [ ] Would one candidate's change break the other candidate's assumptions about file content?

**Edge cases:**
- Two workers adding different functions to the same file: **not independent** — they share the file.
- Two workers adding functions to different files in the same module: check imports. If either file imports the other, **not independent**.
- Two workers updating different config keys in the same YAML: **not independent** — they share the file.
- Two workers adding separate test suites to different test files with no shared fixtures: may be independent — verify no shared fixture, schema, or import.

## Review Independence Checklist

Review candidates are independent by risk category when all of the following hold:

- [ ] Each candidate reviews a different named risk category (e.g. security, data model, verification, release).
- [ ] The categories do not overlap in the files or contracts they inspect.
- [ ] Each candidate produces a self-contained finding list with its own coverage rows.
- [ ] The parent can merge findings without re-reading either worker's full output.

**Edge cases:**
- Security review and data-model review both reading the same schema file: **not independent** — they share the inspection target.
- Two reviewers assigned the same risk category: **not independent** by definition.

## Think / Plan Independence Checklist

Exploration candidates are independent when:

- [ ] Each candidate answers questions in a different source area, config file, or requirement bucket.
- [ ] The answer to one candidate's question does not change the scope of another candidate's question.
- [ ] The parent can integrate conflicting findings without needing both workers' full context.

**Edge cases:**
- Two explorers reading the same config file for different keys: **not independent** — they share the source.
- Two explorers reading different source items that reference the same domain constraint: check whether the constraint affects both buckets. If yes, **not independent**.

## When Unsure

If any item is uncertain, do not dispatch. Sequence locally. Coordination cost is linear; merge conflict cost is exponential.
