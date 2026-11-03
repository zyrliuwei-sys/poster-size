import { m } from '@/paraglide/messages.js';
import { AIPosterGenerator } from '@/components/ai-poster-generator';

export function AIPosterGeneratorBlock() {
  return (
    <AIPosterGenerator
      copy={{
        kicker: m['poster.ai.kicker'](),
        title: m['poster.ai.title'](),
        description: m['poster.ai.description'](),
        prompt: m['poster.ai.prompt'](),
        placeholder: m['poster.ai.placeholder'](),
        inspiration: m['poster.ai.inspiration'](),
        style: m['poster.ai.style'](),
        size: m['poster.ai.size'](),
        quality: m['poster.ai.quality'](),
        generate: m['poster.ai.generate'](),
        generating: m['poster.ai.generating'](),
        signIn: m['poster.ai.sign_in'](),
        creditCost: (credits) => m['poster.ai.credit_cost']({ credits }),
        balance: (credits) => m['poster.ai.balance']({ credits }),
        preview: m['poster.ai.preview'](),
        sample: m['poster.ai.sample'](),
        ready: m['poster.ai.ready'](),
        waiting: m['poster.ai.waiting'](),
        waitingNote: m['poster.ai.waiting_note'](),
        download: m['poster.ai.download'](),
        expiry: m['poster.ai.expiry'](),
        retry: m['poster.ai.retry'](),
        notConfigured: m['poster.ai.not_configured'](),
        insufficient: m['poster.ai.insufficient'](),
        pricing: m['poster.ai.pricing'](),
        model: m['poster.ai.model'](),
        promptError: m['poster.ai.prompt_error'](),
        statusError: m['poster.ai.status_error'](),
        refunded: m['poster.ai.refunded'](),
        examplesLabel: m['poster.ai.examples_label'](),
        sampleTitle: m['poster.ai.sample_title'](),
        sampleSubtitle: m['poster.ai.sample_subtitle'](),
        sampleFooter: m['poster.ai.sample_footer'](),
        resultAlt: m['poster.ai.result_alt'](),
        errors: {
          POSTER_AUTH_REQUIRED: m['poster.ai.auth_error'](),
          POSTER_INVALID_INPUT: m['poster.ai.prompt_error'](),
          POSTER_NOT_CONFIGURED: m['poster.ai.not_configured'](),
          POSTER_INSUFFICIENT_CREDITS: m['poster.ai.insufficient'](),
          POSTER_GENERATION_FAILED: m['poster.ai.generation_error'](),
          POSTER_RATE_LIMITED: m['poster.ai.rate_error'](),
          POSTER_DOWNLOAD_FAILED: m['poster.ai.download_error'](),
        },
        qualities: {
          '1K': m['poster.ai.standard'](),
          '2K': m['poster.ai.high'](),
          '4K': m['poster.ai.ultra'](),
        },
        sizes: {
          '2:3': m['poster.ai.portrait'](),
          '3:4': m['poster.ai.classic'](),
          '1:1': m['poster.ai.square'](),
          '4:5': m['poster.ai.social'](),
          '9:16': m['poster.ai.story'](),
          '16:9': m['poster.ai.landscape'](),
        },
      }}
      styles={[
        { id: 'auto', label: m['poster.ai.style.auto']() },
        { id: 'editorial', label: m['poster.ai.style.editorial']() },
        { id: 'minimal', label: m['poster.ai.style.minimal']() },
        { id: 'vintage', label: m['poster.ai.style.vintage']() },
        { id: 'bold', label: m['poster.ai.style.bold']() },
        { id: 'illustration', label: m['poster.ai.style.illustration']() },
        { id: 'cinematic', label: m['poster.ai.style.cinematic']() },
      ]}
      examples={[
        {
          label: m['poster.ai.example.music'](),
          prompt: m['poster.ai.example.music_prompt'](),
          style: 'bold',
        },
        {
          label: m['poster.ai.example.coffee'](),
          prompt: m['poster.ai.example.coffee_prompt'](),
          style: 'vintage',
        },
        {
          label: m['poster.ai.example.exhibition'](),
          prompt: m['poster.ai.example.exhibition_prompt'](),
          style: 'editorial',
        },
      ]}
    />
  );
}
