'use client';

import { motion } from 'framer-motion';
import { Map, Globe, Eye, Layers } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

interface SetMapViewRendererProps {
  execution: ToolExecution;
}

const viewModeConfig = {
  map2d: { icon: Map, label: '2D Map', color: 'text-blue-500', bg: 'bg-blue-100' },
  map3d: { icon: Globe, label: '3D View', color: 'text-purple-500', bg: 'bg-purple-100' },
  streetview: { icon: Eye, label: 'Street View', color: 'text-orange-500', bg: 'bg-orange-100' },
};

export function SetMapViewRenderer({ execution }: SetMapViewRendererProps) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { viewMode: 'map2d' | 'map3d' | 'streetview' };
  const typedResult = result as { success: boolean; viewMode?: string } | undefined;

  const isExecuting = status === 'executing';
  const isCompleted = status === 'completed';
  const config = viewModeConfig[typedArgs.viewMode] || viewModeConfig.map2d;
  const Icon = config.icon;

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Layers className="w-4 h-4 text-violet-500" />}
      title="Switching view"
      subtitle={config.label}
      error={error}
    >
      <div className="p-3 min-h-[80px]">
        {/* View switch animation */}
        <div className="relative flex items-center justify-center h-16">
          {/* Card flip animation */}
          <motion.div
            className="relative w-20 h-14"
            style={{ perspective: 500 }}
          >
            {/* Front card (old view) */}
            <motion.div
              className="absolute inset-0 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center backface-hidden"
              initial={{ rotateY: 0 }}
              animate={isExecuting || isCompleted ? { rotateY: 180 } : { rotateY: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <Map className="w-6 h-6 text-gray-400" />
            </motion.div>

            {/* Back card (new view) */}
            <motion.div
              className={`absolute inset-0 rounded-lg ${config.bg} border border-gray-200 flex items-center justify-center`}
              initial={{ rotateY: -180 }}
              animate={isExecuting || isCompleted ? { rotateY: 0 } : { rotateY: -180 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <motion.div
                animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Icon className={`w-6 h-6 ${config.color}`} />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Rotation indicator */}
          {isExecuting && (
            <motion.div
              className="absolute right-4 top-1/2 -translate-y-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-4 h-4 rounded-full border-2 border-violet-300 border-t-violet-500" />
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
            <span className="text-xs text-violet-600">
              Switching to {config.label}...
            </span>
          )}
          {isCompleted && typedResult?.success && (
            <span className="text-xs text-emerald-600">
              Now viewing in {config.label}
            </span>
          )}
          {(status === 'error' || status === 'failed') && (
            <span className="text-xs text-red-600">Failed to switch view</span>
          )}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}
