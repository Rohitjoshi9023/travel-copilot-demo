'use client';

import { useState, useCallback, useEffect } from 'react';
import { CopilotProvider } from '@yourgpt/copilot-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MessageSquare,
  Settings,
  User,
  Map,
} from 'lucide-react';
import { MapContainer } from '@/components/map/MapContainer';
import { MapAIContext } from '@/components/map/MapAIContext';
import { CopilotPanel, CopilotBottomSheet } from '@/components/chat/CopilotPanel';
import { TripSelector } from '@/components/trips/TripSelector';
import { usePlaces } from '@/hooks/usePlaces';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTripMapSync } from '@/hooks/useTripMapSync';

interface AppShellProps {
  googleMapsApiKey: string;
}

export function AppShell({ googleMapsApiKey }: AppShellProps) {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { searchPlaces, isSearching } = usePlaces();

  // Sync map location with active trip's destination
  useTripMapSync();

  // Ensure component is mounted before rendering Copilot components
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      await searchPlaces(searchQuery);
    },
    [searchQuery, searchPlaces]
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  // Error handler for Copilot - logs errors to console
  const handleCopilotError = useCallback((error: Error) => {
    console.error('[Copilot Error]', error.message, error);
  }, []);

  return (
    <CopilotProvider
      runtimeUrl="/api/chat"
      maxIterations={10}
      onError={handleCopilotError}
      debug={true}
      streaming={true}
    >
      {/* Provide map context to AI */}
      <MapAIContext />

      <div className="h-screen w-screen overflow-hidden bg-gray-100">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
          <div className="p-4 flex items-center gap-4">
            {/* Logo */}
            <div
              className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border border-gray-200"
              style={{ backgroundColor: '#ffffff' }}
            >
              <Map style={{ width: 20, height: 20, stroke: '#4f46e5' }} />
              <span className="font-semibold hidden sm:inline" style={{ color: '#111827' }}>
                Travel Copilot
              </span>
            </div>

            {/* Trip Selector */}
            <TripSelector />

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="pointer-events-auto flex-1 max-w-xl"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 20, height: 20, stroke: '#9ca3af' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search places or ask Copilot..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg shadow-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ backgroundColor: '#ffffff', color: '#1f2937', caretColor: '#1f2937' }}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </form>

            {/* Actions */}
            <div className="pointer-events-auto flex items-center gap-2">
              {/* Chat toggle button */}
              <button
                onClick={toggleChat}
                className="p-2.5 rounded-lg shadow-lg transition-colors border"
                style={{
                  backgroundColor: isChatOpen ? '#4f46e5' : '#ffffff',
                  borderColor: isChatOpen ? '#4338ca' : '#e5e7eb',
                }}
                title={isChatOpen ? 'Close Copilot' : 'Open Copilot'}
              >
                <MessageSquare style={{ width: 20, height: 20, stroke: isChatOpen ? '#ffffff' : '#4b5563' }} />
              </button>

              {/* Settings */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2.5 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors hidden sm:block"
                style={{ backgroundColor: '#ffffff' }}
                title="Settings"
              >
                <Settings style={{ width: 20, height: 20, stroke: '#4b5563' }} />
              </button>

              {/* User */}
              <button
                className="w-9 h-9 rounded-lg shadow-lg border border-indigo-200 flex items-center justify-center hidden sm:flex"
                style={{ backgroundColor: '#e0e7ff' }}
                title="Account"
              >
                <User style={{ width: 20, height: 20, stroke: '#4f46e5' }} />
              </button>
            </div>
          </div>
        </header>

        {/* Map */}
        <div
          className={`
            absolute inset-0 transition-all duration-300
            ${isChatOpen && !isMobile ? 'right-[420px]' : ''}
          `}
        >
          <MapContainer
            apiKey={googleMapsApiKey}
            onPlaceSelect={() => {
              setIsChatOpen(true);
            }}
          />
        </div>

        {/* Chat Panel - only render after mount to ensure CopilotProvider context is ready */}
        {isMounted && (
          isMobile ? (
            <CopilotBottomSheet isOpen={isChatOpen} onClose={toggleChat} />
          ) : (
            <AnimatePresence>
              {isChatOpen && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed right-0 top-0 bottom-0 w-[420px] z-40"
                >
                  <CopilotPanel isOpen={true} onClose={toggleChat} />
                </motion.div>
              )}
            </AnimatePresence>
          )
        )}

        {/* Mobile FAB for chat */}
        {isMobile && !isChatOpen && (
          <button
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors border border-indigo-700"
          >
            <MessageSquare style={{ width: 24, height: 24, stroke: '#ffffff' }} />
          </button>
        )}

        {/* Settings Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <SettingsMenu onClose={() => setIsMenuOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </CopilotProvider>
  );
}

function SettingsMenu({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-40"
      />

      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="fixed top-16 right-4 w-64 bg-white rounded-xl shadow-xl z-50 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Settings</h3>
        </div>
        <div className="p-2">
          <SettingsItem label="Dark Mode" />
          <SettingsItem label="Traffic Layer" />
          <SettingsItem label="Satellite View" />
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}

function SettingsItem({ label }: { label: string }) {
  const [enabled, setEnabled] = useState(false);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <span className="text-sm text-gray-700">{label}</span>
      <div
        className={`
          w-9 h-5 rounded-full transition-colors
          ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}
        `}
      >
        <div
          className={`
            w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5
            ${enabled ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}
          `}
        />
      </div>
    </button>
  );
}
