# Verification Review

Review verifies the quality of evidence before Test formalizes it.

Inspect:

- Build command results
- Plan verification rows
- task verification items
- generated-output evidence
- manual QA notes
- skipped or not-run checks
- existing verify artifact when reviewing a rerun

Finding triggers:

- command claimed but no exact command/output/evidence exists
- configured command skipped without reason and risk
- failure not fixed, rerun, blocked, or waived
- manual QA lacks environment, steps, expected result, observed result, or evidence
- generated-output check relies only on source inspection
- requirement has no planned or actual evidence

Review does not need to rerun every command, but it must not claim evidence is stronger than what exists.
