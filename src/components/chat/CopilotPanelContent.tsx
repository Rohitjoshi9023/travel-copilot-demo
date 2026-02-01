'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { useCopilot } from '@yourgpt/copilot-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { usePlacesStore } from '@/stores/placesStore';
import { PlaceCard, PlaceCardCarousel } from './PlaceCard';
import { SuggestionChips } from './SuggestionChips';
import { CopilotToolsProvider } from './CopilotToolsProvider';
import type { Place } from '@/types';

// This component uses Copilot hooks and must only be rendered inside CopilotProvider
export function CopilotPanelContent() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Use copilot hook
  const { messages, isLoading, sendMessage, status, toolExecutions, registeredTools, pendingApprovals } = useCopilot();

  // Debug: log registered tools on mount
  useEffect(() => {
    console.log('[Copilot] Registered tools:', registeredTools?.map(t => t.name));
    console.log('[Copilot] Registered tools full:', registeredTools);
  }, [registeredTools]);

  // Debug: log status changes
  useEffect(() => {
    console.log('[Copilot] Status changed:', status);
  }, [status]);

  // Debug: log tool executions
  useEffect(() => {
    console.log('[Copilot] Tool executions updated:', toolExecutions);
    if (toolExecutions?.length > 0) {
      toolExecutions.forEach(exec => {
        console.log(`[Copilot] Tool exec: ${exec.name} - status: ${exec.status}, approval: ${exec.approvalStatus}`);
      });
    }
  }, [toolExecutions]);

  // Debug: log pending approvals
  useEffect(() => {
    console.log('[Copilot] Pending approvals:', pendingApprovals);
  }, [pendingApprovals]);

  // Debug: log messages with detailed tool call info
  useEffect(() => {
    console.log('[Copilot] Messages count:', messages?.length);
    messages?.forEach((msg, i) => {
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        console.log(`[Copilot] Message ${i} has toolCalls:`, msg.toolCalls);
      }
    });
  }, [messages]);

  const places = usePlacesStore((s) => s.places);
  const selectedPlace = usePlacesStore((s) => s.selectedPlace);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const message = inputValue.trim();
      if (!message || isLoading) return;

      setInputValue('');
      await sendMessage(message);
    },
    [inputValue, isLoading, sendMessage]
  );

  const handleSuggestionSelect = useCallback(
    async (query: string) => {
      await sendMessage(query);
    },
    [sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <>
      {/* Register AI tools for map control and place search */}
      <CopilotToolsProvider />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <WelcomeMessage onSuggestionSelect={handleSuggestionSelect} />
        )}

        {messages
          .filter(
            (message) => message.role === 'user' || message.role === 'assistant'
          )
          .map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              places={message.role === 'assistant' ? places : undefined}
            />
          ))}

        {(isLoading || status === 'streaming') && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected place preview */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-3 border-t border-gray-200 bg-gray-50"
          >
            <PlaceCard place={selectedPlace} variant="compact" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t border-gray-100">
          <SuggestionChips
            context={
              selectedPlace
                ? 'place_selected'
                : places.length > 0
                  ? 'search_results'
                  : undefined
            }
            onSelect={handleSuggestionSelect}
          />
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about places..."
              rows={1}
              className="w-full px-4 py-2.5 pr-10 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
}

function WelcomeMessage({
  onSuggestionSelect,
}: {
  onSuggestionSelect: (query: string) => void;
}) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Welcome to Travel Copilot
      </h3>
      <p className="text-sm text-gray-600 mb-6 max-w-xs mx-auto">
        I can help you explore places, find hotels and restaurants, plan trips,
        and navigate - all through natural conversation.
      </p>
      <div className="space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
          Try asking:
        </p>
        <SuggestionChips onSelect={onSuggestionSelect} />
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: {
    id: string;
    role: string;
    content: string;
  };
  places?: Place[];
}

function MessageBubble({ message, places }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? 'bg-gray-200' : 'bg-indigo-100'}
        `}
      >
        {isUser ? (
          <User className="w-4 h-4 text-gray-600" />
        ) : (
          <Bot className="w-4 h-4 text-indigo-600" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`
            inline-block px-4 py-2.5 rounded-2xl text-sm
            ${
              isUser
                ? 'bg-indigo-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }
          `}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Place cards for assistant messages */}
        {!isUser && places && places.length > 0 && (
          <div className="mt-3">
            {places.length === 1 ? (
              <PlaceCard place={places[0]} variant="compact" />
            ) : (
              <PlaceCardCarousel places={places} />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
