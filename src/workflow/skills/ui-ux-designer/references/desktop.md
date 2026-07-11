# Desktop

## Principles

- **Keyboard and mouse are both first-class, not just touch adapted to a bigger screen.** Desktop
  users expect full keyboard operability (tab order, keyboard shortcuts for frequent actions,
  Escape to cancel/close) and precise mouse interactions (hover states, right-click context menus
  where conventional) — a UI ported from mobile touch targets without this feels foreign.
- **Window management is part of the design.** Resizable windows, multi-monitor setups, and
  window-state persistence (remembering size/position) are real desktop expectations — a layout
  that only works at one fixed size fails immediately on a different display.
- **Menu bar / system-level conventions carry real expectations per OS.** Where the app runs
  (Windows/macOS/Linux) has different conventions for menu placement, keyboard shortcut modifiers
  (Ctrl vs Cmd), and window-chrome behavior — respect the host OS's conventions rather than
  imposing one OS's pattern on all of them.
- **Idle/background behavior matters for long-running desktop apps.** Unlike a mobile app that's
  frequently backgrounded/killed, a desktop app may run for days — memory growth, stale cached
  data, and resource leaks that wouldn't matter in a short mobile session become real problems.

## Common Pitfalls

- No keyboard path for an action that's only reachable by mouse click — breaks keyboard-only and
  assistive-technology users.
- Fixed-size windows/dialogs that don't handle resize, or that look wrong at very large/small window sizes.
- Hardcoding one OS's keyboard modifier convention (e.g., always `Ctrl`) instead of the
  platform-appropriate one (`Cmd` on macOS).
- No consideration of long-running-process resource growth (memory leaks, unbounded caches) for an
  app expected to run for extended periods.

## Checklist

- [ ] Every action reachable by mouse also has a keyboard path.
- [ ] Layout handles window resize and multiple display configurations reasonably.
- [ ] Keyboard shortcuts use the host OS's conventional modifier keys, not one OS's convention hardcoded.
- [ ] Long-running resource usage (memory, caches) is bounded or periodically reclaimed.
