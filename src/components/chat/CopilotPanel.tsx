'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { X, Loader2, Sparkles, MessageSquare, Map } from 'lucide-react';
import { useChatIntentStore } from '@/stores/chatIntentStore';

// Dynamically import the content components with SSR disabled
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

const TripsPanelContent = dynamic(
  () => import('@/components/trips/TripsPanelContent').then((mod) => mod.TripsPanelContent),
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

type PanelTab = 'chat' | 'plans';

interface CopilotPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CopilotPanel({ onClose }: CopilotPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('chat');
  const setOnIntentSet = useChatIntentStore((s) => s.setOnIntentSet);

  // Register callback to switch to chat tab when intent is set
  const switchToChatTab = useCallback(() => {
    setActiveTab('chat');
  }, []);

  useEffect(() => {
    setOnIntentSet(switchToChatTab);
    return () => setOnIntentSet(null);
  }, [setOnIntentSet, switchToChatTab]);

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

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'plans'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Map className="w-4 h-4" />
          My Plans
        </button>
      </div>

      {/* Content - takes remaining height */}
      <div className="flex-1 min-h-0">
        {activeTab === 'chat' ? <CopilotPanelContent /> : <TripsPanelContent />}
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
  const [activeTab, setActiveTab] = useState<PanelTab>('chat');
  const setOnIntentSet = useChatIntentStore((s) => s.setOnIntentSet);

  // Register callback to switch to chat tab when intent is set
  const switchToChatTab = useCallback(() => {
    setActiveTab('chat');
  }, []);

  useEffect(() => {
    setOnIntentSet(switchToChatTab);
    return () => setOnIntentSet(null);
  }, [setOnIntentSet, switchToChatTab]);

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

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'plans'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Map className="w-4 h-4" />
          My Plans
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'chat' ? <CopilotPanelContent /> : <TripsPanelContent />}
      </div>
    </div>
  );
}
