import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { getAuth } from '@/core/auth';
import * as posterSizes from '@/modules/poster-sizes/service';
import { hasPermission } from '@/modules/rbac/service';
import { respData, respErr, respOk } from '@/lib/resp';

const sizeSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  region: z.string().min(1),
  width: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  unit: z.string().min(1),
  aspectRatio: z.string().min(1),
  description: z.string().min(1),
  sortOrder: z.coerce.number().int().optional(),
});

async function checkAdmin(request: Request) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new Error('Unauthorized');
  if (!(await hasPermission(session.user.id, 'admin.*'))) {
    throw new Error('Forbidden');
  }
  return session;
}

async function GET({ request }: { request: Request }) {
  try {
    await checkAdmin(request);
    const url = new URL(request.url);
    return respData(
      await posterSizes.listAdmin({
        search: url.searchParams.get('search') || undefined,
      })
    );
  } catch (error: any) {
    return respErr(error.message || 'Could not load poster sizes');
  }
}

async function POST({ request }: { request: Request }) {
  try {
    await checkAdmin(request);
    const payload = sizeSchema.parse(await request.json());
    return respData(await posterSizes.createSize(payload));
  } catch (error: any) {
    return respErr(error.message || 'Could not create poster size');
  }
}

async function PUT({ request }: { request: Request }) {
  try {
    await checkAdmin(request);
    const body = await request.json();
    if (!body?.id) return respErr('ID is required');
    const payload = sizeSchema.partial().parse(body);
    delete payload.id;
    return respData(await posterSizes.updateSize(body.id, payload));
  } catch (error: any) {
    return respErr(error.message || 'Could not update poster size');
  }
}

async function DELETE({ request }: { request: Request }) {
  try {
    await checkAdmin(request);
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return respErr('ID is required');
    await posterSizes.archiveSize(id);
    return respOk();
  } catch (error: any) {
    return respErr(error.message || 'Could not archive poster size');
  }
}

export const Route = createFileRoute('/api/admin/poster-sizes')({
  server: {
    handlers: { GET, POST, PUT, DELETE },
  },
});
