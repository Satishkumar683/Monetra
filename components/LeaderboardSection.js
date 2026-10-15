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
    <div className="space-y-6 sm:space-y-10">
      {/* Header Info */}
      <div className="text-center max-w-2xl mx-auto px-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[#22c55e] px-3 sm:px-4 py-0.5 sm:py-1 text-[11px] sm:text-xs font-black text-slate-950 shadow-solid-sm">
          <span>🏆</span>
          <span>COMMUNITY HALL OF FAME</span>
        </span>
        <h2 className="mt-2.5 sm:mt-4 font-editorial text-2xl sm:text-5xl font-black tracking-tight text-slate-950">
          Top Benefactors & Organizers
        </h2>
        <p className="mt-1.5 sm:mt-3 text-xs sm:text-base text-slate-600 font-medium leading-relaxed">
          Celebrating the generous donors and visionary campaign creators saving lives and making a tangible impact.
        </p>
      </div>

      {/* Global Impact Summary Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-5">
        <div className="rounded-2xl sm:rounded-3xl border-2 border-black bg-white p-2.5 sm:p-6 shadow-solid-sm sm:shadow-solid text-center flex flex-col justify-center">
          <span className="text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-tight truncate">Aid Given</span>
          <p className="font-editorial text-sm sm:text-3xl lg:text-4xl font-black text-emerald-600 mt-0.5 sm:mt-1 truncate">
            ₹{(stats.totalAmount || 0).toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-1 hidden sm:block">Directly funded verified causes</p>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border-2 border-black bg-white p-2.5 sm:p-6 shadow-solid-sm sm:shadow-solid text-center flex flex-col justify-center">
          <span className="text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-tight truncate">Donations</span>
          <p className="font-editorial text-sm sm:text-3xl lg:text-4xl font-black text-slate-950 mt-0.5 sm:mt-1 truncate">
            {(stats.totalCount || 0).toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-1 hidden sm:block">Verified transactions</p>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border-2 border-black bg-white p-2.5 sm:p-6 shadow-solid-sm sm:shadow-solid text-center flex flex-col justify-center">
          <span className="text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-tight truncate">Patrons</span>
          <p className="font-editorial text-sm sm:text-3xl lg:text-4xl font-black text-slate-950 mt-0.5 sm:mt-1 truncate">
            {(stats.uniqueDonorsCount || 0).toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-1 hidden sm:block">Active angels</p>
        </div>
      </div>

      {/* Interactive Filter Bar & Search */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between">
        {/* Tab Selector */}
        <div className="flex bg-white p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border-2 border-black shadow-solid-sm w-full md:w-auto">
          <button
            onClick={() => setTab("donors")}
            className={`flex-1 md:flex-none px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
            className={`flex-1 md:flex-none px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
            <div className="pt-2 sm:pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 items-end max-w-4xl mx-auto">
                {/* Rank 2 */}
                {second ? (
                  <div className="order-2 md:order-1 rounded-2xl sm:rounded-3xl border-2 border-black bg-white p-4 sm:p-6 text-center shadow-solid-sm sm:shadow-solid flex flex-col items-center">
                    <Link href={`/profile/${second.id}`} className="relative hover:scale-105 transition-transform">
                      <img
                        src={second.user?.image || "/default-avatar.png"}
                        alt={second.user?.name || "Member"}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-black object-cover shadow-solid-sm"
                      />
                      <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 border-2 border-black flex items-center justify-center font-black text-xs sm:text-sm shadow-solid-sm">
                        🥈
                      </span>
                    </Link>
                    <Link
                      href={`/profile/${second.id}`}
                      className="font-editorial text-base sm:text-lg font-black text-slate-950 mt-2.5 sm:mt-3 truncate max-w-[200px] hover:underline"
                    >
                      {second.user?.name || "Anonymous Member"}
                    </Link>
                    <span className="inline-block mt-1 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full border border-black bg-slate-100 text-slate-900">
                      {second.tier}
                    </span>
                    <p className="font-editorial text-xl sm:text-2xl font-black text-slate-950 mt-2 sm:mt-3">
                      ₹{(second.totalAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-bold mt-0.5 sm:mt-1">
                      {second.actionCount} {second.actionLabel}
                    </p>
                    <div className="mt-3 sm:mt-4 flex gap-2 w-full">
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
                  <div className="order-1 md:order-2 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black bg-[#e2ff3d] p-5 sm:p-8 text-center shadow-solid sm:shadow-solid-lg flex flex-col items-center md:scale-105 z-10">
                    <Link href={`/profile/${first.id}`} className="relative hover:scale-105 transition-transform">
                      <img
                        src={first.user?.image || "/default-avatar.png"}
                        alt={first.user?.name || "Member"}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 sm:border-3 border-black object-cover shadow-solid"
                      />
                      <span className="absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center font-black text-base sm:text-lg shadow-solid animate-bounce">
                        👑
                      </span>
                    </Link>
                    <span className="mt-2.5 sm:mt-3 text-[9px] sm:text-[10px] font-black px-2.5 sm:px-3 py-0.5 rounded-full border border-black bg-slate-950 text-white uppercase tracking-wider">
                      Rank #1 Champion
                    </span>
                    <Link
                      href={`/profile/${first.id}`}
                      className="font-editorial text-xl sm:text-2xl font-black text-slate-950 mt-1.5 sm:mt-2 truncate max-w-[220px] hover:underline"
                    >
                      {first.user?.name || "Anonymous Member"}
                    </Link>
                    <p className="font-editorial text-2xl sm:text-3xl font-black text-slate-950 mt-1.5 sm:mt-2">
                      ₹{(first.totalAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-800 font-black mt-0.5 sm:mt-1">
                      {first.actionCount} {first.actionLabel} ✦
                    </p>
                    <div className="mt-3 sm:mt-4 flex gap-2 w-full">
                      <Link
                        href={`/profile/${first.id}`}
                        className="flex-1 py-1.5 sm:py-2 rounded-xl border border-black bg-white hover:bg-slate-100 text-xs font-black shadow-solid-sm"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => handleMessageClick(first.id)}
                        className="flex-1 py-1.5 sm:py-2 rounded-xl border border-black bg-slate-950 hover:bg-slate-800 text-white text-xs font-black shadow-solid-sm cursor-pointer"
                      >
                        💬 Message
                      </button>
                    </div>
                  </div>
                )}

                {/* Rank 3 */}
                {third ? (
                  <div className="order-3 rounded-2xl sm:rounded-3xl border-2 border-black bg-white p-4 sm:p-6 text-center shadow-solid-sm sm:shadow-solid flex flex-col items-center">
                    <Link href={`/profile/${third.id}`} className="relative hover:scale-105 transition-transform">
                      <img
                        src={third.user?.image || "/default-avatar.png"}
                        alt={third.user?.name || "Member"}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-black object-cover shadow-solid-sm"
                      />
                      <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-200 border-2 border-black flex items-center justify-center font-black text-xs sm:text-sm shadow-solid-sm">
                        🥉
                      </span>
                    </Link>
                    <Link
                      href={`/profile/${third.id}`}
                      className="font-editorial text-base sm:text-lg font-black text-slate-950 mt-2.5 sm:mt-3 truncate max-w-[200px] hover:underline"
                    >
                      {third.user?.name || "Anonymous Member"}
                    </Link>
                    <span className="inline-block mt-1 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full border border-black bg-amber-50 text-amber-950">
                      {third.tier}
                    </span>
                    <p className="font-editorial text-xl sm:text-2xl font-black text-slate-950 mt-2 sm:mt-3">
                      ₹{(third.totalAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-bold mt-0.5 sm:mt-1">
                      {third.actionCount} {third.actionLabel}
                    </p>
                    <div className="mt-3 sm:mt-4 flex gap-2 w-full">
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
          <div className="rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-black bg-white p-3.5 sm:p-8 shadow-solid-sm sm:shadow-solid-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-4 sm:mb-6">
              <h3 className="font-editorial text-lg sm:text-2xl font-black text-slate-950">
                {search ? `Search Results for "${search}"` : tab === "donors" ? "All Donors" : "All Cause Organizers"}
              </h3>
              <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                Showing {leaderboard.length} members
              </span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-10 sm:py-12">
                <span className="text-3xl">🔍</span>
                <p className="text-slate-600 text-xs sm:text-sm font-black mt-2">
                  No community profiles matched your query.
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-2 text-xs font-black text-emerald-700 underline"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              <div className="divide-y-2 divide-slate-100">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 hover:bg-slate-50 -mx-1 px-1 sm:-mx-6 sm:px-6 rounded-xl sm:rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                      {/* Rank Pill */}
                      <div
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border-2 border-black flex items-center justify-center font-black text-[11px] sm:text-xs shrink-0 ${
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
                      <Link href={`/profile/${entry.id}`} className="shrink-0">
                        <img
                          src={entry.user?.image || "/default-avatar.png"}
                          alt={entry.user?.name || "Member"}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-black object-cover shadow-solid-sm hover:scale-105 transition-transform"
                        />
                      </Link>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <Link
                            href={`/profile/${entry.id}`}
                            className="font-editorial text-sm sm:text-base font-black text-slate-950 hover:underline truncate max-w-[140px] sm:max-w-none"
                          >
                            {entry.user?.name || "Community Member"}
                          </Link>
                          <span className={`text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 ${entry.badgeStyle}`}>
                            {entry.tierBadge} {entry.tier}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-bold mt-0.5 truncate">
                          {entry.user?.username && `@${entry.user.username} • `}
                          {entry.user?.city && `${entry.user.city} • `}
                          {entry.actionCount} {entry.actionLabel}
                        </p>
                      </div>
                    </div>

                    {/* Amount and Action CTAs */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-100 sm:border-0">
                      <div className="text-left sm:text-right">
                        <span className="font-editorial text-base sm:text-xl font-black text-emerald-700">
                          ₹{(entry.totalAmount || 0).toLocaleString()}
                        </span>
                        <p className="text-[9px] sm:text-[11px] text-slate-400 font-bold">
                          {tab === "donors" ? "Total Given" : "Total Raised"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Link
                          href={`/profile/${entry.id}`}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-black bg-white hover:bg-slate-100 text-[11px] sm:text-xs font-black shadow-solid-sm transition-all"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => handleMessageClick(entry.id)}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-black bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-[11px] sm:text-xs font-black shadow-solid-sm transition-all cursor-pointer"
                          title="Message member"
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
