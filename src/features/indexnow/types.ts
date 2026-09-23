export type IndexNowSettings = {
  configured: boolean;
  enabled: boolean;
  autoSubmit: boolean;
  apiKeyMasked: string | null;
  keyLocation: string | null;
  lastSubmittedAt: string | null;
  lastSubmittedCount: number;
  lastError: string | null;
};

export type IndexNowSubmission = {
  submitted: number;
  batches: number;
  status: number;
};

export type IndexNowVerification = {
  ok: boolean;
  message: string;
};
