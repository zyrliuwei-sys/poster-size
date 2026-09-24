import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Download, Sparkles } from 'lucide-react';

export type PosterGeneratorFormat = {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: string;
  aspectRatio: string;
};

export type PosterGeneratorTemplate = {
  id: 'editorial' | 'signal' | 'notice';
  label: string;
  note: string;
};

export type PosterGeneratorPalette = {
  id: 'coral' | 'blue' | 'yellow';
  label: string;
  background: string;
  ink: string;
  accent: string;
  detail: string;
};

export type PosterGeneratorCopy = {
  kicker: string;
  title: string;
  description: string;
  previewLabel: string;
  controlsLabel: string;
  format: string;
  template: string;
  palette: string;
  headline: string;
  headlinePlaceholder: string;
  subline: string;
  sublinePlaceholder: string;
  download: string;
  downloaded: string;
  downloadHelp: string;
  previewAlt: string;
  formatDetails: (params: {
    width: number;
    height: number;
    unit: string;
    ratio: string;
  }) => string;
  draftNote: string;
};

type PosterGeneratorProps = {
  copy: PosterGeneratorCopy;
  formats: PosterGeneratorFormat[];
  templates: PosterGeneratorTemplate[];
  palettes: PosterGeneratorPalette[];
};

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const tokens = text.trim().includes(' ')
    ? text.trim().split(/\s+/)
    : Array.from(text.trim());
  const lines: string[] = [];
  let current = '';

  for (const token of tokens) {
    const next = current
      ? `${current}${text.includes(' ') ? ' ' : ''}${token}`
      : token;
    if (current && context.measureText(next).width > maxWidth) {
      lines.push(current);
      current = token;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 5);
}

function drawPoster(
  canvas: HTMLCanvasElement,
  format: PosterGeneratorFormat,
  template: PosterGeneratorTemplate['id'],
  palette: PosterGeneratorPalette,
  headline: string,
  subline: string
) {
  const width = 900;
  const height = Math.max(
    520,
    Math.round(width * (format.height / format.width))
  );
  const context = canvas.getContext('2d');
  if (!context) return;

  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, width, height);
  context.fillStyle = palette.background;
  context.fillRect(0, 0, width, height);

  const pad = Math.round(width * 0.08);
  const shortSide = Math.min(width, height);
  const stripe = Math.round(shortSide * 0.06);

  context.lineWidth = 4;
  context.strokeStyle = palette.ink;
  context.fillStyle = palette.accent;

  if (template === 'editorial') {
    context.fillRect(pad, pad, width - pad * 2, stripe);
    context.fillStyle = palette.detail;
    context.fillRect(width - pad * 3, pad + stripe * 2, pad * 2, pad * 2);
    context.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
    context.beginPath();
    context.arc(pad * 2, height - pad * 1.7, pad * 0.65, 0, Math.PI * 2);
    context.fillStyle = palette.accent;
    context.fill();
  } else if (template === 'signal') {
    context.save();
    context.translate(width * 0.7, height * 0.3);
    context.rotate(-0.16);
    context.fillRect(-width * 0.58, -stripe * 1.5, width * 0.9, stripe * 3);
    context.restore();
    context.fillStyle = palette.detail;
    context.beginPath();
    context.arc(width * 0.78, height * 0.7, shortSide * 0.16, 0, Math.PI * 2);
    context.fill();
    context.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
  } else {
    context.fillStyle = palette.ink;
    context.fillRect(pad, pad, width - pad * 2, stripe);
    context.fillStyle = palette.accent;
    context.fillRect(pad, height * 0.54, width - pad * 2, height * 0.2);
    context.fillStyle = palette.detail;
    context.fillRect(width * 0.62, height * 0.2, width * 0.2, height * 0.2);
    context.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
  }

  context.fillStyle = palette.ink;
  context.textBaseline = 'top';
  context.font = '700 22px "Space Grotesk", sans-serif';
  context.fillText('POSTER SIZE', pad, pad + stripe * 1.8);

  const headlineSize = headline.length > 18 ? 66 : 88;
  context.font = `700 ${headlineSize}px "Space Grotesk", sans-serif`;
  const headlineLines = wrapCanvasText(
    context,
    headline.trim().toUpperCase() || 'MAKE IT FIT',
    width - pad * 2
  );
  const headlineLineHeight = headlineSize * 0.92;
  const headlineTop = height * 0.53;
  headlineLines.forEach((line, index) => {
    context.fillText(line, pad, headlineTop + index * headlineLineHeight);
  });

  context.font = '500 25px "IBM Plex Sans", sans-serif';
  const sublineTop =
    headlineTop + headlineLines.length * headlineLineHeight + 28;
  const sublineLines = wrapCanvasText(
    context,
    subline.trim() || 'A clear message for a well-sized canvas.',
    width * 0.58
  );
  sublineLines.forEach((line, index) => {
    context.fillText(line, pad, sublineTop + index * 34);
  });

  context.font = '600 18px "IBM Plex Sans", sans-serif';
  context.fillText(
    `${format.name}  /  ${format.aspectRatio}`,
    pad,
    height - pad - 28
  );
}

export function PosterGenerator({
  copy,
  formats,
  templates,
  palettes,
}: PosterGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formatId, setFormatId] = useState(formats[0]?.id ?? 'a4');
  const [templateId, setTemplateId] = useState<PosterGeneratorTemplate['id']>(
    templates[0]?.id ?? 'editorial'
  );
  const [paletteId, setPaletteId] = useState<PosterGeneratorPalette['id']>(
    palettes[0]?.id ?? 'coral'
  );
  const [headline, setHeadline] = useState(copy.headlinePlaceholder);
  const [subline, setSubline] = useState(copy.sublinePlaceholder);
  const [downloaded, setDownloaded] = useState(false);

  const format = useMemo(
    () => formats.find((item) => item.id === formatId) ?? formats[0],
    [formatId, formats]
  );
  const palette = useMemo(
    () => palettes.find((item) => item.id === paletteId) ?? palettes[0],
    [paletteId, palettes]
  );

  useEffect(() => {
    if (!canvasRef.current || !format || !palette) return;
    drawPoster(
      canvasRef.current,
      format,
      templateId,
      palette,
      headline,
      subline
    );
  }, [format, headline, palette, subline, templateId]);

  function downloadPoster() {
    if (!canvasRef.current || !format) return;
    const link = document.createElement('a');
    link.download = `poster-size-${format.id}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    setDownloaded(true);
  }

  if (!format || !palette) return null;

  return (
    <section className="ps-generator" aria-labelledby="poster-generator-title">
      <div className="ps-generator-intro">
        <div>
          <p className="ps-eyebrow">{copy.kicker}</p>
          <h1 id="poster-generator-title">{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <div className="ps-generator-intro-mark" aria-hidden="true">
          <Sparkles size={18} />
          <span>01</span>
        </div>
      </div>

      <div className="ps-generator-workspace">
        <div className="ps-generator-stage">
          <div className="ps-generator-stage-head">
            <span>{format.name}</span>
            <span>
              {copy.formatDetails({
                width: format.width,
                height: format.height,
                unit: format.unit,
                ratio: format.aspectRatio,
              })}
            </span>
          </div>
          <div className="ps-generator-canvas-wrap">
            <canvas
              ref={canvasRef}
              className="ps-generator-canvas"
              aria-label={copy.previewAlt}
            />
          </div>
          <div className="ps-generator-stage-foot">
            <span>{copy.previewAlt}</span>
            <span>PNG / 01</span>
          </div>
        </div>

        <aside
          className="ps-generator-controls"
          aria-label={copy.controlsLabel}
        >
          <div className="ps-generator-controls-head">
            <div>
              <span className="ps-generator-label">{copy.controlsLabel}</span>
              <h2>{copy.format}</h2>
            </div>
            <span className="ps-generator-control-count">3 inputs</span>
          </div>

          <div className="ps-generator-control-group">
            <div className="ps-generator-group-head">
              <span>{copy.format}</span>
              <span>{format.aspectRatio}</span>
            </div>
            <div className="ps-generator-format-grid">
              {formats.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`ps-generator-format-option ${
                    formatId === item.id ? 'is-active' : ''
                  }`}
                  aria-pressed={formatId === item.id}
                  onClick={() => setFormatId(item.id)}
                >
                  <span>{item.name}</span>
                  <small>{item.aspectRatio}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="ps-generator-control-group">
            <div className="ps-generator-group-head">
              <span>{copy.template}</span>
              <span>3</span>
            </div>
            <div className="ps-generator-template-list">
              {templates.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`ps-generator-template-option ${
                    templateId === item.id ? 'is-active' : ''
                  }`}
                  aria-pressed={templateId === item.id}
                  onClick={() => setTemplateId(item.id)}
                >
                  <span>{item.label}</span>
                  <small>{item.note}</small>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="ps-generator-control-group ps-generator-copy-group">
            <label htmlFor="poster-generator-headline">{copy.headline}</label>
            <input
              id="poster-generator-headline"
              value={headline}
              maxLength={48}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder={copy.headlinePlaceholder}
            />
            <label htmlFor="poster-generator-subline">{copy.subline}</label>
            <textarea
              id="poster-generator-subline"
              value={subline}
              maxLength={120}
              rows={3}
              onChange={(event) => setSubline(event.target.value)}
              placeholder={copy.sublinePlaceholder}
            />
          </div>

          <div className="ps-generator-control-group">
            <div className="ps-generator-group-head">
              <span>{copy.palette}</span>
              <span>{palette.label}</span>
            </div>
            <div className="ps-generator-palette-list">
              {palettes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`ps-generator-palette-option ${
                    paletteId === item.id ? 'is-active' : ''
                  }`}
                  aria-label={item.label}
                  aria-pressed={paletteId === item.id}
                  onClick={() => setPaletteId(item.id)}
                >
                  <span
                    style={{
                      background: `linear-gradient(135deg, ${item.background} 48%, ${item.accent} 48%)`,
                    }}
                  />
                  <small>{item.label}</small>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="ps-generator-download"
            onClick={downloadPoster}
          >
            <Download size={17} aria-hidden="true" />
            <span>{downloaded ? copy.downloaded : copy.download}</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </button>
          <p className="ps-generator-download-help">{copy.downloadHelp}</p>
        </aside>
      </div>
    </section>
  );
}
