export interface CalendarDesignExample {
  id: string;
  image: string;
  title: string;
  description: string;
  alt: string;
}

export function CalendarDesignShowcase({
  copy,
  items,
}: {
  copy: {
    title: string;
    description: string;
    note: string;
    view: (title: string) => string;
  };
  items: CalendarDesignExample[];
}) {
  return (
    <section
      className="cal-design-showcase"
      id="desk-calendar-designs"
      aria-labelledby="calendar-design-title"
    >
      <div className="cal-design-heading">
        <h2 id="calendar-design-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>
      <div className="cal-design-grid">
        {items.map((item) => (
          <figure key={item.id} className="cal-design-example">
            <a
              href={item.image}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={copy.view(item.title)}
            >
              <img
                src={item.image}
                alt={item.alt}
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
              />
            </a>
            <figcaption>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="cal-design-note">{copy.note}</p>
    </section>
  );
}
