# Poster Size behavior bible

## Reference findings

- Reference: `https://www.apple.com/`
- Fixed top navigation: 48px high, transparent background, `backdrop-filter: saturate(1.8) blur(20px)`.
- Reference body font: `SF Pro Text`, `SF Pro Icons`, `Helvetica Neue`, Helvetica, Arial, sans-serif.
- Reference ink: `rgb(29, 29, 31)`; secondary gray: `rgb(110, 110, 115)`; action blue: `rgb(41, 151, 255)`.
- The reference uses large product modules separated by generous whitespace, with compact links and minimal chrome.

## Poster Size interaction model

- Header: sticky, click-driven links. On mobile, the nav collapses into a menu.
- Catalogue: click-driven search and category filtering. Search updates locally while the API query is debounced by React Query.
- Favourite button: click-driven optimistic mutation. Signed-out visitors are sent to sign-in with a callback URL.
- Size cards: hover changes the preview treatment and reveals the arrow affordance; the card remains keyboard accessible.
- Reduced motion: all reveal and hover transforms are disabled or reduced to opacity-only transitions.

## Responsive sweep targets

- Desktop 1440px: 4-card catalogue grid, two-column hero, full header actions.
- Tablet 768px: 2-card grid, hero stacks with the visual below the copy.
- Mobile 390px: 1-card grid, compact header with menu, search and filters stack vertically.
