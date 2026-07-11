# Unit Coverage

## Principles

- **Coverage on the touched lines matters more than the repo-wide percentage.** A repo-wide
  coverage number can stay flat or even rise while the specific lines this change added are
  completely untested — adequacy judgment must look at coverage of the actual diff, not just the
  aggregate metric.
- **Coverage measures execution, not correctness.** A line being executed by a test proves nothing
  about whether the test actually asserts the right behavior — a test that calls a function but
  asserts nothing meaningful inflates coverage without adding real confidence.
- **Branch coverage matters more than line coverage for conditional logic.** A line with an
  `if/else` can be "covered" by only ever exercising one branch — for logic with real conditional
  complexity, confirm both branches (and edge conditions) are actually exercised, not just that the
  line was reached once.
- **Untested error/edge-case paths are the highest-value gap.** The happy path is usually tested
  first and adequately; the error-handling and boundary-condition paths are where real bugs hide
  and where coverage gaps matter most.

## What "Adequate" Means Here

- The specific lines/branches this diff added or changed have real, assertion-bearing tests — not
  just "coverage tool doesn't flag them red."
- Error paths and edge cases introduced by this change have at least one test each, not only the
  happy path.
- A coverage percentage alone (without checking which lines it covers) is not sufficient evidence
  of adequacy for this specific change.

## Checklist

- [ ] The diff's new/changed lines have tests that actually execute them, confirmed by name or by reading the coverage report's per-file detail, not just the aggregate number.
- [ ] Tests contain real assertions on behavior, not just "doesn't throw."
- [ ] Both branches of new conditional logic are exercised where the logic has real branching complexity.
- [ ] At least one error/edge-case path introduced by this change has a test.
