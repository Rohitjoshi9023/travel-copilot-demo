'use client';

import dynamic from 'next/dynamic';

// Dynamically import AppShell with SSR disabled to avoid hydration issues with CopilotProvider
const AppShell = dynamic(() => import('@/components/layout/AppShell').then((mod) => mod.AppShell), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-600">Loading Maps Copilot...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  if (!googleMapsApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Configuration Required
          </h1>
          <p className="text-gray-600 mb-4">
            Please add your Google Maps API key to the environment variables.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-left">
            <p className="text-sm font-mono text-gray-700 mb-2">
              Create a <code className="bg-gray-200 px-1 rounded">.env.local</code> file:
            </p>
            <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`OPENAI_API_KEY=sk-...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
GOOGLE_MAPS_API_KEY=...`}
            </pre>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Get your API key from the{' '}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Google Cloud Console
            </a>
          </p>
        </div>
      </div>
    );
  }

  return <AppShell googleMapsApiKey={googleMapsApiKey} />;
}
