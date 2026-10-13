export default function DonateLoading() {
  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) px-4 sm:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-slate-300 rounded-2xl border-2 border-black animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl border-2 border-black bg-white overflow-hidden shadow-solid">
              <div className="h-52 bg-slate-200 animate-pulse border-b-2 border-black" />
              <div className="p-6 space-y-4">
                <div className="h-6 w-3/4 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-full bg-slate-100 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
