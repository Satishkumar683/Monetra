// app/fundraise/page.js
import Link from "next/link";

const heroStats = [
  {
    title: "100% Verified",
    desc: "Hospital IPD and KYC checked by our Trust Desk.",
  },
  {
    title: "Zero Platform Fee",
    desc: "100% of donor funding goes directly to treatment.",
  },
  {
    title: "Direct UPI & Cards",
    desc: "Seamless, immediate contributions via Razorpay.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Story",
    desc: "Fill in patient diagnosis, hospital bills, and funding goal in under 3 minutes.",
    badge: "✦ FAST ONBOARDING",
    badgeColor: "bg-[#22c55e]",
  },
  {
    number: "02",
    title: "Trust Desk Check",
    desc: "Our verification team validates the hospital estimate and documents.",
    badge: "🛡️ 100% VERIFIED",
    badgeColor: "bg-[#22c55e]",
  },
  {
    number: "03",
    title: "Disburse & Heal",
    desc: "Receive contributions and post treatment recovery updates to donors.",
    badge: "💸 DIRECT IMPACT",
    badgeColor: "bg-[#38bdf8]",
  },
];

export default function FundraisePage() {
  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text)">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-7xl mx-auto rounded-[2.5rem] bg-[#3b82f6] border-2 border-black shadow-solid-lg p-8 sm:p-14 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#e2ff3d] px-4 py-1.5 text-xs font-black text-slate-950 dark:text-slate-950 shadow-solid-sm">
              <span>✦</span> START A VERIFIED FUNDRAISER
            </span>

            <h1 className="mt-6 font-editorial text-4xl sm:text-6xl lg:text-7xl font-black text-[#e2ff3d] leading-[0.92] tracking-tight drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">
              Raise funds<br />
              that save<br />
              real lives.
            </h1>

            <p className="mt-6 text-white text-sm sm:text-base font-medium leading-relaxed">
              Whether it&apos;s for critical ICU emergencies, pediatric surgery, or community disaster relief — your story inspires verified support across India.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/fundraise/create"
                className="inline-flex items-center justify-center rounded-xl bg-[#e2ff3d] hover:bg-[#d4ff00] text-slate-950 dark:text-slate-950 font-black text-sm px-8 py-3.5 border-2 border-black shadow-solid hover:translate-y-0.5 hover:shadow-solid-sm active:translate-y-1 transition-all"
              >
                Start a Fundraiser Now &rarr;
              </Link>
              <Link
                href="/admin/verification"
                className="inline-flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm px-6 py-3.5 border-2 border-black shadow-solid hover:translate-y-0.5 hover:shadow-solid-sm active:translate-y-1 transition-all"
              >
                Trust Desk FAQ
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t-2 border-black/20">
              {heroStats.map((stat) => (
                <div key={stat.title}>
                  <p className="font-editorial text-lg font-black text-white">{stat.title}</p>
                  <p className="text-xs text-blue-100 mt-1 font-medium">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Floating Photo Showcase */}
          <div className="relative w-full max-w-md lg:max-w-lg">
            <div className="rounded-3xl border-2 border-black bg-white p-2 shadow-solid-lg overflow-hidden rotate-2 hover:rotate-0 transition-transform">
              <img
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=700&q=80"
                alt="Community care"
                className="w-full h-80 sm:h-96 object-cover rounded-2xl"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl border-2 border-black bg-[#ff70a6] text-white p-4 shadow-solid font-black text-xs sm:text-sm max-w-xs -rotate-3">
              🛡️ Over ₹2.4 Cr verified donations delivered directly to hospitals
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Pillars */}
      <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[#22c55e] px-4 py-1.5 text-xs font-black text-slate-950 shadow-solid-sm">
            <span>✓</span> HOW MONETRA OPERATES
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-black text-(--app-text) tracking-tight mt-3">
            Simple, Transparent Steps
          </h2>
          <p className="text-slate-600 text-sm mt-2 font-medium">
            No hidden clauses. Zero middleman cuts. Pure verified giving.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-3xl border-2 border-black bg-white text-slate-900 p-8 flex flex-col justify-between shadow-solid hover:translate-y-1 transition-transform"
            >
              <div>
                <span className={`text-xs font-black text-slate-950 rounded-lg ${step.badgeColor} border-2 border-black px-3 py-1 shadow-solid-sm`}>
                  {step.badge}
                </span>
                <span className="block font-editorial text-4xl font-black text-slate-300 mt-6">
                  {step.number}
                </span>
                <h3 className="font-editorial text-2xl font-black text-slate-950 mt-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
              <div className="mt-8 pt-5 border-t-2 border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <span>✓</span> Verified by Monetra Team
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl border-2 border-black bg-[#22c55e] text-slate-950 p-10 sm:p-14 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-solid-lg">
          <div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to begin your fundraiser?
            </h2>
            <p className="text-slate-900 text-sm font-medium mt-2 max-w-xl">
              It takes less than 3 minutes to publish your campaign and submit hospital records for fast approval.
            </p>
          </div>
          <Link
            href="/fundraise/create"
            className="rounded-xl bg-slate-950 text-white font-black px-8 py-4 text-sm border-2 border-black shadow-solid hover:bg-slate-900 hover:translate-y-0.5 hover:shadow-solid-sm transition-all whitespace-nowrap active:translate-y-1"
          >
            Create Fundraiser &rarr;
          </Link>
        </div>
      </section>
    </main>
  );
}
