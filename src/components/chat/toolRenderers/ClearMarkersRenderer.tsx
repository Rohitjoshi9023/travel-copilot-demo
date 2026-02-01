'use client';

import { motion } from 'framer-motion';
import { Trash2, MapPin, Check } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

interface ClearMarkersRendererProps {
  execution: ToolExecution;
}

export function ClearMarkersRenderer({ execution }: ClearMarkersRendererProps) {
  const { status, result, error } = execution;
  const typedResult = result as { success: boolean } | undefined;

  const isExecuting = status === 'executing';
  const isCompleted = status === 'completed';

  // Sample markers to animate
  const markers = [
    { x: 20, y: 30 },
    { x: 50, y: 20 },
    { x: 80, y: 35 },
    { x: 35, y: 50 },
    { x: 65, y: 55 },
  ];

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Trash2 className="w-4 h-4 text-gray-500" />}
      title="Clearing markers"
      error={error}
    >
      <div className="p-3 min-h-[80px]">
        {/* Markers clearing animation */}
        <div className="relative flex items-center justify-center h-16">
          {/* Markers flying away */}
          {markers.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              initial={{ scale: 1, opacity: 1 }}
              animate={
                isExecuting || isCompleted
                  ? {
                      scale: 0,
                      opacity: 0,
                      y: -20,
                      x: (pos.x - 50) * 0.5,
                    }
                  : { scale: 1, opacity: 1 }
              }
              transition={{
                duration: 0.4,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            >
              <MapPin className="w-4 h-4 text-red-400" />
            </motion.div>
          ))}

          {/* Checkmark appears after clearing */}
          {isCompleted && (
            <motion.div
              className="absolute w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 15,
                delay: 0.5,
              }}
            >
              <Check className="w-5 h-5 text-emerald-500" />
            </motion.div>
          )}

          {/* Sweeping animation */}
          {isExecuting && (
            <motion.div
              className="absolute h-full w-1 bg-gradient-to-b from-transparent via-gray-300 to-transparent"
              initial={{ left: '0%' }}
              animate={{ left: '100%' }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>

        {/* Status text */}
        <motion.div
          className="text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {isExecuting && (
            <span className="text-xs text-gray-600">Removing all markers...</span>
          )}
          {isCompleted && typedResult?.success && (
            <span className="text-xs text-emerald-600">All markers cleared</span>
          )}
          {(status === 'error' || status === 'failed') && (
            <span className="text-xs text-red-600">Failed to clear markers</span>
          )}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}
