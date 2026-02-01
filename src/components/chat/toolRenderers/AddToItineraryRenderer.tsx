'use client';

import { motion } from 'framer-motion';
import { ListPlus, Check, Calendar } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

interface AddToItineraryRendererProps {
  execution: ToolExecution;
}

export function AddToItineraryRenderer({ execution }: AddToItineraryRendererProps) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { placeName: string; placeId?: string; day?: number };
  const typedResult = result as { success: boolean; place?: string; day?: number } | undefined;

  const isExecuting = status === 'executing';
  const isCompleted = status === 'completed';
  const day = typedResult?.day || typedArgs.day || 1;

  return (
    <ToolRendererWrapper
      status={status}
      icon={<ListPlus className="w-4 h-4 text-emerald-500" />}
      title="Adding to itinerary"
      subtitle={typedArgs.placeName}
      error={error}
    >
      <div className="p-3 min-h-[80px]">
        {/* Itinerary item animation */}
        <div className="relative">
          {/* Day badge */}
          <motion.div
            className="flex items-center gap-2 mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">
                Day {day}
              </span>
            </div>
          </motion.div>

          {/* Item card sliding in */}
          <motion.div
            className="relative bg-white border border-gray-200 rounded-lg p-3 overflow-hidden"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              delay: 0.1,
            }}
          >
            {/* Checkbox */}
            <div className="flex items-start gap-3">
              <motion.div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-gray-300'
                }`}
                animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                {isExecuting && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Place info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {typedArgs.placeName}
                </div>
                {isExecuting && (
                  <motion.div
                    className="h-2 bg-gray-200 rounded w-1/2 mt-1"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
            </div>

            {/* Progress bar for executing */}
            {isExecuting && (
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-emerald-400"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Success checkmark burst */}
          {isCompleted && typedResult?.success && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-400" />
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
            <span className="text-xs text-emerald-600">
              Adding to Day {day}...
            </span>
          )}
          {isCompleted && typedResult?.success && (
            <span className="text-xs text-emerald-600">
              Added to Day {day} itinerary
            </span>
          )}
          {(status === 'error' || status === 'failed') && (
            <span className="text-xs text-red-600">
              Failed to add to itinerary
            </span>
          )}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}
