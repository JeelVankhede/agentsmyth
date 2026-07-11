# Mobile — iOS

## Principles

- **Human Interface Guidelines conventions carry real user expectations.** Navigation patterns
  (tab bar for top-level sections, nav-stack push/pop with a back gesture), standard gestures
  (swipe-back, pull-to-refresh), and system typography/spacing are not arbitrary — deviating from
  them has a real relearning cost for users, so deviate deliberately, not by default.
- **Safe areas and dynamic type are not optional.** Content must respect safe-area insets (notch,
  home indicator) and scale with the user's chosen text size (Dynamic Type) — a fixed-size layout
  that ignores either breaks on real devices/real accessibility settings, not just edge cases.
- **Every screen needs a defined state for interruption.** Backgrounding, incoming calls, low
  memory (view controller reload) — iOS can interrupt a screen's flow at any point; state that
  needs to survive must be explicitly persisted, not assumed to remain in memory.
- **Offline and poor-connectivity states are the norm on mobile, not the exception.** Design for
  "the network call is slow or fails" as a primary state, not a rare edge case.

## Common Pitfalls

- Hardcoded layout dimensions that don't respect safe-area insets, breaking on notched devices.
- Ignoring Dynamic Type — text that doesn't scale, or a layout that breaks/truncates when it does.
- Custom back-navigation that doesn't support the standard edge-swipe gesture users expect.
- No state restoration story — an app that loses the user's place after a backgrounding-induced reload.

## Checklist

- [ ] Layout respects safe-area insets on all supported device form factors.
- [ ] Text scales correctly with Dynamic Type settings without breaking layout.
- [ ] Standard navigation gestures (swipe-back, pull-to-refresh where applicable) work as expected.
- [ ] Screen state that must survive backgrounding/reload is explicitly persisted.
- [ ] Offline/slow-network states are designed, not left to whatever the default error looks like.
