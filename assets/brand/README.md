# Brand assets

The mark is a forge ring: a circle drawn as exactly seven equal arc segments with even gaps, wrapping a solid anvil silhouette. Seven segments map to the seven lifecycle phases, and the gaps between them are the gates. This count is load-bearing. A version of this mark with six or eight segments is not a stylistic variant, it is a wrong asset, and it should be rejected in review the same way a typo in the wordmark would be.

## Which file to use where

In a README rendered on GitHub, use the light and dark SVGs together through a `<picture>` element with a `prefers-color-scheme` source, the way the root `README.md` does it. GitHub strips `<style>` blocks out of inline SVG, so the auto variant will not switch themes there even though it opens correctly as a standalone file. The picture pair is the only reliable method on GitHub.

On the web, in the docs site header, or anywhere the SVG is loaded as its own document (an `<img src>`, a favicon link, a VitePress `logo` config entry), use the auto variant. It carries its own `prefers-color-scheme` media query and switches on its own.

For print, slide decks, or any promo surface where you know the background color in advance and are not relying on the system theme, use the explicit light or dark variant that matches that background. Do not use the auto variant there. A slide deck exported to PDF has no concept of a system color scheme, and an auto variant sitting on the wrong background will render in the wrong ink color with no way to detect or fix it after the fact.

## The seven-segment rule

The ring's `stroke-dasharray` is derived from its radius, not chosen freehand. At `r="27"` the circumference is 169.65, divided by seven gives a 24.235 unit slot per segment, split into a 17 unit stroke and a 7.235 unit gap. If you ever need to change the ring's radius, both dasharray numbers must be recomputed from that new circumference divided by seven. Copying the old dasharray values onto a new radius will silently produce a ring where the segments do not close evenly, and depending on rounding you may not even get seven visible arcs anymore. Recompute, do not copy.

## Minimum sizes

The mark alone should not render below 24px, where the anvil's horn and waist are still legible. Below that it starts to blur into a blob. The lockup should not render narrower than about 240px wide, since the subtitle line is the first thing to become illegible as it shrinks. The favicon variant, which drops the anvil entirely and uses a heavier stroke on the ring alone, is the one exception built to survive down to 16px, which is why it exists as a separate file rather than a scaled-down copy of the mark.

## Clear space

Keep clear space equal to one ring stroke-width on all sides of the mark, and the same amount around the lockup as a whole. Do not let another logo, a border, or a line of text sit closer than that. The ring's gaps are meaningful negative space in their own right, and crowding the whole mark reads as crowding the gates.
