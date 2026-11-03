import assert from 'node:assert/strict';
import { test } from 'node:test';

import { POSTER_MODEL, posterInputSchema } from '@/config/poster-generation';

import {
  createEvoLinkPoster,
  evoLinkResultUrl,
  queryEvoLinkImage,
  resolveEvoLinkImageConfig,
} from './evolink-image';

const config = { apiKey: 'test-key', baseUrl: 'https://api.evolink.ai' };

test('normalizes the model page and OpenAI-style base URLs', () => {
  assert.equal(
    resolveEvoLinkImageConfig({
      evolink_api_key: 'test-key',
      evolink_base_url: 'https://evolink.ai/zh/nano-banana-2',
    })?.baseUrl,
    config.baseUrl
  );
  assert.equal(
    resolveEvoLinkImageConfig({
      evolink_api_key: 'test-key',
      evolink_base_url: 'https://api.evolink.ai/v1/',
    })?.baseUrl,
    config.baseUrl
  );
  assert.equal(resolveEvoLinkImageConfig({}), null);
  assert.throws(() =>
    resolveEvoLinkImageConfig({
      evolink_api_key: 'test-key',
      evolink_base_url: 'http://localhost',
    })
  );
});

test('validates prompt length, supported ratios and quality before billing', () => {
  assert.equal(posterInputSchema.safeParse({ prompt: '  ' }).success, false);
  assert.equal(
    posterInputSchema.safeParse({ prompt: 'x'.repeat(3001) }).success,
    false
  );
  assert.equal(
    posterInputSchema.safeParse({ prompt: 'A poster', size: '210x297' })
      .success,
    false
  );
  assert.equal(
    posterInputSchema.safeParse({ prompt: 'A poster', quality: 'medium' })
      .success,
    false
  );
  assert.deepEqual(posterInputSchema.parse({ prompt: '  爵士海报  ' }), {
    prompt: '爵士海报',
    style: 'auto',
    size: '2:3',
    quality: '1K',
  });
});

test('submits the documented Nano Banana 2 async request without image-edit fields', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    assert.equal(url, 'https://api.evolink.ai/v1/images/generations');
    assert.equal(init.method, 'POST');
    assert.equal(
      (init.headers as Record<string, string>).Authorization,
      'Bearer test-key'
    );
    const body = JSON.parse(String(init.body));
    assert.equal(body.model, POSTER_MODEL);
    assert.equal(body.size, '9:16');
    assert.equal(body.quality, '4K');
    assert.match(body.prompt, /爵士之夜/);
    assert.match(body.prompt, /Vintage screen-printed/);
    assert.equal(body.image_urls, undefined);
    assert.equal(body.resolution, undefined);
    assert.deepEqual(body.model_params, {
      web_search: false,
      image_search: false,
      thinking_level: 'auto',
    });
    return Response.json({ id: 'task-1', status: 'pending', progress: 0 });
  });
  assert.equal(
    (
      await createEvoLinkPoster(config, {
        prompt: '爵士之夜',
        style: 'vintage',
        size: '9:16',
        quality: '4K',
      })
    ).id,
    'task-1'
  );
});

test('polls an encoded upstream task and reads only HTTPS image results', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    assert.equal(url, 'https://api.evolink.ai/v1/tasks/task%2F1');
    assert.equal(init.method, 'GET');
    return Response.json({
      id: 'task/1',
      status: 'completed',
      results: ['https://cdn.evolink.ai/poster.png'],
    });
  });
  assert.equal(
    evoLinkResultUrl(await queryEvoLinkImage(config, 'task/1')),
    'https://cdn.evolink.ai/poster.png'
  );
  assert.equal(
    evoLinkResultUrl({
      id: 'x',
      status: 'completed',
      results: ['javascript:alert(1)'],
    }),
    undefined
  );
  assert.equal(
    evoLinkResultUrl({
      id: 'x',
      status: 'completed',
      result_data: [{ url: 'https://cdn.evolink.ai/alternate.png' }],
    }),
    'https://cdn.evolink.ai/alternate.png'
  );
});

test('redacts upstream account details and fails safely on malformed responses', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json(
      { error: { message: 'private account information' } },
      { status: 401 }
    )
  );
  await assert.rejects(queryEvoLinkImage(config, 'task-1'), {
    message: 'POSTER_PROVIDER_ERROR',
  });
  mock.mock.mockImplementation(async () =>
    Response.json({ status: 'pending' })
  );
  await assert.rejects(queryEvoLinkImage(config, 'task-1'), {
    message: 'POSTER_PROVIDER_ERROR',
  });
});
