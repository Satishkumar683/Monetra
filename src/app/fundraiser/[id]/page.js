// src/app/fundraiser/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

function ProgressBar({ percent }) {
  return (
    <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full bg-emerald-400 rounded-full transition-all"
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

function DonateBox({ fundraiserId, onDonationSuccess }) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading-script | processing | done | error
  const [errorMsg, setErrorMsg] = useState("");

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleDonate(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setErrorMsg("");
    setStatus("loading-script");

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setErrorMsg(
        "Could not load payment gateway. Check your connection and try again.",
      );
      setStatus("error");
      return;
    }

    try {
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fundraiserId, amount: Number(amount) }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        setErrorMsg(orderData.message || "Could not start payment.");
        setStatus("error");
        return;
      }

      setStatus("processing");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Monetra",
        description: "Donation",
        order_id: orderData.orderId,
        // UPI, cards, netbanking, and wallets (incl. UPI QR scan) are all
        // shown automatically by Razorpay's checkout — no extra config needed.
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                fundraiserId,
                amount: Number(amount),
                message,
                anonymous,
              }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              setErrorMsg(verifyData.message || "Payment verification failed.");
              setStatus("error");
              return;
            }

            setStatus("done");
            if (onDonationSuccess) {
              onDonationSuccess(verifyData.fundraiser.currentAmount);
            }
          } catch (err) {
            setErrorMsg(
              "Network error during verification. If money was deducted, contact support.",
            );
            setStatus("error");
          }
        },
        modal: {
          ondismiss: function () {
            setStatus("idle");
          },
        },
        theme: { color: "#34d399" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setErrorMsg("Payment failed. Please try again.");
        setStatus("error");
      });
      rzp.open();
    } catch (err) {
      setErrorMsg("Something went wrong starting the payment.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <p className="text-emerald-400 font-semibold">
          Thank you for your support!
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Your payment was verified and your donation has been recorded.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleDonate}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4"
    >
      <h3 className="text-white font-semibold text-lg">Make a Donation</h3>

      <div>
        <label className="block text-sm text-slate-300 mb-2">Amount (₹)</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="500"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-2">
          Message (optional)
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Leave a note of support..."
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 resize-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="rounded border-white/20 bg-white/5"
        />
        Donate anonymously
      </label>

      <button
        type="submit"
        disabled={status === "loading-script" || status === "processing"}
        className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 transition-colors text-slate-900 font-semibold py-3"
      >
        {status === "loading-script"
          ? "Loading payment gateway..."
          : status === "processing"
            ? "Processing..."
            : "Donate Now"}
      </button>

      {status === "error" && <p className="text-sm text-red-400">{errorMsg}</p>}
    </form>
  );
}

function RecentDonations({ fundraiserId, refreshTrigger }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/donations/fundraiser/${fundraiserId}`);
        const data = await res.json();
        if (data.success) {
          setDonations(data.donations);
        }
      } catch (err) {
        // fail silently — this is a secondary section, not critical
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fundraiserId, refreshTrigger]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading donations...</p>;
  }

  if (donations.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No donations yet. Be the first to support this cause!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {donations.map((d) => (
        <div
          key={d._id}
          className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            {d.donor?.image ? (
              <img
                src={d.donor.image}
                alt={d.donor.name}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 text-xs font-semibold flex-shrink-0">
                {d.anonymous ? "A" : "?"}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {d.anonymous ? "Anonymous" : d.donor?.name || "A supporter"}
              </p>
              {d.message && (
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                  &ldquo;{d.message}&rdquo;
                </p>
              )}
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(d.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <span className="text-emerald-400 font-semibold text-sm flex-shrink-0 ml-3">
            ₹{d.amount.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// Full-screen document slideshow / lightbox.
// Shows the current document large, with dot indicators (bottom-left) and
// prev/next circular arrow buttons (bottom-right), similar to a native
// photo-gallery viewer. Works for both images and non-image files (the
// latter get a file-icon placeholder + a download prompt instead of an
// <img>).
function DocumentLightbox({ documents, index, onClose, onIndexChange }) {
  const total = documents.length;
  const current = documents[index];
  const isImage = current?.fileData?.startsWith("data:image");

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function goTo(nextIndex) {
    const wrapped = (nextIndex + total) % total;
    onIndexChange(wrapped);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl aspect-4/3 sm:aspect-16/9 rounded-3xl overflow-hidden bg-linear-to-br from-emerald-900/40 via-slate-900 to-slate-950 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur flex items-center justify-center text-white transition-colors"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Document label */}
        <div className="absolute top-4 left-4 z-10 max-w-[60%]">
          <span className="inline-block rounded-full bg-black/50 backdrop-blur px-4 py-1.5 text-xs text-emerald-300 font-medium truncate max-w-full">
            {current?.name}
          </span>
        </div>

        {/* Content */}
        <div className="w-full h-full flex items-center justify-center p-8 sm:p-10">
          {isImage ? (
            <img
              src={current.fileData}
              alt={current.name}
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          ) : (
            <a
              href={current?.fileData}
              download={current?.name}
              className="flex flex-col items-center gap-3 text-slate-300 hover:text-white transition-colors"
            >
              <span className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                <svg
                  className="w-9 h-9 text-slate-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M14 3v4a1 1 0 0 0 1 1h4M6 21h12a1 1 0 0 0 1-1V7l-5-5H6a1 1 0 0 0-1 1v17a1 1 0 0 0 1 1Z" />
                </svg>
              </span>
              <span className="text-sm font-medium">{current?.name}</span>
              <span className="text-xs text-emerald-400">
                Click to download &middot; {current?.type}
              </span>
            </a>
          )}
        </div>

        {/* Dot indicators, bottom-left */}
        {total > 1 && (
          <div className="absolute bottom-6 left-8 z-10 flex items-center gap-1.5">
            {documents.map((doc, i) => (
              <button
                key={doc._id}
                onClick={() => goTo(i)}
                aria-label={`Go to document ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        {/* Prev / next arrows, bottom-right */}
        {total > 1 && (
          <div className="absolute bottom-6 right-8 z-10 flex items-center gap-3">
            <button
              onClick={() => goTo(index - 1)}
              aria-label="Previous document"
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur flex items-center justify-center text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18 9 12l6-6" />
              </svg>
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="Next document"
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur flex items-center justify-center text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Share icon buttons — each opens the relevant platform's share intent in a
// new tab, pre-filled with the fundraiser title, a short blurb, and the
// page URL. Falls back gracefully everywhere since these are just plain
// links (no SDKs required).
function ShareIconButton({ label, colorClass, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2"
    >
      <span
        className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-105 ${colorClass}`}
      >
        {children}
      </span>
      <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors">
        {label}
      </span>
    </button>
  );
}

// Designed, GoFundMe-style share card + a row of social destinations.
// The card itself (cover image, title, progress, raised/goal, footer
// branding + link) is what gets echoed into each platform's share preview
// via the URL/text we hand it — this component is the visual preview of
// that story, plus the actual share actions.
function ShareModal({ fundraiser, currentAmount, percent, url, onClose }) {
  const [copied, setCopied] = useState(false);
  const { title, coverImage, targetAmount, category, owner } = fundraiser;

  const shareText = `Help support "${title}" — every contribution gets us closer to ₹${targetAmount.toLocaleString()}. Take a look:`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const links = {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    email: `mailto:?subject=${encodeURIComponent(
      `Support "${title}"`,
    )}&body=${encodedText}%0A%0A${encodedUrl}`,
  };

  function openShareWindow(href) {
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=650");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // clipboard API unavailable — silently ignore, copy button just won't confirm
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
      } catch (err) {
        // user cancelled the native share sheet — nothing to do
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden bg-[#0b1119] border border-white/10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur flex items-center justify-center text-white transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Designed preview card — this is the "poster" version of the campaign */}
        <div className="relative h-56 w-full">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0b1119] via-[#0b1119]/50 to-black/20" />
          <span className="absolute top-4 left-4 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[11px] text-emerald-300 font-medium">
            {category}
          </span>
          <div className="absolute bottom-4 left-5 right-5">
            <p className="font-serif text-xl font-bold text-white leading-snug line-clamp-2">
              {title}
            </p>
            {owner?.name && (
              <p className="text-xs text-slate-300 mt-1">
                by <span className="text-white font-medium">{owner.name}</span>
              </p>
            )}
          </div>
        </div>

        <div className="px-5 pt-4">
          <ProgressBar percent={percent} />
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-white font-semibold">
              ₹{currentAmount.toLocaleString()}{" "}
              <span className="text-slate-400 font-normal">raised</span>
            </span>
            <span className="text-emerald-400 font-medium">
              {Math.round(percent)}% funded
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Goal: ₹{targetAmount.toLocaleString()}
          </p>
        </div>

        <div className="px-5 pt-5">
          <p className="text-sm text-white font-semibold mb-3">Share with</p>
          <div className="grid grid-cols-4 gap-y-4">
            <ShareIconButton
              label="WhatsApp"
              colorClass="bg-[#25D366]"
              onClick={() => openShareWindow(links.whatsapp)}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.05c-.24.68-1.4 1.3-1.93 1.37-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 2 .9 2.14.07.15.12.32.02.51-.1.19-.15.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.07.17-.2.72-.83.91-1.12.19-.29.38-.24.63-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
              </svg>
            </ShareIconButton>

            <ShareIconButton
              label="Facebook"
              colorClass="bg-[#1877F2]"
              onClick={() => openShareWindow(links.facebook)}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.16 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.78 8.44-4.94 8.44-9.94Z" />
              </svg>
            </ShareIconButton>

            <ShareIconButton
              label="X"
              colorClass="bg-black border border-white/20"
              onClick={() => openShareWindow(links.twitter)}
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.24 2.75h3.29l-7.19 8.22 8.46 10.28h-6.62l-5.19-6.72-5.94 6.72H1.76l7.7-8.79L1.36 2.75h6.79l4.69 6.14 5.4-6.14Zm-1.15 16.6h1.82L7.02 4.55H5.06l12.03 14.8Z" />
              </svg>
            </ShareIconButton>

            <ShareIconButton
              label="LinkedIn"
              colorClass="bg-[#0A66C2]"
              onClick={() => openShareWindow(links.linkedin)}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.5 8.5h3.4V21H3.5V8.5Zm6.2 0h3.26v1.71h.05c.45-.86 1.56-1.77 3.21-1.77 3.44 0 4.07 2.26 4.07 5.2V21h-3.4v-5.68c0-1.36-.02-3.1-1.89-3.1-1.9 0-2.19 1.48-2.19 3v5.78H9.7V8.5Z" />
              </svg>
            </ShareIconButton>

            <ShareIconButton
              label="Telegram"
              colorClass="bg-[#26A5E4]"
              onClick={() => openShareWindow(links.telegram)}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.94 4.6 3.66 11.68c-1.25.5-1.24 1.19-.23 1.5l4.68 1.46 1.8 5.53c.22.6.38.84.76.84.36 0 .53-.16.73-.36l1.75-1.7 4.62 3.42c.85.47 1.46.23 1.67-.79l3.02-14.24c.3-1.28-.48-1.85-1.52-1.74Zm-3.2 3.24-8.36 7.56-.36 3.36-1.63-5.02 9.4-6.36c.44-.28.85-.13.5.23Z" />
              </svg>
            </ShareIconButton>

            <ShareIconButton
              label="Email"
              colorClass="bg-slate-600"
              onClick={() => openShareWindow(links.email)}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
                <path d="m3.5 6 8.5 6 8.5-6" />
              </svg>
            </ShareIconButton>

            <ShareIconButton
              label={copied ? "Copied!" : "Copy Link"}
              colorClass={copied ? "bg-emerald-500" : "bg-white/10 border border-white/15"}
              onClick={handleCopy}
            >
              {copied ? (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m5 12 5 5 9-10" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12a3 3 0 0 0 4.24.24l3-3a3 3 0 0 0-4.24-4.24l-1.5 1.5" />
                  <path d="M15 12a3 3 0 0 0-4.24-.24l-3 3a3 3 0 0 0 4.24 4.24l1.5-1.5" />
                </svg>
              )}
            </ShareIconButton>

            {typeof window !== "undefined" && navigator.share && (
              <ShareIconButton
                label="More"
                colorClass="bg-white/10 border border-white/15"
                onClick={handleNativeShare}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="18" cy="5" r="2.5" />
                  <circle cx="6" cy="12" r="2.5" />
                  <circle cx="18" cy="19" r="2.5" />
                  <path d="m8.2 10.7 7.6-4.4M8.2 13.3l7.6 4.4" />
                </svg>
              </ShareIconButton>
            )}
          </div>
        </div>

        <div className="px-5 py-5 mt-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <svg
              className="w-4 h-4 text-slate-500 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" />
              <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.36-1.36" />
            </svg>
            <span className="text-xs text-slate-400 truncate flex-1">
              {url}
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex-shrink-0"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FundraiserDetailPage() {
  const { id } = useParams();

  const [fundraiser, setFundraiser] = useState(null);
  const [liveAmount, setLiveAmount] = useState(null);
  const [donationsRefreshKey, setDonationsRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null); // null = closed
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/fundraisers/${id}`);
        const data = await res.json();
        if (data.success) {
          setFundraiser(data.fundraiser);
          setLiveAmount(data.fundraiser.currentAmount);
        } else {
          setError(data.message || "Fundraiser not found.");
        }
      } catch (err) {
        setError("Network error while loading fundraiser.");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#060b10] flex items-center justify-center">
        <p className="text-slate-400">Loading fundraiser...</p>
      </main>
    );
  }

  if (error || !fundraiser) {
    return (
      <main className="min-h-screen bg-[#060b10] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <h1 className="text-2xl font-bold text-white">Fundraiser not found</h1>
        <p className="text-slate-400">{error}</p>
        <Link
          href="/donate"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-400 hover:bg-emerald-300 transition-colors text-slate-900 font-semibold px-6 py-3"
        >
          Back to Donate
        </Link>
      </main>
    );
  }

  const {
    title,
    description,
    coverImage,
    targetAmount,
    category,
    owner,
    createdAt,
    documents,
  } = fundraiser;

  const currentAmount = liveAmount ?? fundraiser.currentAmount;
  const percent = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  return (
    <main className="min-h-screen bg-[#060b10] pb-20">
      <div className="relative h-72 sm:h-96 w-full">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#060b10] via-[#060b10]/20 to-transparent" />
        <span className="absolute top-6 left-8 rounded-full bg-black/60 backdrop-blur px-4 py-1.5 text-xs text-emerald-300 font-medium">
          {category}
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-8 -mt-16 relative grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {title}
            </h1>
            <button
              type="button"
              onClick={() => setShowShare(true)}
              className="flex-shrink-0 mt-1 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] hover:border-emerald-500/50 hover:bg-white/[0.06] transition-colors text-slate-200 text-sm font-medium px-4 py-2"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="m8.2 10.7 7.6-4.4M8.2 13.3l7.6 4.4" />
              </svg>
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          {owner?.name && (
            <p className="mt-3 text-sm text-slate-400">
              Organized by{" "}
              <span className="text-white font-medium">{owner.name}</span>
            </p>
          )}

          <p className="mt-2 text-xs text-slate-500">
            Started {new Date(createdAt).toLocaleDateString()}
          </p>

          <p className="mt-6 text-slate-300 leading-relaxed whitespace-pre-line">
            {description}
          </p>

          {documents && documents.length > 0 && (
            <div className="mt-10">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                Verification Documents
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Uploaded by the organizer to support the authenticity of this
                campaign. Click a document to view it full-screen.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc, i) => {
                  const isImage = doc.fileData?.startsWith("data:image");
                  return (
                    <button
                      key={doc._id}
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-emerald-500/40 transition-colors text-left"
                    >
                      {isImage ? (
                        <img
                          src={doc.fileData}
                          alt={doc.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <span className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-6 h-6 text-slate-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M14 3v4a1 1 0 0 0 1 1h4M6 21h12a1 1 0 0 0 1-1V7l-5-5H6a1 1 0 0 0-1 1v17a1 1 0 0 0 1 1Z" />
                          </svg>
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {doc.name}
                        </p>
                        <p className="text-xs text-emerald-400 mt-0.5">
                          {doc.type}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mt-10">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              <svg
                className="w-5 h-5 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
              </svg>
              Recent Donations
            </h2>
            <p className="mt-1 text-xs text-slate-500 mb-4">
              People who&apos;ve supported this campaign.
            </p>

            <RecentDonations
              fundraiserId={id}
              refreshTrigger={donationsRefreshKey}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
            <ProgressBar percent={percent} />
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-white font-semibold text-lg">
                ₹{currentAmount.toLocaleString()}
              </span>
              <span className="text-slate-400">
                of ₹{targetAmount.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {Math.round(percent)}% funded
            </p>
            <button
              type="button"
              onClick={() => setShowShare(true)}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 hover:border-emerald-500/50 hover:bg-white/[0.04] transition-colors text-slate-200 font-medium py-2.5 text-sm"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="m8.2 10.7 7.6-4.4M8.2 13.3l7.6 4.4" />
              </svg>
              Share this fundraiser
            </button>
          </div>

          <div id="donate-box">
            <DonateBox
              fundraiserId={id}
              onDonationSuccess={(newAmount) => {
                setLiveAmount(newAmount);
                setDonationsRefreshKey((k) => k + 1);
              }}
            />
          </div>
        </div>
      </div>

      {lightboxIndex !== null && documents && documents.length > 0 && (
        <DocumentLightbox
          documents={documents}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}

      {showShare && (
        <ShareModal
          fundraiser={fundraiser}
          currentAmount={currentAmount}
          percent={percent}
          url={typeof window !== "undefined" ? window.location.href : ""}
          onClose={() => setShowShare(false)}
        />
      )}
    </main>
  );
}