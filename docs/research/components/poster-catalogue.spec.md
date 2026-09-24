# PosterCatalogue Specification

## Overview

- Target file: `src/components/poster-size-finder.tsx`
- Interaction model: click-driven filters and debounced query; optimistic favourite toggle.
- Page shape: Catalogue, uniform inventory cards, no fake browser chrome.

## Card structure

- Preview: CSS ratio silhouette with a printed size label.
- Metadata: name, category/region, physical dimensions, ratio.
- Action: heart button in the top-right corner; hover arrow appears at the lower-right.

## Data states

- Loading: neutral skeleton blocks.
- Empty search: one concise empty state with a reset action.
- Error: one inline retry action.
- Signed out favourite: redirect to sign-in with the current page as callback.
- Signed in favourite: heart fill state persists through API and query invalidation.

## Responsive behavior

- 1440px: 4 columns, cards stay equal height.
- 768px: 2 columns.
- 390px: 1 column, preview height remains stable and metadata wraps naturally.
