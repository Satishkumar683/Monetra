import Link from "next/link";
import ProgressBar from "./ProgressBar";
import { optimizeImage } from "@/lib/imageUtils";

export default function FundraiserCard({ fundraiser }) {
  const {
    _id,
    title,
    description,
    coverImage,
    targetAmount,
    currentAmount,
    owner,
    category,
    verificationStatus = "verified",
  } = fundraiser;

  const safeCurrent = currentAmount || 0;
  const safeTarget = targetAmount || 1;
  const percent = Math.min(100, (safeCurrent / safeTarget) * 100);
  const optimizedCover = optimizeImage(coverImage, { width: 600, quality: "auto", format: "auto" });

  const isVerified = verificationStatus === "verified";

  return (
    <div className="group rounded-3xl border-2 border-black bg-white text-slate-900 shadow-solid hover:shadow-solid-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Cover Image & Badges */}
      <div className="relative h-52 bg-slate-100 overflow-hidden border-b-2 border-black">
        <img
          src={optimizedCover || "/images/donation.webp"}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = "/images/donation.webp";
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category Pill */}
        <span className="absolute top-3.5 left-3.5 rounded-full bg-[#22c55e] text-slate-950 font-black text-xs border border-black px-3 py-1 shadow-solid-sm">
          {category}
        </span>

        {/* Verification Status Pill */}
        {isVerified ? (
          <span className="absolute top-3.5 right-3.5 rounded-full bg-white text-slate-950 font-black text-[11px] border border-black px-2.5 py-1 flex items-center gap-1 shadow-solid-sm">
            <span className="text-emerald-600 font-bold">✓</span>
            Verified
          </span>
        ) : (
          <span className="absolute top-3.5 right-3.5 rounded-full bg-amber-100 text-amber-950 font-black text-[11px] border border-black px-2.5 py-1 flex items-center gap-1 shadow-solid-sm">
            ⏳ In Review
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-editorial text-xl font-black text-slate-950 group-hover:text-emerald-700 transition-colors line-clamp-1 tracking-tight">
          {title}
        </h3>

        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed flex-1 font-medium">
          {description}
        </p>

        {/* Organizer Snippet */}
        {owner?.name && (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span className="w-5 h-5 rounded-full bg-slate-100 border border-black text-slate-950 font-black text-[10px] flex items-center justify-center">
              {owner.name.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">by <span className="text-slate-900 font-bold">{owner.name}</span></span>
          </div>
        )}

        {/* Progress Metrics */}
        <div className="mt-5 pt-4 border-t-2 border-slate-100">
          <ProgressBar percent={percent} />

          <div className="mt-2.5 flex items-baseline justify-between text-xs">
            <div>
              <span className="font-editorial text-base font-black text-slate-950">
                ₹{safeCurrent.toLocaleString()}
              </span>
              <span className="text-slate-500 text-[11px] ml-1 font-medium">raised</span>
            </div>
            <div className="text-right">
              <span className="text-emerald-700 font-black">{Math.round(percent)}%</span>
              <span className="text-slate-500 text-[11px] ml-1 font-medium">of ₹{safeTarget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/fundraiser/${_id}`}
          className={`mt-5 inline-flex items-center justify-center rounded-xl font-black py-3 text-xs tracking-wide border-2 border-black shadow-solid hover:translate-y-0.5 hover:shadow-solid-sm active:translate-y-1 transition-all ${
            isVerified
              ? "bg-[#22c55e] hover:bg-[#16a34a] text-slate-950"
              : "bg-slate-100 hover:bg-slate-200 text-slate-800"
          }`}
        >
          {isVerified ? "Donate Now →" : "View Campaign"}
        </Link>
      </div>
    </div>
  );
}