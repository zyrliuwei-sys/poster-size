import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  creditsForUpstreamUsage,
  DESIGN_CREDIT_RESERVE,
} from '@/config/design-pricing';
import { consume, grant, revoke } from '@/modules/credits/service';
import {
  clientDayKey,
  FREE_DAILY_LIMIT,
  freeDesignsUsedToday,
  recordFreeDesign,
} from '@/modules/design/free-tier';
import {
  generateDesign,
  isAIConfigured,
  isEvoLinkConfigured,
  saveDesignHistory,
  type DesignStyle,
  type RoomType,
} from '@/modules/design/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

/** Marker the studio matches to switch to its sign-up prompt. */
const FREE_LIMIT_ERROR = 'Daily free design limit reached';

// Client downscales to ≤1536px JPEG (~under 2MB base64); cap generously at 12MB.
const MAX_IMAGE_CHARS = 12_000_000;

/** GET /api/design — provider and auth status for the Create studio. */
async function GET({ request }: { request: Request }) {
  try {
    const aiConfigured = await isAIConfigured();
    const requiresAuth = await isEvoLinkConfigured();
    return respData({
      aiConfigured,
      requiresAuth,
      freeDailyLimit: FREE_DAILY_LIMIT,
    });
  } catch (e: any) {
    console.error('get design status failed:', e);
    return respErr(e?.message || 'get design status failed');
  }
}

async function settleReservedCredits(params: {
  userId: string;
  userEmail: string;
  reservationId: string;
  actualCredits: number;
}): Promise<void> {
  const { userId, userEmail, reservationId, actualCredits } = params;
  if (actualCredits === DESIGN_CREDIT_RESERVE) return;

  if (actualCredits < DESIGN_CREDIT_RESERVE) {
    await revoke(reservationId);
    await grant({
      userId,
      userEmail,
      credits: actualCredits,
      scene: 'ai_task_adjustment',
      description: 'Room design credit adjustment',
    });
    return;
  }

  // The normal 1K room edit fits inside the reservation. If a larger actual
  // usage is ever returned, attempt to collect the difference without making
  // the already-generated image disappear when the balance is too low.
  const extra = await consume({
    userId,
    userEmail,
    credits: actualCredits - DESIGN_CREDIT_RESERVE,
    scene: 'ai_task',
    description: 'Room design generation usage adjustment',
  });
  if (!extra.success) {
    console.warn('could not collect EvoLink usage adjustment', {
      userId,
      actualCredits,
    });
  }
}

/** POST /api/design — generate a room redesign from an uploaded photo. */
async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 5000,
    keyPrefix: 'design',
  });
  if (limited) return limited;

  let reservationId: string | undefined;
  let user: { id: string; email: string } | undefined;

  try {
    const body = await request.json();
    const { image, roomType, style, instructions } = body || {};

    if (!image || typeof image !== 'string') {
      return respErr('Image is required');
    }
    if (!image.startsWith('data:image/') || image.length > MAX_IMAGE_CHARS) {
      return respErr('Invalid or oversized image');
    }
    if (instructions && typeof instructions !== 'string') {
      return respErr('Invalid instructions');
    }

    // Real EvoLink generations are paid upstream, so protect the API key and
    // reserve customer credits before starting the remote task. Demo mode and
    // the legacy Gemini fallback keep their existing public behaviour.
    if (await isEvoLinkConfigured()) {
      const auth = getAuth();
      const session = await auth.api.getSession({ headers: request.headers });

      // Anonymous free tier: one watermarked design per visitor per day.
      // The quota row is recorded after a successful generation, so a failed
      // run never burns the free attempt; the unique (ip_hash, day) index
      // still hard-caps repeat visitors.
      if (!session?.user) {
        const dayKey = clientDayKey(request);
        const used = await freeDesignsUsedToday(dayKey);
        if (used >= FREE_DAILY_LIMIT) {
          return respErr(
            `${FREE_LIMIT_ERROR}. Sign up to keep designing — credits start at $5.`
          );
        }
        const freeResult = await generateDesign({
          image,
          roomType,
          style,
          instructions,
        });
        try {
          await recordFreeDesign(dayKey);
        } catch (recordError) {
          console.warn('record free design usage failed:', recordError);
        }
        const { upstreamCredits: _freeUpstream, ...freePublic } = freeResult;
        return respData({ ...freePublic, free: true });
      }

      user = { id: session.user.id, email: session.user.email };

      const reservation = await consume({
        userId: user.id,
        userEmail: user.email,
        credits: DESIGN_CREDIT_RESERVE,
        scene: 'ai_task',
        description: 'Room design generation reservation',
        metadata: JSON.stringify({ provider: 'evolink', multiplier: 7 }),
      });
      if (!reservation.success || !reservation.consumedCredit?.id) {
        return respErr(
          `Insufficient credits. At least ${DESIGN_CREDIT_RESERVE} credits are required.`
        );
      }
      reservationId = reservation.consumedCredit.id;
    }

    const result = await generateDesign({
      image,
      roomType,
      style,
      instructions,
    });

    // Demo/Gemini installations do not require auth to generate, but still
    // save a history entry when the visitor happens to be signed in.
    if (!user) {
      const auth = getAuth();
      const session = await auth.api.getSession({ headers: request.headers });
      if (session?.user) {
        user = { id: session.user.id, email: session.user.email };
      }
    }

    let chargedCredits: number | undefined;
    if (reservationId && user) {
      chargedCredits = creditsForUpstreamUsage(result.upstreamCredits);
      await settleReservedCredits({
        userId: user.id,
        userEmail: user.email,
        reservationId,
        actualCredits: chargedCredits,
      });
      reservationId = undefined;
    }

    const { upstreamCredits: _upstreamCredits, ...publicResult } = result;
    let historyId: string | undefined;
    if (user) {
      try {
        const historyItem = await saveDesignHistory({
          userId: user.id,
          roomType: roomType as RoomType,
          style: style as DesignStyle,
          instructions,
          result,
          chargedCredits,
        });
        historyId = historyItem.id;
      } catch (historyError) {
        // Keep the just-generated image usable even if history storage has a
        // transient database problem. The next generation can retry saving.
        console.error('save design history failed:', historyError);
      }
    }

    return respData({
      ...publicResult,
      chargedCredits,
      ...(historyId ? { id: historyId } : {}),
    });
  } catch (e: any) {
    if (reservationId) {
      try {
        await revoke(reservationId);
      } catch (revokeError) {
        console.error('failed to restore reserved design credits', revokeError);
      }
    }
    console.error('generate design failed:', e);
    return respErr(e?.message || 'generate design failed');
  }
}

export const Route = createFileRoute('/api/design')({
  server: {
    handlers: { GET, POST },
  },
});
