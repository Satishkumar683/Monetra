"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PublicProfilePage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const router = useRouter();
  const { data: session } = useSession();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("campaigns");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${id}`);
        const data = await res.json();
        if (data.success) {
          setProfileData(data);
        } else {
          setError(data.message || "User not found");
        }
      } catch (err) {
        setError("Network error loading profile");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProfile();
  }, [id]);

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-(--app-bg) text-(--app-text) flex items-center justify-center py-20">
        <div className="inline-flex items-center gap-3 bg-white border-2 border-black px-6 py-3 rounded-full shadow-solid">
          <svg className="animate-spin w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="font-editorial text-sm font-bold text-slate-950">Loading profile...</span>
        </div>
      </main>
    );
  }

  if (error || !profileData) {
    return (
      <main className="min-h-screen bg-(--app-bg) text-(--app-text) px-4 py-20">
        <div className="max-w-md mx-auto rounded-3xl border-2 border-black bg-white p-8 text-center shadow-solid-lg">
          <div className="w-16 h-16 rounded-2xl bg-red-100 border-2 border-black flex items-center justify-center mx-auto text-2xl mb-4">
            🔍
          </div>
          <h1 className="font-editorial text-2xl font-black text-slate-950">Profile Not Found</h1>
          <p className="text-slate-600 text-sm mt-2">{error || "The user you are looking for does not exist."}</p>
          <Link
            href="/leaderboard"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#22c55e] text-slate-950 font-black px-6 py-3 border-2 border-black shadow-solid hover:translate-y-0.5 transition-all text-sm"
          >
            ← Back to Leaderboard
          </Link>
        </div>
      </main>
    );
  }

  const { user, stats, fundraisers = [], donations = [] } = profileData;
  const isSelf = session?.user?.email && session?.user?.name === user.name;

  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-xs font-black text-slate-700 hover:text-black uppercase tracking-wider bg-white px-3 py-1.5 rounded-xl border-2 border-black shadow-solid-sm transition-all"
          >
            ← Community Directory
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-black bg-white px-3 py-1.5 rounded-xl border-2 border-black shadow-solid-sm hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <span>🔗</span>
            <span>{copied ? "Link Copied!" : "Share Profile"}</span>
          </button>
        </div>

        {/* Profile Header Hero */}
        <div className="rounded-3xl border-3 border-black bg-white p-6 sm:p-8 shadow-solid-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative">
                <img
                  src={user.image || "/default-avatar.png"}
                  alt={user.name}
                  className="w-28 h-28 rounded-full border-3 border-black object-cover shadow-solid shrink-0"
                />
                {user.role === "admin" && (
                  <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 border-2 border-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-solid-sm">
                    STAFF
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="font-editorial text-3xl sm:text-4xl font-black text-slate-950">
                    {user.name}
                  </h1>
                  {user.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#22c55e] text-slate-950 text-xs font-black px-2.5 py-0.5 shadow-solid-sm">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {user.username && (
                  <p className="text-xs font-bold text-slate-500 mt-0.5">@{user.username}</p>
                )}

                {user.bio ? (
                  <p className="text-slate-700 text-sm mt-3 max-w-xl font-medium leading-relaxed italic bg-slate-50 p-3 rounded-2xl border-2 border-slate-200">
                    &ldquo;{user.bio}&rdquo;
                  </p>
                ) : (
                  <p className="text-slate-400 text-xs italic mt-2">Active Monetra Community Member</p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs font-bold text-slate-600">
                  {(user.city || user.country) && (
                    <span className="inline-flex items-center gap-1">
                      <span>📍</span>
                      {[user.city, user.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {user.createdAt && (
                    <span className="inline-flex items-center gap-1">
                      <span>🗓️</span>
                      Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions CTA */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
              {!isSelf ? (
                <button
                  onClick={() => router.push(`/community/chat?user=${user._id}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black px-6 py-3 border-2 border-black shadow-solid hover:translate-y-0.5 transition-all cursor-pointer text-sm"
                >
                  <span>💬</span>
                  <span>Direct Message</span>
                </button>
              ) : (
                <Link
                  href="/profile/edit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e2ff3d] hover:bg-[#d4ff00] text-slate-950 font-black px-6 py-3 border-2 border-black shadow-solid hover:translate-y-0.5 transition-all text-sm"
                >
                  <span>✏️</span>
                  <span>Edit My Profile</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Impact Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-solid text-center">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Total Donated</span>
            <p className="font-editorial text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              ₹{(stats?.totalDonated || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Verified contributions</p>
          </div>

          <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-solid text-center">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Causes Backed</span>
            <p className="font-editorial text-2xl sm:text-3xl font-black text-slate-950 mt-1">
              {stats?.donationsCount || 0}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Lives impacted</p>
          </div>

          <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-solid text-center">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Total Raised</span>
            <p className="font-editorial text-2xl sm:text-3xl font-black text-[#2563eb] mt-1">
              ₹{(stats?.totalRaised || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">From active causes</p>
          </div>

          <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-solid text-center">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Causes Created</span>
            <p className="font-editorial text-2xl sm:text-3xl font-black text-slate-950 mt-1">
              {stats?.fundraisersCount || 0}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Community initiatives</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 border-b-2 border-black pb-3">
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-5 py-2.5 rounded-2xl border-2 border-black font-black text-xs transition-all cursor-pointer ${
              activeTab === "campaigns"
                ? "bg-[#22c55e] text-slate-950 shadow-solid-sm"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Created Campaigns ({fundraisers.length})
          </button>
          <button
            onClick={() => setActiveTab("donations")}
            className={`px-5 py-2.5 rounded-2xl border-2 border-black font-black text-xs transition-all cursor-pointer ${
              activeTab === "donations"
                ? "bg-[#22c55e] text-slate-950 shadow-solid-sm"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Public Giving Impact ({donations.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "campaigns" && (
          <div>
            {fundraisers.length === 0 ? (
              <div className="rounded-3xl border-2 border-black bg-white p-10 text-center shadow-solid">
                <span className="text-3xl">🌱</span>
                <p className="font-editorial text-lg font-black text-slate-950 mt-2">
                  No active campaigns published yet.
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  When {user.name} starts a fundraiser, it will show up here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fundraisers.map((f) => {
                  const percent = Math.min(100, Math.round(((f.currentAmount || 0) / (f.targetAmount || 1)) * 100));
                  return (
                    <div
                      key={f._id}
                      className="rounded-3xl border-2 border-black bg-white overflow-hidden shadow-solid hover:translate-y-[-2px] transition-all flex flex-col"
                    >
                      <div className="relative h-44 bg-slate-100 border-b-2 border-black">
                        <img
                          src={f.coverImage || "/placeholder-cause.jpg"}
                          alt={f.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="rounded-full border border-black bg-[#e2ff3d] px-3 py-0.5 text-[10px] font-black uppercase text-slate-950 shadow-solid-sm">
                            {f.category}
                          </span>
                          {f.isUrgent && (
                            <span className="rounded-full border border-black bg-red-500 px-3 py-0.5 text-[10px] font-black uppercase text-white shadow-solid-sm">
                              URGENT 🚨
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-editorial text-lg font-black text-slate-950 line-clamp-2">
                            {f.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-2 line-clamp-2 font-medium">
                            {f.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t-2 border-slate-100">
                          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                            <span className="text-emerald-700 font-black">
                              ₹{(f.currentAmount || 0).toLocaleString()}
                            </span>
                            <span className="text-slate-500">
                              Goal: ₹{(f.targetAmount || 0).toLocaleString()} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full border border-black overflow-hidden">
                            <div
                              className="bg-[#22c55e] h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <div className="mt-4 flex gap-2">
                            <Link
                              href={`/fundraiser/${f._id}`}
                              className="flex-1 text-center rounded-xl bg-slate-950 text-white hover:bg-slate-800 text-xs font-black py-2.5 border-2 border-black transition-all"
                            >
                              View Campaign →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "donations" && (
          <div>
            {donations.length === 0 ? (
              <div className="rounded-3xl border-2 border-black bg-white p-10 text-center shadow-solid">
                <span className="text-3xl">🤝</span>
                <p className="font-editorial text-lg font-black text-slate-950 mt-2">
                  No public donations listed.
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Public donations supported by {user.name} will be shown here.
                </p>
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-solid-lg divide-y-2 divide-slate-100">
                {donations.map((d) => (
                  <div key={d._id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 border-2 border-black flex items-center justify-center font-black text-base shadow-solid-sm shrink-0">
                        ❤️
                      </div>
                      <div>
                        <Link
                          href={`/fundraiser/${d.fundraiser?._id}`}
                          className="font-editorial text-sm sm:text-base font-black text-slate-950 hover:underline line-clamp-1"
                        >
                          {d.fundraiser?.title || "Community Fundraiser"}
                        </Link>
                        <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                          {new Date(d.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-editorial text-base sm:text-lg font-black text-emerald-700">
                        ₹{d.amount.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold">Verified Donation</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
