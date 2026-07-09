
"use client";

import { useEffect, useState } from "react";
import FundraiserCard from "../../../components/FundraiserCard";

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
    img: "images/donation6.jpg",
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
    <section className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/5 px-4 py-1.5 text-xs font-medium text-emerald-400">
          <HeartIcon className="w-3.5 h-3.5" /> Every Donation Creates a Difference
        </span>

        <h1 className="mt-6 font-serif text-5xl sm:text-6xl font-bold leading-[1.05] text-white">
          Give Today,
          <br />
          <span className="text-emerald-400">Change</span> Tomorrow
        </h1>

        <p className="mt-6 text-slate-300 max-w-md">
          Support meaningful causes and help bring hope, care, and a better
          future to those who need it most.
        </p>

        <div className="mt-8 flex flex-wrap gap-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 w-fit">
          {stats.map((stat) => {
            const Icon = iconMap[stat.icon];
            return (
              <div key={stat.label} className="flex items-center gap-3 pr-6 last:pr-0 border-r last:border-r-0 border-white/10">
                <span className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Icon className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-white font-bold leading-none">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className="rounded-4xl overflow-hidden border border-white/10 shadow-2xl">
          <img
            src="/images/donation11.jpg"
            alt="Hands sharing a heart"
            className="w-full h-105 object-cover"
          />
        </div>

        {/* <div className="absolute left-6 bottom-6 flex items-center gap-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 px-5 py-4">
          <span className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldIcon className="w-4 h-4" />
          </span>
          {/* <div>
            <p className="text-white text-sm font-semibold">100% Secure Donations</p>
            <p className="text-xs text-slate-300">Your donation is safe with us.</p>
          </div> 
        </div> */}
      </div>
    </section>
  );
}

function CausesHeader() {
  return (
    <div className="text-center max-w-xl mx-auto mb-10">
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-emerald-400">
        + EXPLORE CAUSES +
      </span>
      <h2 className="mt-5 font-serif text-3xl sm:text-4xl font-bold text-white">
        Choose a Cause to Support
      </h2>
      <p className="mt-3 text-slate-400">
        Your small contribution can bring a big change.
      </p>
    </div>
  );
}

// function CauseCard({ cause }) {
//   const Icon = iconMap[cause.icon];
//   return (
//     <div className="snap-start shrink-0 w-64 sm:w-72 rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
//       <div className="relative h-40">
//         <img src={cause.img} alt={cause.title} className="w-full h-full object-cover" />
//         <span className="absolute left-4 -bottom-5 w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg">
//           <Icon className="w-5 h-5" />
//         </span>
//       </div>
//       <div className="pt-8 pb-5 px-5">
//         <h3 className="text-white font-semibold text-lg">{cause.title}</h3>
//         <p className="mt-2 text-sm text-slate-400 leading-relaxed">{cause.desc}</p>
//         <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
//           <HeartIcon className="w-4 h-4" />
//           <span>{cause.donations}</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// function CausesRow() {
//   return (
//     <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 px-8 max-w-7xl mx-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
//       {causes.map((cause) => (
//         <CauseCard key={cause.title} cause={cause} />
//       ))}
//     </div>
//   );
// }


function FundraiserGrid() {
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fundraisers");
        const data = await res.json();
        if (data.success) {
          setFundraisers(data.fundraisers);
        } else {
          setError("Could not load fundraisers.");
        }
      } catch (err) {
        setError("Network error while loading fundraisers.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-center text-slate-400 py-12">Loading fundraisers...</p>;
  }

  if (error) {
    return <p className="text-center text-red-400 py-12">{error}</p>;
  }

  if (fundraisers.length === 0) {
    return (
      <p className="text-center text-slate-400 py-12">
        No active fundraisers yet. Be the first to create one!
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {fundraisers.map((f) => (
        <FundraiserCard key={f._id} fundraiser={f} />
      ))}
    </div>
  );
}

const DonatePage = () => {
  return (
    <main className="relative min-h-screen bg-[#060b10] overflow-hidden pb-16">
      <Hero />
      <CausesHeader />
      <FundraiserGrid />
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