'use client';

import { motion } from 'framer-motion';
import { MapPin, Plus } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

interface AddMarkerRendererProps {
  execution: ToolExecution;
}

export function AddMarkerRenderer({ execution }: AddMarkerRendererProps) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { title: string; location: string; type?: string };
  const typedResult = result as { success: boolean; markerId?: string } | undefined;

  const isExecuting = status === 'executing';
  const isCompleted = status === 'completed';

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Plus className="w-4 h-4 text-rose-500" />}
      title="Adding marker"
      subtitle={typedArgs.title}
      error={error}
    >
      <div className="p-3 min-h-[80px]">
        {/* Pin drop animation */}
        <div className="relative flex items-center justify-center h-16">
          {/* Ground shadow */}
          <motion.div
            className="absolute bottom-2 w-8 h-2 bg-gray-300 rounded-full"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={
              isExecuting || isCompleted
                ? { scale: 1, opacity: 0.5 }
                : { scale: 0.5, opacity: 0 }
            }
            transition={{ duration: 0.3 }}
          />

          {/* Pin dropping animation */}
          <motion.div
            className="relative"
            initial={{ y: -50, opacity: 0 }}
            animate={
              isCompleted
                ? { y: 0, opacity: 1 }
                : isExecuting
                ? { y: [-50, 0, -10, 0], opacity: 1 }
                : { y: -50, opacity: 0 }
            }
            transition={
              isExecuting
                ? { duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }
                : { type: 'spring', stiffness: 300, damping: 15 }
            }
          >
            <motion.div
              animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <MapPin className="w-8 h-8 text-rose-500" />
            </motion.div>
          </motion.div>

          {/* Ripple effect on landing */}
          {isCompleted && (
            <>
              <motion.div
                className="absolute bottom-2 w-8 h-2 rounded-full border-2 border-rose-300"
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="absolute bottom-2 w-8 h-2 rounded-full border-2 border-rose-300"
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </>
          )}
        </div>

        {/* Location info */}
        <motion.div
          className="text-center mt-2"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-xs font-medium text-gray-700 truncate max-w-[200px] mx-auto">
            {typedArgs.title}
          </div>
          <div className="text-[10px] text-gray-500 truncate max-w-[200px] mx-auto">
            {typedArgs.location}
          </div>
        </motion.div>

        {/* Status text */}
        <motion.div
          className="text-center mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {isExecuting && (
            <span className="text-xs text-rose-600">Placing marker...</span>
          )}
          {isCompleted && typedResult?.success && (
            <span className="text-xs text-emerald-600">Marker added</span>
          )}
          {(status === 'error' || status === 'failed') && (
            <span className="text-xs text-red-600">Failed to add marker</span>
          )}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}
