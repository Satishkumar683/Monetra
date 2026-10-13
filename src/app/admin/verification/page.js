"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CATEGORIES } from "@/lib/constants";

// Helper SVG icons
function ShieldCheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ClockIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function AlertTriangleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function XCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" x2="9" y1="9" y2="15" />
      <line x1="9" x2="15" y1="9" y2="15" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function FileTextIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
    </svg>
  );
}

function CloseIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function AdminVerificationPage() {
  const { data: session, status: authStatus } = useSession();

  const [fundraisers, setFundraisers] = useState([]);
  const [counts, setCounts] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    action_required: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending"); // pending | verified | action_required | rejected | all
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Passkey gatekeeper state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adminPasskey, setAdminPasskey] = useState("");
  const [passkeyInput, setPasskeyInput] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [verifyingKey, setVerifyingKey] = useState(false);
  const [gateError, setGateError] = useState("");

  // Inspection Drawer / Modal state
  const [inspectingItem, setInspectingItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [badgeType, setBadgeType] = useState("standard");
  const [decisionNote, setDecisionNote] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);

  // Restore unlocked session if previously verified in this tab
  useEffect(() => {
    try {
      const storedUnlocked = sessionStorage.getItem("monetra_admin_unlocked");
      const storedKey = sessionStorage.getItem("monetra_admin_passkey");
      if (storedUnlocked === "true" && storedKey) {
        setIsUnlocked(true);
        setAdminPasskey(storedKey);
        loadCampaigns(storedKey);
      }
    } catch (e) {
      // sessionStorage not available
    }
  }, []);

  // Fetch campaigns
  async function loadCampaigns(overrideKey) {
    const key = overrideKey || adminPasskey;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/verification?status=all`, {
        headers: key ? { "x-admin-passkey": key } : {},
      });
      const data = await res.json();
      if (data.success) {
        setFundraisers(data.fundraisers || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to load verification queue:", err);
    } finally {
      setLoading(false);
    }
  }

  // Verify Admin Access Passkey
  async function handleVerifyGate(e) {
    if (e) e.preventDefault();
    if (!passkeyInput.trim()) {
      setGateError("Please enter your Admin Access ID.");
      return;
    }

    setVerifyingKey(true);
    setGateError("");

    try {
      const res = await fetch("/api/admin/verify-passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: passkeyInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setGateError(data.message || "Invalid Admin Access ID. Access denied.");
        return;
      }

      const verifiedKey = passkeyInput.trim();
      setIsUnlocked(true);
      setAdminPasskey(verifiedKey);
      try {
        sessionStorage.setItem("monetra_admin_unlocked", "true");
        sessionStorage.setItem("monetra_admin_passkey", verifiedKey);
      } catch (e) {}

      loadCampaigns(verifiedKey);
    } catch (err) {
      setGateError("Network error verifying Admin ID.");
    } finally {
      setVerifyingKey(false);
    }
  }

  // Lock desk
  function handleLockDesk() {
    setIsUnlocked(false);
    setAdminPasskey("");
    setPasskeyInput("");
    setGateError("");
    try {
      sessionStorage.removeItem("monetra_admin_unlocked");
      sessionStorage.removeItem("monetra_admin_passkey");
    } catch (e) {}
  }

  // Handle decisions
  async function handleDecision(action) {
    if (!inspectingItem) return;

    if ((action === "reject" || action === "request_info") && !decisionNote.trim()) {
      alert("Please provide a note or reason for the organizer.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/verification/${inspectingItem._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(adminPasskey ? { "x-admin-passkey": adminPasskey } : {}),
        },
        body: JSON.stringify({
          action,
          badge: badgeType,
          note: decisionNote,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to submit decision.");
        return;
      }

      // Update state locally
      setFundraisers((prev) =>
        prev.map((f) => (f._id === inspectingItem._id ? data.fundraiser : f))
      );

      // Refresh counts
      setCounts((prev) => {
        const oldStatus = inspectingItem.verificationStatus || "pending";
        const newStatus = data.fundraiser.verificationStatus;
        if (oldStatus === newStatus) return prev;
        return {
          ...prev,
          [oldStatus]: Math.max(0, (prev[oldStatus] || 1) - 1),
          [newStatus]: (prev[newStatus] || 0) + 1,
        };
      });

      setInspectingItem(null);
      setDecisionNote("");
    } catch (err) {
      alert("Network error submitting decision.");
    } finally {
      setActionLoading(false);
    }
  }

  // Filtered list
  const filteredList = useMemo(() => {
    return fundraisers.filter((f) => {
      const matchesTab =
        activeTab === "all" ? true : f.verificationStatus === activeTab;
      const matchesCat =
        selectedCategory === "All" ? true : f.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        f.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.owner?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesCat && matchesSearch;
    });
  }, [fundraisers, activeTab, selectedCategory, searchQuery]);

  // If not unlocked, render the Gatekeeper Screen
  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-(--app-bg) text-(--app-text) flex flex-col items-center justify-center px-4 py-24">
        <div className="max-w-md w-full rounded-3xl border-2 border-black bg-white p-7 sm:p-9 text-slate-900 shadow-solid-lg relative overflow-hidden">
          {/* Top subtle mint accent strip */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-[#22c55e] border-b-2 border-black" />

          {/* Shield Pill Badge */}
          <div className="flex justify-center mt-3 mb-4">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#22c55e] px-3.5 py-1 text-xs font-black text-slate-950 shadow-solid-sm">
              <ShieldCheckIcon className="w-4 h-4 text-slate-950" />
              RESTRICTED TRUST & SAFETY DESK
            </span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-black mx-auto flex items-center justify-center mb-4 shadow-solid-sm">
            <ShieldCheckIcon className="w-8 h-8 text-emerald-600" />
          </div>

          <h1 className="font-editorial text-2xl sm:text-3xl font-black text-center text-slate-950">
            Verify Yourself as Admin
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm text-center font-medium mt-2 mb-6 leading-relaxed">
            Please enter your designated <strong>Admin Access ID</strong> to unlock the campaign verification queue, inspect hospital IPD records, and authorize payouts.
          </p>

          {gateError && (
            <div className="mb-5 rounded-2xl border-2 border-black bg-rose-50 p-3.5 text-xs font-bold text-rose-700 shadow-solid-sm flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{gateError}</span>
            </div>
          )}

          <form onSubmit={handleVerifyGate} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Access ID / Passkey
              </label>
              <div className="relative">
                <input
                  type={showPasskey ? "text" : "password"}
                  value={passkeyInput}
                  onChange={(e) => {
                    setPasskeyInput(e.target.value);
                    if (gateError) setGateError("");
                  }}
                  placeholder="Enter your Admin ID"
                  className="w-full rounded-2xl border-2 border-black bg-slate-50 px-4 py-3 text-sm font-black text-slate-950 placeholder:text-slate-400 shadow-solid-sm focus:outline-none focus:bg-white transition-colors pr-14"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {showPasskey ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={verifyingKey}
              className="w-full rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-slate-950 font-black py-3.5 text-sm border-2 border-black shadow-solid hover:translate-y-0.5 hover:shadow-solid-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {verifyingKey ? (
                "Authenticating..."
              ) : (
                <>
                  <span>✦</span>
                  <span>Verify & Unlock Desk</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t-2 border-slate-100 flex items-center justify-between text-xs font-bold">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-950 transition-colors flex items-center gap-1"
            >
              &larr; Return Home
            </Link>
            <Link
              href="/donate"
              className="text-emerald-700 hover:underline"
            >
              Public Explore
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) pt-20 sm:pt-24 lg:pt-28 pb-24">
      {/* Top Banner */}
      <div className="border-b-2 border-black bg-(--app-bg) pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#22c55e] px-3.5 py-1 text-xs font-black text-slate-950 shadow-solid-sm">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-slate-950" />
                MONETRA TRUST & SAFETY DESK
              </span>
              <h1 className="font-editorial text-3xl sm:text-4xl font-black text-slate-950 mt-3">
                Campaign Verification Desk
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
                Verify hospital IPD records, doctor estimates, and identity proofs before donations unlock.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/donate"
                className="rounded-full border-2 border-black bg-white hover:bg-slate-100 px-4 py-2 text-xs text-slate-950 font-black shadow-solid-sm transition-all"
              >
                Public Explore &rarr;
              </Link>
              <button
                type="button"
                onClick={loadCampaigns}
                className="rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black px-4 py-2 text-xs border-2 border-black shadow-solid-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
                Refresh Queue
              </button>
              <button
                type="button"
                onClick={handleLockDesk}
                className="rounded-full bg-rose-100 hover:bg-rose-200 text-rose-900 font-black px-3.5 py-2 text-xs border-2 border-black shadow-solid-sm transition-all flex items-center gap-1.5 cursor-pointer"
                title="Lock Admin Desk"
              >
                <CloseIcon className="w-3 h-3" />
                Lock Desk
              </button>
            </div>
          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`rounded-3xl border-2 border-black p-5 text-left transition-all cursor-pointer ${
                activeTab === "pending"
                  ? "bg-[#22c55e] text-slate-950 shadow-solid-lg scale-[1.02]"
                  : "bg-white text-slate-900 shadow-solid hover:translate-y-0.5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Pending Review</span>
                <ClockIcon className="w-5 h-5 text-amber-500" />
              </div>
              <p className="font-editorial text-3xl font-black mt-2">{counts.pending}</p>
              <p className="text-[11px] font-bold text-slate-600 mt-0.5">Donations locked</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("verified")}
              className={`rounded-3xl border-2 border-black p-5 text-left transition-all cursor-pointer ${
                activeTab === "verified"
                  ? "bg-[#22c55e] text-slate-950 shadow-solid-lg scale-[1.02]"
                  : "bg-white text-slate-900 shadow-solid hover:translate-y-0.5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Verified Active</span>
                <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="font-editorial text-3xl font-black mt-2">{counts.verified}</p>
              <p className="text-[11px] font-bold text-slate-600 mt-0.5">Donations enabled</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("action_required")}
              className={`rounded-3xl border-2 border-black p-5 text-left transition-all cursor-pointer ${
                activeTab === "action_required"
                  ? "bg-amber-300 text-slate-950 shadow-solid-lg scale-[1.02]"
                  : "bg-white text-slate-900 shadow-solid hover:translate-y-0.5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Action Required</span>
                <AlertTriangleIcon className="w-5 h-5 text-amber-600" />
              </div>
              <p className="font-editorial text-3xl font-black mt-2">{counts.action_required}</p>
              <p className="text-[11px] font-bold text-slate-600 mt-0.5">Awaiting organizer</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rejected")}
              className={`rounded-3xl border-2 border-black p-5 text-left transition-all cursor-pointer ${
                activeTab === "rejected"
                  ? "bg-rose-200 text-slate-950 shadow-solid-lg scale-[1.02]"
                  : "bg-white text-slate-900 shadow-solid hover:translate-y-0.5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Declined</span>
                <XCircleIcon className="w-5 h-5 text-rose-500" />
              </div>
              <p className="font-editorial text-3xl font-black mt-2">{counts.rejected}</p>
              <p className="text-[11px] font-bold text-slate-600 mt-0.5">Guidelines not met</p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Filters and search bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-black/10">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "pending", label: `Pending (${counts.pending})` },
              { id: "verified", label: `Verified (${counts.verified})` },
              { id: "action_required", label: `Action Req (${counts.action_required})` },
              { id: "rejected", label: `Declined (${counts.rejected})` },
              { id: "all", label: `All (${counts.total})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-black whitespace-nowrap transition-all border-2 border-black cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#22c55e] text-slate-950 shadow-solid-sm"
                    : "text-slate-800 bg-white hover:bg-slate-100 shadow-[0_2px_0_#000]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-solid-sm focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns or organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 sm:w-64 rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-semibold text-slate-950 placeholder:text-slate-400 shadow-solid-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Campaign List */}
        {loading ? (
          <div className="py-20 text-center text-slate-600 font-bold text-sm">
            Loading verification queue...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border-2 border-black bg-white shadow-solid-sm mt-6 p-8">
            <CheckCircleIcon className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <p className="text-slate-950 font-black text-base">No campaigns found in this view</p>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              All caught up or try switching the filter tab.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredList.map((c) => {
              const statusPill =
                c.verificationStatus === "verified" ? (
                  <span className="rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 text-[11px] font-black flex items-center gap-1.5 shadow-xs">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                    Verified
                  </span>
                ) : c.verificationStatus === "action_required" ? (
                  <span className="rounded-full bg-amber-500/15 border-2 border-amber-500/30 text-amber-300 px-2.5 py-0.5 text-[11px] font-black flex items-center gap-1.5 shadow-xs">
                    <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-400" />
                    Action Req
                  </span>
                ) : c.verificationStatus === "rejected" ? (
                  <span className="rounded-full bg-rose-500/15 border-2 border-rose-500/30 text-rose-300 px-2.5 py-0.5 text-[11px] font-black flex items-center gap-1.5 shadow-xs">
                    <XCircleIcon className="w-3.5 h-3.5 text-rose-400" />
                    Declined
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/15 border-2 border-amber-500/30 text-amber-300 px-2.5 py-0.5 text-[11px] font-black flex items-center gap-1.5 shadow-xs">
                    <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
                    Pending Review
                  </span>
                );

              const docCount = c.documents?.length || 0;

              return (
                <div
                  key={c._id}
                  className="rounded-3xl border-2 border-black bg-white text-slate-900 overflow-hidden flex flex-col shadow-solid hover:shadow-solid-lg hover:-translate-y-1 transition-all"
                >
                  <div className="relative h-44 bg-slate-100 overflow-hidden border-b-2 border-black">
                    <img
                      src={c.coverImage || "/images/donation.webp"}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-[#22c55e] px-3 py-0.5 text-xs text-slate-950 font-black border border-black shadow-solid-sm">
                      {c.category}
                    </span>
                    <div className="absolute top-3 right-3">{statusPill}</div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-editorial text-lg font-black text-slate-950 line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 font-medium">
                      {c.description}
                    </p>

                    <div className="mt-4 pt-4 border-t-2 border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-slate-500 font-bold">Target Amount</p>
                        <p className="font-editorial text-base font-black text-slate-950">
                          ₹{c.targetAmount?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 font-bold">Documents Attached</p>
                        <p className="text-emerald-800 font-black">
                          {docCount} {docCount === 1 ? "File" : "Files"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-black flex items-center justify-center text-[10px] text-slate-950 font-black">
                        {c.owner?.name?.[0] || "U"}
                      </span>
                      <span className="truncate">{c.owner?.name || "Organizer"}</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {c.verificationNote && (
                      <div className="mt-3 rounded-xl border border-black bg-amber-50 p-2.5 text-[11px] text-slate-900 font-semibold shadow-solid-sm">
                        <span className="font-black text-slate-950">Note:</span> {c.verificationNote}
                      </div>
                    )}

                    <div className="mt-5 pt-3 border-t-2 border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectingItem(c);
                          setBadgeType(c.verificationBadge !== "none" ? c.verificationBadge : "standard");
                          setDecisionNote(c.verificationNote || "");
                        }}
                        className="flex-1 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black py-2.5 text-xs border-2 border-black shadow-solid-sm hover:translate-y-0.5 transition-all cursor-pointer"
                      >
                        Inspect & Review
                      </button>
                      <Link
                        href={`/fundraiser/${c._id}`}
                        target="_blank"
                        className="rounded-xl border-2 border-black bg-slate-50 hover:bg-slate-100 p-2 text-slate-950 shadow-solid-sm transition-all"
                        title="View Public Page"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <path d="M15 3h6v6" />
                          <path d="M10 14L21 3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inspection Modal / Drawer */}
      {inspectingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setInspectingItem(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0b1219] border border-white/15 p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 font-semibold">
                  {inspectingItem.category}
                </span>
                <h2 className="font-serif text-2xl font-bold text-white mt-1.5">
                  {inspectingItem.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Organized by <span className="text-white font-medium">{inspectingItem.owner?.name}</span> ({inspectingItem.owner?.email})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                aria-label="Close"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              {/* Left Column: Story & Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Fundraiser Goal
                  </h4>
                  <p className="text-xl font-bold text-white">
                    ₹{inspectingItem.targetAmount?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Campaign Story
                  </h4>
                  <div className="max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {inspectingItem.description}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Reviewer Verification Checklist
                  </h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-white/20 bg-white/5 text-emerald-400" />
                      Government ID / KYC name matches creator
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-white/20 bg-white/5 text-emerald-400" />
                      Hospital admission / Doctor registration valid
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-white/20 bg-white/5 text-emerald-400" />
                      Cost estimate matches target goal
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Uploaded Documents & Decision Desk */}
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Uploaded Verification Documents ({inspectingItem.documents?.length || 0})
                  </h4>

                  {!inspectingItem.documents || inspectingItem.documents.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/20 p-6 text-center text-xs text-slate-500">
                      No documents were uploaded by this creator.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {inspectingItem.documents.map((doc, idx) => (
                        <div
                          key={doc._id || idx}
                          onClick={() => setPreviewDoc(doc)}
                          className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-3 hover:border-emerald-500/40 transition-colors flex items-center gap-2.5"
                        >
                          <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            <FileTextIcon className="w-4 h-4 text-emerald-400" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-white font-medium truncate">{doc.name}</p>
                            <p className="text-[10px] text-emerald-400">{doc.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Badge selector */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                    Trust Badge to Award
                  </label>
                  <select
                    value={badgeType}
                    onChange={(e) => setBadgeType(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="standard" className="bg-slate-900 text-white">
                      Standard Monetra Verified
                    </option>
                    <option value="hospital_verified" className="bg-slate-900 text-white">
                      Hospital Direct Verified
                    </option>
                    <option value="field_verified" className="bg-slate-900 text-white">
                      Field / Volunteer Visited
                    </option>
                  </select>
                </div>

                {/* Decision note input */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                    Verification Note / Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g. Cross-checked IPD# 2049 at Fortis Hospital desk. Valid estimate."
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 resize-none"
                  />
                </div>

                {/* Decision Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleDecision("verify")}
                    className="w-full sm:flex-1 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 text-slate-900 font-semibold py-2.5 text-xs transition-colors shadow-lg shadow-emerald-400/10 flex items-center justify-center gap-1.5"
                  >
                    {actionLoading ? (
                      "Processing..."
                    ) : (
                      <>
                        <CheckCircleIcon className="w-3.5 h-3.5 text-slate-900" />
                        Approve & Unlock Donations
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleDecision("request_info")}
                    className="w-full sm:w-auto rounded-xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 font-medium px-4 py-2.5 text-xs transition-colors"
                  >
                    Request Info
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleDecision("reject")}
                    className="w-full sm:w-auto rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-medium px-4 py-2.5 text-xs transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Full View Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-[#0c141d] rounded-2xl border border-white/20 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs text-emerald-300 font-semibold">{previewDoc.name} ({previewDoc.type})</span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                Close <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-center max-h-[70vh] overflow-auto">
              {previewDoc.fileData?.startsWith("data:image") ? (
                <img
                  src={previewDoc.fileData}
                  alt={previewDoc.name}
                  className="max-h-[65vh] object-contain rounded-lg"
                />
              ) : (
                <div className="p-8 text-center text-xs text-slate-300">
                  <p>Document preview not supported for non-image format.</p>
                  <a
                    href={previewDoc.fileData}
                    download={previewDoc.name}
                    className="mt-3 inline-block rounded-lg bg-emerald-400 text-slate-900 font-semibold px-4 py-2"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
