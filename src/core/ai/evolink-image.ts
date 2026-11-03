import { POSTER_MODEL, type PosterInput } from '@/config/poster-generation';

export interface EvoLinkImageConfig {
  apiKey: string;
  baseUrl: string;
}
export interface EvoLinkImageTask {
  id: string;
  status: string;
  progress?: number;
  results?: string[];
  result_data?: { url?: string }[];
  error?: { message?: string; code?: string };
}

export function resolveEvoLinkImageConfig(
  configs: Record<string, string>
): EvoLinkImageConfig | null {
  const apiKey = configs.evolink_api_key?.trim();
  if (!apiKey) return null;
  const url = new URL(
    configs.evolink_base_url?.trim() || 'https://api.evolink.ai'
  );
  if (['evolink.ai', 'www.evolink.ai'].includes(url.hostname)) {
    url.hostname = 'api.evolink.ai';
    url.pathname = '';
  }
  if (url.protocol !== 'https:' || url.username || url.password)
    throw new Error('Invalid EvoLink API URL');
  url.search = '';
  url.hash = '';
  return {
    apiKey,
    baseUrl: url.toString().replace(/\/+$/, '').replace(/\/v1$/, ''),
  };
}

async function request(
  config: EvoLinkImageConfig,
  path: string,
  body?: unknown
): Promise<EvoLinkImageTask> {
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30_000),
  });
  const data = (await response
    .json()
    .catch(() => null)) as EvoLinkImageTask | null;
  if (!response.ok || !data?.id) {
    // Never expose upstream response bodies, which can contain account details.
    console.error('EvoLink image request failed', {
      status: response.status,
      code: data?.error?.code,
    });
    throw new Error('POSTER_PROVIDER_ERROR');
  }
  return data;
}

const STYLE_PROMPTS: Record<PosterInput['style'], string> = {
  auto: 'Choose a visual direction that best fits the brief.',
  editorial:
    'Editorial Swiss graphic design, considered typography, asymmetric grid, generous margins.',
  minimal:
    'Minimalist graphic design, restrained palette, generous negative space, one striking focal point.',
  vintage:
    'Vintage screen-printed poster, rich ink colors, subtle paper grain, retro typography.',
  bold: 'Bold contemporary graphic design, oversized typography, high contrast, expressive shapes.',
  illustration:
    'Artful illustrated poster, original hand-drawn imagery, expressive color and texture.',
  cinematic:
    'Cinematic poster, dramatic lighting, evocative composition, sophisticated title treatment.',
};

export function createEvoLinkPoster(
  config: EvoLinkImageConfig,
  input: PosterInput
) {
  return request(config, '/v1/images/generations', {
    model: POSTER_MODEL,
    prompt: [
      'Create one complete, beautifully composed poster as a flat, edge-to-edge graphic, not a photograph of a poster or a mockup.',
      STYLE_PROMPTS[input.style],
      'Follow the brief faithfully. Render requested wording accurately in its original language, with clear typographic hierarchy. Do not invent extra slogans or add watermarks.',
      `Poster brief: ${input.prompt}`,
    ].join('\n'),
    size: input.size,
    quality: input.quality,
    model_params: {
      web_search: false,
      image_search: false,
      thinking_level: 'auto',
    },
  });
}

export function queryEvoLinkImage(config: EvoLinkImageConfig, taskId: string) {
  return request(config, `/v1/tasks/${encodeURIComponent(taskId)}`);
}

export function evoLinkResultUrl(task: EvoLinkImageTask): string | undefined {
  const value = task.results?.[0] || task.result_data?.[0]?.url;
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}
