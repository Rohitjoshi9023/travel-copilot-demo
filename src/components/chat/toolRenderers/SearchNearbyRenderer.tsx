'use client';

import { motion } from 'framer-motion';
import { Radio, MapPin } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

interface SearchNearbyRendererProps {
  execution: ToolExecution;
}

export function SearchNearbyRenderer({ execution }: SearchNearbyRendererProps) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { type: string; location: string; radius?: number };
  const typedResult = result as { success: boolean; count?: number; places?: Array<{ name: string }> } | undefined;

  const isExecuting = status === 'executing';
  const isCompleted = status === 'completed';
  const resultCount = typedResult?.count || 0;

  // Generate random positions for result pins
  const pinPositions = Array.from({ length: Math.min(resultCount, 6) }).map((_, i) => ({
    angle: (i * 60 + 30) * (Math.PI / 180),
    distance: 28 + (i % 2) * 8,
  }));

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Radio className="w-4 h-4 text-cyan-500" />}
      title="Searching nearby"
      subtitle={`${typedArgs.type} near ${typedArgs.location}`}
      error={error}
    >
      <div className="p-3 min-h-[100px]">
        {/* Radar animation */}
        <div className="relative flex items-center justify-center h-20">
          {/* Center point */}
          <motion.div
            className="relative z-10 w-8 h-8 rounded-full bg-cyan-100 border-2 border-cyan-500 flex items-center justify-center"
            animate={isExecuting ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <MapPin className="w-4 h-4 text-cyan-600" />
          </motion.div>

          {/* Radar pulse rings */}
          {isExecuting && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border-2 border-cyan-400"
                  style={{ width: 32, height: 32 }}
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 4, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}

          {/* Radar sweep line */}
          {isExecuting && (
            <motion.div
              className="absolute w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent origin-left"
              style={{ left: '50%', top: '50%' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          )}

          {/* Result pins (show when completed) */}
          {isCompleted && typedResult?.success && (
            <>
              {pinPositions.map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: i * 0.1,
                  }}
                  style={{
                    left: `calc(50% + ${Math.cos(pos.angle) * pos.distance}px)`,
                    top: `calc(50% + ${Math.sin(pos.angle) * pos.distance}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <motion.div
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 15,
                      delay: i * 0.1 + 0.1,
                    }}
                  >
                    <MapPin className="w-4 h-4 text-red-500" />
                  </motion.div>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Status text */}
        <motion.div
          className="text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {isExecuting && (
            <span className="text-xs text-cyan-600">
              Scanning for {typedArgs.type} near {typedArgs.location}...
            </span>
          )}
          {isCompleted && typedResult?.success && (
            <span className="text-xs text-emerald-600">
              Found {typedResult.count} {typedArgs.type}
              {typedResult.count !== 1 ? 's' : ''} nearby
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
