import { ApiError, apiGetText } from '@/lib/api-client';

// Read the site's public files from the browser through the shared API client.
export async function checkKeyFile(key: string) {
  try {
    const body = await apiGetText(`/${encodeURIComponent(key)}.txt`);
    return { ok: body === key, status: 200 };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, status: error.code };
    throw error;
  }
}

export async function readSitemap(): Promise<string[]> {
  const visited = new Set<string>();
  const read = async (path: string): Promise<string[]> => {
    if (visited.has(path)) return [];
    visited.add(path);
    const doc = new DOMParser().parseFromString(
      await apiGetText(path),
      'application/xml'
    );
    if (doc.getElementsByTagName('parsererror').length) {
      throw new Error(`Invalid sitemap XML: ${path}`);
    }
    const locs = [...doc.getElementsByTagNameNS('*', 'loc')]
      .map((el) => el.textContent?.trim() ?? '')
      .filter(Boolean);
    if (doc.getElementsByTagNameNS('*', 'sitemapindex').length) {
      const urls: string[] = [];
      for (const loc of locs) {
        const url = new URL(loc, window.location.origin);
        if (!['http:', 'https:'].includes(url.protocol))
          throw new Error('Invalid sitemap URL');
        // Fetch the matching local path so previews also work without cross-origin reads.
        urls.push(...(await read(url.pathname + url.search)));
      }
      return urls;
    }
    if (!doc.getElementsByTagNameNS('*', 'urlset').length) {
      throw new Error(`Invalid sitemap: ${path}`);
    }
    const alternates = [...doc.getElementsByTagNameNS('*', 'link')]
      .filter((el) => el.getAttribute('rel') === 'alternate')
      .map((el) => el.getAttribute('href')?.trim() ?? '')
      .filter(Boolean);
    return [...locs, ...alternates];
  };
  return [...new Set(await read('/sitemap.xml'))];
}
