import { m } from '@/paraglide/messages.js';
import { CalendarDesignShowcase } from '@/components/calendar-design-showcase';

export function CalendarDesignShowcaseBlock() {
  return (
    <CalendarDesignShowcase
      copy={{
        title: m['calendar2027.designs.title'](),
        description: m['calendar2027.designs.description'](),
        note: m['calendar2027.designs.note'](),
        view: (title) => m['calendar2027.designs.view']({ title }),
      }}
      items={[
        {
          id: 'typographic',
          image: '/imgs/calendar-examples/typographic-desk-calendar-2027.jpg',
          title: m['calendar2027.designs.typographic.title'](),
          description: m['calendar2027.designs.typographic.description'](),
          alt: m['calendar2027.designs.typographic.alt'](),
        },
        {
          id: 'botanical',
          image: '/imgs/calendar-examples/botanical-desk-calendar-2027.jpg',
          title: m['calendar2027.designs.botanical.title'](),
          description: m['calendar2027.designs.botanical.description'](),
          alt: m['calendar2027.designs.botanical.alt'](),
        },
        {
          id: 'color-block',
          image: '/imgs/calendar-examples/color-block-desk-calendar-2027.jpg',
          title: m['calendar2027.designs.color_block.title'](),
          description: m['calendar2027.designs.color_block.description'](),
          alt: m['calendar2027.designs.color_block.alt'](),
        },
      ]}
    />
  );
}
