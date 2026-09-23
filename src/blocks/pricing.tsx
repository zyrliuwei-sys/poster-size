'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Check,
  Folder,
  Headphones,
  Mail,
  Puzzle,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { Link, useRouter } from '@/core/i18n/navigation';
import { creditsForPriceInCents } from '@/config/design-pricing';
import { apiPost } from '@/lib/api-client';
import { currentPathWithQuery } from '@/lib/redirect';
import { m } from '@/paraglide/messages.js';
import { usePublicConfig } from '@/hooks/use-public-config';
import {
  PaymentProviderModal,
  type PaymentProvider,
} from '@/components/payment-provider-modal';
import {
  PricingTable,
  type PricingGroup,
  type PricingPlan,
} from '@/components/pricing-table';

const ALL_PROVIDERS: PaymentProvider[] = [
  'stripe',
  'creem',
  'paypal',
  'alipay',
  'wechat',
];

export function Pricing({
  title,
  subtitle,
  heading = 'h2',
}: {
  title?: string;
  /** Secondary line under the heading (e.g. the old H2 copy on /pricing). */
  subtitle?: string;
  /** Heading level — /pricing passes h1 (it is the page's only H1). */
  heading?: 'h1' | 'h2';
} = {}) {
  const router = useRouter();
  const { data: session } = useSession();

  const { data: configsData } = usePublicConfig();
  const configs = configsData ?? {};
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);

  const enabledProviders = useMemo<PaymentProvider[]>(
    () => ALL_PROVIDERS.filter((p) => configs[`${p}_enabled`] === 'true'),
    [configs]
  );

  const creditsFeature = (priceInCents: number) => ({
    icon: Sparkles,
    label: m['landing.pricing.credits']({
      credits: creditsForPriceInCents(priceInCents).toLocaleString(),
    }),
  });

  const designsFeature = (priceInCents: number) => ({
    icon: Check,
    label: m['landing.pricing.designs']({
      count: Math.floor(
        creditsForPriceInCents(priceInCents) / 14
      ).toLocaleString(),
    }),
  });

  const hobbyFeatures = (priceInCents: number) => [
    { icon: Folder, label: m['landing.pricing.feature_1_project']() },
    creditsFeature(priceInCents),
    designsFeature(priceInCents),
    { icon: Mail, label: m['landing.pricing.feature_email_support']() },
  ];
  const designerFeatures = (priceInCents: number) => [
    creditsFeature(priceInCents),
    designsFeature(priceInCents),
    { icon: Zap, label: m['landing.pricing.feature_priority_support']() },
    { icon: Terminal, label: m['landing.pricing.feature_api_access']() },
  ];
  const studioFeatures = (priceInCents: number) => [
    { icon: Check, label: m['landing.pricing.feature_everything_pro']() },
    creditsFeature(priceInCents),
    designsFeature(priceInCents),
    {
      icon: Headphones,
      label: m['landing.pricing.feature_dedicated_support'](),
    },
    { icon: Puzzle, label: m['landing.pricing.feature_custom_integrations']() },
  ];

  const hobby = m['landing.pricing.starter']();
  const designer = m['landing.pricing.pro']();
  const studio = m['landing.pricing.enterprise']();

  const oneTime = { hobby: 500, designer: 1500, studio: 3900 } as const;
  const monthly = { hobby: 900, designer: 1900, studio: 3900 } as const;
  const yearly = { hobby: 7900, designer: 16900, studio: 34900 } as const;

  const groups: PricingGroup[] = [
    {
      key: 'monthly',
      label: m['landing.pricing.monthly'](),
      plans: [
        {
          id: 'starter-monthly',
          name: hobby,
          description: m['landing.pricing.starter_desc'](),
          price: '$9',
          interval: 'mo',
          features: hobbyFeatures(monthly.hobby),
          productId: 'starter_monthly',
          priceInCents: monthly.hobby,
          currency: 'usd',
          credits: creditsForPriceInCents(monthly.hobby),
          plan: { name: 'Starter', interval: 'month', intervalCount: 1 },
        },
        {
          id: 'pro-monthly',
          name: designer,
          description: m['landing.pricing.pro_desc'](),
          price: '$19',
          interval: 'mo',
          featured: true,
          badge: m['landing.pricing.popular'](),
          features: designerFeatures(monthly.designer),
          productId: 'pro_monthly',
          priceInCents: monthly.designer,
          currency: 'usd',
          credits: creditsForPriceInCents(monthly.designer),
          plan: { name: 'Pro', interval: 'month', intervalCount: 1 },
        },
        {
          id: 'enterprise-monthly',
          name: studio,
          description: m['landing.pricing.enterprise_desc'](),
          price: '$39',
          interval: 'mo',
          features: studioFeatures(monthly.studio),
          productId: 'enterprise_monthly',
          priceInCents: monthly.studio,
          currency: 'usd',
          credits: creditsForPriceInCents(monthly.studio),
          plan: { name: 'Enterprise', interval: 'month', intervalCount: 1 },
        },
      ],
    },
    {
      key: 'yearly',
      label: m['landing.pricing.yearly'](),
      plans: [
        {
          id: 'starter-yearly',
          name: hobby,
          description: m['landing.pricing.starter_desc'](),
          price: '$7',
          originalPrice: '$9',
          interval: 'mo',
          billingNote: m['landing.pricing.billed_annually']({ price: '$79' }),
          checkoutPrice: '$79 / year',
          features: hobbyFeatures(yearly.hobby),
          productId: 'starter_yearly',
          priceInCents: yearly.hobby,
          currency: 'usd',
          credits: creditsForPriceInCents(yearly.hobby),
          plan: { name: 'Starter', interval: 'year', intervalCount: 1 },
        },
        {
          id: 'pro-yearly',
          name: designer,
          description: m['landing.pricing.pro_desc'](),
          price: '$14',
          originalPrice: '$19',
          interval: 'mo',
          billingNote: m['landing.pricing.billed_annually']({ price: '$169' }),
          checkoutPrice: '$169 / year',
          featured: true,
          badge: m['landing.pricing.popular'](),
          features: designerFeatures(yearly.designer),
          productId: 'pro_yearly',
          priceInCents: yearly.designer,
          currency: 'usd',
          credits: creditsForPriceInCents(yearly.designer),
          plan: { name: 'Pro', interval: 'year', intervalCount: 1 },
        },
        {
          id: 'enterprise-yearly',
          name: studio,
          description: m['landing.pricing.enterprise_desc'](),
          price: '$29',
          originalPrice: '$39',
          interval: 'mo',
          billingNote: m['landing.pricing.billed_annually']({ price: '$349' }),
          checkoutPrice: '$349 / year',
          features: studioFeatures(yearly.studio),
          productId: 'enterprise_yearly',
          priceInCents: yearly.studio,
          currency: 'usd',
          credits: creditsForPriceInCents(yearly.studio),
          plan: { name: 'Enterprise', interval: 'year', intervalCount: 1 },
        },
      ],
    },
    {
      key: 'one-time',
      label: m['landing.pricing.one_time'](),
      plans: [
        {
          id: 'hobby-one-time',
          name: hobby,
          description: m['landing.pricing.starter_desc'](),
          price: '$5',
          features: hobbyFeatures(oneTime.hobby),
          productId: 'hobby_one_time',
          priceInCents: oneTime.hobby,
          currency: 'usd',
          credits: creditsForPriceInCents(oneTime.hobby),
          buttonText: m['landing.pricing.buy_one_time'](),
        },
        {
          id: 'designer-one-time',
          name: designer,
          description: m['landing.pricing.pro_desc'](),
          price: '$15',
          features: designerFeatures(oneTime.designer),
          featured: true,
          badge: m['landing.pricing.best_value'](),
          productId: 'designer_one_time',
          priceInCents: oneTime.designer,
          currency: 'usd',
          credits: creditsForPriceInCents(oneTime.designer),
          buttonText: m['landing.pricing.buy_one_time'](),
        },
        {
          id: 'studio-one-time',
          name: studio,
          description: m['landing.pricing.enterprise_desc'](),
          price: '$39',
          features: studioFeatures(oneTime.studio),
          productId: 'studio_one_time',
          priceInCents: oneTime.studio,
          currency: 'usd',
          credits: creditsForPriceInCents(oneTime.studio),
          buttonText: m['landing.pricing.buy_one_time'](),
        },
      ],
    },
  ];

  const checkoutMutation = useMutation({
    mutationFn: ({
      plan,
      provider,
    }: {
      plan: PricingPlan;
      provider: PaymentProvider;
    }) =>
      apiPost<{ checkout_url?: string }>('/api/payment/checkout', {
        product_id: plan.productId,
        product_name: plan.productName || plan.name,
        plan_name: plan.plan?.name || plan.name,
        price: plan.priceInCents,
        currency: plan.currency || 'usd',
        type: plan.plan ? 'subscription' : 'one-time',
        description: plan.name,
        plan: plan.plan,
        credits: plan.credits,
        credits_valid_days: plan.creditsValidDays,
        payment_provider: provider,
        // Come back to the page the user paid from.
        redirect: currentPathWithQuery('/settings/billing'),
      }),
    onSuccess: (data) => {
      if (!data?.checkout_url) {
        toast.error('Checkout failed');
        setLoadingProvider(null);
        return;
      }
      window.location.href = data.checkout_url;
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Checkout failed');
      setLoadingProvider(null);
    },
  });

  function startCheckout(plan: PricingPlan, provider: PaymentProvider) {
    setLoadingProvider(provider);
    checkoutMutation.mutate({ plan, provider });
  }

  async function handleCheckout(plan: PricingPlan) {
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(currentPathWithQuery('/pricing'));
      router.push(`/sign-in?callbackUrl=${callbackUrl}`);
      return;
    }

    const selectEnabled = configs.select_payment_enabled === 'true';
    const defaultProvider = (configs.default_payment_provider ||
      enabledProviders[0] ||
      'stripe') as PaymentProvider;

    if (selectEnabled && enabledProviders.length > 1) {
      setPendingPlan(plan);
      setModalOpen(true);
      return;
    }

    await startCheckout(plan, defaultProvider);
  }

  function handleProviderSelect(provider: PaymentProvider) {
    if (!pendingPlan) return;
    startCheckout(pendingPlan, provider);
  }

  const Heading = heading;

  return (
    <section
      id="pricing"
      className="border-border border-t px-4 pt-24 pb-10 sm:pt-32 sm:pb-12"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-20 text-center">
          <Heading className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {title ?? m['landing.pricing.title']()}
          </Heading>
          {subtitle ? (
            <h2 className="mt-4 text-2xl font-medium tracking-tight text-balance">
              {subtitle}
            </h2>
          ) : null}
          <p className="text-muted-foreground mt-5 text-lg">
            {m['landing.pricing.description']()}
          </p>
        </div>

        {/* Free entry tier — the promise every landing page makes ("one free
            design a day") has to be findable here, above the paid plans. */}
        <div className="mb-16 rounded-3xl border border-neutral-200 bg-[#f5f5f7] p-8 sm:p-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">
                {m['landing.pricing.free.name']()}
              </h3>
              <p className="mt-2 text-4xl font-semibold tracking-tight">
                $0
                <span className="text-muted-foreground ml-2 text-base font-normal">
                  {m['landing.pricing.free.tagline']()}
                </span>
              </p>
            </div>
            <Link
              href="/room-design"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0071e3] px-7 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-[#0077ed]"
            >
              {m['landing.pricing.free.cta']()}
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {(
              [
                'landing.pricing.free.b1',
                'landing.pricing.free.b2',
                'landing.pricing.free.b3',
                'landing.pricing.free.b4',
              ] as const
            ).map((key) => (
              <li key={key} className="flex items-start gap-3">
                <Check className="text-primary mt-1 size-5 shrink-0" />
                <span className="leading-relaxed">{m[key]()}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground mt-8 text-sm leading-relaxed">
            {m['landing.pricing.free.note']()}
          </p>
        </div>

        <PricingTable groups={groups} onCheckout={handleCheckout} />
      </div>

      <PaymentProviderModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setPendingPlan(null);
            setLoadingProvider(null);
          }
        }}
        providers={enabledProviders.length ? enabledProviders : ['stripe']}
        loadingProvider={loadingProvider}
        onSelect={handleProviderSelect}
        planName={pendingPlan?.name}
        price={pendingPlan?.checkoutPrice || pendingPlan?.price}
      />
    </section>
  );
}
