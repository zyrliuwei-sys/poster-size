import { useState } from 'react';
import { ArrowUpRight, MoveUpRight } from 'lucide-react';

import type {
  PosterExampleCategory,
  PosterExamplePreset,
} from '@/config/poster-examples';

export interface PosterShowcaseItem extends PosterExamplePreset {
  title: string;
  category: PosterExampleCategory;
  categoryLabel: string;
  styleLabel: string;
  color: string;
  image: string;
}

interface Props {
  copy: {
    kicker: string;
    title: string;
    description: string;
    all: string;
    use: string;
    note: string;
    count: (count: number) => string;
    view: (title: string) => string;
  };
  categories: { id: PosterExampleCategory; label: string }[];
  items: PosterShowcaseItem[];
  onUseExample: (example: PosterExamplePreset) => void;
}

export function PosterShowcase({
  copy,
  categories,
  items,
  onUseExample,
}: Props) {
  const [category, setCategory] = useState<PosterExampleCategory | 'all'>(
    'all'
  );
  const visible =
    category === 'all'
      ? items
      : items.filter((item) => item.category === category);

  return (
    <section
      className="ps-showcase"
      aria-labelledby="poster-showcase-title"
      id="poster-examples"
    >
      <div className="ps-showcase-heading">
        <div>
          <p className="ps-eyebrow">{copy.kicker}</p>
          <h2 id="poster-showcase-title">{copy.title}</h2>
        </div>
        <p className="ps-showcase-description">{copy.description}</p>
      </div>
      <div className="ps-showcase-toolbar">
        <div className="ps-showcase-filters" role="group" aria-label={copy.all}>
          {[{ id: 'all' as const, label: copy.all }, ...categories].map(
            (item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={category === item.id}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
                <span>
                  {item.id === 'all'
                    ? items.length
                    : items.filter((poster) => poster.category === item.id)
                        .length}
                </span>
              </button>
            )
          )}
        </div>
        <span className="ps-showcase-count" aria-live="polite">
          {copy.count(visible.length)}
        </span>
      </div>
      <ul className="ps-showcase-grid">
        {visible.map((item) => (
          <li key={item.id} className="ps-showcase-card">
            <a
              className="ps-showcase-art"
              href={item.image}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={copy.view(item.title)}
              style={{ backgroundColor: item.color }}
            >
              <img
                src={item.image}
                alt={item.title}
                width={640}
                height={960}
                loading="lazy"
                decoding="async"
              />
              <span className="ps-showcase-zoom" aria-hidden="true">
                <MoveUpRight size={18} />
              </span>
            </a>
            <div className="ps-showcase-caption">
              <div className="ps-showcase-meta">
                <span>
                  {String(items.indexOf(item) + 1).padStart(2, '0')} /{' '}
                  {item.categoryLabel}
                </span>
                <span>{item.size}</span>
              </div>
              <h3>{item.title}</h3>
              <div className="ps-showcase-card-foot">
                <span>{item.styleLabel}</span>
                <button
                  type="button"
                  onClick={() =>
                    onUseExample({
                      id: item.id,
                      prompt: item.prompt,
                      style: item.style,
                      size: item.size,
                    })
                  }
                  aria-label={`${copy.use} · ${item.title}`}
                >
                  {copy.use}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="ps-showcase-note">
        <span aria-hidden="true">✳</span>
        {copy.note}
      </p>
    </section>
  );
}
