# Source-of-Truth Review

Review source-of-truth handling when requirements, docs, generated output, release notes, or external handoff depend on configured sources.

Inspect:

- `.workflow/config/source-of-truth.yaml`
- source links in the brief
- source strategy in the plan
- task evidence for source reads or handoff notes
- blocked handoff or waiver entries

Finding triggers:

- required source was not read
- changed files conflict with source authority
- source update is required but no Ship handoff exists
- agent claims an external update without evidence
- source provider is treated as mandatory without config/user instruction
- source ambiguity is hidden as an assumption instead of a blocker

Source updates usually belong to Ship. Review should flag missing handoff rather than perform the update.
