# Web

## Principles

- **Semantic HTML first, ARIA second.** A native `<button>` gets keyboard interaction, focus
  handling, and screen-reader semantics for free; a `<div onClick>` styled to look like a button
  requires manually reimplementing all of that with `role`, `tabindex`, and key handlers — use the
  native element unless there's a concrete reason not to.
- **Responsive means designed for a range, not just "shrinks."** A layout that merely reflows at
  narrow widths without reconsidering information density, touch-target size, and navigation
  pattern is not truly responsive — design breakpoints around actual content/interaction needs, not
  arbitrary pixel widths.
- **Every interactive state needs a visual design, not just the "happy path."** Hover, focus,
  active, disabled, loading, and error states are part of the component's design, not an
  implementation afterthought — an undesigned focus state is both a UX gap and an accessibility gap.
- **Progressive enhancement over graceful degradation where feasible.** Core functionality should
  work without JS where reasonably possible (form submission, navigation); JS enhances the
  experience rather than being a hard requirement for baseline function.

## Common Pitfalls

- Removing the browser's default focus outline without providing a replacement — leaves keyboard
  users with no visible indication of focus position.
- Fixed pixel widths/heights on containers that should flex with content or viewport.
- Click handlers on non-interactive elements (`<div>`, `<span>`) without the accompanying
  keyboard/role/focus work that makes them actually operable by keyboard.
- Loading states that show nothing (blank screen) instead of a skeleton/spinner, giving no
  feedback that something is happening.

## Checklist

- [ ] Interactive elements use native semantic HTML where possible, not styled non-interactive elements.
- [ ] Every interactive state (hover, focus, active, disabled, loading, error) has a defined visual design.
- [ ] Layout is designed for a range of viewport widths with reconsidered density, not just reflow.
- [ ] Focus indicators are visible and not simply removed.
- [ ] Core functionality degrades reasonably without JavaScript where feasible.
