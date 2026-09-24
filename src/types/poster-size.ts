export type PosterCategory = 'print' | 'social' | 'presentation';

export interface PosterSizeItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  region: string;
  width: number;
  height: number;
  unit: string;
  aspectRatio: string;
  description: string;
  sortOrder: number;
  status: string;
}

export interface PosterSizeListResponse {
  items: PosterSizeItem[];
  favoriteIds: string[];
  total: number;
}
