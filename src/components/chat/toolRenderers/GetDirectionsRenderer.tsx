'use client';

import { motion } from 'framer-motion';
import { Navigation, MapPin, Car, Footprints, Bike, Train } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

interface GetDirectionsRendererProps {
  execution: ToolExecution;
}

const travelModeIcons = {
  driving: Car,
  walking: Footprints,
  bicycling: Bike,
  transit: Train,
};

export function GetDirectionsRenderer({ execution }: GetDirectionsRendererProps) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { origin: string; destination: string; travelMode?: string };
  const typedResult = result as { success: boolean; message?: string } | undefined;

  const isExecuting = status === 'executing';
  const isCompleted = status === 'completed';
  const TravelIcon = travelModeIcons[typedArgs.travelMode as keyof typeof travelModeIcons] || Car;

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Navigation className="w-4 h-4 text-blue-500" />}
      title="Getting directions"
      subtitle={`${typedArgs.origin} → ${typedArgs.destination}`}
      error={error}
    >
      <div className="p-3 min-h-[80px]">
        {/* Route drawing animation */}
        <div className="relative flex items-center justify-center h-16">
          <svg className="w-full h-full" viewBox="0 0 200 60">
            {/* Route path */}
            <motion.path
              d="M 25 30 L 60 30 L 80 45 L 120 15 L 140 30 L 175 30"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="0 1"
              initial={{ pathLength: 0 }}
              animate={
                isExecuting
                  ? { pathLength: [0, 1, 1, 0] }
                  : isCompleted
                  ? { pathLength: 1 }
                  : { pathLength: 0 }
              }
              transition={
                isExecuting
                  ? { duration: 2, repeat: Infinity, times: [0, 0.4, 0.6, 1] }
                  : { duration: 0.8, ease: 'easeOut' }
              }
            />

            {/* Animated dash overlay for executing state */}
            {isExecuting && (
              <motion.path
                d="M 25 30 L 60 30 L 80 45 L 120 15 L 140 30 L 175 30"
                fill="none"
                stroke="#93c5fd"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="5 10"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -30 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </svg>

          {/* Origin marker */}
          <motion.div
            className="absolute left-2 top-1/2 -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </motion.div>

          {/* Travel mode icon */}
          <motion.div
            className="absolute"
            initial={{ left: '15%' }}
            animate={
              isExecuting
                ? { left: ['15%', '85%'] }
                : isCompleted
                ? { left: '50%' }
                : { left: '15%' }
            }
            transition={
              isExecuting
                ? { duration: 2, repeat: Infinity, ease: 'linear' }
                : { duration: 0.5 }
            }
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            <motion.div
              className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center"
              animate={isExecuting ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              <TravelIcon className="w-4 h-4 text-blue-500" />
            </motion.div>
          </motion.div>

          {/* Destination marker */}
          <motion.div
            className="absolute right-2 top-1/2 -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <MapPin className="w-6 h-6 text-red-500" />
          </motion.div>
        </div>

        {/* Route info */}
        <motion.div
          className="flex items-center justify-center gap-4 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-[10px] text-gray-500 truncate max-w-[80px]">
            {typedArgs.origin}
          </div>
          <div className="text-xs text-gray-400">→</div>
          <div className="text-[10px] text-gray-500 truncate max-w-[80px]">
            {typedArgs.destination}
          </div>
        </motion.div>

        {/* Status text */}
        <motion.div
          className="text-center mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {isExecuting && (
            <span className="text-xs text-blue-600">
              Calculating route by {typedArgs.travelMode || 'driving'}...
            </span>
          )}
          {isCompleted && typedResult?.success && (
            <span className="text-xs text-emerald-600">Route found</span>
          )}
          {(status === 'error' || status === 'failed') && (
            <span className="text-xs text-red-600">Failed to get directions</span>
          )}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}
