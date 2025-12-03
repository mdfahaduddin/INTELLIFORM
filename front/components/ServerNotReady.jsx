import React from 'react'
import { Moon, Loader2 } from "lucide-react";

function ServerNotReady() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-linear-to-br from-purple-900/10 via-transparent to-blue-900/10" />
      <div className="bg-linear-to-br from-white/5 to-white/2 backdrop-blur-2xl rounded-3xl border border-white/10 p-10 shadow-2xl max-w-lg w-full text-center relative">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <Moon className="w-16 h-16 mx-auto text-indigo-400 animate-pulse-slow" />
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl animate-ping-slow" />
        </div>

        <h1 className="text-3xl font-extrabold mb-4 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          The Server is Having a Nap 😴
        </h1>

        <p className="text-gray-400 text-lg mb-6">
          This application is running on a **free server plan** (because
          funding is hard! 😅). It needs a minute or two to wake up and get
          its coffee.
        </p>

        <div className="flex items-center justify-center gap-3 bg-white/10 p-4 rounded-xl border border-white/20 mb-6">
          <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
          <p className="text-sm font-semibold text-gray-300">
            Waking up now... Please be patient!
          </p>
        </div>

        <p className="text-sm text-gray-500">
          You can try refreshing the page in about 30 seconds if it seems
          stuck.
        </p>
      </div>
    </div>
  )
}

export default ServerNotReady