export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) flex items-center justify-center">
      <div className="inline-flex items-center gap-3 bg-white border-2 border-black px-6 py-3 rounded-full shadow-solid">
        <svg className="animate-spin w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="font-editorial text-sm font-black text-slate-950">Loading profile...</span>
      </div>
    </main>
  );
}
