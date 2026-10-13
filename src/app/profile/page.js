"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StatsCards from "./StatsCards";
import FundraiserList from "./FundraiserList";
import DonationHistory from "./DonationHistory";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "fundraisers", label: "My Fundraisers" },
  { key: "donations", label: "Donation History" },
  { key: "analytics", label: "Analytics" },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadDonations() {
      try {
        const res = await fetch("/api/donations");
        const data = await res.json();
        if (data.success) {
          setDonations(data.donations);
        }
      } catch (err) {
        // fail silently here; donation history is secondary to the main dashboard
      } finally {
        setDonationsLoading(false);
      }
    }
    loadDonations();
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function load() {
      try {
        const res = await fetch("/api/fundraisers/mine");
        const data = await res.json();
        if (data.success) {
          setFundraisers(data.fundraisers);
        } else {
          setError(data.message || "Could not load your fundraisers.");
        }
      } catch (err) {
        setError("Network error while loading your fundraisers.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [status]);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

  function handleDeleted(id) {
    setFundraisers((prev) => prev.filter((f) => f._id !== id));
  }

  function handleShare() {
    const url = `${window.location.origin}/profile/`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-(--app-bg) text-(--app-text) flex items-center justify-center">
        <p className="text-slate-600 font-bold">Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-(--app-bg) text-(--app-text) flex flex-col items-center justify-center gap-4 px-8 text-center">
        <h1 className="text-2xl font-black text-slate-950">
          Sign in to view your profile
        </h1>
        <button
          onClick={() => router.push("/login")}
          className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] transition-colors text-slate-950 font-black px-6 py-3 border-2 border-black shadow-solid-sm cursor-pointer"
        >
          Go to Login
        </button>
      </main>
    );
  }

  const joinedDate = session.user.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : null;

  // ---- Analytics (computed client-side from fundraisers + donations already loaded) ----
  const activeCampaigns = fundraisers.filter((f) => f.isActive).length;
  const closedCampaigns = fundraisers.length - activeCampaigns;
  const totalRaisedAcrossCampaigns = fundraisers.reduce(
    (sum, f) => sum + (f.currentAmount || 0),
    0
  );
  const totalGoalAcrossCampaigns = fundraisers.reduce(
    (sum, f) => sum + (f.targetAmount || 0),
    0
  );
  const overallSuccessRate =
    totalGoalAcrossCampaigns > 0
      ? Math.round((totalRaisedAcrossCampaigns / totalGoalAcrossCampaigns) * 100)
      : 0;
  const avgDonation =
    donations.length > 0 ? Math.round(totalDonated / donations.length) : 0;
  const topFundraiser = [...fundraisers].sort(
    (a, b) => (b.currentAmount || 0) - (a.currentAmount || 0)
  )[0];

  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="rounded-3xl border-2 border-black bg-white text-slate-900 p-6 sm:p-8 shadow-solid-lg">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {session.user.image && !avatarError ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  onError={() => setAvatarError(true)}
                  className="w-24 h-24 rounded-full border-2 border-black shadow-solid-sm object-cover shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-black bg-[#22c55e] shadow-solid-sm flex items-center justify-center text-slate-950 shrink-0">
                  <svg
                    className="w-12 h-12 text-slate-950"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                </div>
              )}
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="font-editorial text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    {session.user.name}
                  </h1>
                  {session.user.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-black bg-[#22c55e] text-slate-950 text-xs font-black px-2.5 py-1 shadow-solid-sm">
                      ✓ Verified Creator
                    </span>
                  )}
                </div>
                <p className="text-slate-600 font-medium text-xs mt-1">{session.user.email}</p>

                {session.user.bio && (
                  <p className="text-slate-700 text-sm mt-3 max-w-xl italic font-medium">
                    &ldquo;{session.user.bio}&rdquo;
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 mt-4 text-xs font-bold text-slate-600">
                  {(session.user.city || session.user.country) && (
                    <span className="inline-flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4 text-emerald-600 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {[session.user.city, session.user.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  )}
                  {joinedDate && (
                    <span className="inline-flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4 text-emerald-600 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                      Member since {joinedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => router.push("/profile/edit")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] transition-all text-slate-950 text-xs font-black px-5 py-2.5 border-2 border-black shadow-solid-sm hover:translate-y-0.5 whitespace-nowrap cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-slate-50 hover:bg-slate-100 transition-all text-slate-950 text-xs font-black px-5 py-2.5 shadow-solid-sm hover:translate-y-0.5 whitespace-nowrap cursor-pointer"
              >
                {copied ? "Link Copied!" : "Share Profile"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats (always visible) */}
        {loading ? (
          <p className="text-slate-400">Loading your stats...</p>
        ) : (
          <StatsCards fundraisers={fundraisers} totalDonated={totalDonated} />
        )}

        {/* Dashboard-style tab nav */}
        <div className="flex flex-wrap gap-2.5 border-b-2 border-slate-800 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-xs font-black px-4 py-2 rounded-2xl border-2 border-black transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#22c55e] text-slate-950 shadow-solid-sm"
                  : "bg-white text-slate-800 shadow-[0_2px_0_#000] hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="rounded-3xl border-2 border-black bg-white text-slate-900 p-6 sm:p-7 shadow-solid-lg">
              <h2 className="font-editorial text-xl font-black text-slate-950 mb-4">
                My Fundraisers
              </h2>
              {loading ? (
                <p className="text-slate-500 font-medium">Loading...</p>
              ) : error ? (
                <p className="text-red-600 font-bold">{error}</p>
              ) : (
                <FundraiserList
                  fundraisers={fundraisers.slice(0, 2)}
                  onDeleted={handleDeleted}
                />
              )}
            </section>

            <section className="rounded-3xl border-2 border-black bg-white text-slate-900 p-6 sm:p-7 shadow-solid-lg">
              <h2 className="font-editorial text-xl font-black text-slate-950 mb-4">
                Donation History
              </h2>
              {donationsLoading ? (
                <p className="text-slate-500 font-medium">Loading...</p>
              ) : (
                <DonationHistory donations={donations.slice(0, 3)} />
              )}
            </section>
          </div>
        )}

        {activeTab === "fundraisers" && (
          <section className="rounded-3xl border-2 border-black bg-white text-slate-900 p-6 sm:p-7 shadow-solid-lg">
            <h2 className="font-editorial text-xl font-black text-slate-950 mb-4">
              My Fundraisers
            </h2>
            {loading ? (
              <p className="text-slate-400">Loading...</p>
            ) : error ? (
              <p className="text-red-400">{error}</p>
            ) : (
              <FundraiserList fundraisers={fundraisers} onDeleted={handleDeleted} />
            )}
          </section>
        )}

        {activeTab === "donations" && (
          <section className="rounded-3xl border-2 border-black bg-white text-slate-900 p-6 sm:p-7 shadow-solid-lg">
            <h2 className="font-editorial text-xl font-black text-slate-950 mb-4">
              Donation History
            </h2>
            {donationsLoading ? (
              <p className="text-slate-500 font-medium">Loading...</p>
            ) : (
              <DonationHistory donations={donations} />
            )}
          </section>
        )}

        {activeTab === "analytics" && (
          <section className="rounded-3xl border-2 border-black bg-white text-slate-900 p-6 sm:p-7 shadow-solid-lg">
            <h2 className="font-editorial text-xl font-black text-slate-950 mb-5">
              Campaign & Giving Analytics
            </h2>

            {fundraisers.length === 0 && donations.length === 0 ? (
              <div className="rounded-2xl border-2 border-black bg-slate-50 p-8 text-center shadow-solid-sm">
                <p className="text-slate-600 font-medium">
                  Not enough activity yet to show analytics.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border-2 border-black bg-slate-50 p-4 shadow-solid-sm">
                  <p className="text-xs font-bold text-slate-500">Active Campaigns</p>
                  <p className="font-editorial text-2xl font-black text-slate-950 mt-1">
                    {activeCampaigns}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-black bg-slate-50 p-4 shadow-solid-sm">
                  <p className="text-xs font-bold text-slate-500">Closed Campaigns</p>
                  <p className="font-editorial text-2xl font-black text-slate-950 mt-1">
                    {closedCampaigns}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-black bg-slate-50 p-4 shadow-solid-sm">
                  <p className="text-xs font-bold text-slate-500">Overall Success Rate</p>
                  <p className="font-editorial text-2xl font-black text-emerald-700 mt-1">
                    {overallSuccessRate}%
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-black bg-slate-50 p-4 shadow-solid-sm">
                  <p className="text-xs font-bold text-slate-500">Avg. Donation Made</p>
                  <p className="font-editorial text-2xl font-black text-slate-950 mt-1">
                    ₹{avgDonation.toLocaleString()}
                  </p>
                </div>

                {topFundraiser && (
                  <div className="col-span-2 lg:col-span-4 rounded-2xl border-2 border-black bg-slate-50 p-5 shadow-solid-sm">
                    <span className="inline-block rounded-full bg-[#22c55e] border border-black px-2.5 py-0.5 text-[10px] font-black text-slate-950 mb-2">
                      ✦ Top Performing Campaign
                    </span>
                    <p className="font-editorial text-base font-black text-slate-950 mt-1">
                      {topFundraiser.title}
                    </p>
                    <p className="text-xs font-bold text-slate-600 mt-1">
                      ₹{(topFundraiser.currentAmount || 0).toLocaleString()} raised of ₹{(topFundraiser.targetAmount || 0).toLocaleString()} goal
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}