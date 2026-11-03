import type { PosterInput } from '@/config/poster-generation';

export const POSTER_EXAMPLE_CATEGORIES = [
  'events',
  'brands',
  'food',
  'lifestyle',
] as const;
export type PosterExampleCategory = (typeof POSTER_EXAMPLE_CATEGORIES)[number];
export interface PosterExamplePreset {
  id: string;
  prompt: string;
  style: PosterInput['style'];
  size: PosterInput['size'];
}

export const POSTER_EXAMPLES = [
  { id: 'jazz', category: 'events', style: 'bold', color: '#f17238' },
  { id: 'coffee', category: 'food', style: 'vintage', color: '#e7dfc8' },
  { id: 'art', category: 'events', style: 'editorial', color: '#e7e2d6' },
  { id: 'skincare', category: 'brands', style: 'minimal', color: '#e6c9ae' },
  {
    id: 'travel',
    category: 'lifestyle',
    style: 'illustration',
    color: '#a8c6dc',
  },
  { id: 'film', category: 'events', style: 'cinematic', color: '#172c3b' },
  { id: 'bakery', category: 'food', style: 'vintage', color: '#e8d6b2' },
  { id: 'fashion', category: 'brands', style: 'editorial', color: '#d5d1c7' },
  { id: 'running', category: 'lifestyle', style: 'bold', color: '#d2e756' },
  { id: 'ramen', category: 'food', style: 'illustration', color: '#d84131' },
  { id: 'tech', category: 'events', style: 'bold', color: '#213a32' },
  {
    id: 'flowers',
    category: 'lifestyle',
    style: 'illustration',
    color: '#e1b5c3',
  },
  { id: 'books', category: 'brands', style: 'minimal', color: '#d0c6d8' },
  { id: 'wine', category: 'food', style: 'editorial', color: '#763c49' },
  { id: 'wedding', category: 'lifestyle', style: 'minimal', color: '#e4dfcb' },
  { id: 'sale', category: 'brands', style: 'bold', color: '#ec6685' },
] as const satisfies readonly {
  id: string;
  category: PosterExampleCategory;
  style: PosterInput['style'];
  color: string;
}[];

export type PosterExampleId = (typeof POSTER_EXAMPLES)[number]['id'];
