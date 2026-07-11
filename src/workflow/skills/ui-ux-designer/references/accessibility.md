# Accessibility

Cross-cutting — loads alongside every platform route, not selected independently. Accessibility is
not a platform, it's a requirement that applies within each one.

## Principles

- **Every interactive element must be operable without a pointing device.** Keyboard (web/desktop),
  switch control/external keyboard (mobile), or the platform's assistive-technology equivalent must
  be able to reach and activate every interactive element a mouse/touch user can.
- **Assistive technology needs semantic information, not just visual information.** A
  screen-reader user needs to know an element's role (button, link, heading), name (accessible
  label), and state (expanded/collapsed, checked/unchecked, disabled) — conveyed through semantic
  markup/native components or explicit ARIA/accessibility APIs, not inferred from visual styling alone.
- **Color must never be the only signal.** Any information conveyed by color (error state, status
  indicator) needs a second, non-color signal (icon, text label, pattern) for users who can't
  perceive that color distinction.
- **Focus management matters for dynamic UI.** When content changes dynamically (a modal opens, an
  item is added/removed, navigation occurs), focus must move somewhere sensible and be announced —
  a screen-reader user left with focus on a now-invisible element, or with no indication content
  changed, is lost.

## Common Pitfalls

- Interactive elements with no accessible name (an icon-only button with no label/aria-label
  equivalent) — a screen-reader announces it as "button" with no indication what it does.
- Color-only status indicators (red text for error, no icon or text label alongside it).
- Modal/dialog opens without moving focus into it, or closes without returning focus to the
  triggering element.
- Sufficient color contrast ignored — text/UI elements that fail WCAG contrast minimums are
  unreadable for low-vision users even without assistive technology.
- Motion/animation with no reduced-motion accommodation for users sensitive to it.

## Checklist

- [ ] Every interactive element is operable without a pointing device.
- [ ] Every interactive element has an accessible name conveying its purpose, not just visual styling.
- [ ] No information is conveyed by color alone.
- [ ] Focus moves sensibly on dynamic content changes (modal open/close, navigation) and is announced to assistive technology.
- [ ] Text and meaningful UI elements meet minimum contrast requirements.
- [ ] Motion-heavy interactions have a reduced-motion accommodation where the platform supports detecting the preference.
