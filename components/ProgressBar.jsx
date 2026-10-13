export default function ProgressBar({ percent, size = "sm" }) {
  const heightClass = size === "lg" ? "h-3.5" : "h-2.5";

  return (
    <div className={`w-full ${heightClass} rounded-full bg-slate-100 overflow-hidden border-2 border-black`}>
      <div
        className="h-full bg-[#22c55e] border-r-2 border-black transition-all duration-500"
        style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
      />
    </div>
  );
}
