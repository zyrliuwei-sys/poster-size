# IndexNow feature

This feature adds an admin installer for Bing IndexNow. It uses the existing
`config` table, so no schema migration is required.

## Copy to another ShipAny project

Copy these paths:

- `src/features/indexnow/`
- `src/modules/indexnow/service.ts`
- `src/routes/admin/indexnow.tsx`
- `src/routes/api/admin/indexnow.ts`
- `src/routes/{$key}[.]txt.ts`

Then copy the `admin.nav.indexnow` and `admin.indexnow.*` messages from both
locale files, add the `/admin/indexnow` item to `src/routes/admin/route.tsx`,
and add the `notifyIndexNow` calls from `src/routes/api/admin/posts.ts` if the
target project has the posts module.

The page is available at `/admin/indexnow`. It generates or accepts an
IndexNow key, serves the verification file at `/{key}.txt`, submits the
current sitemap, and can notify IndexNow after article mutations.
