import { Zap } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-tr from-indigo-900/10 via-transparent to-purple-900/10" style={{ animation: 'background-pan 10s linear infinite alternate' }}/>
      <div className="relative z-10 text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-50 blur-xl animate-pulse" />
          
          <div className="relative w-24 h-24 bg-linear-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 flex items-center justify-center shadow-2xl">
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div 
                className="absolute top-0 left-0 w-1/3 h-full bg-white/20 transform -skew-x-12 -translate-x-full"
                style={{ animation: 'shimmer 1.5s infinite linear' }}
              />
            </div>
            <Zap className="w-10 h-10 text-yellow-300 relative z-20" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold mb-3 bg-linear-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
          Processing Magic...
        </h1>
        
        <p className="text-gray-400 text-lg max-w-sm mx-auto">
          Just a moment while the server wakes up or data loads.
        </p>
        <div className="flex gap-2 justify-center mt-6">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}