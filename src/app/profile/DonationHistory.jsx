export default function DonationHistory({ donations }) {
  if (!donations || donations.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-slate-400">You haven&apos;t made any donations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {donations.map((d) => (
        <div
          key={d._id}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4"
        >
          <div>
            <p className="text-white font-medium">{d.fundraiser?.title || "Fundraiser"}</p>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(d.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-semibold">₹{d.amount.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{d.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}