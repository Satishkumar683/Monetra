export default function DonationHistory({ donations }) {
  if (!donations || donations.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-black bg-slate-50 p-8 text-center shadow-solid-sm">
        <p className="text-slate-600 font-medium">You haven&apos;t made any donations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {donations.map((d) => (
        <div
          key={d._id}
          className="flex items-center justify-between rounded-2xl border-2 border-black bg-slate-50 px-5 py-4 shadow-solid-sm hover:translate-y-0.5 transition-transform"
        >
          <div>
            <p className="font-editorial text-sm font-black text-slate-950">{d.fundraiser?.title || "Verified Cause"}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {new Date(d.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-editorial text-base font-black text-emerald-800">₹{d.amount.toLocaleString()}</p>
            <span className="inline-block mt-0.5 rounded-full bg-[#22c55e] border border-black px-2 py-0.2 text-[10px] font-black text-slate-950">
              {d.status || "Completed"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}