# PosterHeader Specification

## Overview

- Target file: `src/components/poster-header.tsx`
- Interaction model: sticky bar with click-driven mobile menu.
- Reference CSS: 48px fixed Apple global nav, system font stack, transparent layer with 20px blur.

## Adapted structure

- Wordmark left: square P mark plus “Poster Size”.
- Right: Saved link, single Browse sizes CTA, session action.
- Mobile: wordmark, saved icon, menu trigger; menu opens below the bar.

## Responsive behavior

- Desktop 1024px and above: inline actions, 48px bar.
- Below 1024px: show menu trigger, stack navigation links in a translucent panel.
- All controls have 44px minimum hit areas on mobile and visible `:focus-visible` rings.
