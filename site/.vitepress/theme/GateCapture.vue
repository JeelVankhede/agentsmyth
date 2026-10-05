<!--
  The capture block below is GENERATED. Do not hand-edit it.
  `npm run capture:gate` rewrites everything between the agentsmyth:capture markers with the real
  output of a real refused commit; `npm run capture:gate -- --check` fails if it has gone stale.
  See scripts/capture-gate-refusal.mjs (WP-R24).
-->
<template>
  <section class="gate-capture-wrap" aria-label="A commit refused by the lifecycle gate">
    <p class="gate-capture-label">The gate, refusing a commit whose plan was never approved</p>
    <!-- agentsmyth:capture BEGIN -->
<pre v-pre class="gate-capture"><code>$ git commit -m "plan: session handling"
all staged files are safe (workflow/docs/config or Markdown) — nothing to gate
check-commit-coverage: ok
  adapters present: AGENTS.md
check-setup-complete: ok
build: workflow/artifacts/plans/add-session-handling-v1.md → ready-for-next-phase ✓
check-lifecycle --phase build --slug add-session-handling: failed with 1 issue(s)
- build: upstream workflow/artifacts/plans/add-session-handling-v1.md's checkpoint "plan-review" is not marked approved (status: "pending").
$ echo $?
1</code></pre>
<!-- agentsmyth:capture END -->
    <p class="gate-capture-note">
      Not a mockup. Regenerated from a real refusal by <code>npm run capture:gate</code>, which fails
      if the gate ever lets that commit through.
    </p>
  </section>
</template>
