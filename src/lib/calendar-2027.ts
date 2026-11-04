import { z } from 'zod';

export const CALENDAR_YEAR = 2027;
export const calendarSettingsSchema = z.object({
  layout: z.enum(['year', 'month', 'all-months']),
  month: z.number().int().min(0).max(11),
  weekStart: z.enum(['sunday', 'monday']),
  paper: z.enum(['a4', 'letter']),
  orientation: z.enum(['portrait', 'landscape']),
  palette: z.enum(['blue', 'ink', 'forest']),
  title: z.string().max(60),
  weekends: z.boolean(),
  notes: z.boolean(),
});

export type CalendarSettings = z.infer<typeof calendarSettingsSchema>;
export type CalendarLabels = {
  months: string[];
  weekdays: string[];
  notes: string;
  yearLabel: string;
};

export const DEFAULT_CALENDAR_SETTINGS: CalendarSettings = {
  layout: 'year',
  month: 0,
  weekStart: 'monday',
  paper: 'a4',
  orientation: 'portrait',
  palette: 'blue',
  title: '',
  weekends: true,
  notes: true,
};

export const CALENDAR_PALETTES = {
  blue: 'oklch(0.62 0.17 35)',
  ink: '#262d35',
  forest: '#25604d',
} as const;

export function getMonthCells(
  month: number,
  weekStart: CalendarSettings['weekStart']
) {
  const firstDay = new Date(Date.UTC(CALENDAR_YEAR, month, 1)).getUTCDay();
  const offset = (firstDay - (weekStart === 'monday' ? 1 : 0) + 7) % 7;
  const dayCount = new Date(Date.UTC(CALENDAR_YEAR, month + 1, 0)).getUTCDate();
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 && day <= dayCount ? day : null;
  });
}

export function getPaperDimensions(settings: CalendarSettings) {
  const [short, long] = settings.paper === 'a4' ? [210, 297] : [215.9, 279.4];
  return settings.orientation === 'portrait'
    ? { width: short, height: long }
    : { width: long, height: short };
}

export function getCalendarMonths(settings: CalendarSettings) {
  return settings.layout === 'all-months'
    ? Array.from({ length: 12 }, (_, i) => i)
    : [settings.layout === 'month' ? settings.month : null];
}

function escapeXml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[char]!
  );
}

/** The same SVG drives the live preview, downloads, and print output. */
export function createCalendarSvg(
  settings: CalendarSettings,
  labels: CalendarLabels,
  month: number | null = settings.layout === 'year' ? null : settings.month
) {
  const paper = getPaperDimensions(settings);
  const w = paper.width * 4;
  const h = paper.height * 4;
  const margin = 48;
  const accent = CALENDAR_PALETTES[settings.palette];
  const ink = 'oklch(0.24 0.035 42)';
  const muted = 'oklch(0.48 0.035 42)';
  const rule = 'oklch(0.24 0.035 42 / 0.22)';
  const order = Array.from(
    { length: 7 },
    (_, i) => (i + (settings.weekStart === 'monday' ? 1 : 0)) % 7
  );
  const parts: string[] = [];
  const text = (
    value: string,
    x: number,
    y: number,
    size: number,
    fill = ink,
    weight = 400,
    anchor = 'start'
  ) =>
    parts.push(
      `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${escapeXml(value)}</text>`
    );
  const line = (x1: number, y1: number, x2: number, y2: number, color = rule) =>
    parts.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1"/>`
    );

  text('2027', margin, 132, 112, accent, 700);
  text(
    month === null ? labels.yearLabel : labels.months[month],
    w - margin,
    128,
    month === null ? 16 : 34,
    accent,
    600,
    'end'
  );
  const title = settings.title.trim().slice(0, 60);
  const titleUnits = [...title].reduce(
    (sum, char) => sum + (char.charCodeAt(0) > 255 ? 1 : 0.6),
    0
  );
  if (title)
    text(
      title,
      margin + 2,
      165,
      Math.min(17, (w - margin * 2) / Math.max(1, titleUnits)),
      muted
    );
  line(margin, 186, w - margin, 186, accent);

  if (month === null) {
    const cols = settings.orientation === 'portrait' ? 3 : 4;
    const rows = 12 / cols;
    const gapX = 30;
    const gapY = 24;
    const top = 222;
    const bottom = settings.notes ? 112 : 62;
    const cw = (w - margin * 2 - (cols - 1) * gapX) / cols;
    const ch = (h - top - bottom - (rows - 1) * gapY) / rows;
    for (let m = 0; m < 12; m++) {
      const x = margin + (m % cols) * (cw + gapX);
      const y = top + Math.floor(m / cols) * (ch + gapY);
      const rowHeight = Math.min(24, (ch - 50) / 6);
      text(labels.months[m], x, y + 15, 16, accent, 700);
      order.forEach((day, col) =>
        text(
          labels.weekdays[day],
          x + ((col + 0.5) * cw) / 7,
          y + 40,
          10,
          muted,
          500,
          'middle'
        )
      );
      getMonthCells(m, settings.weekStart).forEach((day, index) => {
        if (day === null) return;
        const col = index % 7;
        const weekend = order[col] === 0 || order[col] === 6;
        text(
          String(day),
          x + ((col + 0.5) * cw) / 7,
          y + 60 + Math.floor(index / 7) * rowHeight,
          13,
          settings.weekends && weekend ? accent : ink,
          400,
          'middle'
        );
      });
    }
  } else {
    const x = margin;
    const top = 240;
    const cw = (w - margin * 2) / 7;
    const rh = (h - top - (settings.notes ? 154 : 62)) / 6;
    order.forEach((day, col) => {
      const weekend = day === 0 || day === 6;
      text(
        labels.weekdays[day],
        x + col * cw + 12,
        top - 17,
        14,
        settings.weekends && weekend ? accent : muted,
        600
      );
      if (settings.weekends && weekend)
        parts.push(
          `<rect x="${x + col * cw}" y="${top}" width="${cw}" height="${rh * 6}" fill="oklch(0.97 0.02 92)"/>`
        );
    });
    for (let col = 0; col <= 7; col++)
      line(x + col * cw, top, x + col * cw, top + rh * 6);
    for (let row = 0; row <= 6; row++)
      line(x, top + row * rh, w - margin, top + row * rh);
    getMonthCells(month, settings.weekStart).forEach((day, index) => {
      if (day === null) return;
      const col = index % 7;
      const weekend = order[col] === 0 || order[col] === 6;
      text(
        String(day),
        x + col * cw + 12,
        top + Math.floor(index / 7) * rh + 28,
        18,
        settings.weekends && weekend ? accent : ink,
        500
      );
    });
  }
  if (settings.notes) {
    text(labels.notes, margin, h - 82, 12, muted, 600);
    line(margin, h - 62, w - margin, h - 62);
    line(margin, h - 40, w - margin, h - 40);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#ffffff"/><g font-family="Arial, Helvetica, sans-serif">${parts.join('')}</g></svg>`;
}

export function calendarSvgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
