import { m } from '@/paraglide/messages.js';

const STEPS = [
  {
    img: '/imgs/steps/step1.webp',
    width: 1024,
    height: 683,
    title: m['landing.how.step1.title'],
    desc: m['landing.how.step1.desc'],
  },
  {
    img: '/imgs/steps/step2.webp',
    width: 860,
    height: 577,
    title: m['landing.how.step2.title'],
    desc: m['landing.how.step2.desc'],
  },
  {
    img: '/imgs/demo/diningRoom-modern.avif',
    width: 1376,
    height: 768,
    title: m['landing.how.step3.title'],
    desc: m['landing.how.step3.desc'],
  },
] as const;

/**
 * How it works — three steps, Apple-style numbered cards on light gray.
 */
export function HowItWorks() {
  return (
    <section id="how" className="bg-[#f5f5f7] px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {m['landing.how.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            {m['landing.how.subtitle']()}
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center md:text-left">
              <div className="overflow-hidden rounded-3xl shadow-lg">
                <img
                  src={step.img}
                  alt={step.title()}
                  width={step.width}
                  height={step.height}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <p className="text-primary mt-6 text-sm font-semibold">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                {step.title()}
              </h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                {step.desc()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
