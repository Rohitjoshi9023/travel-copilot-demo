'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { X, Loader2, Sparkles } from 'lucide-react';

// Dynamically import the content component with SSR disabled
// This ensures useCopilot and useCopilotTools only run on the client
const CopilotPanelContent = dynamic(
  () =>
    import('./CopilotPanelContent').then((mod) => mod.CopilotPanelContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    ),
  }
);

interface CopilotPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CopilotPanel({ isOpen = true, onClose }: CopilotPanelProps) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 shadow-xl flex flex-col z-40"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Travel Copilot</h2>
            <p className="text-xs text-gray-500">Your AI tour guide</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content - dynamically loaded, client-side only */}
      <CopilotPanelContent />
    </motion.div>
  );
}

// Mobile bottom sheet variant
export function CopilotBottomSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 h-[70vh] bg-white rounded-t-2xl shadow-xl z-40"
    >
      {/* Drag handle */}
      <div className="flex justify-center py-2">
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Travel Copilot</h2>
            <p className="text-xs text-gray-500">Your AI tour guide</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content - dynamically loaded, client-side only */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <CopilotPanelContent />
      </div>
    </motion.div>
  );
}
