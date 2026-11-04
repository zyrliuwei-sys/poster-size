# PosterSize upgrades

## 2026-11-04: Install and verify directory badges

- The actual homepage footer (`PosterFooter`) now includes saved badges.
  The root loader reads them from storage so anonymous source HTML includes
  real links and verification attributes, before browser JavaScript runs.
- Official text links, image badges, safe sizing and `data-*` metadata are
  supported. Saves merge additions by URL and use a single conditional write;
  concurrent additions and retries preserve existing badges. Reload an older
  open administrator page before saving: writes now use add/remove/replace.
- `POST /api/integrations/footer-badges` accepts a dedicated credential limited
  to checking capability and adding/updating badges. Administrator APIs retain
  their existing permission checks. Ordinary signup does not grant badge access.
- To activate the integration, set server-only `FOOTER_BADGE_AUTOMATION_TOKEN_HASH`
  to the SHA-256 hex of a unique random `bbg_` token, then connect the token to
  the owned PosterSize website in Backlora. Empty disables the endpoint.
  Backlora must include `postersize.org` in `BACKLINK_BADGE_ALLOWED_HOSTS` and
  have `CONFIG_ENCRYPTION_KEY` set. See Backlora's `docs/badge-automation.md` and
  `scripts/create-badge-credential.mjs`. Never use a public `VITE_` token.
- Deploy both the endpoint and the Backlora bridge before activating a run.
  Existing copied prompts need to be regenerated to call the dedicated API.
  No schema migration or user-role change is required.
- Run `pnpm test:footer-badges` and `pnpm test:footer-badges:d1`, then build.
  Tests use isolated SQLite/D1 fixtures via `tests/tsconfig.badges.json` without
  replacing the project's PostgreSQL schema or touching live data.
