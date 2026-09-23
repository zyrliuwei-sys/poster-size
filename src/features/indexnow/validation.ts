const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const MASK_PREFIX = '••••••••';

export function normalizeIndexNowKey(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error('IndexNow API key must be a string');
  }

  const key = value.trim();
  if (!INDEXNOW_KEY_PATTERN.test(key)) {
    throw new Error(
      'IndexNow API key must be 8–128 characters using only letters, numbers, and hyphens'
    );
  }
  return key;
}

export function maskIndexNowKey(key: string): string {
  if (key.length <= 8) return MASK_PREFIX;
  return `${MASK_PREFIX}${key.slice(-4)}`;
}
