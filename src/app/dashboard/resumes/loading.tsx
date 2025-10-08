export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-neutral-700 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Loading Resume Builder</h2>
        <p className="text-neutral-400 text-sm">Setting up your workspace...</p>
      </div>
    </div>
  );
}