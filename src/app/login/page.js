"use client";

import React, { Suspense, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  return null;
}

function LoginErrorNotice() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  let message = "An error occurred during sign in. Please try again.";
  if (error === "OAuthCallback" || error === "OAuthSignin") {
    message = "Google/OAuth sign in failed. Please verify your credentials or try again.";
  } else if (error === "AccessDenied") {
    message = "Access was denied. Please try again.";
  }

  return (
    <div className="w-full p-3 text-xs text-red-900 font-bold bg-red-100 border-2 border-black rounded-xl text-center shadow-solid-sm mb-2">
      ⚠️ {message}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left Side: Brand Narrative */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#22c55e] px-4 py-1.5 text-xs font-black text-slate-950 shadow-solid-sm">
            <span>✦</span> 100% VERIFIED GIVING
          </span>

          <h1 className="mt-6 font-editorial text-4xl sm:text-6xl font-black text-slate-950 leading-[0.95] tracking-tight">
            Welcome back<br />
            to verified<br />
            <span className="text-emerald-700">giving.</span>
          </h1>

          <p className="mt-6 text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
            Sign in to start fundraisers, upload hospital admission proofs, check your Trust Desk status, and track your donation impact.
          </p>

          <div className="mt-8 flex items-center gap-4 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5 text-slate-900 font-bold">
              <span className="text-emerald-700 font-bold">✓</span> Direct UPI & Cards
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5 text-slate-900 font-bold">
              <span className="text-emerald-700 font-bold">✓</span> Zero Middleman Markup
            </span>
          </div>
        </div>

        {/* Right Side: Neo-Brutalist Login Box */}
        <div className="rounded-3xl border-2 border-black bg-white text-slate-900 p-8 sm:p-10 shadow-solid-lg flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-[#22c55e] border-2 border-black flex items-center justify-center text-slate-950 font-black text-xl shadow-solid-sm mb-4">
            *
          </div>

          <h2 className="font-editorial text-2xl sm:text-3xl font-black text-slate-950 text-center">
            Sign In to Monetra
          </h2>
          <p className="text-xs text-slate-600 font-medium text-center mt-1 mb-6">
            Choose your preferred authentication provider to continue
          </p>

          <Suspense fallback={null}>
            <LoginContent />
            <LoginErrorNotice />
          </Suspense>

          <div className="w-full space-y-3">
            {/* Google Login */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 text-slate-950 border-2 border-black rounded-2xl shadow-solid-sm py-3.5 px-4 text-xs sm:text-sm font-black transition-all hover:translate-y-0.5 active:translate-y-1 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* GitHub Login */}
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-900 text-white border-2 border-black rounded-2xl shadow-solid-sm py-3.5 px-4 text-xs sm:text-sm font-black transition-all hover:translate-y-0.5 active:translate-y-1 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 font-medium text-center mt-6">
            By signing in, you agree to Monetra&apos;s verified crowdfunding terms and community transparency guidelines.
          </p>
        </div>
      </div>
    </main>
  );
}
