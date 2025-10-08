

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-neutral-700 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto opacity-60" style={{ animationDelay: '0.3s' }}></div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h2>
        <p className="text-neutral-400">Preparing your resume builder...</p>
      </div>
    </div>
  );
}