"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LeaderboardSection({ onSelectUserToMessage }) {
  const router = useRouter();
  const [tab, setTab] = useState("donors"); // "donors" | "creators"
  const [search, setSearch] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalCount: 0,
    uniqueDonorsCount: 0,
    activeFundraisersCount: 0,
    activeCreatorsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      async function loadLeaderboard() {
        try {
          setLoading(true);
          const params = new URLSearchParams({
            limit: "50",
            tab,
            ...(search ? { search } : {}),
          });
          const res = await fetch(`/api/leaderboard?${params.toString()}`);
          const data = await res.json();
          if (data.success) {
            setLeaderboard(data.leaderboard || []);
            if (data.stats) setStats(data.stats);
          } else {
            setError(data.message || "Could not load rankings.");
          }
        } catch (err) {
          setError("Network error while loading rankings.");
        } finally {
          setLoading(false);
        }
      }
      loadLeaderboard();
    }, 250);

    return () => clearTimeout(timer);
  }, [tab, search]);

  const topThree = leaderboard.slice(0, 3);
  const first = topThree.find((d) => d.rank === 1);
  const second = topThree.find((d) => d.rank === 2);
  const third = topThree.find((d) => d.rank === 3);

  const handleMessageClick = (userId) => {
    if (onSelectUserToMessage) {
      onSelectUserToMessage(userId);
    } else {
      router.push(`/community?user=${userId}`);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header Info */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[#22c55e] px-4 py-1 text-xs font-black text-slate-950 shadow-solid-sm">
          <span>🏆</span>
          <span>COMMUNITY HALL OF FAME & RANKINGS</span>
        </span>
        <h2 className="mt-4 font-editorial text-3xl sm:text-5xl font-black tracking-tight text-slate-950">
          Top Benefactors & Organizers
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          Celebrating the generous donors and visionary campaign creators saving lives and making a tangible impact.
        </p>
      </div>

      {/* Global Impact Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-solid text-center">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Community Aid</span>
          <p className="font-editorial text-3xl sm:text-4xl font-black text-emerald-600 mt-1">
            ₹{(stats.totalAmount || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-bold mt-1">Directly funded verified causes</p>
        </div>

        <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-solid text-center">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Contributions</span>
          <p className="font-editorial text-3xl sm:text-4xl font-black text-slate-950 mt-1">
            {(stats.totalCount || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-bold mt-1">Verified Razorpay transactions</p>
        </div>

        <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-solid text-center">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Generous Patrons</span>
          <p className="font-editorial text-3xl sm:text-4xl font-black text-slate-950 mt-1">
            {(stats.uniqueDonorsCount || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-bold mt-1">Active community angels</p>
        </div>
      </div>

      {/* Interactive Filter Bar & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Tab Selector */}
        <div className="flex bg-white p-1.5 rounded-2xl border-2 border-black shadow-solid-sm w-full md:w-auto">
          <button
            onClick={() => setTab("donors")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
              tab === "donors"
                ? "bg-[#22c55e] text-slate-950 border border-black shadow-solid-sm"
                : "text-slate-600 hover:text-black"
            }`}
          >
            <span>🏆</span>
            <span>Top Donors</span>
          </button>
          <button
            onClick={() => setTab("creators")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
              tab === "creators"
                ? "bg-[#22c55e] text-slate-950 border border-black shadow-solid-sm"
                : "text-slate-600 hover:text-black"
            }`}
          >
            <span>🌟</span>
            <span>Top Organizers</span>
          </button>
        </div>

        {/* Profile Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, city..."
            className="w-full text-xs font-bold pl-10 pr-4 py-3 rounded-2xl border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-[#22c55e] shadow-solid-sm placeholder:text-slate-400"
          />
          <span className="absolute left-3.5 top-3.5 text-sm text-slate-400">🔍</span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-black font-black"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-flex items-center gap-3 bg-white border-2 border-black px-6 py-3 rounded-full shadow-solid">
            <svg className="animate-spin w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="font-editorial text-sm font-bold text-slate-950">
              Updating community rankings...
            </span>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl border-2 border-black bg-red-100 text-red-900 font-bold text-center">
          {error}
        </div>
      ) : (
        <>
          {/* Podium (Shown only when not filtering via search) */}
          {!search && topThree.length > 0 && (
            <div className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
                {/* Rank 2 */}
                {second ? (
                  <div className="order-2 md:order-1 rounded-3xl border-2 border-black bg-white p-6 text-center shadow-solid flex flex-col items-center">
                    <Link href={`/profile/${second.id}`} className="relative hover:scale-105 transition-transform">
                      <img
                        src={second.user?.image || "/default-avatar.png"}
                        alt={second.user?.name || "Member"}
                        className="w-20 h-20 rounded-full border-2 border-black object-cover shadow-solid-sm"
                      />
                      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-200 border-2 border-black flex items-center justify-center font-black text-sm shadow-solid-sm">
                        🥈
                      </span>
                    </Link>
                    <Link
                      href={`/profile/${second.id}`}
                      className="font-editorial text-lg font-black text-slate-950 mt-3 truncate max-w-[200px] hover:underline"
                    >
                      {second.user?.name || "Anonymous Member"}
                    </Link>
                    <span className="inline-block mt-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-black bg-slate-100 text-slate-900">
                      {second.tier}
                    </span>
                    <p className="font-editorial text-2xl font-black text-slate-950 mt-3">
                      ₹{(second.totalAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      {second.actionCount} {second.actionLabel}
                    </p>
                    <div className="mt-4 flex gap-2 w-full">
                      <Link
                        href={`/profile/${second.id}`}
                        className="flex-1 py-1.5 rounded-xl border border-black bg-slate-100 hover:bg-slate-200 text-[11px] font-black"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => handleMessageClick(second.id)}
                        className="flex-1 py-1.5 rounded-xl border border-black bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-[11px] font-black cursor-pointer"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ) : <div className="order-2 md:order-1" />}

                {/* Rank 1 */}
                {first && (
                  <div className="order-1 md:order-2 rounded-3xl border-3 border-black bg-[#e2ff3d] p-8 text-center shadow-solid-lg flex flex-col items-center scale-105 z-10">
                    <Link href={`/profile/${first.id}`} className="relative hover:scale-105 transition-transform">
                      <img
                        src={first.user?.image || "/default-avatar.png"}
                        alt={first.user?.name || "Member"}
                        className="w-24 h-24 rounded-full border-3 border-black object-cover shadow-solid"
                      />
                      <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center font-black text-lg shadow-solid animate-bounce">
                        👑
                      </span>
                    </Link>
                    <span className="mt-3 text-[10px] font-black px-3 py-0.5 rounded-full border border-black bg-slate-950 text-white uppercase tracking-wider">
                      Rank #1 Champion
                    </span>
                    <Link
                      href={`/profile/${first.id}`}
                      className="font-editorial text-2xl font-black text-slate-950 mt-2 truncate max-w-[220px] hover:underline"
                    >
                      {first.user?.name || "Anonymous Member"}
                    </Link>
                    <p className="font-editorial text-3xl font-black text-slate-950 mt-2">
                      ₹{(first.totalAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-800 font-black mt-1">
                      {first.actionCount} {first.actionLabel} ✦
                    </p>
                    <div className="mt-4 flex gap-2 w-full">
                      <Link
                        href={`/profile/${first.id}`}
                        className="flex-1 py-2 rounded-xl border border-black bg-white hover:bg-slate-100 text-xs font-black shadow-solid-sm"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => handleMessageClick(first.id)}
                        className="flex-1 py-2 rounded-xl border border-black bg-slate-950 hover:bg-slate-800 text-white text-xs font-black shadow-solid-sm cursor-pointer"
                      >
                        💬 Message
                      </button>
                    </div>
                  </div>
                )}

                {/* Rank 3 */}
                {third ? (
                  <div className="order-3 rounded-3xl border-2 border-black bg-white p-6 text-center shadow-solid flex flex-col items-center">
                    <Link href={`/profile/${third.id}`} className="relative hover:scale-105 transition-transform">
                      <img
                        src={third.user?.image || "/default-avatar.png"}
                        alt={third.user?.name || "Member"}
                        className="w-20 h-20 rounded-full border-2 border-black object-cover shadow-solid-sm"
                      />
                      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-200 border-2 border-black flex items-center justify-center font-black text-sm shadow-solid-sm">
                        🥉
                      </span>
                    </Link>
                    <Link
                      href={`/profile/${third.id}`}
                      className="font-editorial text-lg font-black text-slate-950 mt-3 truncate max-w-[200px] hover:underline"
                    >
                      {third.user?.name || "Anonymous Member"}
                    </Link>
                    <span className="inline-block mt-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-black bg-amber-50 text-amber-950">
                      {third.tier}
                    </span>
                    <p className="font-editorial text-2xl font-black text-slate-950 mt-3">
                      ₹{(third.totalAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      {third.actionCount} {third.actionLabel}
                    </p>
                    <div className="mt-4 flex gap-2 w-full">
                      <Link
                        href={`/profile/${third.id}`}
                        className="flex-1 py-1.5 rounded-xl border border-black bg-slate-100 hover:bg-slate-200 text-[11px] font-black"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => handleMessageClick(third.id)}
                        className="flex-1 py-1.5 rounded-xl border border-black bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-[11px] font-black cursor-pointer"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ) : <div className="order-3" />}
              </div>
            </div>
          )}

          {/* Complete Directory Table */}
          <div className="rounded-3xl border-3 border-black bg-white p-6 sm:p-8 shadow-solid-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h3 className="font-editorial text-2xl font-black text-slate-950">
                {search ? `Search Results for "${search}"` : tab === "donors" ? "All Donors" : "All Cause Organizers"}
              </h3>
              <span className="text-xs font-bold text-slate-500">
                Showing {leaderboard.length} members
              </span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-3xl">🔍</span>
                <p className="text-slate-600 text-sm font-black mt-2">
                  No community profiles matched your query.
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-3 text-xs font-black text-emerald-700 underline"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              <div className="divide-y-2 divide-slate-100">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 -mx-6 px-6 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Pill */}
                      <div
                        className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center font-black text-xs shrink-0 ${
                          entry.rank === 1
                            ? "bg-[#e2ff3d] shadow-solid-sm"
                            : entry.rank <= 3
                            ? "bg-amber-100 shadow-solid-sm"
                            : "bg-slate-100"
                        }`}
                      >
                        #{entry.rank}
                      </div>

                      {/* Avatar */}
                      <Link href={`/profile/${entry.id}`}>
                        <img
                          src={entry.user?.image || "/default-avatar.png"}
                          alt={entry.user?.name || "Member"}
                          className="w-12 h-12 rounded-full border-2 border-black object-cover shrink-0 shadow-solid-sm hover:scale-105 transition-transform"
                        />
                      </Link>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/profile/${entry.id}`}
                            className="font-editorial text-base font-black text-slate-950 hover:underline"
                          >
                            {entry.user?.name || "Community Member"}
                          </Link>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${entry.badgeStyle}`}>
                            {entry.tierBadge} {entry.tier}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">
                          {entry.user?.username && `@${entry.user.username} • `}
                          {entry.user?.city && `${entry.user.city} • `}
                          {entry.actionCount} {entry.actionLabel}
                        </p>
                      </div>
                    </div>

                    {/* Amount and Action CTAs */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-12 sm:pl-0">
                      <div className="text-left sm:text-right">
                        <span className="font-editorial text-xl font-black text-emerald-700">
                          ₹{(entry.totalAmount || 0).toLocaleString()}
                        </span>
                        <p className="text-[11px] text-slate-400 font-bold">
                          {tab === "donors" ? "Total Given" : "Total Raised"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${entry.id}`}
                          className="px-3 py-1.5 rounded-xl border border-black bg-white hover:bg-slate-100 text-xs font-black shadow-solid-sm transition-all"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => handleMessageClick(entry.id)}
                          className="px-3 py-1.5 rounded-xl border border-black bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-black shadow-solid-sm transition-all cursor-pointer"
                        >
                          💬
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
