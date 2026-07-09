export default function StatsCards({ fundraisers, totalDonated }) {
  const createdCount = fundraisers.length;
  const totalRaised = fundraisers.reduce((sum, f) => sum + (f.currentAmount || 0), 0);
  const activeCount = fundraisers.filter((f) => f.isActive).length;

  const stats = [
    { label: "Created Campaigns", value: createdCount },
    { label: "Total Raised", value: `₹${totalRaised.toLocaleString()}` },
    { label: "Total Donated", value: `₹${totalDonated.toLocaleString()}` },
    { label: "Active Campaigns", value: activeCount },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-white/10 bg-white/3 p-5"
        >
          <p className="text-2xl font-bold text-white">{stat.value}</p>
          <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}