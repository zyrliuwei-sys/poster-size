import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { and, desc, eq, isNull } from 'drizzle-orm';

import { AIMediaType, GeminiProvider } from '@/core/ai';
import { db } from '@/core/db';
import { aiTask, type AiTask } from '@/config/db/schema';
import { getAllConfigs, type ConfigMap } from '@/modules/config/service';
import { getStorage } from '@/modules/storage/service';
import { getUuid } from '@/lib/hash';

/**
 * Room design service — validates input, builds the redesign prompt, and calls
 * the configured AI provider. EvoLink is the primary image provider because
 * it supports the GPT Image 2.5 Sunburst image-to-image route used by the
 * Create studio. Gemini remains as a backwards-compatible fallback.
 *
 * Provider config: admin → Settings → AI → EvoLink (`evolink_api_key`).
 */

export const ROOM_TYPES = [
  'living',
  'bedroom',
  'kitchen',
  'bathroom',
  'dining',
  'office',
  'kids',
  'study',
  'basement',
  'attic',
] as const;

export const STYLES = [
  'modern',
  'minimalist',
  'scandinavian',
  'japandi',
  'industrial',
  'bohemian',
  'coastal',
  'midcentury',
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];
export type DesignStyle = (typeof STYLES)[number];

const ROOM_LABELS: Record<RoomType, string> = {
  living: 'living room',
  bedroom: 'bedroom',
  kitchen: 'kitchen',
  bathroom: 'bathroom',
  dining: 'dining room',
  office: 'home office',
  kids: 'kids room',
  study: 'study room',
  basement: 'basement',
  attic: 'attic',
};

const STYLE_LABELS: Record<DesignStyle, string> = {
  modern: 'modern',
  minimalist: 'minimalist',
  scandinavian: 'Scandinavian',
  japandi: 'Japandi',
  industrial: 'industrial',
  bohemian: 'bohemian',
  coastal: 'coastal',
  midcentury: 'mid-century modern',
};

export interface DesignResult {
  imageUrl: string;
  demo: boolean;
  provider: string;
  /** Raw EvoLink credits; used by the API route to settle customer credits. */
  upstreamCredits?: number;
}

export interface DesignHistoryItem extends DesignResult {
  id: string;
  roomType: RoomType;
  style: DesignStyle;
  instructions: string;
  createdAt: string;
}

interface EvoLinkTask {
  id?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed' | string;
  results?: string[];
  result_data?: Array<{ url?: string }>;
  error?: { message?: string; code?: string } | null;
  usage?: {
    credits_used?: number;
    credits_reserved?: number;
    cost?: { credits?: number };
  };
}

const EVOLINK_MODEL = 'gpt-image-2.5-sunburst';
const EVOLINK_DEFAULT_BASE_URL = 'https://api.evolink.ai';
const EVOLINK_FILE_UPLOAD_URL =
  'https://files-api.evolink.ai/api/v1/files/upload/stream';
const DESIGN_HISTORY_SCENE = 'room_design';
const DESIGN_HISTORY_MEDIA_TYPE = 'image';

/** Compose the redesign prompt from room type + style + free-form instructions. */
export function buildPrompt(params: {
  roomType: RoomType;
  style: DesignStyle;
  instructions?: string;
}): string {
  const { roomType, style, instructions } = params;
  return [
    `Redesign this ${ROOM_LABELS[roomType]} in a ${STYLE_LABELS[style]} style.`,
    'Keep the room layout, walls, windows and doors exactly as in the photo. Replace the furniture, decor, colors, materials and lighting to match the target style. Photorealistic interior design photography, natural light, high detail.',
    instructions?.trim()
      ? `Additional requirements: ${instructions.trim()}`
      : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Whether an AI provider is configured (admin custom config or env fallback). */
export async function isAIConfigured(): Promise<boolean> {
  const configs = await getAllConfigs();
  return Boolean(resolveEvoLinkConfig(configs) || resolveGeminiApiKey(configs));
}

export async function isEvoLinkConfigured(): Promise<boolean> {
  return Boolean(resolveEvoLinkConfig(await getAllConfigs()));
}

function resolveGeminiApiKey(configs: ConfigMap): string | undefined {
  return (
    (configs.gemini_api_key as string) ||
    process.env.GEMINI_API_KEY ||
    undefined
  );
}

function resolveEvoLinkConfig(
  configs: ConfigMap
): { apiKey: string; baseUrl: string } | undefined {
  const apiKey = configs.evolink_api_key?.trim();
  if (!apiKey) return undefined;

  const baseUrl = normalizeEvoLinkBaseUrl(configs.evolink_base_url);

  return { apiKey, baseUrl };
}

/** Accept the public model page URL, but always call EvoLink's API host. */
function normalizeEvoLinkBaseUrl(value?: string): string {
  const raw = (value || EVOLINK_DEFAULT_BASE_URL).trim();
  try {
    const url = new URL(raw);
    if (url.hostname === 'evolink.ai' || url.hostname === 'www.evolink.ai') {
      url.hostname = 'api.evolink.ai';
      url.pathname = '';
      url.search = '';
      url.hash = '';
    }
    return url.toString().replace(/\/+$/, '').replace(/\/v1$/, '');
  } catch {
    return EVOLINK_DEFAULT_BASE_URL;
  }
}

/** Persist a generated image: R2 when storage is configured, else public/uploads (dev). */
async function uploadOutput(
  body: Buffer,
  contentType: string
): Promise<string> {
  const ext = contentType.split('/')[1] || 'png';
  const name = `${getUuid()}.${ext}`;

  const storage = await getStorage();
  if (storage) {
    const result = await storage.uploadFile({
      body: new Uint8Array(body),
      key: name,
      contentType,
      disposition: 'inline',
    });
    if (result.success && result.url) return result.url;
    throw new Error(result.error || 'upload design result failed');
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', 'design');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), body);
  return `/uploads/design/${name}`;
}

function parseDataUrl(dataUrl: string): {
  body: Buffer;
  contentType: string;
  extension: string;
} {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/s);
  if (!match) throw new Error('Invalid image data');

  const contentType = match[1].toLowerCase();
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
    throw new Error('Unsupported image format');
  }

  const body = Buffer.from(match[2], 'base64');
  if (!body.length) throw new Error('Empty image data');

  return {
    body,
    contentType,
    extension: contentType.split('/')[1] || 'jpg',
  };
}

/**
 * EvoLink image inputs must be public URLs. Its file service is the bridge for
 * the data URL sent by the browser, and the uploaded input expires after 72h.
 */
async function uploadEvoLinkInput(
  image: string,
  apiKey: string
): Promise<string> {
  const parsed = parseDataUrl(image);
  const form = new FormData();
  const body = new ArrayBuffer(parsed.body.byteLength);
  new Uint8Array(body).set(parsed.body);
  form.append(
    'file',
    new Blob([body], { type: parsed.contentType }),
    `room-${getUuid()}.${parsed.extension}`
  );

  const response = await fetch(EVOLINK_FILE_UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        data?.message ||
        `EvoLink input upload failed (${response.status})`
    );
  }

  const fileUrl =
    data?.file_url || data?.data?.file_url || data?.url || data?.data?.url;
  if (typeof fileUrl !== 'string' || !fileUrl.startsWith('http')) {
    throw new Error('EvoLink input upload returned no public URL');
  }

  return fileUrl;
}

async function requestEvoLink<T>(
  baseUrl: string,
  apiKey: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(init?.headers || {}),
    },
  });
  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        data?.message ||
        `EvoLink request failed (${response.status})`
    );
  }
  return data as T;
}

function getEvoLinkResultUrl(task: EvoLinkTask): string | undefined {
  const resultUrl = task.results?.find(
    (url): url is string => typeof url === 'string' && url.startsWith('http')
  );
  if (resultUrl) return resultUrl;

  const resultDataUrl = task.result_data?.find(
    (item): item is { url: string } =>
      typeof item?.url === 'string' && item.url.startsWith('http')
  )?.url;
  return resultDataUrl;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Submit an EvoLink task and wait for its final image result. */
async function generateWithEvoLink(params: {
  image: string;
  prompt: string;
  apiKey: string;
  baseUrl: string;
}): Promise<{ imageUrl: string; upstreamCredits?: number }> {
  const inputUrl = await uploadEvoLinkInput(params.image, params.apiKey);
  const task = await requestEvoLink<EvoLinkTask>(
    params.baseUrl,
    params.apiKey,
    '/v1/images/generations',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EVOLINK_MODEL,
        prompt: params.prompt,
        image_urls: [inputUrl],
        size: '4:3',
        resolution: '1K',
        quality: 'medium',
        output_format: 'jpeg',
        n: 1,
      }),
    }
  );

  if (!task.id) throw new Error('EvoLink did not return a task ID');

  // Poll every 2s. This stays well below EvoLink's documented 60 requests/min
  // task-status limit while allowing complex room edits up to two minutes.
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (attempt > 0) await wait(2000);

    const status =
      attempt === 0
        ? task
        : await requestEvoLink<EvoLinkTask>(
            params.baseUrl,
            params.apiKey,
            `/v1/tasks/${encodeURIComponent(task.id)}`
          );

    if (status.status === 'completed') {
      const resultUrl = getEvoLinkResultUrl(status);
      if (!resultUrl) throw new Error('EvoLink completed without an image');
      const upstreamCredits =
        status.usage?.credits_used ?? status.usage?.cost?.credits;
      return {
        imageUrl: resultUrl,
        upstreamCredits:
          typeof upstreamCredits === 'number' ? upstreamCredits : undefined,
      };
    }

    if (status.status === 'failed') {
      throw new Error(
        status.error?.message || 'EvoLink image generation failed'
      );
    }
  }

  throw new Error('EvoLink image generation timed out');
}

/** Copy a short-lived EvoLink result into the app's configured storage. */
async function persistEvoLinkResult(resultUrl: string): Promise<string> {
  try {
    const response = await fetch(resultUrl);
    if (!response.ok) throw new Error(`download failed (${response.status})`);
    const body = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    return await uploadOutput(body, contentType);
  } catch (error) {
    // A serverless deployment may not have a writable local filesystem and may
    // not have object storage configured. The EvoLink URL is still usable for
    // 24h, so leave it as the final fallback instead of losing the result.
    console.warn('failed to persist EvoLink result, using remote URL:', error);
    return resultUrl;
  }
}

/** Pick the closest curated demo image for a room/style pair. */
function demoImage(roomType: RoomType, style: DesignStyle): string {
  const room =
    roomType === 'bedroom'
      ? 'bedroom'
      : roomType === 'dining'
        ? 'diningRoom'
        : 'livingRoom';
  const st =
    style === 'minimalist' || style === 'scandinavian' ? style : 'modern';
  return `/imgs/demo/${room}-${st}.avif`;
}

function normalizeStoredImageUrl(url: string): string {
  const value = url.trim();
  if (/^(?:https?:|data:|blob:|\/)/i.test(value)) return value;
  return `https://${value}`;
}

function parseHistoryItem(task: AiTask): DesignHistoryItem | undefined {
  if (!task.taskResult || !task.options) return undefined;

  try {
    const result = JSON.parse(task.taskResult) as Partial<DesignResult>;
    const options = JSON.parse(task.options) as {
      roomType?: string;
      style?: string;
      instructions?: string;
    };
    if (
      typeof result.imageUrl !== 'string' ||
      !ROOM_TYPES.includes(options.roomType as RoomType) ||
      !STYLES.includes(options.style as DesignStyle)
    ) {
      return undefined;
    }

    return {
      id: task.id,
      imageUrl: normalizeStoredImageUrl(result.imageUrl),
      demo: Boolean(result.demo),
      provider:
        typeof result.provider === 'string' ? result.provider : task.provider,
      roomType: options.roomType as RoomType,
      style: options.style as DesignStyle,
      instructions: options.instructions || '',
      createdAt: task.createdAt.toISOString(),
    };
  } catch {
    return undefined;
  }
}

/** Persist a completed room design without storing the user's source photo. */
export async function saveDesignHistory(params: {
  userId: string;
  roomType: RoomType;
  style: DesignStyle;
  instructions?: string;
  result: DesignResult;
  chargedCredits?: number;
}): Promise<DesignHistoryItem> {
  const [task] = await db()
    .insert(aiTask)
    .values({
      id: getUuid(),
      userId: params.userId,
      mediaType: DESIGN_HISTORY_MEDIA_TYPE,
      provider: params.result.provider,
      model: params.result.provider || EVOLINK_MODEL,
      prompt: buildPrompt({
        roomType: params.roomType,
        style: params.style,
        instructions: params.instructions,
      }),
      options: JSON.stringify({
        roomType: params.roomType,
        style: params.style,
        instructions: params.instructions || '',
      }),
      status: 'success',
      taskResult: JSON.stringify({
        imageUrl: normalizeStoredImageUrl(params.result.imageUrl),
        demo: params.result.demo,
        provider: params.result.provider,
      }),
      costCredits: params.chargedCredits || 0,
      scene: DESIGN_HISTORY_SCENE,
    })
    .returning();

  const historyItem = parseHistoryItem(task);
  if (!historyItem) throw new Error('Saved design history is invalid');
  return historyItem;
}

/** Return the signed-in user's most recent room designs. */
export async function listDesignHistory(userId: string, limit = 30) {
  const tasks = await db()
    .select()
    .from(aiTask)
    .where(
      and(
        eq(aiTask.userId, userId),
        eq(aiTask.scene, DESIGN_HISTORY_SCENE),
        eq(aiTask.status, 'success'),
        isNull(aiTask.deletedAt)
      )
    )
    .orderBy(desc(aiTask.createdAt))
    .limit(limit);

  return tasks
    .map((task: AiTask) => parseHistoryItem(task))
    .filter((item: DesignHistoryItem | undefined): item is DesignHistoryItem =>
      Boolean(item)
    );
}

/** Find one design owned by the signed-in user for a download request. */
export async function getDesignHistoryItem(params: {
  userId: string;
  id: string;
}) {
  const [task] = await db()
    .select()
    .from(aiTask)
    .where(
      and(
        eq(aiTask.id, params.id),
        eq(aiTask.userId, params.userId),
        eq(aiTask.scene, DESIGN_HISTORY_SCENE),
        isNull(aiTask.deletedAt)
      )
    )
    .limit(1);

  return task ? parseHistoryItem(task) : undefined;
}

/**
 * Generate a room redesign. EvoLink is preferred when its admin setting is
 * present, then Gemini is used for existing installations, and finally a
 * curated demo image is returned when no provider is configured.
 */
export async function generateDesign(params: {
  image: string;
  roomType: string;
  style: string;
  instructions?: string;
}): Promise<DesignResult> {
  const { image, roomType, style, instructions } = params;

  if (!ROOM_TYPES.includes(roomType as RoomType)) {
    throw new Error('Invalid room type');
  }
  if (!STYLES.includes(style as DesignStyle)) {
    throw new Error('Invalid style');
  }
  if (!image || !image.startsWith('data:image/')) {
    throw new Error('Invalid image');
  }
  if (instructions && instructions.length > 500) {
    throw new Error('Instructions too long');
  }

  const room = roomType as RoomType;
  const designStyle = style as DesignStyle;
  const prompt = buildPrompt({
    roomType: room,
    style: designStyle,
    instructions,
  });

  const configs = await getAllConfigs();
  const evoLink = resolveEvoLinkConfig(configs);

  if (evoLink) {
    const evoLinkResult = await generateWithEvoLink({
      image,
      prompt,
      apiKey: evoLink.apiKey,
      baseUrl: evoLink.baseUrl,
    });
    return {
      imageUrl: await persistEvoLinkResult(evoLinkResult.imageUrl),
      demo: false,
      provider: `evolink:${EVOLINK_MODEL}`,
      upstreamCredits: evoLinkResult.upstreamCredits,
    };
  }

  const apiKey = resolveGeminiApiKey(configs);

  if (!apiKey) {
    return {
      imageUrl: demoImage(room, designStyle),
      demo: true,
      provider: 'demo',
    };
  }

  const provider = new GeminiProvider({
    apiKey,
    uploadFile: async ({ body, contentType }) => ({
      url: await uploadOutput(Buffer.from(body), contentType),
    }),
  });

  const result = await provider.generate({
    params: {
      mediaType: AIMediaType.IMAGE,
      model: 'gemini-2.5-flash-image',
      prompt,
      options: { image_input: [image] },
    },
  });

  const imageUrl = result.taskInfo?.images?.[0]?.imageUrl;
  if (!imageUrl) {
    throw new Error('No image returned by AI provider');
  }

  return { imageUrl, demo: false, provider: provider.name };
}
