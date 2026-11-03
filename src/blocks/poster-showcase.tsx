import {
  POSTER_EXAMPLES,
  type PosterExamplePreset,
} from '@/config/poster-examples';
import { m } from '@/paraglide/messages.js';
import { PosterShowcase } from '@/components/poster-showcase';

export function PosterShowcaseBlock({
  onUseExample,
}: {
  onUseExample: (example: PosterExamplePreset) => void;
}) {
  const text = {
    jazz: {
      title: m['poster.showcase.jazz.title'](),
      prompt: m['poster.showcase.jazz.prompt'](),
    },
    coffee: {
      title: m['poster.showcase.coffee.title'](),
      prompt: m['poster.showcase.coffee.prompt'](),
    },
    art: {
      title: m['poster.showcase.art.title'](),
      prompt: m['poster.showcase.art.prompt'](),
    },
    skincare: {
      title: m['poster.showcase.skincare.title'](),
      prompt: m['poster.showcase.skincare.prompt'](),
    },
    travel: {
      title: m['poster.showcase.travel.title'](),
      prompt: m['poster.showcase.travel.prompt'](),
    },
    film: {
      title: m['poster.showcase.film.title'](),
      prompt: m['poster.showcase.film.prompt'](),
    },
    bakery: {
      title: m['poster.showcase.bakery.title'](),
      prompt: m['poster.showcase.bakery.prompt'](),
    },
    fashion: {
      title: m['poster.showcase.fashion.title'](),
      prompt: m['poster.showcase.fashion.prompt'](),
    },
    running: {
      title: m['poster.showcase.running.title'](),
      prompt: m['poster.showcase.running.prompt'](),
    },
    ramen: {
      title: m['poster.showcase.ramen.title'](),
      prompt: m['poster.showcase.ramen.prompt'](),
    },
    tech: {
      title: m['poster.showcase.tech.title'](),
      prompt: m['poster.showcase.tech.prompt'](),
    },
    flowers: {
      title: m['poster.showcase.flowers.title'](),
      prompt: m['poster.showcase.flowers.prompt'](),
    },
    books: {
      title: m['poster.showcase.books.title'](),
      prompt: m['poster.showcase.books.prompt'](),
    },
    wine: {
      title: m['poster.showcase.wine.title'](),
      prompt: m['poster.showcase.wine.prompt'](),
    },
    wedding: {
      title: m['poster.showcase.wedding.title'](),
      prompt: m['poster.showcase.wedding.prompt'](),
    },
    sale: {
      title: m['poster.showcase.sale.title'](),
      prompt: m['poster.showcase.sale.prompt'](),
    },
  };
  const categories = {
    events: m['poster.showcase.events'](),
    brands: m['poster.showcase.brands'](),
    food: m['poster.showcase.food'](),
    lifestyle: m['poster.showcase.lifestyle'](),
  };
  const styles = {
    bold: m['poster.ai.style.bold'](),
    vintage: m['poster.ai.style.vintage'](),
    editorial: m['poster.ai.style.editorial'](),
    minimal: m['poster.ai.style.minimal'](),
    illustration: m['poster.ai.style.illustration'](),
    cinematic: m['poster.ai.style.cinematic'](),
  };
  return (
    <PosterShowcase
      copy={{
        kicker: m['poster.showcase.kicker'](),
        title: m['poster.showcase.title'](),
        description: m['poster.showcase.description'](),
        all: m['poster.showcase.all'](),
        use: m['poster.showcase.use'](),
        note: m['poster.showcase.note'](),
        count: (count) => m['poster.showcase.count']({ count }),
        view: (title) => m['poster.showcase.view']({ title }),
      }}
      categories={Object.entries(categories).map(([id, label]) => ({
        id: id as keyof typeof categories,
        label,
      }))}
      items={POSTER_EXAMPLES.map((item) => ({
        ...item,
        ...text[item.id],
        size: '2:3',
        image: `/imgs/poster-examples/${item.id}.webp`,
        categoryLabel: categories[item.category],
        styleLabel: styles[item.style],
      }))}
      onUseExample={onUseExample}
    />
  );
}
