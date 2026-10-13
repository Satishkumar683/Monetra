"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-8 mb-5 sm:mb-7">
      <div className="max-w-7xl mx-auto relative flex items-center justify-between gap-4">
        {/* Left: Exact Brewser-Style Chunky Wordmark */}
        <Link href="/" className="flex items-center gap-0.5 group shrink-0 z-10">
          <span className="font-editorial text-3xl sm:text-4xl font-black text-[#16a34a] tracking-tight group-hover:scale-105 transition-transform drop-shadow-[0_2px_0_rgba(0,0,0,0.2)]">
            monetra
          </span>
          <span className="text-[#16a34a] font-black text-2xl group-hover:rotate-45 transition-transform">
            *
          </span>
        </Link>

        {/* Center: Absolute dead-center floating capsule pill (slimmed vertically) */}
        <nav className="hidden lg:flex items-center gap-5 rounded-full bg-white text-slate-950 border-2 border-black px-5 py-1.5 shadow-solid absolute left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
          <Link
            href="/"
            className="text-xs font-extrabold text-slate-900 hover:text-emerald-600 transition-colors tracking-tight"
          >
            Home
          </Link>
          <Link
            href="/donate"
            className="text-xs font-extrabold text-slate-900 hover:text-emerald-600 transition-colors tracking-tight"
          >
            Explore Causes
          </Link>
          <Link
            href="/fundraise"
            className="text-xs font-extrabold text-slate-900 hover:text-emerald-600 transition-colors tracking-tight"
          >
            Raise Your Fund
          </Link>
          <Link
            href="/admin/verification"
            className="text-xs font-extrabold text-slate-900 hover:text-emerald-600 transition-colors tracking-tight flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Admin
          </Link>
          <Link
            href="/about"
            className="text-xs font-extrabold text-slate-900 hover:text-emerald-600 transition-colors tracking-tight"
          >
            About Us
          </Link>

          {/* Embedded Capsule CTA Button */}
          <Link
            href="/fundraise/create"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black text-xs px-3 py-1 border border-black shadow-[0_1px_0_#000] transition-transform active:scale-95 ml-1"
          >
            <span>✦</span>
            <span>Get Started</span>
          </Link>
        </nav>

        {/* Right: Floating Theme Switch + Circular Avatar / Profile Button */}
        <div className="flex items-center gap-2.5 shrink-0 z-10">
          <ThemeToggle />
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                if (!session) {
                  window.location.href = "/login";
                } else {
                  setUserMenuOpen((prev) => !prev);
                }
              }}
              aria-label="User Profile"
              className="w-10 h-10 rounded-full bg-white border-2 border-black shadow-solid-sm flex items-center justify-center text-slate-950 hover:scale-105 active:translate-y-0.5 transition-all overflow-hidden cursor-pointer"
            >
              {session?.user?.image && !avatarError ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  onError={() => setAvatarError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-5 h-5 text-slate-950"
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
              )}
            </button>

            {/* Profile Dropdown */}
            {session && userMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white border-2 border-black p-2.5 shadow-solid-lg z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b-2 border-slate-100">
                  <p className="text-xs font-black text-slate-900 truncate">
                    {session.user?.name || "Verified Member"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {session.user?.email}
                  </p>
                </div>
                <div className="py-1.5 space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <span>👤</span> My Profile & Donations
                  </Link>
                  <Link
                    href="/fundraise/create"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <span>✦</span> Start a Fundraiser
                  </Link>
                  {session?.user?.role === "admin" && (
                    <Link
                      href="/admin/verification"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <span>🛡️</span> Trust Desk Queue
                    </Link>
                  )}
                </div>
                <div className="pt-1.5 border-t-2 border-slate-100">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden w-11 h-11 rounded-full bg-white border-2 border-black shadow-solid-sm flex items-center justify-center text-slate-950 font-bold"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 rounded-3xl bg-white border-2 border-black p-5 shadow-solid-lg max-w-sm mx-auto text-slate-900 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-black py-2 px-3 rounded-xl hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            href="/donate"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-black py-2 px-3 rounded-xl hover:bg-slate-100"
          >
            Explore Causes
          </Link>
          <Link
            href="/fundraise"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-black py-2 px-3 rounded-xl hover:bg-slate-100"
          >
            Raise Your Fund
          </Link>
          <Link
            href="/admin/verification"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-black py-2 px-3 rounded-xl hover:bg-slate-100 text-emerald-700"
          >
            🛡️ Admin Desk
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-black py-2 px-3 rounded-xl hover:bg-slate-100"
          >
            About Us
          </Link>
          <Link
            href="/fundraise/create"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 border-2 border-black font-black py-3 text-sm shadow-solid-sm mt-3"
          >
            ✦ Get Started
          </Link>
        </div>
      )}
    </header>
  );
}