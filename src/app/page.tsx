'use client';

import dynamic from 'next/dynamic';

// Shimmer app loading screen
function AppLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-gray-50">
      {/* Logo with shimmer */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-2xl bg-indigo-400 animate-ping opacity-20" />
      </div>

      {/* App name */}
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Travel Copilot</h1>

      {/* Loading bar */}
      <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500 bg-[length:200%_100%] animate-[shimmer_1s_ease-in-out_infinite] rounded-full" />
      </div>

      {/* Subtle text */}
      <p className="text-sm text-gray-400 mt-3">Preparing your journey...</p>
    </div>
  );
}

// Dynamically import AppShell with SSR disabled to avoid hydration issues with CopilotProvider
const AppShell = dynamic(() => import('@/components/layout/AppShell').then((mod) => mod.AppShell), {
  ssr: false,
  loading: () => <AppLoadingScreen />,
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
