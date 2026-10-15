"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ totalAmount: 0, totalCount: 0, uniqueDonorsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/leaderboard?limit=50");
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.leaderboard || []);
          if (data.stats) setStats(data.stats);
        } else {
          setError(data.message || "Could not load leaderboard.");
        }
      } catch (err) {
        setError("Network error while loading leaderboard.");
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const remainingDonors = leaderboard.slice(3);

  // Position order for podium: [Rank 2, Rank 1, Rank 3]
  const first = topThree.find((d) => d.rank === 1);
  const second = topThree.find((d) => d.rank === 2);
  const third = topThree.find((d) => d.rank === 3);

  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[#22c55e] px-4 py-1 text-xs font-black text-slate-950 shadow-solid-sm">
            <span>🏆</span>
            <span>COMMUNITY HALL OF FAME</span>
          </span>
          <h1 className="mt-4 font-editorial text-4xl sm:text-6xl font-black tracking-tight text-slate-950">
            Top Community Benefactors
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Honoring our most generous supporters whose heartfelt contributions save lives, build classrooms, and fund critical surgeries every single day.
          </p>
        </div>

        {/* Global Impact Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-solid text-center">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Community Aid</span>
            <p className="font-editorial text-3xl sm:text-4xl font-black text-emerald-600 mt-1">
              ₹{stats.totalAmount.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 font-bold mt-1">100% directly transferred to causes</p>
          </div>

          <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-solid text-center">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Contributions</span>
            <p className="font-editorial text-3xl sm:text-4xl font-black text-slate-950 mt-1">
              {stats.totalCount.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 font-bold mt-1">Verified Razorpay transactions</p>
          </div>

          <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-solid text-center">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Generous Donors</span>
            <p className="font-editorial text-3xl sm:text-4xl font-black text-slate-950 mt-1">
              {stats.uniqueDonorsCount.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 font-bold mt-1">Active community angels</p>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-flex items-center gap-3 bg-white border-2 border-black px-6 py-3 rounded-full shadow-solid">
              <svg className="animate-spin w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="font-editorial text-sm font-bold text-slate-950">Calculating donor rankings...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl border-2 border-black bg-red-100 text-red-900 font-bold text-center">
            {error}
          </div>
        ) : (
          <>
            {/* =========================================================================
                TOP 3 PODIUM SECTION
               ========================================================================= */}
            {topThree.length > 0 && (
              <div className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
                  {/* Rank 2: Silver */}
                  {second ? (
                    <div className="order-2 md:order-1 rounded-3xl border-2 border-black bg-white p-6 text-center shadow-solid flex flex-col items-center">
                      <div className="relative">
                        <img
                          src={second.user?.image || "/default-avatar.png"}
                          alt={second.user?.name || "Donor"}
                          className="w-20 h-20 rounded-full border-2 border-black object-cover shadow-solid-sm"
                        />
                        <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-200 border-2 border-black flex items-center justify-center font-black text-sm shadow-solid-sm">
                          🥈
                        </span>
                      </div>
                      <h3 className="font-editorial text-lg font-black text-slate-950 mt-3 truncate max-w-[200px]">
                        {second.user?.name || "Anonymous Donor"}
                      </h3>
                      <span className="inline-block mt-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-black bg-slate-100 text-slate-900">
                        {second.tier}
                      </span>
                      <p className="font-editorial text-2xl font-black text-slate-950 mt-3">
                        ₹{second.totalDonated.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 font-bold mt-1">
                        {second.causesCount} causes helped
                      </p>
                    </div>
                  ) : <div className="order-2 md:order-1" />}

                  {/* Rank 1: Gold Champion (Center Stage, Taller) */}
                  {first && (
                    <div className="order-1 md:order-2 rounded-3xl border-3 border-black bg-[#e2ff3d] p-8 text-center shadow-solid-lg flex flex-col items-center scale-105 z-10">
                      <div className="relative">
                        <img
                          src={first.user?.image || "/default-avatar.png"}
                          alt={first.user?.name || "Donor"}
                          className="w-24 h-24 rounded-full border-3 border-black object-cover shadow-solid"
                        />
                        <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center font-black text-lg shadow-solid animate-bounce">
                          👑
                        </span>
                      </div>
                      <span className="mt-3 text-[10px] font-black px-3 py-0.5 rounded-full border border-black bg-slate-950 text-white uppercase tracking-wider">
                        Rank #1 Patron
                      </span>
                      <h3 className="font-editorial text-2xl font-black text-slate-950 mt-2 truncate max-w-[220px]">
                        {first.user?.name || "Anonymous Donor"}
                      </h3>
                      <p className="font-editorial text-3xl font-black text-slate-950 mt-2">
                        ₹{first.totalDonated.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-800 font-black mt-1">
                        {first.causesCount} campaigns empowered ✦
                      </p>
                    </div>
                  )}

                  {/* Rank 3: Bronze */}
                  {third ? (
                    <div className="order-3 rounded-3xl border-2 border-black bg-white p-6 text-center shadow-solid flex flex-col items-center">
                      <div className="relative">
                        <img
                          src={third.user?.image || "/default-avatar.png"}
                          alt={third.user?.name || "Donor"}
                          className="w-20 h-20 rounded-full border-2 border-black object-cover shadow-solid-sm"
                        />
                        <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-200 border-2 border-black flex items-center justify-center font-black text-sm shadow-solid-sm">
                          🥉
                        </span>
                      </div>
                      <h3 className="font-editorial text-lg font-black text-slate-950 mt-3 truncate max-w-[200px]">
                        {third.user?.name || "Anonymous Donor"}
                      </h3>
                      <span className="inline-block mt-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-black bg-amber-50 text-amber-950">
                        {third.tier}
                      </span>
                      <p className="font-editorial text-2xl font-black text-slate-950 mt-3">
                        ₹{third.totalDonated.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 font-bold mt-1">
                        {third.causesCount} causes helped
                      </p>
                    </div>
                  ) : <div className="order-3" />}
                </div>
              </div>
            )}

            {/* =========================================================================
                RANKINGS TABLE (RANKS 4 - 50)
               ========================================================================= */}
            <div className="rounded-3xl border-2 border-black bg-white p-6 sm:p-8 shadow-solid-lg overflow-hidden">
              <h2 className="font-editorial text-2xl font-black text-slate-950 mb-6">
                All Community Champions
              </h2>

              {leaderboard.length === 0 ? (
                <p className="text-slate-500 text-sm font-semibold text-center py-8">
                  No donations recorded yet. Be the first to donate and lead the rankings!
                </p>
              ) : (
                <div className="divide-y-2 divide-slate-100">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.donorId}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 -mx-6 px-6 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank Pill */}
                        <div className={`w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center font-black text-xs shrink-0 ${
                          entry.rank === 1
                            ? "bg-[#e2ff3d] shadow-solid-sm"
                            : entry.rank <= 3
                            ? "bg-amber-100 shadow-solid-sm"
                            : "bg-slate-100"
                        }`}>
                          #{entry.rank}
                        </div>

                        {/* Donor Photo */}
                        <img
                          src={entry.user?.image || "/default-avatar.png"}
                          alt={entry.user?.name || "Donor"}
                          className="w-12 h-12 rounded-full border-2 border-black object-cover shrink-0 shadow-solid-sm"
                        />

                        {/* Donor Info */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-editorial text-base font-black text-slate-950">
                              {entry.user?.name || "Generous Supporter"}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${entry.badgeStyle}`}>
                              {entry.tierBadge} {entry.tier}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-bold mt-0.5">
                            {entry.donationCount} donations • {entry.causesCount} distinct causes
                          </p>
                        </div>
                      </div>

                      {/* Donated Amount */}
                      <div className="text-left sm:text-right shrink-0 pl-12 sm:pl-0">
                        <span className="font-editorial text-xl font-black text-emerald-700">
                          ₹{entry.totalDonated.toLocaleString()}
                        </span>
                        <p className="text-[11px] text-slate-400 font-bold">Total Given</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Call to Action */}
            <div className="rounded-3xl border-2 border-black bg-[#3b82f6] text-white p-8 sm:p-12 text-center shadow-solid-lg">
              <span className="text-2xl">✨</span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-black mt-2 text-[#e2ff3d]">
                Join the Monetra Community Champions
              </h2>
              <p className="text-white/90 text-sm max-w-lg mx-auto mt-2 font-medium">
                Every verified contribution directly saves lives and climbs the community leaderboard.
              </p>
              <Link
                href="/donate"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#e2ff3d] hover:bg-[#d4ff00] text-slate-950 font-black px-8 py-3.5 border-2 border-black shadow-solid hover:translate-y-0.5 transition-all"
              >
                Explore Causes to Support ✦
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
