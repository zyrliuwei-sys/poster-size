import { ArrowLeft } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { PosterFooter } from '@/components/poster-footer';
import {
  PosterGenerator,
  type PosterGeneratorFormat,
  type PosterGeneratorPalette,
  type PosterGeneratorTemplate,
} from '@/components/poster-generator';
import { PosterHeader } from '@/components/poster-header';

const formats: PosterGeneratorFormat[] = [
  {
    id: 'a4',
    name: 'A4',
    width: 210,
    height: 297,
    unit: 'mm',
    aspectRatio: '1:1.41',
  },
  {
    id: '18x24',
    name: '18 × 24 in',
    width: 18,
    height: 24,
    unit: 'in',
    aspectRatio: '3:4',
  },
  {
    id: 'square',
    name: 'Square 5 × 5 in',
    width: 5,
    height: 5,
    unit: 'in',
    aspectRatio: '1:1',
  },
  {
    id: 'presentation',
    name: 'Presentation 16:9',
    width: 1920,
    height: 1080,
    unit: 'px',
    aspectRatio: '16:9',
  },
];

function getPalettes(): PosterGeneratorPalette[] {
  return [
    {
      id: 'coral',
      label: m['poster.generator.palette.coral'](),
      background: '#f2ead8',
      ink: '#2b1b18',
      accent: '#d9563a',
      detail: '#f2c933',
    },
    {
      id: 'blue',
      label: m['poster.generator.palette.blue'](),
      background: '#e8eee8',
      ink: '#192a2e',
      accent: '#2f6fa5',
      detail: '#d9563a',
    },
    {
      id: 'yellow',
      label: m['poster.generator.palette.yellow'](),
      background: '#f0e6c9',
      ink: '#2b1b18',
      accent: '#efc72b',
      detail: '#5a80a8',
    },
  ];
}

function getTemplates(): PosterGeneratorTemplate[] {
  return [
    {
      id: 'editorial',
      label: m['poster.generator.template.editorial'](),
      note: m['poster.generator.template.editorial_note'](),
    },
    {
      id: 'signal',
      label: m['poster.generator.template.signal'](),
      note: m['poster.generator.template.signal_note'](),
    },
    {
      id: 'notice',
      label: m['poster.generator.template.notice'](),
      note: m['poster.generator.template.notice_note'](),
    },
  ];
}

export function PosterGeneratorBlock() {
  const palettes = getPalettes();
  const templates = getTemplates();

  return (
    <div className="ps-page ps-generator-page">
      <PosterHeader />
      <main className="ps-generator-main">
        <Link href="/size-guide" className="ps-generator-back">
          <ArrowLeft size={16} aria-hidden="true" />
          {m['poster.generator.back']()}
        </Link>
        <PosterGenerator
          copy={{
            kicker: m['poster.generator.kicker'](),
            title: m['poster.generator.title'](),
            description: m['poster.generator.description'](),
            previewLabel: m['poster.generator.preview_label'](),
            controlsLabel: m['poster.generator.controls_label'](),
            format: m['poster.generator.format'](),
            template: m['poster.generator.template'](),
            palette: m['poster.generator.palette'](),
            headline: m['poster.generator.headline'](),
            headlinePlaceholder: m['poster.generator.headline_placeholder'](),
            subline: m['poster.generator.subline'](),
            sublinePlaceholder: m['poster.generator.subline_placeholder'](),
            download: m['poster.generator.download'](),
            downloaded: m['poster.generator.downloaded'](),
            downloadHelp: m['poster.generator.download_help'](),
            previewAlt: m['poster.generator.preview_alt'](),
            formatDetails: ({ width, height, unit, ratio }) =>
              m['poster.generator.format_details']({
                width,
                height,
                unit,
                ratio,
              }),
            draftNote: m['poster.generator.draft_note'](),
          }}
          formats={formats}
          templates={templates}
          palettes={palettes}
        />
      </main>
      <PosterFooter />
    </div>
  );
}
