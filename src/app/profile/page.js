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
      <main className="min-h-screen bg-[#060b10] flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-[#060b10] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <h1 className="text-2xl font-bold text-white">
          Sign in to view your profile
        </h1>
        <button
          onClick={() => router.push("/login")}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-400 hover:bg-emerald-300 transition-colors text-slate-900 font-semibold px-6 py-3"
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
    <main className="min-h-screen bg-[#060b10] px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="rounded-2xl border border-white/10 bg-white/3 p-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <img
                src={session.user.image}
                alt={session.user.name}
                className="w-24 h-24 rounded-full border border-white/10 object-cover shrink-0"
              />
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="font-serif text-3xl font-bold text-white">
                    {session.user.name}
                  </h1>
                  {session.user.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium px-2.5 py-1">
                      ✨ Verified Creator
                    </span>
                  )}
                </div>
                <p className="text-slate-400 mt-1">{session.user.email}</p>

                {session.user.bio && (
                  <p className="text-slate-300 text-sm mt-3 max-w-xl italic">
                    &ldquo;{session.user.bio}&rdquo;
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1 mt-4 text-sm text-slate-500">
                  {session.user.location && (
                    <span>📍 {session.user.location}</span>
                  )}
                  {joinedDate && <span>📅 Joined {joinedDate}</span>}
                </div>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => router.push("/profile/edit")}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 hover:bg-emerald-300 transition-colors text-slate-900 text-sm font-semibold px-5 py-2.5 whitespace-nowrap"
              >
                Edit Profile
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors text-white text-sm font-medium px-5 py-2.5 whitespace-nowrap"
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
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-sm font-medium px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-white/6 text-emerald-400 border-b-2 border-emerald-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                My Fundraisers
              </h2>
              {loading ? (
                <p className="text-slate-400">Loading...</p>
              ) : error ? (
                <p className="text-red-400">{error}</p>
              ) : (
                <FundraiserList
                  fundraisers={fundraisers.slice(0, 2)}
                  onDeleted={handleDeleted}
                />
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Donation History
              </h2>
              {donationsLoading ? (
                <p className="text-slate-400">Loading...</p>
              ) : (
                <DonationHistory donations={donations.slice(0, 3)} />
              )}
            </section>
          </div>
        )}

        {activeTab === "fundraisers" && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
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
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Donation History
            </h2>
            {donationsLoading ? (
              <p className="text-slate-400">Loading...</p>
            ) : (
              <DonationHistory donations={donations} />
            )}
          </section>
        )}

        {activeTab === "analytics" && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white mb-5">
              Analytics
            </h2>

            {fundraisers.length === 0 && donations.length === 0 ? (
              <p className="text-slate-400">
                Not enough activity yet to show analytics.
              </p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-slate-500">Active Campaigns</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {activeCampaigns}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-slate-500">Closed Campaigns</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {closedCampaigns}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-slate-500">Overall Success Rate</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">
                    {overallSuccessRate}%
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-slate-500">Avg. Donation Made</p>
                  <p className="text-xl font-bold text-white mt-1">
                    ₹{avgDonation.toLocaleString()}
                  </p>
                </div>

                {topFundraiser && (
                  <div className="col-span-2 lg:col-span-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">
                      Top Performing Campaign
                    </p>
                    <p className="text-white font-medium mt-1">
                      {topFundraiser.title}
                    </p>
                    <p className="text-sm text-slate-400 mt-0.5">
                      ₹{(topFundraiser.currentAmount || 0).toLocaleString()} raised
                      of ₹{(topFundraiser.targetAmount || 0).toLocaleString()} goal
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