export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          {/* Enhanced Loading Spinner */}
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-neutral-700 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto opacity-60" style={{ animationDelay: '0.3s' }}></div>
          </div>
          
          {/* Loading Text */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Creating Your Resume
            </h2>
            <p className="text-neutral-400 text-lg">
              Loading templates and AI tools...
            </p>
          </div>
          
          {/* Loading Steps */}
          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
              <span>Initializing workspace</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500" style={{ animationDelay: '0.5s' }}>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Loading AI capabilities</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500" style={{ animationDelay: '1s' }}>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              <span>Preparing preview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}