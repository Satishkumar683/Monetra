"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FundraiserCard from "../../components/FundraiserCard";

export default function Home() {
  const [featuredFundraisers, setFeaturedFundraisers] = useState([]);
  const [urgentFundraisers, setUrgentFundraisers] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [featRes, urgentRes, leadRes] = await Promise.allSettled([
          fetch("/api/fundraisers?limit=6&sort=mostRaised"),
          fetch("/api/fundraisers?urgent=true&limit=3"),
          fetch("/api/leaderboard?limit=3"),
        ]);

        if (featRes.status === "fulfilled") {
          const data = await featRes.value.json();
          if (data.success && data.fundraisers) setFeaturedFundraisers(data.fundraisers);
        }

        if (urgentRes.status === "fulfilled") {
          const data = await urgentRes.value.json();
          if (data.success && data.fundraisers) setUrgentFundraisers(data.fundraisers);
        }

        if (leadRes.status === "fulfilled") {
          const data = await leadRes.value.json();
          if (data.success && data.leaderboard) setTopDonors(data.leaderboard);
        }
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) flex flex-col">
      {/* =========================================================================
          HERO CANVAS (EXACT SPATIAL COMPOSITION FROM USER'S REFERENCE SCREENSHOT)
         ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:pb-32 overflow-hidden">
        {/* The Exact Brewser-Blue Stage Container */}
        <div className="relative max-w-7xl mx-auto rounded-[2.5rem] sm:rounded-[3rem] bg-[#3b82f6] border-2 border-black shadow-solid-lg min-h-[580px] lg:min-h-[720px] flex flex-col items-center justify-center px-6 py-16 sm:py-24 overflow-hidden">

          {/* ---------------- FLANKING LEFT CARDS ---------------- */}
          {/* Card 1: Top-Left Floating Photo */}
          <div className="hidden md:block absolute left-4 lg:left-10 top-8 lg:top-12 w-44 lg:w-52 h-44 lg:h-52 rounded-3xl border-2 border-black bg-white p-1.5 shadow-solid -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 group overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
              alt="Healthcare volunteer support"
              onError={(e) => {
                e.currentTarget.src = "/images/healthcare.jpg";
              }}
              className="w-full h-full object-cover rounded-[1.25rem] group-hover:scale-105 transition-transform"
            />
          </div>

          {/* Card 2: Mid-Left Floating Photo */}
          <div className="hidden md:block absolute left-2 lg:left-6 top-64 lg:top-72 w-40 lg:w-48 h-40 lg:h-48 rounded-3xl border-2 border-black bg-white p-1.5 shadow-solid rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 group overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80"
              alt="Patient recovery and care"
              onError={(e) => {
                e.currentTarget.src = "/images/donation.webp";
              }}
              className="w-full h-full object-cover rounded-[1.25rem] group-hover:scale-105 transition-transform"
            />
          </div>

          {/* Card 3: Bottom-Left Floating Photo + Retro Sticker */}
          <div className="hidden md:block absolute left-8 lg:left-20 bottom-8 lg:bottom-12 w-48 lg:w-56 h-36 lg:h-44 rounded-3xl border-2 border-black bg-white p-1.5 shadow-solid -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 group">
            {/* Retro Sticker Badge on bottom-left edge (matching image 1) */}
            <div className="absolute -left-3 -top-3 w-12 h-12 rounded-full bg-[#ff70a6] border-2 border-black shadow-solid-sm flex items-center justify-center text-white font-black text-xl z-20 animate-pulse">
              ♥
            </div>
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80"
              alt="Direct aid package"
              onError={(e) => {
                e.currentTarget.src = "/images/fundraise1.jpg";
              }}
              className="w-full h-full object-cover rounded-[1.25rem] group-hover:scale-105 transition-transform"
            />
          </div>

          {/* ---------------- CENTER STAGE TYPOGRAPHY & CTA ---------------- */}
          <div className="relative z-20 text-center max-w-xl mx-auto flex flex-col items-center">
            {/* Massive Chunky Serif Display Headline */}
            <h1 className="font-editorial text-5xl sm:text-7xl lg:text-[5.5rem] font-black text-[#e2ff3d] leading-[0.92] tracking-tight drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">
              The home<br />
              of verified<br />
              giving.
            </h1>

            {/* Subtitle Underneath */}
            <p className="mt-6 text-sm sm:text-base text-white font-medium max-w-md mx-auto leading-relaxed">
              Your direct access to 100+ of the best verified community causes.<br className="hidden sm:inline" />
              Who will you support first?
            </p>

            {/* Solid Neo-Brutalist CTA Button */}
            <div className="mt-8">
              <Link
                href="/fundraise/create"
                className="inline-flex items-center justify-center rounded-xl bg-[#e2ff3d] hover:bg-[#d4ff00] text-slate-950 dark:text-slate-950 font-black text-sm px-8 py-3.5 border-2 border-black shadow-solid hover:translate-y-0.5 hover:shadow-solid-sm active:translate-y-1 transition-all"
              >
                Get started
              </Link>
            </div>
          </div>

          {/* ---------------- FLANKING RIGHT CARDS ---------------- */}
          {/* Card 4: Top-Right Tall Floating Photo */}
          <div className="hidden md:block absolute right-4 lg:right-10 top-10 lg:top-14 w-48 lg:w-60 h-64 lg:h-76 rounded-3xl border-2 border-black bg-white p-1.5 shadow-solid rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 group overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80"
              alt="Community healthcare care package"
              onError={(e) => {
                e.currentTarget.src = "/images/education.jpg";
              }}
              className="w-full h-full object-cover rounded-[1.25rem] group-hover:scale-105 transition-transform"
            />
          </div>

          {/* Card 5: Bottom-Right Vertical Floating Photo */}
          <div className="hidden md:block absolute right-6 lg:right-16 bottom-10 lg:bottom-14 w-44 lg:w-56 h-52 lg:h-64 rounded-3xl border-2 border-black bg-white p-1.5 shadow-solid -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 group overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=600&q=80"
              alt="Monetra verified supplies delivered"
              onError={(e) => {
                e.currentTarget.src = "/images/donation.webp";
              }}
              className="w-full h-full object-cover rounded-[1.25rem] group-hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* Mobile Photo Carousel Strip (Only visible on small phones) */}
        <div className="md:hidden mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          <div className="shrink-0 w-44 h-44 rounded-2xl border-2 border-black bg-white p-1 shadow-solid-sm overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80"
              alt="Volunteer care"
              onError={(e) => {
                e.currentTarget.src = "/images/healthcare.jpg";
              }}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="shrink-0 w-44 h-44 rounded-2xl border-2 border-black bg-white p-1 shadow-solid-sm overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80"
              alt="Relief supplies"
              onError={(e) => {
                e.currentTarget.src = "/images/education.jpg";
              }}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="shrink-0 w-44 h-44 rounded-2xl border-2 border-black bg-white p-1 shadow-solid-sm overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=400&q=80"
              alt="Verified impact"
              onError={(e) => {
                e.currentTarget.src = "/images/donation.webp";
              }}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          URGENT CAUSES SPOTLIGHT (CRITICAL EMERGENCY SUPPORT)
         ========================================================================= */}
      {urgentFundraisers.length > 0 && (
        <section className="py-12 px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="rounded-[2.5rem] border-3 border-black bg-red-500/10 p-6 sm:p-10 shadow-solid-lg">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-red-600 text-white px-3.5 py-1 text-xs font-black shadow-solid-sm mb-3 animate-pulse">
                  <span>🚨</span>
                  <span>TIME-CRITICAL EMERGENCY CAUSES</span>
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  Needs Immediate Support
                </h2>
                <p className="text-slate-700 text-xs sm:text-sm mt-1 max-w-xl font-medium">
                  These verified campaigns require immediate financial backing for urgent surgeries, ICU costs, and emergency disaster relief.
                </p>
              </div>

              <Link
                href="/donate?urgent=true"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-xs font-black shadow-solid hover:translate-y-0.5 transition-all self-start sm:self-auto"
              >
                View All Urgent Causes ⚡
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {urgentFundraisers.map((f) => (
                <FundraiserCard key={f._id} fundraiser={f} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          FEATURED CAUSES SECTION
         ========================================================================= */}
      <section className="py-16 lg:py-24 px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#22c55e] px-3.5 py-1 text-xs font-black text-slate-950 shadow-solid-sm mb-3">
              <span>✦</span>
              <span>VERIFIED COMMUNITY CAUSES</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-black text-(--app-text) tracking-tight">
              Causes Needing Help Today
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-xl">
              Reviewed and authorized by our Trust Desk. 100% of donations go directly to treatment and beneficiary recovery.
            </p>
          </div>

          <Link
            href="/donate"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white hover:bg-slate-100 px-5 py-2.5 text-xs font-black text-slate-950 shadow-solid hover:translate-y-0.5 hover:shadow-solid-sm transition-all self-start sm:self-auto"
          >
            Explore All Causes &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-slate-500 text-sm font-semibold">
            Loading active fundraisers...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredFundraisers.map((f) => (
              <FundraiserCard key={f._id} fundraiser={f} />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          COMMUNITY CHAMPIONS LEADERBOARD SECTION
         ========================================================================= */}
      {topDonors.length > 0 && (
        <section className="py-12 lg:py-16 px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="rounded-[2.5rem] border-2 border-black bg-white p-8 sm:p-12 shadow-solid-lg">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[#e2ff3d] px-3.5 py-1 text-xs font-black text-slate-950 shadow-solid-sm mb-3">
                  <span>🏆</span>
                  <span>COMMUNITY LEADERBOARD</span>
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  Top Generous Supporters
                </h2>
                <p className="text-slate-600 text-sm mt-1 max-w-xl font-medium">
                  Celebrating community angels who lead by giving. Every rupee directly funds verified relief and climbs the community ranks.
                </p>
              </div>

              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-[#e2ff3d] hover:bg-[#d4ff00] text-slate-950 px-5 py-2.5 text-xs font-black shadow-solid hover:translate-y-0.5 transition-all self-start sm:self-auto"
              >
                View Full Hall of Fame &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topDonors.map((donor, idx) => (
                <div
                  key={donor.id || donor.donorId || idx}
                  className="rounded-3xl border-2 border-black bg-slate-50 p-6 flex flex-col justify-between shadow-solid hover:-translate-y-1 transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={donor.user?.image || "/default-avatar.png"}
                        alt={donor.user?.name || "Donor"}
                        className="w-14 h-14 rounded-full border-2 border-black object-cover shadow-solid-sm"
                      />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-black flex items-center justify-center text-xs shadow-solid-sm font-black">
                        #{donor.rank || idx + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-editorial text-lg font-black text-slate-950 truncate max-w-[160px]">
                        {donor.user?.name || "Anonymous Supporter"}
                      </h4>
                      <span className={`inline-block mt-0.5 text-[10px] font-black px-2 py-0.5 rounded-full border ${donor.badgeStyle || "border-black bg-slate-100"}`}>
                        {donor.tierBadge || "🌱"} {donor.tier || "Supporter"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t-2 border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400">Total Donated</span>
                      <p className="font-editorial text-xl font-black text-emerald-700">
                        ₹{(donor.totalDonated ?? donor.totalAmount ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {donor.causesCount || donor.actionCount || 0} causes helped
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          HOW MONETRA WORKS (3 SOLID PILLARS)
         ========================================================================= */}
      <section className="py-16 lg:py-24 px-6 lg:px-8 border-t-2 border-black/15 bg-(--app-bg)">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[#22c55e] px-3.5 py-1 text-xs font-black text-slate-950 shadow-solid-sm">
              <span>🛡️</span>
              <span>100% TRANSPARENT PROCESS</span>
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-black text-(--app-text) tracking-tight mt-3">
              How Monetra Works
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              A structured, verified crowdfunding pipeline built to protect donors and empower genuine families in crisis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="rounded-3xl border-2 border-black bg-white text-slate-900 p-8 flex flex-col justify-between shadow-solid hover:translate-y-1 transition-transform">
              <div>
                <span className="text-xs font-black text-slate-950 rounded-lg bg-[#22c55e] border-2 border-black px-3 py-1 shadow-solid-sm">
                  STEP 01
                </span>
                <h3 className="font-editorial text-2xl font-black text-slate-950 mt-6">
                  Submit Story & Docs
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed font-medium">
                  Start your fundraiser in minutes. Upload patient admission records, hospital cost estimates, and government ID for authentication.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t-2 border-slate-200 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <span>✓</span> Takes under 3 minutes
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border-2 border-black bg-white text-slate-900 p-8 flex flex-col justify-between shadow-solid hover:translate-y-1 transition-transform">
              <div>
                <span className="text-xs font-black text-slate-950 rounded-lg bg-[#22c55e] border-2 border-black px-3 py-1 shadow-solid-sm">
                  STEP 02
                </span>
                <h3 className="font-editorial text-2xl font-black text-slate-950 mt-6">
                  Trust Desk Verification
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed font-medium">
                  Our team checks hospital IPD admission numbers and doctor credentials. Once approved, the campaign receives the 🛡️ Verified badge.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t-2 border-slate-200 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <span>✓</span> Zero fraudulent campaigns
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border-2 border-black bg-white text-slate-900 p-8 flex flex-col justify-between shadow-solid hover:translate-y-1 transition-transform">
              <div>
                <span className="text-xs font-black text-slate-950 rounded-lg bg-[#38bdf8] border-2 border-black px-3 py-1 shadow-solid-sm">
                  STEP 03
                </span>
                <h3 className="font-editorial text-2xl font-black text-slate-950 mt-6">
                  Disbursement & Updates
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed font-medium">
                  Donors contribute seamlessly via UPI & Cards. Organizers post regular hospital recovery updates and treatment receipts directly to the campaign.
                </p>
              </div>
              <div className="mt-8 pt-5 border-t-2 border-slate-200 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <span>✓</span> 100% receipt transparency
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CALL TO ACTION BANNER
         ========================================================================= */}
      <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl border-2 border-black bg-[#3b82f6] p-10 sm:p-14 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-solid-lg">
          <div className="max-w-2xl">
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-black text-[#e2ff3d] tracking-tight leading-tight drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]">
              Need emergency funding for someone you love?
            </h2>
            <p className="text-white text-sm sm:text-base font-medium mt-3 leading-relaxed">
              Start a campaign today. Our verification desk will review your documents within 24 hours to begin receiving community support.
            </p>
          </div>

          <Link
            href="/fundraise/create"
            className="rounded-xl bg-[#e2ff3d] hover:bg-[#d4ff00] text-slate-950 dark:text-slate-950 font-black px-8 py-4 text-sm border-2 border-black shadow-solid hover:translate-y-0.5 hover:shadow-solid-sm transition-all whitespace-nowrap active:translate-y-1"
          >
            Start a Fundraiser &rarr;
          </Link>
        </div>
      </section>

      {/* =========================================================================
          FIXED FLOATING HELP BUTTON (EXACT PINK CIRCLE '?' FROM REFERENCE SCREENSHOT)
         ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setShowHelpModal((prev) => !prev)}
          aria-label="Need Help or Verification Assistance?"
          className="w-12 h-12 rounded-full bg-[#ff70a6] text-white font-black text-2xl border-2 border-black shadow-solid flex items-center justify-center hover:scale-110 active:translate-y-0.5 transition-all cursor-pointer"
        >
          ?
        </button>

        {showHelpModal && (
          <div className="absolute bottom-16 right-0 w-80 rounded-3xl bg-white border-2 border-black p-5 shadow-solid-lg text-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#ff70a6] text-white font-black text-xs flex items-center justify-center">
                  ?
                </span>
                <span className="font-editorial text-base font-black text-slate-950">
                  Monetra Help Desk
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-6 h-6 rounded-full border border-black flex items-center justify-center text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="py-3 text-xs text-slate-700 space-y-2">
              <p>
                <strong>Need help starting a campaign?</strong> Our Trust Desk team is available to assist with document uploads and hospital verification.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <p className="font-bold text-slate-900">🛡️ Direct Support:</p>
                <p className="text-slate-600">support@monetra.org</p>
                <p className="text-slate-600">Mon - Sat: 9:00 AM - 8:00 PM</p>
              </div>
            </div>
            <div className="pt-2 border-t-2 border-slate-100 flex gap-2">
              <Link
                href="/admin/verification"
                onClick={() => setShowHelpModal(false)}
                className="flex-1 text-center py-2 rounded-xl bg-[#22c55e] border border-black text-slate-950 font-black text-xs hover:bg-[#16a34a] transition-colors"
              >
                Trust Desk
              </Link>
              <Link
                href="/fundraise"
                onClick={() => setShowHelpModal(false)}
                className="flex-1 text-center py-2 rounded-xl bg-slate-100 border border-black text-slate-950 font-black text-xs hover:bg-slate-200 transition-colors"
              >
                How It Works
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}