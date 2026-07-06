# Generated Output Verification

Generated output must be verified when the plan, repo profile, or changed files indicate generated artifacts.

Possible evidence:

- regeneration command and result
- diff between generated output and expected output
- snapshot comparison
- fixture/example inspection
- source-to-output mapping check
- explicit waiver when generation is not possible

Record:

- source file or config
- generated path
- command or inspection method
- expected relationship
- observed relationship
- manifest IDs covered
- result

Rules:

- Do not claim generated-output correctness from source inspection alone.
- If source changes but generated output does not, record why.
- If generated output changes without source changes, record why.
- If generation tooling is unavailable, record skipped check risk and owner.
