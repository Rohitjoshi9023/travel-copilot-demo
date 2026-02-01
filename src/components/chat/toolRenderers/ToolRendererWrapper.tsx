'use client';

import { motion } from 'framer-motion';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

export type ToolStatus = 'pending' | 'executing' | 'completed' | 'error' | 'failed' | 'rejected';

export interface ToolExecution {
  id: string;
  name: string;
  args: Record<string, unknown>;
  status: ToolStatus;
  result?: unknown;
  error?: string;
}

interface ToolRendererWrapperProps {
  status: ToolStatus;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  error?: string;
}

export function ToolRendererWrapper({
  status,
  icon,
  title,
  subtitle,
  children,
  error,
}: ToolRendererWrapperProps) {
  const isError = status === 'error' || status === 'failed' || status === 'rejected';

  const statusColors = {
    pending: 'bg-gray-50 border-gray-200',
    executing: 'bg-indigo-50 border-indigo-200',
    completed: 'bg-emerald-50 border-emerald-200',
    error: 'bg-red-50 border-red-200',
    failed: 'bg-red-50 border-red-200',
    rejected: 'bg-orange-50 border-orange-200',
  };

  const statusIcons = {
    pending: <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />,
    executing: <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />,
    completed: <Check className="w-3.5 h-3.5 text-emerald-500" />,
    error: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
    failed: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
    rejected: <AlertCircle className="w-3.5 h-3.5 text-orange-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`rounded-lg border p-3 my-2 ${statusColors[status]}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 truncate">{title}</span>
            {statusIcons[status]}
          </div>
          {subtitle && (
            <span className="text-xs text-gray-500 truncate block">{subtitle}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative overflow-hidden rounded-md bg-white/50 min-h-[60px]">
        {children}
      </div>

      {/* Error message */}
      {isError && error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs text-red-600"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}
