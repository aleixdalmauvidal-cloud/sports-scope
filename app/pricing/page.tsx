import Link from "next/link";

const freeFeatures = [
  "CMV Rankings (global, liga, posición)",
  "Player profiles con CMV Score",
  "Social & Sports subscores",
  "Top 3 brands detected",
  "Risers & Fallers weekly",
];

const freeLocked = [
  "Brand Match Score",
  "Vertical Fit Analysis",
  "Opportunity Score",
  "Exports & Shortlists",
];

const proFeatures = [
  "Everything in Free",
  "Brand Match Score personalizado",
  "Vertical Fit Analysis (6 categorías)",
  "Audience Match Score",
  "Opportunity Score + Timing",
  "Compare hasta 4 jugadores",
  "Shortlists & Watchlists",
  "Exports PDF & CSV",
  "Weekly Alerts",
  "Team workspace (3 usuarios)",
];

const enterpriseFeatures = [
  "API access",
  "Unlimited users",
  "Custom verticals",
  "Dedicated support",
];

const faqs = [
  {
    q: "What is the Brand Match Score?",
    a: "It combines category fit, audience alignment, momentum, and brand safety into one score so you can identify which athletes are strongest for your campaign goals.",
  },
  {
    q: "Can I use Sports Scope to build shortlists for clients?",
    a: "Yes. Pro includes shortlists, watchlists, and export-ready outputs so your team can present curated player recommendations to brands and agencies.",
  },
  {
    q: "How is the CMV calculated?",
    a: "CMV blends social reach/engagement, sports performance, commercial signals, momentum, and brand safety into a normalized score that updates with the data pipeline.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel from your workspace billing settings and keep access through the end of the billing period, with no long-term lock-in.",
  },
];

function Check() {
  return <span className="mt-0.5 inline-block text-[#00E5A0]">✓</span>;
}

function Cross() {
  return <span className="mt-0.5 inline-block text-[#6B7280]">✗</span>;
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#08090E] px-6 py-16 text-white sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-[#00E5A0]">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose your Sports Scope plan
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#9CA3AF] sm:text-base">
            Start free and upgrade when you need deeper commercial intelligence, fit scoring, and export workflows for brand teams.
          </p>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-[#0D0F18] p-7">
            <h2 className="text-xl font-semibold">Discover</h2>
            <p className="mt-3 font-mono text-4xl text-white">
              €0 <span className="text-lg text-[#9CA3AF]">/ month</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {freeFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check />
                  <span>{item}</span>
                </li>
              ))}
              {freeLocked.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[#6B7280]">
                  <Cross />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-7 inline-flex w-full items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Get Started Free
            </Link>
          </article>

          <article className="relative rounded-2xl border border-[#00E5A0] bg-[#0D0F18] p-7 shadow-[0_0_40px_rgba(0,229,160,0.15)]">
            <span className="absolute right-4 top-4 rounded-full bg-[#00E5A0]/15 px-3 py-1 text-xs font-semibold text-[#00E5A0]">
              Most Popular
            </span>
            <h2 className="text-xl font-semibold">Brand Intelligence</h2>
            <p className="mt-3 font-mono text-4xl text-white">
              €149 <span className="text-lg text-[#9CA3AF]">/ month</span>
            </p>
            <p className="mt-1 text-xs text-[#9CA3AF]">per organization · up to 3 users</p>
            <ul className="mt-6 space-y-2 text-sm">
              {proFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/api/stripe/checkout?plan=pro"
              className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-[#00E5A0] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-95"
            >
              Start 14-day Free Trial
            </Link>
            <p className="mt-2 text-center text-xs text-[#9CA3AF]">
              No credit card required for trial
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0D0F18] p-7">
          <h3 className="text-lg font-semibold">Enterprise</h3>
          <p className="mt-2 font-mono text-3xl">
            Custom <span className="text-base text-[#9CA3AF]">pricing</span>
          </p>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {enterpriseFeatures.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="mailto:sales@sportsscope.ai"
            className="mt-6 inline-flex rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/5"
          >
            Contact Sales
          </Link>
        </section>

        <section className="mt-12">
          <h3 className="text-2xl font-semibold">FAQ</h3>
          <div className="mt-5 space-y-4">
            {faqs.map((item) => (
              <article key={item.q} className="rounded-xl border border-white/10 bg-[#0D0F18] p-5">
                <h4 className="text-sm font-semibold text-white">{item.q}</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">{item.a}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
