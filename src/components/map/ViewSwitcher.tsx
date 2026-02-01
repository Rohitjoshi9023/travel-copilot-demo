'use client';

import { motion } from 'framer-motion';
import { Map, Box, Eye } from 'lucide-react';
import { useViewModeTransition } from '@/hooks/useMapState';
import type { ViewMode } from '@/types';

interface ViewOption {
  mode: ViewMode;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const viewOptions: ViewOption[] = [
  { mode: 'map2d', icon: Map, label: '2D' },
  { mode: 'map3d', icon: Box, label: '3D' },
  { mode: 'streetview', icon: Eye, label: 'Street' },
];

export function ViewSwitcher() {
  const { currentMode, transitionTo } = useViewModeTransition();

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {viewOptions.map((option) => {
          const Icon = option.icon;
          const isActive = currentMode === option.mode;

          return (
            <button
              key={option.mode}
              onClick={() => transitionTo(option.mode)}
              className={`
                relative flex items-center gap-2 px-3 py-2.5 w-full
                text-sm font-medium transition-colors
                ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}
              `}
              title={option.label}
            >
              {isActive && (
                <motion.div
                  layoutId="viewSwitcherHighlight"
                  className="absolute inset-0 bg-indigo-50"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{option.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for mobile
export function ViewSwitcherCompact() {
  const { currentMode, transitionTo } = useViewModeTransition();

  return (
    <div className="flex bg-white rounded-full shadow-lg overflow-hidden">
      {viewOptions.map((option) => {
        const Icon = option.icon;
        const isActive = currentMode === option.mode;

        return (
          <button
            key={option.mode}
            onClick={() => transitionTo(option.mode)}
            className={`
              relative p-2.5 transition-colors
              ${isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}
            `}
            title={option.label}
          >
            {isActive && (
              <motion.div
                layoutId="viewSwitcherCompactHighlight"
                className="absolute inset-1 bg-indigo-100 rounded-full"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="relative w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}
