'use client';

import dynamic from 'next/dynamic';
import { X, Loader2, Sparkles } from 'lucide-react';

// Dynamically import the content component with SSR disabled
const CopilotPanelContent = dynamic(
  () => import('./CopilotPanelContent').then((mod) => mod.CopilotPanelContent),
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

export function CopilotPanel({ onClose }: CopilotPanelProps) {
  return (
    <div className="h-full w-full bg-white border-l border-gray-200 shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
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

      {/* Content - takes remaining height */}
      <div className="flex-1 min-h-0">
        <CopilotPanelContent />
      </div>
    </div>
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
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[70vh] bg-white rounded-t-2xl shadow-xl z-40 flex flex-col">
      {/* Drag handle */}
      <div className="flex justify-center py-2 flex-shrink-0">
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200">
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

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CopilotPanelContent />
      </div>
    </div>
  );
}
