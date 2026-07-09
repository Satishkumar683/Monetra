"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const heroImages = [
  { src: "/images/donation6.jpg", rotate: "-rotate-12", pos: "left-0 top-16" },
  { src: "/images/donation7.jpg", rotate: "-rotate-6", pos: "left-[18%] top-2" },
  { src: "/images/donation8.jpg", rotate: "rotate-2", pos: "left-1/2 -translate-x-1/2 -top-4" },
  { src: "/images/donation9.jpg", rotate: "rotate-6", pos: "right-[18%] top-2" },
  { src: "/images/donation10.avif", rotate: "rotate-12", pos: "right-0 top-16" },
];

function FeatureRow({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="text-sm text-slate-200">{text}</span>
    </div>
  );
}

/* --- Inline icons (no extra dependency needed) --- */
function HeartIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}
function ShieldIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3Z" />
    </svg>
  );
}
function LockIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
function BoltIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2 3 14h7l-1 8 11-13h-7l0-7Z" />
    </svg>
  );
}
function ArrowIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
function UsersIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 14c2.9.3 5.5 2.6 5.5 6" />
    </svg>
  );
}
function ShareIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.2 10.8 15.8 7M8.2 13.2l7.6 3.8" />
    </svg>
  );
}
function TargetIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}
function TrophyIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5a3 3 0 0 0 3 5M16 5h3a3 3 0 0 1-3 5" />
      <path d="M12 13v4M9 21h6M10 17h4v4h-4z" />
    </svg>
  );
}
function SparkleToolsIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}
function ChecklistIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h13l3 3v13H4z" />
      <path d="M8 11l2 2 4-4" />
      <path d="M8 16h6" />
    </svg>
  );
}
function HeartCheckIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      <path d="m9.5 12.5 1.6 1.6 3.2-3.2" />
    </svg>
  );
}

const whyStartItems = [
  {
    icon: TrophyIcon,
    title: "Trusted by thousands",
    description:
      "Join a growing community of organizers who've raised funds for the causes they care about most.",
  },
  {
    icon: SparkleToolsIcon,
    title: "Smart tools, zero hassle",
    description:
      "Guided prompts and ready-made templates help you write a compelling story in minutes, not hours.",
  },
  {
    icon: ChecklistIcon,
    title: "Everything you need to succeed",
    description:
      "Progress tracking, verified documents, and a built-in share kit keep your fundraiser moving forward.",
  },
  {
    icon: HeartCheckIcon,
    title: "Support at every step",
    description:
      "From setup to your first donation and beyond, our team and help center are here whenever you need them.",
  },
];

function WhyStartSection() {
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollButtons() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateScrollButtons();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  function scrollByCard(direction) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-why-card]");
    const cardWidth = card ? card.offsetWidth + 24 : 320;
    el.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  }

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Why start a <span className="text-emerald-400">Monetra</span>{" "}
          fundraiser?
        </h2>
        <p className="mt-4 text-slate-300 max-w-xl mx-auto">
          Join a community of organizers who've chosen a simple, transparent
          way to raise funds for the people and causes they care about.
        </p>

        <Link href="/fundraise">
          <button className="mt-8 inline-flex items-center rounded-full border border-white/20 hover:border-emerald-400/60 hover:bg-white/[0.04] transition-colors text-white font-semibold px-6 py-3 text-sm">
            Start a Fundraiser
          </button>
        </Link>
      </div>

      <div className="relative mt-14">
        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {whyStartItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                data-why-card
                className="snap-start shrink-0 w-[260px] sm:w-[280px] rounded-3xl border border-white/10 bg-white/[0.03] p-7 flex flex-col"
              >
                <span className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </span>
                <h3 className="mt-6 text-lg font-bold text-white leading-snug">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Prev / next controls */}
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollLeft}
            aria-label="Previous"
            className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400/50 disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18 9 12l6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollRight}
            aria-label="Next"
            className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400/50 disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

const Home = () => {
  return (
    <main className="relative min-h-screen bg-[#060b10] overflow-hidden">
      {/* Background image layer — put your bg image here */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('/images/bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-[#060b10]/60 via-[#060b10]/80 to-[#060b10]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-24">
        {/* Eyebrow */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-emerald-400">
            <span>✦</span> TOGETHER, WE CAN <span>✦</span>
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-6 text-center text-4xl sm:text-5xl font-extrabold leading-tight text-white">
          Every Act of Kindness
          <br />
          <span className="text-emerald-400">Creates a Ripple of Hope</span>
        </h1>

        <p className="mt-4 text-center text-slate-300 max-w-xl mx-auto">
          Join thousands of kind hearts who are making a real difference every
          single day.
        </p>

        {/* Fanned photo arc */}
        <div className="relative mt-16 h-72 sm:h-80">
          <svg
            viewBox="0 0 1000 200"
            className="absolute inset-x-0 top-1/2 w-full h-40 -z-10"
            preserveAspectRatio="none"
          >
            <path
              d="M 50 180 Q 500 -60 950 180"
              fill="none"
              stroke="rgba(52, 211, 153, 0.5)"
              strokeWidth="2"
              strokeDasharray="6 8"
            />
          </svg>

          {heroImages.map((img, i) => (
            <div
              key={i}
              className={`absolute ${img.pos} ${img.rotate} w-40 h-52 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border-4 border-white/90 shadow-2xl`}
            >
              <img
                src={img.src}
                alt="Community member"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Two feature cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Donate card */}
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 flex flex-col">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-white">Donate</h2>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              Support meaningful causes and help bring hope to those who need
              it most. Your contribution can change lives.
            </p>

            <div className="mt-6 border-t border-white/10 pt-6 space-y-4">
              <FeatureRow icon={<ShieldIcon className="w-4 h-4 text-emerald-400" />} text="Verified & Trusted Causes" />
              <FeatureRow icon={<LockIcon className="w-4 h-4 text-emerald-400" />} text="Secure & Transparent Donations" />
              <FeatureRow icon={<BoltIcon className="w-4 h-4 text-emerald-400" />} text="Make a Real Impact" />
            </div>
            <Link href="/donate">
            <button className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 transition-colors text-slate-900 font-semibold py-3">
              Donate Now <ArrowIcon className="w-4 h-4" />
            </button>
            </Link>
          </div>

          {/* Raise a Fund card */}
          <div className="rounded-3xl border border-sky-500/30 bg-sky-500/5 p-8 flex flex-col">
            <div className="w-14 h-14 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-sky-400" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-white">Raise a Fund</h2>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              Start a fundraiser for yourself or someone in need and let the
              world come together to support your cause.
            </p>

            <div className="mt-6 border-t border-white/10 pt-6 space-y-4">
              <FeatureRow icon={<ShareIcon className="w-4 h-4 text-sky-400" />} text="Share Your Story" />
              <FeatureRow icon={<UsersIcon className="w-4 h-4 text-sky-400" />} text="Get Support from Others" />
              <FeatureRow icon={<TargetIcon className="w-4 h-4 text-sky-400" />} text="Reach Your Goal Faster" />
            </div>
           <Link href="/fundraise">
            <button className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 transition-colors text-white font-semibold py-3">
              Start a Fundraiser <ArrowIcon className="w-4 h-4" />
            </button>
            </Link>
          </div>
        </div>
      </div>

      <WhyStartSection />
    </main>
  );
}
export default Home;