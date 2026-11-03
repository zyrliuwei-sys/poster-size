import { useEffect, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  LoaderCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { useSession } from '@/core/auth/client';
import type { PosterExamplePreset } from '@/config/poster-examples';
import {
  POSTER_CREDITS,
  POSTER_QUALITIES,
  POSTER_SIZES,
  posterInputSchema,
  type PosterGenerationConfig,
  type PosterInput,
  type PosterTaskView,
} from '@/config/poster-generation';
import { apiGet, apiPost } from '@/lib/api-client';
import {
  PosterCreditPricing,
  type PosterCreditPricingCopy,
} from '@/components/poster-credit-pricing';

export interface AIPosterCopy {
  kicker: string;
  title: string;
  description: string;
  prompt: string;
  placeholder: string;
  inspiration: string;
  style: string;
  size: string;
  quality: string;
  generate: string;
  generating: string;
  signIn: string;
  creditCost: (credits: number) => string;
  balance: (credits: number) => string;
  preview: string;
  sample: string;
  ready: string;
  waiting: string;
  waitingNote: string;
  download: string;
  expiry: string;
  retry: string;
  notConfigured: string;
  insufficient: string;
  pricing: string;
  model: string;
  promptError: string;
  statusError: string;
  refunded: string;
  examplesLabel: string;
  sampleTitle: string;
  sampleSubtitle: string;
  sampleFooter: string;
  resultAlt: string;
  creditPricing: PosterCreditPricingCopy;
  presetApplied: string;
  errors: Record<string, string>;
  qualities: Record<PosterInput['quality'], string>;
  sizes: Record<PosterInput['size'], string>;
}

interface Props {
  preset?: PosterExamplePreset | null;
  copy: AIPosterCopy;
  styles: { id: PosterInput['style']; label: string }[];
  examples: { label: string; prompt: string; style: PosterInput['style'] }[];
}

const DRAFT_KEY = 'ps-poster-draft-v1';
const PENDING_POSTER_KEY = 'ps-pending-poster-v1';
const GUEST_TASK_KEY = 'ps-poster-task:guest';

export function AIPosterGenerator({ copy, styles, examples, preset }: Props) {
  const { data: session, isPending: sessionPending } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const [style, setStyle] = useState<PosterInput['style']>('auto');
  const [size, setSize] = useState<PosterInput['size']>('2:3');
  const [quality, setQuality] = useState<PosterInput['quality']>('1K');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [resumeInput, setResumeInput] = useState<PosterInput | null>(null);
  const appliedPreset = useRef<PosterExamplePreset | null>(null);

  const config = useQuery({
    queryKey: ['poster-generation-config', userId || 'anonymous'],
    queryFn: () => apiGet<PosterGenerationConfig>('/api/poster-generation'),
    staleTime: 30_000,
  });
  const mutation = useMutation({
    mutationFn: (input: PosterInput) =>
      apiPost<PosterTaskView>('/api/poster-generation', input),
    onSuccess: (task) => {
      const taskIdentity = userId || 'guest';
      queryClient.setQueryData(['poster-task', taskIdentity, task.id], task);
      setTaskId(task.id);
      setImageFailed(false);
      try {
        localStorage.setItem(
          userId ? `ps-poster-task:${userId}` : GUEST_TASK_KEY,
          task.id
        );
      } catch {
        /* Storage is optional. */
      }
      queryClient.invalidateQueries({ queryKey: ['poster-generation-config'] });
    },
  });
  const identityKey = userId || (config.data?.guest ? 'guest' : null);
  const taskQuery = useQuery({
    queryKey: ['poster-task', identityKey, taskId],
    queryFn: () =>
      apiGet<PosterTaskView>(
        `/api/poster-generation?id=${encodeURIComponent(taskId!)}`
      ),
    enabled: Boolean(identityKey && taskId),
    refetchInterval: (query) =>
      ['success', 'failed', 'canceled'].includes(query.state.data?.status || '')
        ? false
        : 4000,
    retry: 2,
  });
  const task = taskQuery.data;
  const busy =
    mutation.isPending ||
    Boolean(
      taskId && (!task || ['pending', 'processing'].includes(task.status))
    );
  const costs = config.data?.costs || POSTER_CREDITS;
  const insufficient =
    config.data?.balance !== null &&
    config.data?.balance !== undefined &&
    config.data.balance < costs[quality];
  const form = useForm({
    defaultValues: { prompt: '' },
    validators: {
      onSubmit: z.object({
        prompt: z
          .string()
          .trim()
          .min(3, copy.promptError)
          .max(3000, copy.promptError),
      }),
    },
    onSubmit: ({ value }) => {
      if (busy) return;
      const input = { prompt: value.prompt.trim(), style, size, quality };
      if (!userId && !config.data?.guest) {
        savePendingPoster(input);
        setPurchaseOpen(true);
        return;
      }
      if (insufficient) {
        savePendingPoster(input);
        setPurchaseOpen(true);
        return;
      }
      mutation.mutate(input);
    },
  });

  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) form.setFieldValue('prompt', draft.slice(0, 3000));
    } catch {
      /* Storage is optional. */
    }
  }, [form]);
  useEffect(() => {
    if (!preset || busy || appliedPreset.current === preset) return;
    appliedPreset.current = preset;
    form.setFieldValue('prompt', preset.prompt);
    setStyle(preset.style);
    setSize(preset.size);
    mutation.reset();
    try {
      localStorage.setItem(DRAFT_KEY, preset.prompt);
    } catch {
      /* Storage is optional. */
    }
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    document.getElementById('poster-generator')?.scrollIntoView({
      behavior: reducedMotion ? 'instant' : 'smooth',
      block: 'start',
    });
    document.getElementById('ai-poster-prompt')?.focus({ preventScroll: true });
    toast.success(copy.presetApplied);
  }, [preset, busy, form, copy.presetApplied]);
  useEffect(() => {
    setTaskId(null);
    if (identityKey) {
      try {
        setTaskId(
          localStorage.getItem(
            userId ? `ps-poster-task:${userId}` : GUEST_TASK_KEY
          )
        );
      } catch {
        /* Storage is optional. */
      }
    }
  }, [identityKey, userId]);
  useEffect(() => {
    if (task && ['success', 'failed', 'canceled'].includes(task.status))
      queryClient.invalidateQueries({ queryKey: ['poster-generation-config'] });
  }, [task?.status, queryClient]);

  const errorMessage = mutation.error
    ? copy.errors[mutation.error.message] ||
      copy.errors.POSTER_GENERATION_FAILED
    : null;

  function savePendingPoster(input: PosterInput) {
    try {
      localStorage.setItem(PENDING_POSTER_KEY, JSON.stringify(input));
    } catch {
      /* Storage is optional. */
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('poster_paid') !== '1') return;

    try {
      const raw = localStorage.getItem(PENDING_POSTER_KEY);
      const parsed = raw ? posterInputSchema.safeParse(JSON.parse(raw)) : null;
      if (parsed?.success) {
        setStyle(parsed.data.style);
        setSize(parsed.data.size);
        setQuality(parsed.data.quality);
        form.setFieldValue('prompt', parsed.data.prompt);
        setResumeInput(parsed.data);
      }
      url.searchParams.delete('poster_paid');
      window.history.replaceState(
        {},
        '',
        `${url.pathname}${url.search}${url.hash}`
      );
    } catch {
      /* Storage is optional. */
    }
  }, [form]);

  useEffect(() => {
    if (
      !resumeInput ||
      busy ||
      !config.data?.configured ||
      config.data.balance == null ||
      config.data.balance < costs[resumeInput.quality]
    )
      return;

    setResumeInput(null);
    try {
      localStorage.removeItem(PENDING_POSTER_KEY);
    } catch {
      /* Storage is optional. */
    }
    mutation.mutate(resumeInput);
  }, [busy, config.data, costs, mutation, resumeInput]);

  return (
    <section
      className="ps-ai-hero"
      id="poster-generator"
      aria-labelledby="ai-poster-title"
    >
      <div className="ps-ai-intro">
        <p className="ps-eyebrow">
          <span className="ps-ai-live-dot" />
          {copy.kicker}
        </p>
        <h1 id="ai-poster-title">{copy.title}</h1>
        <p>{copy.description}</p>
      </div>
      <div className="ps-ai-workspace">
        <form
          className="ps-ai-controls"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <div className="ps-ai-panel-heading">
            <span>01 / {copy.prompt}</span>
            <Sparkles size={17} aria-hidden="true" />
          </div>
          <form.Field name="prompt">
            {(field) => (
              <div className="ps-ai-prompt-field">
                <label className="sr-only" htmlFor="ai-poster-prompt">
                  {copy.prompt}
                </label>
                <textarea
                  id="ai-poster-prompt"
                  value={field.state.value}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                    try {
                      localStorage.setItem(DRAFT_KEY, event.target.value);
                    } catch {
                      /* Storage is optional. */
                    }
                  }}
                  onBlur={field.handleBlur}
                  maxLength={3000}
                  rows={5}
                  placeholder={copy.placeholder}
                  disabled={busy}
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={
                    field.state.meta.errors.length
                      ? 'ai-prompt-error'
                      : undefined
                  }
                />
                <span className="ps-ai-character-count">
                  {field.state.value.length} / 3000
                </span>
                {field.state.meta.errors.length > 0 && (
                  <p id="ai-prompt-error" className="ps-ai-error" role="alert">
                    {copy.promptError}
                  </p>
                )}
              </div>
            )}
          </form.Field>
          <div className="ps-ai-examples" aria-label={copy.examplesLabel}>
            <span>{copy.inspiration}</span>
            {examples.map((example, index) => (
              <button
                type="button"
                key={example.label}
                disabled={busy}
                onClick={() => {
                  form.setFieldValue('prompt', example.prompt);
                  setStyle(example.style);
                  setSampleIndex(index);
                  try {
                    localStorage.setItem(DRAFT_KEY, example.prompt);
                  } catch {
                    /* Storage is optional. */
                  }
                }}
              >
                {example.label}
                <ArrowUpRight size={12} aria-hidden="true" />
              </button>
            ))}
          </div>
          <fieldset className="ps-ai-styles" disabled={busy}>
            <legend>02 / {copy.style}</legend>
            <div>
              {styles.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={style === item.id}
                  className={style === item.id ? 'is-active' : ''}
                  onClick={() => setStyle(item.id)}
                >
                  {style === item.id && <Check size={12} aria-hidden="true" />}
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="ps-ai-select-row">
            <label htmlFor="ai-poster-size">
              <span>03 / {copy.size}</span>
              <select
                id="ai-poster-size"
                value={size}
                disabled={busy}
                onChange={(event) =>
                  setSize(event.target.value as PosterInput['size'])
                }
              >
                {POSTER_SIZES.map((value) => (
                  <option value={value} key={value}>
                    {copy.sizes[value]} · {value}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="ai-poster-quality">
              <span>04 / {copy.quality}</span>
              <select
                id="ai-poster-quality"
                value={quality}
                disabled={busy}
                onChange={(event) =>
                  setQuality(event.target.value as PosterInput['quality'])
                }
              >
                {POSTER_QUALITIES.map((value) => (
                  <option value={value} key={value}>
                    {value} · {copy.qualities[value]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="ps-ai-submit-area">
            <button
              className="ps-ai-generate"
              type="submit"
              disabled={sessionPending || busy || !config.data?.configured}
            >
              {busy ? (
                <LoaderCircle
                  className="ps-ai-spin"
                  size={18}
                  aria-hidden="true"
                />
              ) : (
                <Sparkles size={18} aria-hidden="true" />
              )}
              <span>{busy ? copy.generating : copy.generate}</span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </button>
            <div className="ps-ai-credit-note">
              <span>{copy.creditCost(costs[quality])}</span>
              {config.data?.balance != null && (
                <span>{copy.balance(config.data.balance)}</span>
              )}
            </div>
            {config.data?.configured === false && (
              <p className="ps-ai-error" role="status">
                {copy.notConfigured}
              </p>
            )}
            {config.isError && (
              <p className="ps-ai-error" role="alert">
                {copy.statusError}{' '}
                <button type="button" onClick={() => void config.refetch()}>
                  {copy.retry}
                </button>
              </p>
            )}
            {insufficient && (
              <p className="ps-ai-error">
                {copy.insufficient} {copy.pricing}
              </p>
            )}
            {errorMessage && (
              <p className="ps-ai-error" role="alert">
                {errorMessage}
              </p>
            )}
            {purchaseOpen && (
              <PosterCreditPricing
                copy={copy.creditPricing}
                mode="inline"
                onClose={() => setPurchaseOpen(false)}
                redirect="/?poster_paid=1#poster-generator"
                onBeforeCheckout={() =>
                  savePendingPoster({
                    prompt: form.state.values.prompt.trim(),
                    style,
                    size,
                    quality,
                  })
                }
              />
            )}
          </div>
        </form>
        <div
          className="ps-ai-preview-panel"
          aria-label={copy.preview}
          aria-busy={busy}
        >
          <div className="ps-ai-preview-heading">
            <span>{copy.preview}</span>
            <span className="ps-ai-preview-status">
              {busy
                ? copy.generating
                : task?.status === 'success'
                  ? copy.ready
                  : copy.sample}
            </span>
          </div>
          <div className="ps-ai-preview-stage">
            {task?.status === 'success' && task.imageUrl && !imageFailed ? (
              <img
                className="ps-ai-result"
                src={task.imageUrl}
                alt={copy.resultAlt}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div
                className={`ps-ai-sample ps-ai-sample-${sampleIndex % 3}`}
                aria-hidden="true"
              >
                <div className="ps-ai-sample-top">
                  <span>STUDIO / 026</span>
                  <span>
                    DESIGN
                    <br />
                    IN MOTION
                  </span>
                </div>
                <div className="ps-ai-sample-art">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="ps-ai-sample-type">
                  <span>{copy.sampleSubtitle}</span>
                  <strong>{copy.sampleTitle}</strong>
                </div>
                <div className="ps-ai-sample-bottom">
                  <span>{copy.sampleFooter}</span>
                  <span>↗</span>
                </div>
              </div>
            )}
            {busy && (
              <div className="ps-ai-loading" role="status">
                <LoaderCircle
                  size={30}
                  className="ps-ai-spin"
                  aria-hidden="true"
                />
                <strong>{copy.waiting}</strong>
                <p>{copy.waitingNote}</p>
                {task && task.progress > 0 && (
                  <progress
                    value={task.progress}
                    max={100}
                    aria-label={copy.generating}
                  />
                )}
              </div>
            )}
          </div>
          <div className="ps-ai-preview-footer" aria-live="polite">
            {task?.status === 'success' && task.imageUrl ? (
              <>
                <a
                  href={`/api/poster-generation?id=${encodeURIComponent(task.id)}&download=1`}
                  className="ps-ai-download"
                >
                  <ArrowDownToLine size={16} aria-hidden="true" />
                  {copy.download}
                </a>
                <span>
                  {task.size} / {task.quality}
                </span>
              </>
            ) : (
              <>
                <span>{copy.model}</span>
                <span>
                  {size} / {quality}
                </span>
              </>
            )}
          </div>
          {taskQuery.isError && (
            <p className="ps-ai-preview-note ps-ai-error" role="alert">
              {copy.statusError}{' '}
              <button type="button" onClick={() => void taskQuery.refetch()}>
                <RotateCcw size={13} />
                {copy.retry}
              </button>
            </p>
          )}
          {task && ['failed', 'canceled'].includes(task.status) && (
            <p className="ps-ai-preview-note ps-ai-error" role="alert">
              {copy.refunded}
            </p>
          )}
          {task?.status === 'success' && (
            <p className="ps-ai-preview-note">
              {imageFailed ? copy.errors.POSTER_DOWNLOAD_FAILED : copy.expiry}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
