# IndexNow

Installed from the supplied `indexnow-installer` bundle, replacing the previous
admin page at `/admin/indexnow`. Administrators can save an editable key, verify
its public `/{key}.txt` file, submit the sitemap, or submit specific URLs. Each
batch displays the search engine's response, with fallback endpoints on transient
errors. Failed batches are excluded from the successful submission count.

The existing `config` table is used; no schema change is needed. New keys are
stored under `indexnow_key` and encrypted when `CONFIG_ENCRYPTION_KEY` is set.
The previous `indexnow_api_key` row remains readable. The previously published
deployment key remains the default until an administrator saves another key.
Key reads bypass the global config cache so verification uses the latest value.

Existing article notifications continue to honor `indexnow_enabled` and
`indexnow_auto_submit`; failures never prevent an article from being saved.

The browser reads public key/sitemap files through `apiGetText`. Sitemap indexes
and language alternates are included. The server validates that submitted URLs
belong to the configured public site and sends batches of up to 10,000 URLs.
