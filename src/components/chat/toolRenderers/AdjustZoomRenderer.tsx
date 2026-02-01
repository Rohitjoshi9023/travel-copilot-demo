'use client';

import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

interface AdjustZoomRendererProps {
  execution: ToolExecution;
}

export function AdjustZoomRenderer({ execution }: AdjustZoomRendererProps) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { direction: 'in' | 'out'; amount?: number };
  const typedResult = result as { success: boolean; zoom?: number } | undefined;

  const isExecuting = status === 'executing';
  const isCompleted = status === 'completed';
  const isZoomIn = typedArgs.direction === 'in';
  const ZoomIcon = isZoomIn ? ZoomIn : ZoomOut;

  return (
    <ToolRendererWrapper
      status={status}
      icon={<ZoomIcon className="w-4 h-4 text-sky-500" />}
      title={isZoomIn ? 'Zooming in' : 'Zooming out'}
      subtitle={typedArgs.amount ? `${typedArgs.amount} levels` : undefined}
      error={error}
    >
      <div className="p-3 min-h-[80px]">
        {/* Zoom animation */}
        <div className="relative flex items-center justify-center h-16">
          {/* Map representation that scales */}
          <motion.div
            className="relative w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden"
            animate={
              isExecuting
                ? {
                    scale: isZoomIn ? [1, 1.15, 1.15, 1] : [1, 0.85, 0.85, 1],
                  }
                : isCompleted
                ? {
                    scale: isZoomIn ? 1.1 : 0.9,
                  }
                : {}
            }
            transition={
              isExecuting
                ? { duration: 1, repeat: Infinity }
                : { duration: 0.3 }
            }
          >
            {/* Grid lines representing map */}
            <div className="absolute inset-0 grid grid-cols-3 gap-0.5 p-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-gray-300 rounded-sm"
                  animate={
                    isExecuting
                      ? {
                          opacity: [0.5, 1, 0.5],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>

            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-0.5 bg-sky-400 absolute" />
              <div className="w-0.5 h-4 bg-sky-400 absolute" />
            </div>
          </motion.div>

          {/* Zoom icon with animation */}
          <motion.div
            className="absolute -right-1 -top-1 w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shadow-sm"
            animate={
              isExecuting
                ? {
                    scale: [1, 1.2, 1],
                  }
                : isCompleted
                ? { scale: [1, 1.3, 1] }
                : {}
            }
            transition={
              isExecuting
                ? { duration: 0.5, repeat: Infinity }
                : { duration: 0.3 }
            }
          >
            <ZoomIcon className="w-4 h-4 text-sky-600" />
          </motion.div>

          {/* Zoom level indicator */}
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white rounded-full shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isCompleted && typedResult?.zoom !== undefined ? (
              <span className="text-xs font-medium text-gray-700">
                Zoom: {typedResult.zoom}
              </span>
            ) : (
              <motion.span
                className="text-xs text-gray-500"
                animate={isExecuting ? { opacity: [0.5, 1, 0.5] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                {isZoomIn ? 'Zooming in...' : 'Zooming out...'}
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Status text */}
        <motion.div
          className="text-center mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {isExecuting && (
            <span className="text-xs text-sky-600">
              {isZoomIn ? 'Zooming in' : 'Zooming out'}
              {typedArgs.amount ? ` ${typedArgs.amount} level${typedArgs.amount > 1 ? 's' : ''}` : ''}...
            </span>
          )}
          {isCompleted && typedResult?.success && (
            <span className="text-xs text-emerald-600">
              Zoom level set to {typedResult.zoom}
            </span>
          )}
          {(status === 'error' || status === 'failed') && (
            <span className="text-xs text-red-600">Failed to adjust zoom</span>
          )}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}
