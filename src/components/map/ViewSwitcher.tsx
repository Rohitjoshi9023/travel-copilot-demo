'use client';

import { motion } from 'framer-motion';
import { Map, Box, Eye } from 'lucide-react';
import { useViewModeTransition } from '@/hooks/useMapState';
import type { ViewMode } from '@/types';

interface ViewOption {
  mode: ViewMode;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
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
      <div className="rounded-lg shadow-lg overflow-hidden border border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        {viewOptions.map((option) => {
          const Icon = option.icon;
          const isActive = currentMode === option.mode;

          return (
            <button
              key={option.mode}
              onClick={() => transitionTo(option.mode)}
              className="relative flex items-center gap-2 px-3 py-2.5 w-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive ? '#eef2ff' : '#ffffff',
              }}
              title={option.label}
            >
              {isActive && (
                <motion.div
                  layoutId="viewSwitcherHighlight"
                  className="absolute inset-0"
                  style={{ backgroundColor: '#eef2ff' }}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon style={{ width: 16, height: 16, stroke: isActive ? '#4f46e5' : '#4b5563' }} />
                <span className="hidden sm:inline" style={{ color: isActive ? '#4f46e5' : '#4b5563' }}>{option.label}</span>
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
    <div className="flex rounded-full shadow-lg overflow-hidden border border-gray-200" style={{ backgroundColor: '#ffffff' }}>
      {viewOptions.map((option) => {
        const Icon = option.icon;
        const isActive = currentMode === option.mode;

        return (
          <button
            key={option.mode}
            onClick={() => transitionTo(option.mode)}
            className="relative p-2.5 transition-colors"
            title={option.label}
          >
            {isActive && (
              <motion.div
                layoutId="viewSwitcherCompactHighlight"
                className="absolute inset-1 rounded-full"
                style={{ backgroundColor: '#e0e7ff' }}
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="relative" style={{ width: 20, height: 20, stroke: isActive ? '#4f46e5' : '#9ca3af' }} />
          </button>
        );
      })}
    </div>
  );
}
