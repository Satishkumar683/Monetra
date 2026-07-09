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

export default function FundraiserCard({ fundraiser }) {
  const { _id, title, description, coverImage, targetAmount, currentAmount, owner, category } = fundraiser;
  const percent = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden flex flex-col">
      <div className="relative h-44">
        <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-xs text-emerald-300 font-medium">
          {category}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-white font-semibold text-lg line-clamp-1">{title}</h3>
        <p className="mt-1 text-sm text-slate-400 line-clamp-2 flex-1">{description}</p>

        {owner?.name && (
          <p className="mt-2 text-xs text-slate-500">by {owner.name}</p>
        )}

        <div className="mt-4">
          <ProgressBar percent={percent} />
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-white font-semibold">₹{currentAmount.toLocaleString()}</span>
            <span className="text-slate-400">of ₹{targetAmount.toLocaleString()}</span>
          </div>
        </div>

        <Link
          href={`/fundraiser/${_id}`}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-400 hover:bg-emerald-300 transition-colors text-slate-900 font-semibold py-2.5"
        >
          Donate Now
        </Link>
      </div>
    </div>
  );
}