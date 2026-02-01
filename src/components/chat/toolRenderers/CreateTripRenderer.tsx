'use client';

import { motion } from 'framer-motion';
import { Plane, Check, MapPin, Calendar } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

interface CreateTripRendererProps {
  execution: ToolExecution;
}

export function CreateTripRenderer({ execution }: CreateTripRendererProps) {
  const { status, args, result, error } = execution;
  const typedArgs = args as {
    name: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
  };
  const typedResult = result as {
    success: boolean;
    tripId?: string;
    tripName?: string;
    destination?: string;
  } | undefined;

  const isExecuting = status === 'executing';
  const isCompleted = status === 'completed';

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Plane className="w-4 h-4 text-indigo-500" />}
      title="Creating trip"
      subtitle={typedArgs.name}
      error={error}
    >
      <div className="p-3 min-h-[100px]">
        {/* Trip card animation */}
        <motion.div
          className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Decorative plane */}
          <motion.div
            className="absolute -top-2 -right-2 opacity-10"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 0.1 }}
            transition={{ delay: 0.2 }}
          >
            <Plane className="w-20 h-20 text-indigo-600 rotate-45" />
          </motion.div>

          {/* Trip info */}
          <div className="relative">
            <motion.h3
              className="text-lg font-semibold text-gray-900"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {typedArgs.name}
            </motion.h3>

            {typedArgs.destination && (
              <motion.div
                className="flex items-center gap-1 mt-1"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-sm text-gray-600">{typedArgs.destination}</span>
              </motion.div>
            )}

            {(typedArgs.startDate || typedArgs.endDate) && (
              <motion.div
                className="flex items-center gap-1 mt-1"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-sm text-gray-600">
                  {typedArgs.startDate}
                  {typedArgs.endDate && ` - ${typedArgs.endDate}`}
                </span>
              </motion.div>
            )}
          </div>

          {/* Success indicator */}
          {isCompleted && typedResult?.success && (
            <motion.div
              className="absolute top-2 right-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          )}

          {/* Loading indicator */}
          {isExecuting && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-indigo-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Status text */}
        <motion.div
          className="text-center mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {isExecuting && (
            <span className="text-xs text-indigo-600">Setting up your trip...</span>
          )}
          {isCompleted && typedResult?.success && (
            <span className="text-xs text-green-600">
              Trip created! Start adding places to your itinerary.
            </span>
          )}
          {(status === 'error' || status === 'failed') && (
            <span className="text-xs text-red-600">Failed to create trip</span>
          )}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}
