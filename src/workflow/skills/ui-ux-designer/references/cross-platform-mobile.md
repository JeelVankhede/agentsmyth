# Cross-Platform Mobile

## Principles

- **"Write once" does not mean "look identical."** A cross-platform framework (React Native,
  Flutter, etc.) sharing logic across iOS and Android is the goal; the UI should still respect each
  platform's own navigation and interaction conventions (back gesture, tab-bar placement,
  platform-typical modal presentation) where the framework allows it — a UI that's identical on
  both platforms often feels wrong on at least one of them.
- **Bridge/native-module boundaries are integration boundaries.** Any call from the cross-platform
  layer into native code crosses a real boundary with its own failure modes (native crash, async
  timing mismatch, platform API unavailable) — treat it with the same rigor as an external service
  call, not as a transparent function call.
- **Platform-specific escape hatches should be scoped, not scattered.** When a feature genuinely
  needs platform-specific behavior, isolate that branching to one well-named location (a platform
  adapter, a `.ios.`/`.android.` file split) rather than `if (Platform.OS === 'ios')` checks spread
  across the codebase.
- **Performance characteristics differ from native even when the API looks the same.** A
  cross-platform framework's rendering/bridge overhead means a pattern that's cheap in native code
  (frequent small re-renders, deep view hierarchies) can be measurably more expensive — don't assume
  native-platform performance intuitions transfer directly.

## Common Pitfalls

- Pixel-identical UI copy-pasted across platforms with no consideration of platform-typical
  navigation/interaction conventions.
- Native-module calls with no error handling for the case where the native side isn't available
  (different OS version, different platform entirely) or throws.
- Platform-specific conditionals scattered throughout business logic instead of isolated to a clear
  adapter layer.
- Deep, frequently-re-rendering component trees that would be fine in native code but cause real
  jank through the framework's bridge/rendering overhead.

## Checklist

- [ ] Platform-specific navigation/interaction conventions are respected where the framework allows, not flattened to one identical UI.
- [ ] Native-module/bridge calls have explicit error handling for unavailability or failure.
- [ ] Platform-specific branching is isolated to a clear adapter layer, not scattered through business logic.
- [ ] Component structure considers the framework's actual rendering/bridge overhead, not native-platform performance assumptions.
