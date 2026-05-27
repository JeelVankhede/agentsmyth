# Generated Output Review

Generated output must be reviewed against its source and regeneration contract.

Inspect:

- configured generated-output paths in repo profile
- commands or scripts that produce output
- source templates, schemas, examples, or fixtures
- task evidence showing whether output was regenerated or intentionally left unchanged
- diffs in generated files, snapshots, or docs derived from source

Finding triggers:

- source changed but generated output did not
- generated output changed without source or command evidence
- output contains stale domain-specific or control-plane assumptions
- generated artifacts are manually edited when config says they must be regenerated
- generated-output verification is missing from Build/Test evidence

If generated output is not configured or not in scope, record that as not applicable only after checking repo profile and plan context.
