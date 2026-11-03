import { createFileRoute } from '@tanstack/react-router';

import {
  createEvoLinkPoster,
  evoLinkResultUrl,
  queryEvoLinkImage,
  resolveEvoLinkImageConfig,
  type EvoLinkImageTask,
} from '@/core/ai/evolink-image';
import { getAuth } from '@/core/auth';
import { envConfigs } from '@/config';
import {
  POSTER_CREDITS,
  POSTER_MODEL,
  POSTER_SCENE,
  posterInputSchema,
} from '@/config/poster-generation';
import {
  AITaskStatus,
  createTask,
  updateTask,
} from '@/modules/ai-tasks/service';
import { getAllConfigs } from '@/modules/config/service';
import { getBalance } from '@/modules/credits/service';
import { getGuestIdentity } from '@/modules/guest/service';
import {
  findPosterTask,
  posterTaskView,
  updatePosterTask,
} from '@/modules/posters/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

type PosterIdentity = { id: string; email: string; guest: boolean };

async function getPosterIdentity(
  request: Request
): Promise<PosterIdentity | undefined> {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (session?.user) {
    return {
      id: session.user.id,
      email: session.user.email,
      guest: false,
    };
  }
  const guest = await getGuestIdentity(request);
  return guest ? { id: guest.id, email: guest.email, guest: true } : undefined;
}

async function applyProviderStatus(id: string, remote: EvoLinkImageTask) {
  if (['failed', 'cancelled', 'canceled'].includes(remote.status)) {
    await updateTask({ taskId: id, status: AITaskStatus.FAILED });
    return;
  }
  const imageUrl = evoLinkResultUrl(remote);
  if (remote.status === 'completed' && !imageUrl) {
    await updateTask({ taskId: id, status: AITaskStatus.FAILED });
    return;
  }
  await updatePosterTask(id, {
    taskId: remote.id,
    status:
      remote.status === 'completed'
        ? AITaskStatus.SUCCESS
        : AITaskStatus.PROCESSING,
    taskResult: JSON.stringify({
      progress: remote.progress || 0,
      ...(imageUrl ? { imageUrl } : {}),
    }),
  });
}

async function GET({ request }: { request: Request }) {
  try {
    const identity = await getPosterIdentity(request);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      const config = resolveEvoLinkImageConfig(await getAllConfigs());
      return respData(
        {
          configured: Boolean(config),
          costs: POSTER_CREDITS,
          balance: identity ? await getBalance(identity.id) : null,
          guest: identity?.guest ?? false,
        },
        { headers: PRIVATE_HEADERS }
      );
    }
    if (!identity) return respErr('POSTER_PAYMENT_REQUIRED', { status: 402 });
    const task = await findPosterTask(id, identity.id);
    if (!task) return respErr('POSTER_NOT_FOUND', { status: 404 });

    if (url.searchParams.get('download') === '1') {
      const result = posterTaskView(task);
      if (result.status !== 'success' || !result.imageUrl)
        return respErr('POSTER_NOT_READY', { status: 409 });
      const response = await fetch(result.imageUrl, {
        signal: AbortSignal.timeout(30_000),
      });
      const contentType =
        response.headers.get('content-type')?.split(';')[0] || '';
      if (
        !response.ok ||
        !['image/png', 'image/jpeg', 'image/webp'].includes(contentType)
      )
        return respErr('POSTER_DOWNLOAD_FAILED', { status: 502 });
      // Finish reading the upstream response inside this request's lifetime.
      // Workers can terminate a borrowed upstream stream after the router
      // releases its request context, so return an owned buffer instead.
      const contentLength = Number(response.headers.get('content-length'));
      if (contentLength > 30 * 1024 * 1024)
        return respErr('POSTER_DOWNLOAD_FAILED', { status: 413 });
      const image = await response.arrayBuffer();
      if (image.byteLength > 30 * 1024 * 1024)
        return respErr('POSTER_DOWNLOAD_FAILED', { status: 413 });
      return new Response(image, {
        headers: {
          ...PRIVATE_HEADERS,
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="poster-${task.id}.${contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1]}"`,
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // A submission that failed before receiving an upstream ID can still be
    // returned to the browser if a transient DB error delayed its refund.
    if (['pending', 'processing'].includes(task.status) && !task.taskId) {
      await updateTask({ taskId: task.id, status: AITaskStatus.FAILED });
    } else if (['pending', 'processing'].includes(task.status) && task.taskId) {
      const config = resolveEvoLinkImageConfig(await getAllConfigs());
      if (!config) return respErr('POSTER_NOT_CONFIGURED', { status: 503 });
      await applyProviderStatus(
        task.id,
        await queryEvoLinkImage(config, task.taskId)
      );
    }
    const current = await findPosterTask(id, identity.id);
    return respData(posterTaskView(current || task), {
      headers: PRIVATE_HEADERS,
    });
  } catch (error) {
    console.error(
      'Query poster failed',
      error instanceof Error ? error.message : 'unknown'
    );
    return respErr('POSTER_STATUS_FAILED', { status: 502 });
  }
}

async function POST({ request }: { request: Request }) {
  const origin = request.headers.get('origin');
  // A trusted reverse proxy can give the Worker an upstream request URL.
  // Accept the configured public app origin as well as the request origin.
  const allowedOrigins = new Set([
    new URL(request.url).origin,
    new URL(envConfigs.app_url).origin,
  ]);
  if (origin && !allowedOrigins.has(origin))
    return respErr('POSTER_INVALID_ORIGIN', { status: 403 });
  const identity = await getPosterIdentity(request);
  if (!identity) return respErr('POSTER_PAYMENT_REQUIRED', { status: 402 });
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 8000,
    keyPrefix: 'poster-generation',
    extraKey: identity.id,
  });
  if (limited) return respErr('POSTER_RATE_LIMITED', { status: 429 });

  let taskId: string | undefined;
  let remoteAccepted = false;
  try {
    if (Number(request.headers.get('content-length')) > 20_000)
      return respErr('POSTER_INVALID_INPUT', { status: 400 });
    const raw = await request.text();
    if (raw.length > 20_000)
      return respErr('POSTER_INVALID_INPUT', { status: 400 });
    const parsed = posterInputSchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return respErr('POSTER_INVALID_INPUT', { status: 400 });
    const config = resolveEvoLinkImageConfig(await getAllConfigs());
    if (!config) return respErr('POSTER_NOT_CONFIGURED', { status: 503 });

    const input = parsed.data;
    const task = await createTask({
      userId: identity.id,
      userEmail: identity.email,
      mediaType: 'image',
      provider: 'evolink',
      model: POSTER_MODEL,
      prompt: input.prompt,
      costCredits: POSTER_CREDITS[input.quality],
      options: input,
      scene: POSTER_SCENE,
    });
    taskId = task.id;
    const remote = await createEvoLinkPoster(config, input);
    await updatePosterTask(task.id, {
      taskId: remote.id,
      status: AITaskStatus.PROCESSING,
    });
    remoteAccepted = true;
    await applyProviderStatus(task.id, remote);
    const saved = await findPosterTask(task.id, identity.id);
    return respData(posterTaskView(saved || task), {
      headers: PRIVATE_HEADERS,
    });
  } catch (error) {
    // Once a provider task is saved, a later status error must not lose it.
    if (taskId && remoteAccepted) {
      const task = await findPosterTask(taskId, identity.id);
      if (task)
        return respData(posterTaskView(task), { headers: PRIVATE_HEADERS });
    }
    if (taskId) {
      try {
        await updateTask({ taskId, status: AITaskStatus.FAILED });
      } catch {
        const task = await findPosterTask(taskId, identity.id);
        if (task)
          return respData(posterTaskView(task), { headers: PRIVATE_HEADERS });
        return respErr('POSTER_REFUND_PENDING', { status: 503 });
      }
    }
    const message = error instanceof Error ? error.message : '';
    console.error('Create poster failed', message);
    return respErr(
      message === 'Insufficient credits'
        ? 'POSTER_INSUFFICIENT_CREDITS'
        : error instanceof SyntaxError
          ? 'POSTER_INVALID_INPUT'
          : 'POSTER_GENERATION_FAILED',
      { status: message === 'Insufficient credits' ? 402 : 502 }
    );
  }
}

export const Route = createFileRoute('/api/poster-generation')({
  server: { handlers: { GET, POST } },
});
