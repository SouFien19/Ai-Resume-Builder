'use client';

import Link from 'next/link';
import { WifiOff, RefreshCcw, Home } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative bg-white rounded-full p-6 shadow-2xl">
              <WifiOff className="w-16 h-16 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          It looks like you&apos;ve lost your internet connection. 
          Don&apos;t worry, you can still view cached resumes and templates.
        </p>

        {/* Features Available Offline */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Available Offline:
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>View cached resumes</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Browse saved templates</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Review your profile</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">✗</span>
              <span>AI-powered features require internet</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            Try Again
          </button>

          <Link
            href="/"
            className="block w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <strong>Tip:</strong> Check your Wi-Fi or mobile data connection and try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  );
}
