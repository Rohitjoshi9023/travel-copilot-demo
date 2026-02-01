'use client';

import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

interface SearchPlacesRendererProps {
  execution: ToolExecution;
}

export function SearchPlacesRenderer({ execution }: SearchPlacesRendererProps) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { query: string; nearLocation?: string; radius?: number };
  const typedResult = result as { success: boolean; count?: number; places?: Array<{ name: string }> } | undefined;

  const isExecuting = status === 'executing';
  const isCompleted = status === 'completed';

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Search className="w-4 h-4 text-amber-500" />}
      title="Searching places"
      subtitle={typedArgs.query}
      error={error}
    >
      <div className="p-3 min-h-[80px]">
        {/* Search animation */}
        <div className="relative flex items-center justify-center h-16">
          {/* Grid pattern (map representation) */}
          <div className="absolute inset-0 grid grid-cols-6 gap-1 p-2 opacity-30">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-2 bg-gray-300 rounded-sm"
                initial={{ opacity: 0.3 }}
                animate={
                  isExecuting
                    ? {
                        opacity: [0.3, 0.6, 0.3],
                        backgroundColor: ['#d1d5db', '#a5b4fc', '#d1d5db'],
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>

          {/* Magnifying glass with search motion */}
          <motion.div
            className="relative z-10"
            animate={
              isExecuting
                ? {
                    x: [-30, 0, 30, 0, -30],
                    y: [-10, 10, -10, 10, -10],
                  }
                : {}
            }
            transition={
              isExecuting
                ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : {}
            }
          >
            <motion.div
              className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center"
              animate={isExecuting ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Search className="w-5 h-5 text-amber-600" />
            </motion.div>

            {/* Pulse rings */}
            {isExecuting && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-amber-400"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-amber-400"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                />
              </>
            )}
          </motion.div>

          {/* Result pins (show when completed) */}
          {isCompleted && typedResult?.success && (
            <motion.div className="absolute inset-0 flex items-center justify-center">
              {[...Array(Math.min(typedResult.count || 0, 5))].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 15,
                    delay: i * 0.1,
                  }}
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 20}%`,
                  }}
                >
                  <MapPin className="w-4 h-4 text-red-500" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Status text */}
        <motion.div
          className="text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {isExecuting && (
            <span className="text-xs text-amber-600">
              Searching for &quot;{typedArgs.query}&quot;
              {typedArgs.nearLocation && ` near ${typedArgs.nearLocation}`}...
            </span>
          )}
          {isCompleted && typedResult?.success && (
            <span className="text-xs text-emerald-600">
              Found {typedResult.count} place{typedResult.count !== 1 ? 's' : ''}
            </span>
          )}
          {(status === 'error' || status === 'failed') && (
            <span className="text-xs text-red-600">Search failed</span>
          )}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}
