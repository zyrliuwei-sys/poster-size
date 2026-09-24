import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type {
  IndexNowSettings,
  IndexNowSubmission,
  IndexNowVerification,
} from '@/features/indexnow/types';
import {
  Check,
  CircleAlert,
  Copy,
  ExternalLink,
  KeyRound,
  Save,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { apiGet, apiGetText, apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const queryKey = ['admin-indexnow'];

function generateKey() {
  return globalThis.crypto.randomUUID().replaceAll('-', '');
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
  toast.success(m['admin.indexnow.copied']());
}

function AdminIndexNowPage() {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [autoSubmit, setAutoSubmit] = useState(true);

  const settingsQuery = useQuery({
    queryKey,
    queryFn: () => apiGet<IndexNowSettings>('/api/admin/indexnow'),
  });

  useEffect(() => {
    if (!settingsQuery.data) return;
    setEnabled(settingsQuery.data.enabled);
    setAutoSubmit(settingsQuery.data.autoSubmit);
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiPost<IndexNowSettings>('/api/admin/indexnow', {
        action: 'save',
        apiKey: apiKey.trim() || undefined,
        enabled,
        autoSubmit,
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKey, saved);
      setApiKey('');
      toast.success(m['admin.indexnow.saved']());
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      apiPost<IndexNowSubmission>('/api/admin/indexnow', {
        action: 'submit',
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(m['admin.indexnow.submitted']({ count: result.submitted }));
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey });
      toast.error(error.message);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!settings?.keyLocation) {
        throw new Error(m['admin.indexnow.key_missing']());
      }
      const keyUrl = new URL(settings.keyLocation);
      const expectedKey = decodeURIComponent(
        keyUrl.pathname.slice(1, -'.txt'.length)
      );
      const responseKey = await apiGetText(settings.keyLocation);
      if (responseKey !== expectedKey) {
        return {
          ok: false,
          message: m['admin.indexnow.verify_mismatch'](),
        } satisfies IndexNowVerification;
      }
      return {
        ok: true,
        message: m['admin.indexnow.verify_success'](),
      } satisfies IndexNowVerification;
    },
    onSuccess: (result) => {
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const settings = settingsQuery.data;
  const saving = saveMutation.isPending;
  const apiKeyLocked = Boolean(settings?.apiKeyLocked);
  const hasKey = Boolean(settings?.configured || apiKey.trim());

  return (
    <div className="max-w-3xl space-y-4 p-4 md:p-6">
      <div className="mb-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {m['admin.indexnow.title']()}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {m['admin.indexnow.description']()}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="text-muted-foreground size-4" />
            {m['admin.indexnow.install_title']()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="indexnow-api-key">
              {m['admin.indexnow.key_label']()}
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="indexnow-api-key"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder={
                  settings?.apiKeyMasked ||
                  m['admin.indexnow.key_placeholder']()
                }
                autoComplete="off"
                className="font-mono"
                disabled={saving || apiKeyLocked}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() => setApiKey(generateKey())}
                disabled={saving || apiKeyLocked}
              >
                <KeyRound data-icon="inline-start" />
                {m['admin.indexnow.generate']()}
              </Button>
            </div>
            {apiKeyLocked ? (
              <p className="text-muted-foreground text-xs">
                {m['admin.indexnow.key_code_locked']()}
              </p>
            ) : null}
          </div>

          <div className="divide-y rounded-lg border px-3">
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <Label className="text-sm" htmlFor="indexnow-enabled">
                  {m['admin.indexnow.enabled']()}
                </Label>
              </div>
              <Switch
                id="indexnow-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <Label className="text-sm" htmlFor="indexnow-auto-submit">
                  {m['admin.indexnow.auto_submit']()}
                </Label>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {m['admin.indexnow.auto_submit_help']()}
                </p>
              </div>
              <Switch
                id="indexnow-auto-submit"
                checked={autoSubmit}
                onCheckedChange={setAutoSubmit}
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saving || !hasKey}
            className="gap-2"
          >
            <Save className="size-4" />
            {saving ? m['admin.indexnow.saving']() : m['admin.indexnow.save']()}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="text-muted-foreground size-4" />
            {m['admin.indexnow.verify_title']()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings?.keyLocation && (
            <div className="bg-muted/30 flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 truncate text-xs">
                {settings.keyLocation}
              </code>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => copyText(settings.keyLocation!)}
                >
                  <Copy data-icon="inline-start" />
                  {m['admin.indexnow.copy']()}
                </Button>
                <a
                  href={settings.keyLocation}
                  target="_blank"
                  rel="noreferrer"
                  className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-medium"
                >
                  <ExternalLink className="size-3.5" />
                  {m['admin.indexnow.open']()}
                </a>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => verifyMutation.mutate()}
              disabled={!settings?.configured || verifyMutation.isPending}
            >
              <Check data-icon="inline-start" />
              {verifyMutation.isPending
                ? m['admin.indexnow.verifying']()
                : m['admin.indexnow.verify']()}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => submitMutation.mutate()}
              disabled={
                !settings?.configured || !enabled || submitMutation.isPending
              }
            >
              <Send data-icon="inline-start" />
              {submitMutation.isPending
                ? m['admin.indexnow.submitting']()
                : m['admin.indexnow.submit']()}
            </Button>
          </div>
          {settings?.lastSubmittedAt && (
            <p className="text-muted-foreground text-xs">
              {m['admin.indexnow.last_submitted']({
                count: settings.lastSubmittedCount,
                time: new Date(settings.lastSubmittedAt).toLocaleString(),
              })}
            </p>
          )}
          {settings?.lastError && (
            <div
              role="alert"
              className="border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                {settings.lastError.includes('(429)')
                  ? m['admin.indexnow.rate_limited']({
                      time: settings.rateLimitedUntil
                        ? new Date(settings.rateLimitedUntil).toLocaleString()
                        : m['admin.indexnow.unknown_time'](),
                    })
                  : settings.lastError}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/admin/indexnow')({
  component: AdminIndexNowPage,
});
