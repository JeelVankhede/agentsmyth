# Mobile — Android

## Principles

- **Material Design conventions (or the repo's chosen alternative) carry real user expectations,**
  same principle as iOS's HIG — the system back button/gesture, navigation drawer or bottom-nav
  patterns, and elevation/ripple feedback conventions are what users expect from an Android app;
  deviate deliberately, not by default.
- **The system back button/gesture is not optional to handle correctly.** Unlike iOS's
  single-direction nav-stack pop, Android's back action can be intercepted at multiple levels
  (activity, fragment, custom in-app state like an open dialog or player) — every screen needs a
  defined back behavior, not a default that surprises the user.
- **Fragmentation is real: screen sizes, OS versions, and manufacturer skins vary widely.** A layout
  tested only on one reference device/emulator will have real breakage on the actual installed
  base — design for a range, and note which OS-version floor this feature assumes.
- **Process death is more aggressive than iOS's backgrounding.** Android can kill a backgrounded
  app's process outright under memory pressure — state that must survive needs explicit
  save/restore (`onSaveInstanceState` or equivalent), not an assumption the process stays alive.

## Common Pitfalls

- Back-button/gesture handling that doesn't account for in-app modal/dialog state, so back
  dismisses the wrong thing or the whole screen unexpectedly.
- Layouts tested only against one screen density/size, breaking on the actual device fragmentation
  Android ships to.
- No explicit state save/restore for process death — a backgrounded, killed, and resumed app
  starts over instead of resuming where the user left off.
- Ignoring the minimum supported API level's actual capability gaps, using a newer API without a
  fallback or a stated version floor.

## Checklist

- [ ] Back button/gesture behavior is explicitly defined for every screen and modal state.
- [ ] Layout is tested against a real range of screen sizes/densities, not one reference device.
- [ ] State that must survive process death has explicit save/restore handling.
- [ ] Any API used has a stated minimum-supported-version floor with a fallback if needed.
- [ ] Touch targets meet the platform's minimum size guidance.
