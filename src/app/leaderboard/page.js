"use client";

import Link from "next/link";
import LeaderboardSection from "@/components/LeaderboardSection";

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Banner linking to Community Hub */}
        <div className="rounded-3xl border-3 border-black bg-[#e2ff3d] p-6 shadow-solid-lg flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-2xl shadow-solid-sm shrink-0">
              💬
            </span>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-950 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                COMMUNITY HUB
              </span>
              <h3 className="font-editorial text-xl sm:text-2xl font-black text-slate-950">
                The Monetra Lounge & Direct Messaging
              </h3>
              <p className="text-xs text-slate-800 font-bold mt-0.5">
                Join our real-time group chat or send private messages to donors and organizers.
              </p>
            </div>
          </div>
          <Link
            href="/community"
            className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-black px-6 py-3 border-2 border-black shadow-solid hover:translate-y-0.5 transition-all text-xs uppercase tracking-wider shrink-0"
          >
            <span>Open Community Hub</span>
            <span>→</span>
          </Link>
        </div>

        {/* Reusable Leaderboard Section */}
        <LeaderboardSection />
      </div>
    </main>
  );
}
