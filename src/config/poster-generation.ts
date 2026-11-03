import { z } from 'zod';

import { USER_CREDIT_MULTIPLIER } from '@/config/design-pricing';

export const POSTER_MODEL = 'gemini-3.1-flash-image-preview';
export const POSTER_SCENE = 'poster_generation';
export const POSTER_STYLES = [
  'auto',
  'editorial',
  'minimal',
  'vintage',
  'bold',
  'illustration',
  'cinematic',
] as const;
export const POSTER_SIZES = [
  '2:3',
  '3:4',
  '1:1',
  '4:5',
  '9:16',
  '16:9',
] as const;
export const POSTER_QUALITIES = ['1K', '2K', '4K'] as const;
// EvoLink's current poster cost is 5 / 7 / 10 API credits by resolution.
// Charge users at the configured 8x multiplier, keeping the margin rule in one
// place instead of duplicating customer prices across the API and UI.
export const POSTER_API_COST_CREDITS = { '1K': 5, '2K': 7, '4K': 10 } as const;
export const POSTER_CREDITS = {
  '1K': POSTER_API_COST_CREDITS['1K'] * USER_CREDIT_MULTIPLIER,
  '2K': POSTER_API_COST_CREDITS['2K'] * USER_CREDIT_MULTIPLIER,
  '4K': POSTER_API_COST_CREDITS['4K'] * USER_CREDIT_MULTIPLIER,
} as const;

export const posterInputSchema = z.object({
  prompt: z.string().trim().min(3).max(3000),
  style: z.enum(POSTER_STYLES).default('auto'),
  size: z.enum(POSTER_SIZES).default('2:3'),
  quality: z.enum(POSTER_QUALITIES).default('1K'),
});

export type PosterInput = z.infer<typeof posterInputSchema>;
export interface PosterTaskView {
  id: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'canceled';
  progress: number;
  imageUrl?: string;
  error?: string;
  costCredits: number;
  size: string;
  quality: string;
}

export interface PosterGenerationConfig {
  configured: boolean;
  costs: typeof POSTER_CREDITS;
  balance: number | null;
  guest: boolean;
}
