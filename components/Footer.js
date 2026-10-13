import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t-2 border-black bg-(--app-bg) text-slate-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Logo and Tagline */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-0.5 group">
            <span className="font-editorial text-2xl sm:text-3xl font-black text-slate-950 tracking-tight group-hover:scale-105 transition-transform">
              monetra
            </span>
            <span className="text-[#16a34a] font-black text-xl group-hover:rotate-45 transition-transform">
              *
            </span>
          </Link>
          <span className="text-xs text-slate-600 border-l-2 border-black/20 pl-3 ml-1 font-semibold">
            100% Verified Community Crowdfunding
          </span>
        </div>

        {/* Right: Copyright */}
        <p className="text-xs text-slate-600 font-bold">
          &copy; {new Date().getFullYear()} Monetra. All rights reserved.
        </p>
      </div>
    </footer>
  );
}