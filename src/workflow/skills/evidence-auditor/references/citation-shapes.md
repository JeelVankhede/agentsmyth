# Citation Shapes

What counts as a resolvable citation for a verified-fact claim.

Acceptable:

- **Command output** — the exact command and its current-turn output (or a clearly labeled
  re-run), not a description of what the command "should" print.
- **File path** — a specific path plus the specific content at that path supporting the claim
  (a line number or quoted excerpt), not just "see the file."
- **Artifact reference** — a path to another lifecycle artifact plus the section that carries the
  supporting content (e.g. "Verification Plan row for R3").
- **User-provided proof** — something the user explicitly stated or pasted in this session,
  attributed as such.

Not acceptable:

- "Should work," "should have passed," "presumably," "as expected."
- A citation to a command that was run in a prior session and not re-verified this turn, when the
  claim concerns current state (e.g. CI status, PR merge state) that can change between sessions.
- A citation that names a file or command without saying what specific result it produced.
