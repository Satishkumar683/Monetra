// app/fundraise/page.js
import Link from "next/link";

const heroStats = [
  {
    icon: "ShieldIcon",
    title: "100% Secure",
    desc: "Your donations are safe with us.",
  },
  {
    icon: "GroupIcon",
    title: "Trusted by Many",
    desc: "Thousands of fundraisers and donors trust us.",
  },
  {
    icon: "HeartIcon",
    title: "Make an Impact",
    desc: "Every rupee you raise creates a difference.",
  },
];

const steps = [
  {
    number: "1",
    icon: "PencilIcon",
    title: "Create",
    desc: "Tell your story, add details and set a fundraising goal.",
  },
  {
    number: "2",
    icon: "ShareIcon",
    title: "Share",
    desc: "Share your fundraiser with friends, family and community.",
  },
  {
    number: "3",
    icon: "HandHeartIcon",
    title: "Receive",
    desc: "Collect donations securely and track your progress.",
  },
];

function ShieldIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3Z" />
    </svg>
  );
}
function GroupIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <path d="M2 20c0-3 2.7-5.5 6-5.5S14 17 14 20M10 20c0-3 2.7-5.5 6-5.5S22 17 22 20" />
    </svg>
  );
}
function HeartIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}
function PencilIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M13 6.5l3 3" />
    </svg>
  );
}
function ShareIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.2 10.8 15.8 7M8.2 13.2l7.6 3.8" />
    </svg>
  );
}
function HandHeartIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M13 8.5a2.3 2.3 0 0 0-3.9-1.6L9 7l-.1-.1A2.3 2.3 0 0 0 5 8.5c0 2.2 4 4.9 4 4.9s4-2.7 4-4.9Z" />
      <path d="M3 18c0-1.7 1.6-3 3.5-3H12l4.5-1.6a1.4 1.4 0 0 1 1.8 1.8c-.2.6-.7 1-1.3 1.2L11 18H8" />
      <path d="M12 18h5.5c1.9 0 3.5-1 3.5-2.5" />
    </svg>
  );
}
function ArrowIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
function GlobeIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9Z" />
    </svg>
  );
}

function Hero() {
  return (
    <section className="relative bg-[#060b10] overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-1/2 hidden lg:block">
        <img
          src="/images/fundraise1.jpg"
          alt="Hands holding a jar with a growing plant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#060b10] via-[#060b10]/10 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-20">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/5 px-4 py-1.5 text-xs font-medium text-emerald-400">
            <HeartIcon className="w-3.5 h-3.5" /> Start a Fundraiser. Change a
            Life.
          </span>

          <h1 className="mt-6 font-serif text-5xl sm:text-6xl font-bold leading-[1.05] text-white">
            Raise Funds
            <br />
            That Make a
            <br />
            <span className="text-emerald-400">Difference</span>
          </h1>

          <p className="mt-6 text-slate-300 leading-relaxed">
            Whether it&apos;s for medical emergencies, education, community
            support, or a personal cause — your story can inspire change. Start
            your fundraiser today and let the world support your mission.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {heroStats.map((stat) => {
              const Icon = { ShieldIcon, GroupIcon, HeartIcon }[stat.icon];
              return (
                <div key={stat.title} className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {stat.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {stat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* mobile image */}
      <div className="lg:hidden h-64">
        <img
          src="/images/fundraise-hero.jpg"
          alt="Hands holding a jar with a growing plant"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-slate-50 py-24 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-emerald-500" />
          <span className="text-xs font-semibold tracking-widest text-emerald-600">
            HOW IT WORKS
          </span>
          <span className="h-px w-8 bg-emerald-500" />
        </div>

        <h2 className="mt-5 font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          Simple Steps to Create Impact
        </h2>
        <p className="mt-3 text-slate-500">
          Start your fundraiser in just a few easy steps
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
        {steps.map((step, i) => {
          const Icon = { PencilIcon, ShareIcon, HandHeartIcon }[step.icon];
          return (
            <div key={step.number} className="relative">
              <div className="relative rounded-2xl border border-slate-200 bg-white px-8 pt-12 pb-8 text-center shadow-sm">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-emerald-700 text-white text-sm font-bold flex items-center justify-center">
                  {step.number}
                </span>
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {i < steps.length - 1 && (
                <span className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 translate-x-full items-center text-emerald-500">
                  <ArrowIcon className="w-6 h-6" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="px-8 pb-24 -mt-2 bg-slate-50">
      <div className="max-w-6xl mx-auto rounded-3xl bg-linear-to-br from-emerald-950 to-[#052015] px-10 sm:px-16 py-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center overflow-hidden">
        <div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
            Create Your Fundraiser Today
          </h2>
          <p className="mt-4 text-slate-300 max-w-md">
            Take the first step towards making a difference. Your cause deserves
            the world&apos;s support.
          </p>
          <Link
            href="/fundraise/create"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-400 hover:bg-emerald-300 transition-colors text-slate-900 font-semibold px-6 py-3"
          >
            Create Your Fundraiser <ArrowIcon className="w-4 h-4" />
          </Link>

          <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
            <ShieldIcon className="w-4 h-4 text-emerald-400" />
            It&apos;s free, easy and secure
          </div>
        </div>

        <div className="relative hidden lg:flex items-center justify-center h-56">
          <GlobeIcon className="absolute top-2 right-10 w-8 h-8 text-emerald-500/40" />
          <GroupIcon className="absolute bottom-2 left-6 w-8 h-8 text-emerald-500/40" />
          <HeartIcon className="absolute top-4 left-16 w-6 h-6 text-emerald-500/40" />
          <svg viewBox="0 0 200 200" className="w-48 h-48 text-emerald-500/60">
            <path
              d="M100 30c-18 0-32 14-32 32 0 26 32 48 32 48s32-22 32-48c0-18-14-32-32-32Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <g
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            >
              <path d="M80 120v40M80 160h-8M80 160h8M75 130l5-5 5 5" />
              <path d="M100 115v45M100 160h-9M100 160h9M95 125l5-5 5 5" />
              <path d="M120 120v40M120 160h-8M120 160h8M115 130l5-5 5 5" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

export default function FundraisePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <HowItWorks />
      <CtaBanner />
    </main>
  );
}
