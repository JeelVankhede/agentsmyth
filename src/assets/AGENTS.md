# agentsmyth

This repository runs a gated engineering lifecycle. Read this before any implementation work.

**If `.agentsmyth/` exists, setup has not finished.** Read `.agentsmyth/setup-bundle.md` and run the
setup skill before anything else. It resolves the open items in `workflow/config/pending-setup.yaml`
and removes `.agentsmyth/` when done. Do not start lifecycle work while that directory is present.

**Find the definitions.** Start at `workflow/router.md`. If that file is absent, read
`definitions_root` from `workflow/config/repo-profile.yaml` and load `<definitions_root>/router.md`
instead — this repo links to a global install rather than keeping a local copy. Every other
`workflow/...` path below resolves the same way: local if present, otherwise under
`<definitions_root>/`. `workflow/artifacts/` is always repo-local.

**Route the work.** `workflow/router.md` classifies the request and selects the phase.
`workflow/lifecycle.md` defines the phase order and the artifact each phase must write before the
next one may start.

{{GATE_PARAGRAPH}}

This block is a pointer to the contract, not the contract itself.
