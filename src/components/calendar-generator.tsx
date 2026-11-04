import { useMemo, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  Download,
  LoaderCircle,
  Printer,
  RotateCcw,
} from 'lucide-react';

import {
  CALENDAR_PALETTES,
  calendarSettingsSchema,
  calendarSvgDataUrl,
  createCalendarSvg,
  DEFAULT_CALENDAR_SETTINGS,
  getPaperDimensions,
  type CalendarLabels,
  type CalendarSettings,
} from '@/lib/calendar-2027';
import { TextField } from '@/components/form-field';

export interface CalendarGeneratorCopy {
  controls: string;
  reset: string;
  layout: string;
  year: string;
  month: string;
  allMonths: string;
  paper: string;
  orientation: string;
  portrait: string;
  landscape: string;
  weekStart: string;
  sunday: string;
  monday: string;
  palette: string;
  blue: string;
  ink: string;
  forest: string;
  title: string;
  titlePlaceholder: string;
  weekends: string;
  notes: string;
  download: string;
  exporting: string;
  print: string;
  svg: string;
  error: string;
  ready: string;
  preview: string;
  previewAlt: string;
  printHint: string;
  private: string;
  pages: (count: number) => string;
  previous: string;
  next: string;
  monthIndex: string;
}

export function CalendarGenerator({
  copy,
  labels,
}: {
  copy: CalendarGeneratorCopy;
  labels: CalendarLabels;
}) {
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<'ready' | 'error' | null>(null);
  const form = useForm({
    defaultValues: DEFAULT_CALENDAR_SETTINGS,
    validators: { onSubmit: calendarSettingsSchema },
    onSubmit: async ({ value }) => {
      setExporting(true);
      setMessage(null);
      try {
        const { downloadCalendarPdf } = await import('@/lib/calendar-export');
        await downloadCalendarPdf(value, labels);
        setMessage('ready');
      } catch {
        setMessage('error');
      } finally {
        setExporting(false);
      }
    },
  });
  const settings = useStore(form.store, (state) => state.values);
  const svg = useMemo(
    () => createCalendarSvg(settings, labels),
    [settings, labels]
  );
  const paper = getPaperDimensions(settings);
  const monthLabel =
    settings.layout === 'year'
      ? '2027'
      : `${labels.months[settings.month]} 2027`;

  const selectMonth = (month: number) => {
    form.setFieldValue('month', month);
    form.setFieldValue('layout', 'month');
    document.getElementById('calendar-generator')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      <section
        className="cal-workspace"
        id="calendar-generator"
        aria-label={copy.controls}
      >
        <form
          className="cal-controls"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <div className="cal-controls-heading">
            <h2>{copy.controls}</h2>
            <button
              type="button"
              className="cal-reset"
              onClick={() => {
                form.reset();
                setMessage(null);
              }}
              disabled={exporting}
            >
              <RotateCcw size={13} aria-hidden="true" />
              {copy.reset}
            </button>
          </div>

          <form.Field name="layout">
            {(field) => (
              <fieldset className="cal-field" disabled={exporting}>
                <legend>{copy.layout}</legend>
                <div className="cal-segmented">
                  {(
                    [
                      ['year', copy.year],
                      ['month', copy.month],
                      ['all-months', copy.allMonths],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={field.state.value === id}
                      onClick={() => field.handleChange(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </form.Field>

          {settings.layout !== 'year' && (
            <form.Field name="month">
              {(field) => (
                <label className="cal-field" htmlFor="calendar-month">
                  <span>{copy.month}</span>
                  <select
                    id="calendar-month"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(Number(event.target.value))
                    }
                    disabled={exporting}
                  >
                    {labels.months.map((month, i) => (
                      <option key={month} value={i}>
                        {month}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </form.Field>
          )}

          <div className="cal-control-grid">
            <form.Field name="paper">
              {(field) => (
                <label className="cal-field" htmlFor="calendar-paper">
                  <span>{copy.paper}</span>
                  <select
                    id="calendar-paper"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value as CalendarSettings['paper']
                      )
                    }
                    disabled={exporting}
                  >
                    <option value="a4">A4</option>
                    <option value="letter">US Letter</option>
                  </select>
                </label>
              )}
            </form.Field>
            <form.Field name="orientation">
              {(field) => (
                <label className="cal-field" htmlFor="calendar-orientation">
                  <span>{copy.orientation}</span>
                  <select
                    id="calendar-orientation"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value as CalendarSettings['orientation']
                      )
                    }
                    disabled={exporting}
                  >
                    <option value="portrait">{copy.portrait}</option>
                    <option value="landscape">{copy.landscape}</option>
                  </select>
                </label>
              )}
            </form.Field>
          </div>

          <form.Field name="weekStart">
            {(field) => (
              <fieldset className="cal-field" disabled={exporting}>
                <legend>{copy.weekStart}</legend>
                <div className="cal-segmented">
                  {(
                    [
                      ['monday', copy.monday],
                      ['sunday', copy.sunday],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={field.state.value === id}
                      onClick={() => field.handleChange(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </form.Field>

          <form.Field name="palette">
            {(field) => (
              <fieldset className="cal-field" disabled={exporting}>
                <legend>{copy.palette}</legend>
                <div className="cal-palettes">
                  {(['blue', 'ink', 'forest'] as const).map((id) => (
                    <button
                      key={id}
                      type="button"
                      aria-label={copy[id]}
                      aria-pressed={field.state.value === id}
                      onClick={() => field.handleChange(id)}
                    >
                      <span
                        style={{ background: CALENDAR_PALETTES[id] }}
                        aria-hidden="true"
                      />
                      {copy[id]}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </form.Field>

          <div className="cal-field cal-title-input">
            <form.Field name="title">
              {(field) => (
                <TextField
                  field={field}
                  label={copy.title}
                  placeholder={copy.titlePlaceholder}
                  disabled={exporting}
                />
              )}
            </form.Field>
          </div>

          <div className="cal-checkboxes">
            <form.Field name="weekends">
              {(field) => (
                <label>
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(event) =>
                      field.handleChange(event.target.checked)
                    }
                    disabled={exporting}
                  />
                  {copy.weekends}
                </label>
              )}
            </form.Field>
            <form.Field name="notes">
              {(field) => (
                <label>
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(event) =>
                      field.handleChange(event.target.checked)
                    }
                    disabled={exporting}
                  />
                  {copy.notes}
                </label>
              )}
            </form.Field>
          </div>

          <div className="cal-export-actions">
            <button type="submit" className="cal-download" disabled={exporting}>
              {exporting ? (
                <LoaderCircle
                  className="cal-spinner"
                  size={18}
                  aria-hidden="true"
                />
              ) : (
                <Download size={18} aria-hidden="true" />
              )}
              {exporting ? copy.exporting : copy.download}
              <span>{settings.layout === 'all-months' ? '12' : '1'} PDF</span>
            </button>
            <div className="cal-secondary-actions">
              <button
                type="button"
                disabled={exporting}
                onClick={async () => {
                  try {
                    const { printCalendar } =
                      await import('@/lib/calendar-export');
                    printCalendar(settings, labels);
                  } catch {
                    setMessage('error');
                  }
                }}
              >
                <Printer size={15} aria-hidden="true" />
                {copy.print}
              </button>
              <button
                type="button"
                disabled={exporting}
                onClick={async () => {
                  try {
                    const { downloadCalendarSvg } =
                      await import('@/lib/calendar-export');
                    downloadCalendarSvg(settings, labels);
                  } catch {
                    setMessage('error');
                  }
                }}
              >
                <ArrowDownToLine size={15} aria-hidden="true" />
                {copy.svg}
              </button>
            </div>
            {message && (
              <p
                className={message === 'error' ? 'cal-error' : 'cal-success'}
                role={message === 'error' ? 'alert' : 'status'}
              >
                {copy[message]}
              </p>
            )}
            <p className="cal-private">{copy.private}</p>
          </div>
        </form>

        <div className="cal-preview-area">
          <div className="cal-preview-bar">
            <span>{copy.preview}</span>
            <span>
              {settings.paper === 'a4' ? 'A4' : 'US Letter'} / {paper.width} ×{' '}
              {paper.height} mm
            </span>
          </div>
          <div className="cal-paper-stage">
            <img
              className="cal-paper"
              src={calendarSvgDataUrl(svg)}
              alt={`${copy.previewAlt}: ${monthLabel}`}
              width={Math.round(paper.width * 4)}
              height={Math.round(paper.height * 4)}
            />
          </div>
          <div className="cal-preview-bottom">
            <span>{copy.pages(settings.layout === 'all-months' ? 12 : 1)}</span>
            {settings.layout === 'all-months' && (
              <div className="cal-page-navigation">
                <button
                  type="button"
                  aria-label={copy.previous}
                  disabled={settings.month === 0 || exporting}
                  onClick={() =>
                    form.setFieldValue('month', settings.month - 1)
                  }
                >
                  <ChevronLeft size={16} />
                </button>
                <span>{settings.month + 1} / 12</span>
                <button
                  type="button"
                  aria-label={copy.next}
                  disabled={settings.month === 11 || exporting}
                  onClick={() =>
                    form.setFieldValue('month', settings.month + 1)
                  }
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            <span>{copy.printHint}</span>
          </div>
        </div>
      </section>

      <section
        className="cal-month-index"
        aria-labelledby="calendar-month-index"
      >
        <h2 id="calendar-month-index">{copy.monthIndex}</h2>
        <div>
          {labels.months.map((month, index) => (
            <button
              type="button"
              key={month}
              onClick={() => selectMonth(index)}
            >
              {month}
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
