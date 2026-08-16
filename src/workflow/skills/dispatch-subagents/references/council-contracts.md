# Council Contracts

Shared contracts for council-mode dispatch: the **disposition** every finding carries, and the
**evidence class** every finding declares.

These live here, in the dispatch contract, rather than inside any one council skill. Both the Think
council and the Review council consume them, and a Review council that inherited its contracts from
a Think-specific skill would couple the two in the wrong direction. Treat this file as frozen once
a council ships against it: a shape change here propagates into every phase that runs a council,
including one whose verdict blocks commits.

---

## Disposition Contract

Every council finding — research or challenge — carries exactly one disposition when the parent
consolidates it.

| Disposition | Meaning |
|---|---|
| `accepted` | The finding stands as reported and informs the artifact. |
| `merged` | The finding was combined with one or more other findings; the merge target is named. |
| `rejected-with-reason` | The finding was not carried forward, and the reason is stated. |

Rules:

- The three values are exhaustive. A finding with no disposition, or any other value, is invalid.
- `rejected-with-reason` requires a non-empty reason. An empty reason fails the phase gate — this is
  the one rule in this file with no judgment component, and it exists because "rejected" without a
  reason is indistinguishable from "ignored".
- `merged` names what it merged into, so the trail from finding to artifact stays traceable.
- A rejection is a **normal outcome**, not an exception path. A challenger whose findings are never
  rejected and a challenger who never rejects anything are both signals worth noticing; neither is
  an error.

## Evidence Class Contract

Every finding declares the class of evidence it rests on. The class determines what the finding is
allowed to conclude, and how strongly the record can be checked.

| Class | Citation contract | Enforcement level |
|---|---|---|
| `repo` | file path, plus line range or command output where applicable | **resolved** — the path must exist and any line range must be within bounds |
| `trial` | sandbox path, the command run, and the observed output | **shape + non-empty output** — presence is auditable, the result itself is not verifiable |
| `web` | URL, retrieval date, and an inline verbatim quote of the claim relied on | **shape only** — the quote cannot be checked against the page |
| `recall` | explicitly marked as model knowledge; carries no citation | **cannot solely support** any recommendation or question resolution |

### Why `repo` citations must resolve

The agent declares its own class. A rule that constrains `recall` is therefore routed around by
labelling a recollection as `repo` with a plausible-looking path — a constraint the constrained party
can opt out of by relabelling is not a constraint. `recall` is also the cheapest class to produce: no
search, no file read, no sandbox. It is what an agent drifts toward under pressure to converge.

Requiring `repo` citations to resolve makes the most attractive relabelling target mechanically
expensive, using filesystem checks and no judgment.

### Why `web` is scoped by question type

A `web` citation may solely support a recommendation only for genuinely **external** facts — API
semantics, specification behaviour, upstream defaults, third-party version support.

For a **repo-shaped** question, `web` may corroborate but may not decide. The repo is present and
`repo` citations resolve mechanically, so the class with no mechanical floor stays confined to the
questions where it is the only option available.

### Why `recall` cannot stand alone

`recall` may raise a hypothesis. It may not resolve one. A recommendation whose only evidence
references are `recall` is invalid, regardless of how confident the finding reads — confidence is
precisely what this class produces without warrant.

A `recall` hypothesis corroborated by a `repo` or `trial` finding is valid, and is the intended use
of the class: it is how the model's knowledge contributes without being trusted on its own.

## What These Contracts Do Not Establish

Stated plainly, because a contract this specific invites the assumption that it guarantees more than
it does:

- That a finding is **correct**. Disposition and class describe provenance, not truth.
- That a `repo` citation which resolves actually **informed** the finding attached to it.
- That a `web` quote was genuinely **present** at the cited URL. Nothing in this system can fetch it.
- That a rejection reason is a **good** reason. Only that one was given.

These are contracts about what the record must contain, not claims about the quality of the thinking
that produced it.
