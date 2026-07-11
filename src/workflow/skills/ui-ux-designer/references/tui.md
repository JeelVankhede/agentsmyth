# TUI (Terminal UI)

## Principles

- **Keyboard is the only input — every action needs a discoverable keybinding.** There is no mouse
  fallback in most terminal environments; every interactive element must be reachable and its
  keybinding either shown on-screen or discoverable via a help overlay, not memorized folklore.
- **Terminal capability varies widely and must degrade gracefully.** Color depth (16/256/truecolor),
  Unicode/box-drawing character support, and terminal size are not guaranteed — detect capability
  and fall back (plain ASCII borders, reduced color palette) rather than assuming a modern
  full-featured terminal.
- **Screen real estate is precious and dynamic.** Terminal window size can be tiny or huge and can
  change at any time (user resizes the window) — layout must respond to resize events, and design
  for a genuinely small minimum size, not just a comfortable default.
- **Non-interactive/piped output must be a distinct, sane mode.** A TUI invoked with stdout piped
  to a file or another command should not emit ANSI escape codes/interactive rendering into that
  stream — detect non-TTY output and switch to a plain, scriptable mode.

## Common Pitfalls

- Hardcoded assumptions about terminal width/height, breaking or rendering garbled output on resize
  or on a genuinely small terminal.
- No plain-text/non-interactive fallback when stdout isn't a TTY — corrupts piped/redirected output
  with escape codes.
- Relying on true-color or Unicode box-drawing with no fallback for terminals that don't support
  them (SSH sessions, older terminals, some CI log viewers).
- Keybindings with no on-screen hint or help overlay, undiscoverable without external documentation.

## Checklist

- [ ] Every interactive action has a keybinding, and it is discoverable on-screen or via help.
- [ ] Layout responds correctly to terminal resize, and has a defined behavior at a small minimum size.
- [ ] Color/Unicode usage has a graceful fallback for terminals that don't support it.
- [ ] Non-TTY (piped/redirected) invocation produces plain, scriptable output, not interactive escape codes.
