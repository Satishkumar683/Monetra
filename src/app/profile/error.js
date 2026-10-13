"use client";

import Link from "next/link";

export default function ProfileError({ error, reset }) {
  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) flex flex-col items-center justify-center px-4 text-center">
      <div className="rounded-3xl border-2 border-black bg-white p-8 sm:p-12 max-w-md w-full shadow-solid-lg">
        <div className="w-16 h-16 rounded-full bg-[#ff70a6] border-2 border-black flex items-center justify-center mx-auto shadow-solid-sm mb-4">
          <span className="font-editorial text-2xl font-black text-slate-950">!</span>
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-black text-slate-950">
          Could not load your profile
        </h1>
        <p className="text-slate-600 font-medium text-sm mt-2 mb-6">
          {error?.message || "An unexpected error occurred while loading your profile."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e2ff3d] hover:bg-[#d4ff00] text-slate-950 font-black px-6 py-3.5 border-2 border-black shadow-solid hover:translate-y-0.5 hover:shadow-solid-sm active:translate-y-1 transition-all cursor-pointer"
          >
            Try Again ✦
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-black text-slate-950 font-bold px-6 py-3.5 shadow-solid-sm hover:translate-y-0.5 active:translate-y-1 transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
