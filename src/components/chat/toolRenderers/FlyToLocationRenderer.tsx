'use client';

import { motion } from 'framer-motion';
import { Plane, MapPin } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

interface FlyToLocationRendererProps {
  execution: ToolExecution;
}

export function FlyToLocationRenderer({ execution }: FlyToLocationRendererProps) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { location: string; zoom?: number };
  const typedResult = result as { success: boolean; location?: string } | undefined;

  const isExecuting = status === 'executing';
  const isCompleted = status === 'completed';

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Plane className="w-4 h-4 text-indigo-500" />}
      title="Flying to location"
      subtitle={typedArgs.location}
      error={error}
    >
      <div className="p-3 flex items-center justify-center min-h-[80px]">
        {/* Flight Path Animation */}
        <div className="relative w-full h-16">
          {/* Dotted path line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 60">
            <motion.path
              d="M 20 50 Q 100 0 180 50"
              fill="none"
              stroke="#c7d2fe"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: isExecuting || isCompleted ? 1 : 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>

          {/* Origin marker */}
          <motion.div
            className="absolute left-2 bottom-1 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">Start</span>
          </motion.div>

          {/* Airplane */}
          <motion.div
            className="absolute"
            initial={{ left: '10%', top: '70%', rotate: -30 }}
            animate={
              isExecuting
                ? {
                    left: ['10%', '50%', '85%'],
                    top: ['70%', '10%', '70%'],
                    rotate: [-30, -45, 30],
                  }
                : isCompleted
                ? { left: '85%', top: '70%', rotate: 30 }
                : { left: '10%', top: '70%', rotate: -30 }
            }
            transition={
              isExecuting
                ? {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
          >
            <Plane className="w-5 h-5 text-indigo-500" />
          </motion.div>

          {/* Destination marker */}
          <motion.div
            className="absolute right-2 bottom-1 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: isCompleted ? [1, 1.2, 1] : 1,
            }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={isCompleted ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <MapPin className="w-5 h-5 text-red-500" />
            </motion.div>
            <span className="text-[10px] text-gray-600 mt-0.5 max-w-[60px] truncate">
              {typedResult?.location || typedArgs.location}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Status text */}
      <motion.div
        className="px-3 pb-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {isExecuting && (
          <span className="text-xs text-indigo-600">
            Navigating to {typedArgs.location}...
          </span>
        )}
        {isCompleted && typedResult?.success && (
          <span className="text-xs text-emerald-600">
            Arrived at {typedResult.location || typedArgs.location}
          </span>
        )}
        {(status === 'error' || status === 'failed') && (
          <span className="text-xs text-red-600">Failed to navigate</span>
        )}
      </motion.div>
    </ToolRendererWrapper>
  );
}
