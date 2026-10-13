export default function StatsCards({ fundraisers, totalDonated }) {
  const createdCount = fundraisers.length;
  const totalRaised = fundraisers.reduce((sum, f) => sum + (f.currentAmount || 0), 0);
  const activeCount = fundraisers.filter((f) => f.isActive).length;

  const stats = [
    { label: "Created Campaigns", value: createdCount, badgeColor: "bg-[#4ade80]" },
    { label: "Total Raised", value: `₹${totalRaised.toLocaleString()}`, badgeColor: "bg-[#22c55e]" },
    { label: "Total Donated", value: `₹${totalDonated.toLocaleString()}`, badgeColor: "bg-[#38bdf8]" },
    { label: "Active Campaigns", value: activeCount, badgeColor: "bg-[#ff70a6]" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl border-2 border-black bg-white text-slate-900 p-6 shadow-solid hover:translate-y-0.5 transition-transform"
        >
          <span className={`w-3 h-3 rounded-full border border-black inline-block ${stat.badgeColor} shadow-solid-sm mb-2`} />
          <p className="font-editorial text-2xl sm:text-3xl font-black text-slate-950">{stat.value}</p>
          <p className="mt-1 text-xs font-bold text-slate-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}