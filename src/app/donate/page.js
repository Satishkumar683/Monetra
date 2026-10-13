
"use client";

import { useEffect, useState } from "react";
import FundraiserCard from "../../../components/FundraiserCard";
import { CATEGORIES } from "@/lib/constants";

const stats = [
  { icon: "UsersIcon", value: "25,000+", label: "Lives Impacted" },
  { icon: "HeartHandsIcon", value: "120+", label: "Verified Causes" },
  { icon: "GroupIcon", value: "10,000+", label: "Generous Donors" },
];

const causes = [
  {
    title: "Education",
    desc: "Help children get access to quality education.",
    donations: "3,452 Donations",
    img: "/images/education.jpg",
    icon: "CapIcon",
  },
  {
    title: "Healthcare",
    desc: "Provide medical care and save precious lives.",
    donations: "4,128 Donations",
    img: "/images/healthcare.jpg",
    icon: "HeartPulseIcon",
  },
  {
    title: "Animal Welfare",
    desc: "Support rescue, shelter and animal care.",
    donations: "2,940 Donations",
    img: "/images/animal.jpg",
    icon: "PawIcon",
  },
  {
    title: "Environment",
    desc: "Protect nature and build a greener planet.",
    donations: "2,213 Donations",
    img: "/images/donation6.jpg",
    icon: "LeafIcon",
  },
  {
    title: "Disaster Relief",
    desc: "Provide urgent help in times of crisis.",
    donations: "1,985 Donations",
    img: "/images/disaster.jpg",
    icon: "ShieldPlusIcon",
  },
  {
    title: "Child Welfare",
    desc: "Ensure a safe, happy and healthy childhood.",
    donations: "3,078 Donations",
    img: "/images/donation9.jpg",
    icon: "GroupIcon",
  },
];

function UsersIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 14c2.9.3 5.5 2.6 5.5 6" />
    </svg>
  );
}
function HeartHandsIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21c-4-2.7-8-6-8-10.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8 3.8C20 15 16 18.3 12 21Z" />
    </svg>
  );
}
function GroupIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <path d="M2 20c0-3 2.7-5.5 6-5.5S14 17 14 20M10 20c0-3 2.7-5.5 6-5.5S22 17 22 20" />
    </svg>
  );
}
function ShieldIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3Z" />
    </svg>
  );
}
function ShieldPlusIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3Z" />
      <path d="M12 8v6M9 11h6" />
    </svg>
  );
}
function CapIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 2 8l10 5 10-5-10-5Z" />
      <path d="M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5" />
    </svg>
  );
}
function HeartPulseIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      <path d="M4 12h3l2-3 2 5 2-4h4" />
    </svg>
  );
}
function PawIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7" cy="8" r="1.6" />
      <circle cx="12" cy="6" r="1.6" />
      <circle cx="17" cy="8" r="1.6" />
      <circle cx="19" cy="12.5" r="1.6" />
      <path d="M12 12c-3 0-6 2.4-6 5.5 0 1.6 1.4 2.5 3 2 1-.3 2-.3 3 0 2 .6 3-.6 3-2 0-3.1-3-5.5-3-5.5Z" />
    </svg>
  );
}
function LeafIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20c8 0 16-6 16-16-9 0-16 7-16 16Z" />
      <path d="M4 20c3-3 5-6 6-10" />
    </svg>
  );
}
function HeartIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

const iconMap = {
  UsersIcon,
  HeartHandsIcon,
  GroupIcon,
  ShieldIcon,
  ShieldPlusIcon,
  CapIcon,
  HeartPulseIcon,
  PawIcon,
  LeafIcon,
};

const Hero = () => {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-12 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#22c55e] px-4 py-1.5 text-xs font-black text-slate-950 shadow-solid-sm">
          <HeartIcon className="w-3.5 h-3.5" /> Direct Verified Giving
        </span>

        <h1 className="mt-6 font-editorial text-4xl sm:text-6xl font-black leading-[0.95] text-(--app-text)">
          Give today,<br />
          <span className="text-emerald-700">change</span> tomorrow.
        </h1>

        <p className="mt-5 text-slate-700 text-sm sm:text-base max-w-md leading-relaxed font-medium">
          Support verified fundraisers and help bring urgent medical care, shelter, and a better future to those who need it most.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 rounded-3xl border-2 border-black bg-white text-slate-950 p-4 sm:p-5 w-fit shadow-solid">
          {stats.map((stat) => {
            const Icon = iconMap[stat.icon];
            return (
              <div key={stat.label} className="flex items-center gap-3 pr-5 last:pr-0 border-r-2 last:border-r-0 border-slate-200">
                <span className="w-10 h-10 rounded-2xl bg-[#22c55e] border-2 border-black flex items-center justify-center text-slate-950 shadow-solid-sm">
                  <Icon className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-editorial text-lg font-black text-slate-950 leading-none">{stat.value}</p>
                  <p className="text-[11px] text-slate-600 font-bold mt-1">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className="rounded-4xl overflow-hidden border-2 border-black shadow-solid-lg">
          <img
            src="/images/donation11.jpg"
            alt="Hands sharing a heart"
            className="w-full h-105 object-cover"
          />
        </div>
      </div>
    </section>
  );
};

function CausesHeader() {
  return (
    <div className="text-center max-w-xl mx-auto mb-10">
      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[#22c55e] px-4 py-1.5 text-xs font-black text-slate-950 shadow-solid-sm">
        ✦ EXPLORE CAUSES ✦
      </span>
      <h2 className="mt-5 font-editorial text-3xl sm:text-4xl font-black text-(--app-text)">
        Choose a Cause to Support
      </h2>
      <p className="mt-3 text-slate-600 font-medium text-sm">
        Your verified contribution directly saves genuine families in crisis.
      </p>
    </div>
  );
}

function CauseCard({ cause, isSelected, onClick }) {
  const Icon = iconMap[cause.icon] || HeartIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left snap-start shrink-0 w-64 sm:w-72 rounded-3xl border-2 border-black transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
        isSelected
          ? "bg-white text-slate-950 shadow-solid-lg scale-[1.02]"
          : "bg-white/95 text-slate-950 shadow-solid hover:scale-[1.01]"
      }`}
    >
      <div className="relative h-36 border-b-2 border-black overflow-hidden shrink-0">
        <img src={cause.img} alt={cause.title} className="w-full h-full object-cover" />
      </div>

      <div className="relative pt-6 pb-5 px-5 flex-1 flex flex-col justify-between w-full">
        {/* Floating circular sticker badge */}
        <span className="absolute left-5 -top-5 w-10 h-10 rounded-full bg-[#22c55e] border-2 border-black flex items-center justify-center text-slate-950 shadow-solid-sm z-10">
          <Icon className="w-4 h-4" />
        </span>

        <div>
          <h3 className="font-editorial text-base font-black text-slate-950">{cause.title}</h3>
          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium min-h-[2.25rem]">
            {cause.desc}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-800 font-black">
          <HeartIcon className="w-3.5 h-3.5" />
          <span>{cause.donations}</span>
        </div>
      </div>
    </button>
  );
}

function CausesRow({ selectedCategory, onSelectCategory }) {
  return (
    <div className="mb-14 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-6 sm:px-8 max-w-7xl mx-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {causes.map((cause) => (
        <CauseCard
          key={cause.title}
          cause={cause}
          isSelected={selectedCategory === cause.title}
          onClick={() => {
            onSelectCategory(cause.title);
            const el = document.getElementById("explore-campaigns");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />
      ))}
    </div>
  );
}


function FundraiserGrid({ selectedCategory, onSelectCategory }) {
  const [fundraisers, setFundraisers] = useState([]);
  const [category, setCategory] = useState(selectedCategory || "All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // Sync external selectedCategory if changed
  useEffect(() => {
    if (selectedCategory && selectedCategory !== category) {
      setCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch campaigns whenever category, debouncedSearch, or sortBy changes
  useEffect(() => {
    async function loadFundraisers() {
      try {
        setLoading(true);
        setError("");
        setPage(1);

        const params = new URLSearchParams({
          page: "1",
          limit: "12",
          sort: sortBy,
        });

        if (category && category !== "All") {
          params.set("category", category);
        }

        if (debouncedSearch.trim()) {
          params.set("search", debouncedSearch.trim());
        }

        const res = await fetch(`/api/fundraisers?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setFundraisers(data.fundraisers);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total ?? data.fundraisers.length);
        } else {
          setError(data.message || "Could not load fundraisers.");
        }
      } catch (err) {
        setError("Network error while loading fundraisers.");
      } finally {
        setLoading(false);
      }
    }

    loadFundraisers();
  }, [category, debouncedSearch, sortBy]);

  async function handleLoadMore() {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: "12",
        sort: sortBy,
      });

      if (category && category !== "All") {
        params.set("category", category);
      }

      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      const res = await fetch(`/api/fundraisers?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setFundraisers((prev) => [...prev, ...data.fundraisers]);
        setPage(nextPage);
        setTotalPages(data.totalPages || 1);
        if (data.total !== undefined) setTotal(data.total);
      } else {
        setError("Could not load more fundraisers.");
      }
    } catch (err) {
      setError("Network error while loading more fundraisers.");
    } finally {
      setLoadingMore(false);
    }
  }

  function handleCategoryChange(newCat) {
    setCategory(newCat);
    if (onSelectCategory) onSelectCategory(newCat);
  }

  function handleResetFilters() {
    setCategory("All");
    setSearch("");
    setSortBy("recent");
  }

  const categoryOptions = ["All", ...CATEGORIES];

  return (
    <div id="explore-campaigns" className="max-w-7xl mx-auto px-6 sm:px-8">
      {/* Search and Filters Bar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns by title or story..."
              className="w-full pl-10 pr-10 py-2.5 rounded-full border-2 border-black bg-white text-slate-950 placeholder:text-slate-400 text-xs sm:text-sm font-semibold shadow-solid-sm focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-bold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-solid-sm focus:outline-none cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="mostRaised">Most Raised</option>
              <option value="highestGoal">Highest Goal</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-black transition-all border-2 border-black ${
                category === cat
                  ? "bg-[#22c55e] text-slate-950 shadow-solid-sm"
                  : "bg-white text-slate-800 hover:bg-slate-100 shadow-[0_2px_0_#000]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
            >
              <div className="h-48 bg-white/5 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-2 w-full bg-white/5 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={handleResetFilters}
            className="rounded-full bg-emerald-400 text-slate-950 px-5 py-2 text-xs font-semibold hover:bg-emerald-300 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : fundraisers.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-white/10 bg-white/[0.02] p-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-4">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">No campaigns found</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            {search || category !== "All"
              ? "We couldn't find any fundraisers matching your filters. Try clearing your search or switching categories."
              : "No active fundraisers yet. Be the first to start one!"}
          </p>
          {(search || category !== "All" || sortBy !== "recent") && (
            <button
              onClick={handleResetFilters}
              className="mt-5 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-5 py-2 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fundraisers.map((f) => (
              <FundraiserCard key={f._id} fundraiser={f} />
            ))}
          </div>

          {page < totalPages && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-semibold px-8 py-3 transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Loading more...
                  </>
                ) : (
                  "Load More Fundraisers"
                )}
              </button>
              <p className="text-xs text-slate-500">
                Showing {fundraisers.length} of {total} fundraisers (Page {page} of {totalPages})
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const DonatePage = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <main className="relative min-h-screen bg-(--app-bg) text-(--app-text) overflow-hidden pb-16">
      <Hero />
      <CausesHeader />
      <CausesRow
        selectedCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
      <FundraiserGrid
        selectedCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
    </main>
  );
};
export default DonatePage;
// const DonatePage = () =>{
//   return (
//     <main className="relative min-h-screen bg-[#060b10] overflow-hidden pb-16">
//       <Hero />
//       <CausesHeader />
//       <FundraiserGrid />
//     </main>
//   );
// }
// export default DonatePage;