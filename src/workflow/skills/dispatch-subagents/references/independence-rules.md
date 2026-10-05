# Independence Rules

Work is independent only when one worker's output cannot invalidate another worker's assumptions.

Use this checklist before dispatching. A single "yes" to any item means the candidates are **not** independent.

## Read-Only Overlap Exception

Disjoint ownership protects two distinct things: **write conflicts**, and **output the parent cannot
merge**. For a worker with no write access there are no write conflicts, so only the merge problem
remains — and a merge problem is solvable with a stated contract rather than a prohibition.

**Surface overlap between dispatched workers is permitted when both of these hold:**

1. Every overlapping worker is read-only with respect to the repository.
2. The parent declares a **dedupe-and-reconcile contract** in the active artifact before dispatch.

Overlap remains forbidden:

- for any worker with repository write access — Build's workers write, so disjointness binds
  absolutely there and this exception never applies to it;
- for read-only workers when no reconcile contract is declared.

### The contract's teeth are conflict recording

Declaring a contract is not the point; recording conflicts is. **When two findings on the same
surface reach conflicting conclusions, the conflict and its resolution must be recorded explicitly.**

A parent that silently picks one conclusion produces a wrong answer with a complete audit trail —
every finding attributed, every disposition recorded, every validator green — while discarding the
single most valuable thing the overlap produced. Disagreement between two independent readers of the
same surface is a finding in its own right, and it is the one that dissolves if consolidation is
allowed to be quiet.

This is also what makes overlap worth its cost rather than merely tolerable: overlapping workers who
agree **corroborate** each other, and overlapping workers who disagree have **found the interesting
thing**. Neither is waste, provided the disagreement cannot be swallowed.

A reconcile contract states, at minimum: how duplicate findings on a shared surface are collapsed,
and how conflicting findings on a shared surface are surfaced rather than silently resolved.

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
- [ ] The categories do not overlap in the files or contracts they inspect, **or** the Read-Only Overlap Exception applies.
- [ ] Each candidate produces a self-contained finding list with its own coverage rows.
- [ ] The parent can merge findings without re-reading either worker's full output.

**Edge cases:**
- Security review and data-model review both reading the same schema file: **not independent** by
  surface — but Review candidates are read-only, so the Read-Only Overlap Exception permits this
  once the parent declares a reconcile contract. Without that contract, still refuse.
- Two reviewers assigned the same risk category: **not independent** by definition. The exception
  covers shared *surfaces*, not duplicated *assignments* — two workers with the same charter produce
  redundancy, not corroboration.

## Think / Plan Independence Checklist

Exploration candidates are independent when:

- [ ] Each candidate answers questions in a different source area, config file, or requirement bucket, **or** the Read-Only Overlap Exception applies.
- [ ] The answer to one candidate's question does not change the scope of another candidate's question.
- [ ] The parent can integrate conflicting findings without needing both workers' full context.

**Edge cases:**
- Two explorers reading the same config file for different keys: **not independent** by surface —
  but explorers are read-only, so the Read-Only Overlap Exception permits this once the parent
  declares a reconcile contract. Without that contract, still refuse.
- Two explorers reading different source items that reference the same domain constraint: check whether the constraint affects both buckets. If yes, they share a surface — the exception applies on the same terms.
- One candidate's question *depends on* another's answer: **not independent**, and the exception does
  not help. This is a sequencing problem, not a merge problem, and no reconcile contract fixes it.

## When Unsure

If any item is uncertain, do not dispatch. Sequence locally. Coordination cost is linear; merge conflict cost is exponential.

The Read-Only Overlap Exception narrows *which* overlaps are disqualifying; it does not lower this
bar. An uncertain reconcile contract is an absent one.
