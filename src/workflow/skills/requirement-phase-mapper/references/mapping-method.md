# Mapping Method

How phase coverage is determined from a plan's `## Phases` section.

1. Split the `## Phases` section into blocks by `### Phase N` headings. The section boundary is
   the *next level-2 heading* (`## `), not a standalone `---` divider — plans commonly use `---`
   as a visual separator *between* phases, which is not a section boundary. (Found via dogfooding:
   an earlier version of this method stopped at the first `---`, truncating every real multi-phase
   plan after Phase 1.)
2. For each block, extract the `**Manifest IDs:**` line's comma-separated ID list — this is the
   authoritative coverage statement for that phase, not the prose Work/Touches text (which may
   mention IDs incidentally without them being "owned" by that phase).
3. An active ID is covered if it appears exactly in some phase's list, OR if a phase lists a
   hyphenated sub-label of it (`RI5` is covered by `RI5-a`, `RI5-b`, etc. — a legitimate per-phase
   decomposition pattern, not separate IDs).
4. An ID with no phase covering it (exactly or via sub-label) is an orphan.
5. An ID cited by multiple phases is not flagged — real plans commonly and legitimately spread a
   cross-cutting concern (e.g. a full-suite verification gate) across every phase with no separate
   annotation. This is a deliberate scope decision, not an oversight: distinguishing legitimate
   multi-phase coverage from an accidental duplicate requires reading intent, which this mechanical
   check does not attempt.
6. A phase's exit gate is binary when it states an observable command, file existence, or grep
   result — not adjective-only language ("done", "complete", "works correctly" with no named check).
