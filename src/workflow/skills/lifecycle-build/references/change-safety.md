# Change Safety

Build must preserve the user's repository state.

Safety rules:

- Inspect status before edits.
- Read files before changing them.
- Use the repo's existing style and helper APIs.
- Keep changes minimal and tied to manifest IDs.
- Avoid destructive commands unless the user explicitly requested them.
- Do not revert unrelated changes.
- Do not overwrite generated output unless the Plan names the source and regeneration path.
- Do not stage or commit unrelated files.

Stop when:

- unrelated changes overlap planned files
- the working tree cannot be safely preserved
- generated files appear stale but the source file and regeneration path are unclear
- a command would require unavailable network/tooling and no waiver exists
