"use client";

import React, { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    q: "How does Monetra verify medical fundraisers?",
    a: "Every medical campaign submitted must upload patient hospital admission certificates, cost estimates stamped by the treating doctor, and government ID proof. Our Trust Desk cross-checks the records directly with the hospital before authorizing public fundraising.",
  },
  {
    q: "Are donations made through Monetra tax-deductible?",
    a: "Campaigns affiliated with registered 80G non-profit organizations provide automatic tax-exemption receipts. Individual emergency causes direct 100% of the funds to the hospital or beneficiary without administrative cuts.",
  },
  {
    q: "How fast are funds transferred to the hospital or family?",
    a: "Once verified, organizers can request partial or full disbursements at any milestone. Transfers are processed directly via verified NEFT/RTGS to hospital bank accounts or verified beneficiary accounts within 24 to 48 hours.",
  },
  {
    q: "What payment methods are supported for donors?",
    a: "Donors across India can contribute via UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Credit Cards, and Debit Cards. All payments are secured with Razorpay bank-grade encryption.",
  },
  {
    q: "Can I post updates and bills after receiving donations?",
    a: "Yes! Transparency is the core pillar of Monetra. Fundraisers can post hospital discharge receipts, medical photos, and recovery milestones directly on their campaign page for all donors to see.",
  },
];

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-14">
        {/* About Hero Section */}
        <section className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#22c55e] px-4 py-1.5 text-xs font-black text-slate-950 shadow-solid-sm">
            ✦ ABOUT MONETRA ✦
          </span>

          <h1 className="mt-6 font-editorial text-4xl sm:text-6xl font-black text-(--app-text) tracking-tight leading-[0.95]">
            Transparent giving,<br />
            <span className="text-emerald-700">zero</span> compromises.
          </h1>

          <p className="mt-5 text-slate-700 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Monetra is built on a single uncompromising belief: Every rupee given in generosity should reach the genuine patient or cause, backed by document-verified truth.
          </p>
        </section>

        {/* Pillars / Values Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-solid flex flex-col justify-between">
            <div>
              <span className="w-10 h-10 rounded-2xl bg-[#22c55e] border-2 border-black flex items-center justify-center text-slate-950 font-black shadow-solid-sm mb-4">
                🛡️
              </span>
              <h3 className="font-editorial text-lg font-black text-slate-950">100% Verified</h3>
              <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                No unvetted campaigns. Medical records and hospital estimates are thoroughly inspected by our Trust Desk.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-solid flex flex-col justify-between">
            <div>
              <span className="w-10 h-10 rounded-2xl bg-[#38bdf8] border-2 border-black flex items-center justify-center text-slate-950 font-black shadow-solid-sm mb-4">
                ⚡
              </span>
              <h3 className="font-editorial text-lg font-black text-slate-950">Direct & Fast</h3>
              <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                Emergency funds are released within 24 hours directly to hospital care accounts or beneficiaries in critical need.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-solid flex flex-col justify-between">
            <div>
              <span className="w-10 h-10 rounded-2xl bg-[#ff70a6] border-2 border-black flex items-center justify-center text-slate-950 font-black shadow-solid-sm mb-4">
                🧾
              </span>
              <h3 className="font-editorial text-lg font-black text-slate-950">Receipt Updates</h3>
              <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                Fundraisers upload post-treatment bills and recovery progress so every backer knows the real-world impact.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="rounded-3xl border-2 border-black bg-white p-6 sm:p-10 shadow-solid-lg">
          <div className="text-center max-w-lg mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[#22c55e] px-3.5 py-1 text-xs font-black text-slate-950 shadow-solid-sm">
              ✦ FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="mt-4 font-editorial text-2xl sm:text-3xl font-black text-slate-950">
              Got Questions? We&apos;ve Got Answers.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Everything you need to know about starting or donating to a fundraiser on Monetra.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border-2 border-black bg-slate-50 overflow-hidden shadow-solid-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-editorial font-black text-sm text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="w-7 h-7 rounded-full border-2 border-black bg-white flex items-center justify-center text-xs font-black shrink-0 shadow-[0_1px_0_#000]">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed border-t border-slate-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA Box */}
          <div className="mt-10 pt-6 border-t-2 border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="font-editorial text-base font-black text-slate-950">
                Ready to make a difference?
              </p>
              <p className="text-xs text-slate-600 font-medium">
                Start your emergency campaign or support a verified family in crisis today.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/fundraise/create"
                className="rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black px-5 py-2.5 text-xs border-2 border-black shadow-solid-sm hover:translate-y-0.5 active:translate-y-1 transition-all"
              >
                ✦ Start Fundraiser
              </Link>
              <Link
                href="/donate"
                className="rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black px-5 py-2.5 text-xs border-2 border-black shadow-solid-sm hover:translate-y-0.5 active:translate-y-1 transition-all"
              >
                Explore Causes
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
