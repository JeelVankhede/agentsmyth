# Regenerating the gate capture

The README and the docs site home both carry a terminal capture of the lifecycle gate refusing a
commit. It is the one claim on those pages a reader cannot check by reading source, so it is
**generated from a real refusal** and never written by hand.

```sh
npm run capture:gate            # rebuild the fixture, provoke the refusal, rewrite both copies
npm run capture:gate -- --check # verify the published copies still match a fresh refusal
```

## What the script does

`scripts/capture-gate-refusal.mjs`:

1. Reads `tuning.council.sandbox_root` from `workflow/config/repo-profile.yaml` and rebuilds a
   throwaway consumer repo at `<sandbox_root>/gate-demo`. It refuses to run if that path resolves
   somewhere shallow, inside the repo, or onto your home directory.
2. Assembles the fixture from `src/assets/` — configs with every `<PLACEHOLDER>` filled, the seven
   artifact directories, `workflow/learnings/`, a knowledge map, an `AGENTS.md` adapter, and
   `src/assets/hooks/pre-commit` installed as the repo's real pre-commit hook.
3. Points the fixture's `bin/agentsmyth.mjs` at **this** repo's CLI and stamps `agentsmyth_version`
   from this repo's `package.json`, so the capture shows the behaviour of the code shipping beside it
   and no version-skew banner appears.
4. Stages a plan artifact that claims `orchestration.status: ready-for-next-phase` while carrying an
   unapproved `plan-review` checkpoint, then runs `git commit`.
5. Refuses to publish if the commit **succeeds**, if the transcript contains no failure line, or if it
   contains a local path, a home directory or a version-skew banner.
6. Writes the transcript into `README.md` and `site/.vitepress/theme/GateCapture.vue`, between
   `<!-- agentsmyth:capture BEGIN -->` / `<!-- agentsmyth:capture END -->` markers.

## What to verify after running it

- `git status` — a second consecutive run must leave the tree unchanged. The script is idempotent and
  a diff on the second run means something is non-deterministic.
- `npm run capture:gate -- --check` exits 0.
- `npm run site:build` exits 0 and the capture renders between the hero actions and the features grid.

## Rules

- **Never hand-edit the block.** The script is the only writer, and both published copies must stay in
  step; `--check` compares them.
- **Never edit the hook to make the output prettier.** The capture's whole value is that it is the real
  output of the shipped gate.
- The marker namespace is `agentsmyth:capture`, deliberately distinct from the `agentsmyth:<version>`
  markers `init` writes into `AGENTS.md` — that grammar is located by pattern, and a capture block
  wearing a version stamp would be a candidate match for it.
- `capture:gate` is deliberately **not** a `*:test` script: the conformance rule
  `r22-every-suite-runs-in-ci` requires every `:test` script to run in CI, and this one needs a
  writable scratch repo outside the checkout.
