import {
  createCalendarSvg,
  getCalendarMonths,
  getPaperDimensions,
  type CalendarLabels,
  type CalendarSettings,
} from './calendar-2027';

function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function downloadCalendarSvg(
  settings: CalendarSettings,
  labels: CalendarLabels
) {
  const svg = createCalendarSvg(settings, labels);
  saveFile(
    new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
    `printable-2027-calendar-${settings.layout === 'year' ? 'year' : settings.month + 1}.svg`
  );
}

async function svgToPng(svg: string, widthMm: number, heightMm: number) {
  const url = URL.createObjectURL(
    new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  );
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = Math.round((widthMm / 25.4) * 300);
    canvas.height = Math.round((heightMm / 25.4) * 300);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) =>
          result ? resolve(result) : reject(new Error('Image export failed')),
        'image/png'
      )
    );
    canvas.width = canvas.height = 0;
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadCalendarPdf(
  settings: CalendarSettings,
  labels: CalendarLabels
) {
  const { PDFDocument } = await import('pdf-lib');
  const document = await PDFDocument.create();
  document.setTitle('Printable 2027 Calendar');
  document.setSubject(settings.title || 'Custom printable 2027 calendar');
  const paper = getPaperDimensions(settings);
  const width = (paper.width / 25.4) * 72;
  const height = (paper.height / 25.4) * 72;
  for (const month of getCalendarMonths(settings)) {
    const image = await document.embedPng(
      await svgToPng(
        createCalendarSvg(settings, labels, month),
        paper.width,
        paper.height
      )
    );
    document
      .addPage([width, height])
      .drawImage(image, { x: 0, y: 0, width, height });
  }
  const bytes = await document.save();
  saveFile(
    new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
    `printable-2027-calendar-${settings.layout}-${settings.paper}.pdf`
  );
}

export function printCalendar(
  settings: CalendarSettings,
  labels: CalendarLabels
) {
  const paper = getPaperDimensions(settings);
  const frame = document.createElement('iframe');
  frame.style.cssText =
    'position:fixed;width:0;height:0;border:0;bottom:0;right:0';
  frame.title = 'Print calendar';
  frame.onload = () => {
    const target = frame.contentWindow;
    if (!target) {
      frame.remove();
      return;
    }
    target.addEventListener('afterprint', () => frame.remove(), { once: true });
    target.focus();
    target.print();
  };
  frame.srcdoc = `<!doctype html><html><head><title>Printable 2027 Calendar</title><style>@page{size:${paper.width}mm ${paper.height}mm;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}.sheet{width:${paper.width}mm;height:${paper.height}mm;break-after:page}.sheet:last-child{break-after:auto}svg{display:block;width:100%;height:100%}</style></head><body>${getCalendarMonths(
    settings
  )
    .map(
      (month) =>
        `<div class="sheet">${createCalendarSvg(settings, labels, month)}</div>`
    )
    .join('')}</body></html>`;
  document.body.appendChild(frame);
}
