import { eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { AUTH_SECRET_PLACEHOLDER, envConfigs } from '@/config';
import { user } from '@/config/db/schema';
import { getCookieFromHeader } from '@/lib/cookie';
import { getUuid } from '@/lib/hash';

export const GUEST_COOKIE = 'ps_guest';
const GUEST_EMAIL_SUFFIX = '@poster-size.local';
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export interface GuestIdentity {
  id: string;
  email: string;
  cookieValue: string;
}

function signingSecret(): string {
  return envConfigs.auth_secret || AUTH_SECRET_PLACEHOLDER;
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(signingSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  );
  return Array.from(signature)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function verify(value: string, signature: string): Promise<boolean> {
  const expected = await sign(value);
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  }
  return mismatch === 0;
}

function isGuestEmail(email: string): boolean {
  return email.startsWith('guest-') && email.endsWith(GUEST_EMAIL_SUFFIX);
}

/** Resolve the anonymous buyer from the signed, httpOnly browser cookie. */
export async function getGuestIdentity(
  request: Request
): Promise<GuestIdentity | undefined> {
  const raw = getCookieFromHeader(request.headers.get('cookie'), GUEST_COOKIE);
  if (!raw) return undefined;

  const separator = raw.lastIndexOf('.');
  if (separator <= 0) return undefined;
  const id = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);
  if (!id || !signature || !(await verify(id, signature))) return undefined;

  const [record] = await db()
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);
  if (!record || !isGuestEmail(record.email)) return undefined;

  return {
    id: record.id,
    email: record.email,
    cookieValue: raw,
  };
}

/** Create an internal guest record without creating a sign-in credential. */
export async function createGuestIdentity(): Promise<GuestIdentity> {
  const id = getUuid();
  const email = `guest-${id}${GUEST_EMAIL_SUFFIX}`;
  await db().insert(user).values({
    id,
    name: 'Poster guest',
    email,
    emailVerified: false,
    utmSource: 'poster_guest_checkout',
    ip: '',
    locale: '',
  });

  return { id, email, cookieValue: `${id}.${await sign(id)}` };
}

export function guestCookieHeader(value: string, request: Request): string {
  const secure = new URL(request.url).protocol === 'https:';
  return [
    `${GUEST_COOKIE}=${value}`,
    'Path=/',
    `Max-Age=${GUEST_COOKIE_MAX_AGE}`,
    'HttpOnly',
    'SameSite=Lax',
    ...(secure ? ['Secure'] : []),
  ].join('; ');
}
