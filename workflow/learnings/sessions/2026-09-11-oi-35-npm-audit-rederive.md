---
session: oi-35-npm-audit-rederive
date: 2026-09-11
chain: oi-35-npm-audit-rederive-v1
branch: chore/oi-35-npm-audit-rederive
---

# Raw Session Entry — OI-35 npm audit Re-derivation

## Context

Pre-1.1.0 open item. The `wp-r11-docs-site-v1` waiver described 3 moderate advisories with no fix
available. By the 2026-08-31 triage, the set was 8 vulnerabilities (6 moderate, 2 high), four of
them fixable. The old waiver misdescribed count, severity, and fixability — all three. This chain
took the four available fixes, re-derived the waiver over the remainder, and closed OI-35.

The chain ran on `chore/oi-35-npm-audit-rederive`, cut from `chore/open-items-triage-1.1.0`. Both
brief and plan were originally written with `user_checkpoint: none` — which let Build through Ship
run with zero user checkpoints. The user confronted this directly on 2026-09-09; all six artifacts
were corrected; brief and plan were approved by the user on 2026-09-11 via a section-by-section
walkthrough. The waiver was approved on the same date ("Continue to reflect").

## Candidate Learnings

1. **Fix-first, waive-remainder.** When some advisories are fixable and others are not, taking the
   fixes first means the waiver is smaller, more accurate, and defensible. Inheriting a prior
   waiver without re-measuring produces the failure mode this chain was opened to fix.

2. **`user_checkpoint: none` set by the agent is not a gate.** The schema permits it; nothing
   prevented it. Both `brief-review` and `plan-review` were bypassed this way. The downstream
   question — whether the schema should require justification or prohibit agent self-assignment of
   `none` — is in OI-92.

3. **Headless DOM checks must match the build's base path.** The site builds with `base:
   /agentsmyth/`. Serving `dist` at the server root causes all JS to 404 and diagrams appear
   absent. The correct harness: `--serve-base /agentsmyth/` or a symlinked directory structure
   that matches production.

4. **`npm audit fix` re-syncs stale lockfile mirror fields as a side effect.** When `package.json`
   fields (`version`, `engines`) were updated in a prior chain but `npm install` was not re-run,
   the lockfile retained the old values. `npm audit fix` re-synced them. This looks like a version
   bump in the diff and should be called out explicitly in any chain where it appears.

## Raw Notes

- Pre-fix: 8 vulns (6 moderate, 2 high). Post-fix: 4 (3 moderate, 1 high). Set cleared:
  dompurify, mermaid, nanoid, postcss. Set remaining: esbuild, vite, vitepress,
  vitepress-plugin-mermaid.
- `npm view vitepress dist-tags` → `{"latest":"1.6.4","next":"2.0.0-alpha.20"}`. No stable fix.
- `npm audit --omit=dev` → 0 throughout. Zero consumer exposure.
- `site:build` exit 0 before and after. Mermaid renders confirmed: under-hood svg=2, lifecycle
  svg=1, correct base path required.
- `validate` ok, `violations:test` 93/93 + 210/210, `conformance:test` 48/48.
- Brief and plan approved by walkthrough 2026-09-11. Waiver approved same date.
- Working tree only. No commit, push, or PR.

## Curator Marks

