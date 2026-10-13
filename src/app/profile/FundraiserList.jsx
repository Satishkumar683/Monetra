"use client";

import { useState } from "react";
import Link from "next/link";
import ProgressBar from "../../components/ProgressBar";

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
      <div className="rounded-2xl border-2 border-black bg-slate-50 p-8 text-center shadow-solid-sm">
        <p className="text-slate-600 font-medium">You haven&apos;t created any fundraisers yet.</p>
        <Link
          href="/fundraise/create"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] transition-all text-slate-950 font-black px-5 py-2.5 text-xs border-2 border-black shadow-solid-sm hover:translate-y-0.5"
        >
          ✦ Start a Fundraiser
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
            className="rounded-2xl border-2 border-black bg-slate-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-solid-sm hover:translate-y-0.5 transition-transform"
          >
            <img
              src={f.coverImage}
              alt={f.title}
              className="w-full sm:w-20 h-20 rounded-xl object-cover flex-shrink-0 border-2 border-black"
            />

            <div className="flex-1 min-w-0">
              <h3 className="font-editorial text-base font-black text-slate-950 truncate">{f.title}</h3>
              <div className="mt-2">
                <ProgressBar percent={percent} />
                <div className="mt-1.5 flex justify-between text-xs">
                  <span className="font-editorial font-black text-slate-950">₹{f.currentAmount.toLocaleString()} raised</span>
                  <span className="text-slate-500 font-bold">of ₹{f.targetAmount.toLocaleString()} · {Math.round(percent)}%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Link
                href={`/fundraiser/${f._id}`}
                className="rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-slate-100 shadow-[0_2px_0_#000]"
              >
                View
              </Link>
              <Link
                href={`/fundraiser/edit/${f._id}`}
                className="rounded-xl border-2 border-black bg-[#22c55e] px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-[#16a34a] shadow-[0_2px_0_#000]"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(f._id)}
                disabled={deletingId === f._id}
                className="rounded-xl border-2 border-black bg-rose-100 px-3 py-1.5 text-xs font-black text-rose-700 hover:bg-rose-200 shadow-[0_2px_0_#000] disabled:opacity-50 cursor-pointer"
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