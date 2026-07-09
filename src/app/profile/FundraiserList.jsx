"use client";

import { useState } from "react";
import Link from "next/link";

function ProgressBar({ percent }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full bg-emerald-400 rounded-full transition-all"
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

export default function FundraiserList({ fundraisers, onDeleted }) {
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this campaign? This can't be undone.");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/fundraisers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        onDeleted(id);
      } else {
        alert(data.message || "Failed to delete.");
      }
    } catch (err) {
      alert("Network error while deleting.");
    } finally {
      setDeletingId(null);
    }
  }

  if (fundraisers.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-slate-400">You haven&apos;t created any fundraisers yet.</p>
        <Link
          href="/fundraise/create"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-400 hover:bg-emerald-300 transition-colors text-slate-900 font-semibold px-5 py-2.5 text-sm"
        >
          Start a Fundraiser
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fundraisers.map((f) => {
        const percent = f.targetAmount > 0 ? (f.currentAmount / f.targetAmount) * 100 : 0;
        return (
          <div
            key={f._id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <img
              src={f.coverImage}
              alt={f.title}
              className="w-full sm:w-24 h-24 rounded-xl object-cover flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{f.title}</h3>
              <div className="mt-2">
                <ProgressBar percent={percent} />
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>₹{f.currentAmount.toLocaleString()} raised</span>
                  <span>of ₹{f.targetAmount.toLocaleString()} · {Math.round(percent)}%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Link
                href={`/fundraiser/${f._id}`}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/5 transition-colors"
              >
                View
              </Link>
              <Link
                href={`/fundraiser/edit/${f._id}`}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/5 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(f._id)}
                disabled={deletingId === f._id}
                className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {deletingId === f._id ? "..." : "Delete"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}