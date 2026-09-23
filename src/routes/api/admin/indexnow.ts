import { createFileRoute } from '@tanstack/react-router';
import { normalizeIndexNowKey } from '@/features/indexnow/validation';

import { getAuth } from '@/core/auth';
import {
  getIndexNowSettings,
  saveIndexNowSettings,
  submitSitemapUrls,
  verifyIndexNowKey,
} from '@/modules/indexnow/service';
import { hasPermission } from '@/modules/rbac/service';
import { respData, respErr } from '@/lib/resp';

const noStore = {
  headers: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  },
};

function requestOrigin(request: Request) {
  return new URL(request.url).origin;
}

async function checkPermission(request: Request, permission: string) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return respErr('Unauthorized', { status: 401 });

  const allowed = await hasPermission(session.user.id, permission);
  if (!allowed) return respErr('Forbidden', { status: 403 });
  return null;
}

async function GET({ request }: { request: Request }) {
  try {
    const denied = await checkPermission(request, 'admin.settings.read');
    if (denied) return denied;
    return respData(await getIndexNowSettings(requestOrigin(request)), noStore);
  } catch (error) {
    return respErr(error instanceof Error ? error.message : 'Internal error');
  }
}

async function POST({ request }: { request: Request }) {
  try {
    const denied = await checkPermission(request, 'admin.settings.write');
    if (denied) return denied;

    const body = await request.json();
    const action = body?.action || 'save';
    const origin = requestOrigin(request);

    if (action === 'save') {
      const hasKey = Object.prototype.hasOwnProperty.call(body, 'apiKey');
      const apiKey = hasKey ? normalizeIndexNowKey(body.apiKey) : undefined;
      const enabled = body.enabled !== false;
      const autoSubmit = body.autoSubmit !== false;

      await saveIndexNowSettings({ apiKey, enabled, autoSubmit });

      let submission;
      let submissionError: string | undefined;
      if (enabled && autoSubmit) {
        try {
          submission = await submitSitemapUrls(origin);
        } catch (error) {
          submissionError =
            error instanceof Error
              ? error.message
              : 'Initial submission failed';
        }
      }

      return respData(
        {
          ...(await getIndexNowSettings(origin)),
          submission,
          submissionError,
        },
        noStore
      );
    }

    if (action === 'submit') {
      return respData(await submitSitemapUrls(origin), noStore);
    }

    if (action === 'verify') {
      return respData(await verifyIndexNowKey(origin), noStore);
    }

    return respErr('Unsupported IndexNow action');
  } catch (error) {
    return respErr(error instanceof Error ? error.message : 'Internal error');
  }
}

export const Route = createFileRoute('/api/admin/indexnow')({
  server: { handlers: { GET, POST } },
});
