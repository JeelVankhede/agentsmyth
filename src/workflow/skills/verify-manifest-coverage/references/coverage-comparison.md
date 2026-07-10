# Coverage Comparison

How to derive the diff's actual manifest coverage and compare it to Review's declared coverage.

1. Read the task artifact's `Changed Files` section — each line is `path — description — IDs:
   <R/RI list>`. Union all listed IDs across all lines to get the task-derived coverage set.
2. Read the review artifact's frontmatter `manifest_ids` — this is the review-declared coverage
   set.
3. Set comparison:
   - IDs in task-derived but not review-declared: the review is claiming less coverage than the
     diff actually touched — likely an oversight in Review's own scoping.
   - IDs in review-declared but not task-derived: the review claims coverage for something the
     diff never touched — likely stale IDs carried over from the brief without confirming Build
     actually implemented them.
4. Either direction is a delta requiring explanation before the Exit Gate passes. A legitimate
   explanation names the specific reason (e.g. "R5 was already covered in a prior version, no new
   change needed this round — confirmed via git blame").
