import Link from 'next/link';
import { Ghost, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10 text-center max-w-md">
        <div className="mb-8">
          <h2 className="text-9xl font-black bg-linear-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-pulse-fast">
            404
          </h2>
        </div>

        <div className="mx-auto w-24 h-24 mb-6 bg-red-500/10 rounded-full border border-red-500/30 flex items-center justify-center shadow-lg">
          <Ghost className="w-10 h-10 text-red-400 animate-float" />
        </div>

        <h1 className="text-4xl font-extrabold mb-4">
          Oops! Data Not Found.
        </h1>
        
        <p className="text-gray-400 text-lg mb-8">
          It looks like the server dropped that file, or the page you were looking for doesn't exist anymore.
        </p>

        <Link href="/" passHref>
          <button className="group relative px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40">
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Go Back Home
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
}