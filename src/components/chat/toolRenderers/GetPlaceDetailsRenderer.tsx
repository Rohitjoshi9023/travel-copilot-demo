'use client';

import { motion } from 'framer-motion';
import { Info, Star, Phone, Globe, Clock } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

interface GetPlaceDetailsRendererProps {
  execution: ToolExecution;
}

export function GetPlaceDetailsRenderer({ execution }: GetPlaceDetailsRendererProps) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { placeId: string };
  const typedResult = result as {
    success: boolean;
    place?: {
      name: string;
      address?: string;
      rating?: number;
      phone?: string;
      website?: string;
      openNow?: boolean;
    };
  } | undefined;

  const isExecuting = status === 'executing';
  const isCompleted = status === 'completed';
  const place = typedResult?.place;

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Info className="w-4 h-4 text-teal-500" />}
      title="Getting details"
      subtitle={place?.name || typedArgs.placeId.slice(0, 20) + '...'}
      error={error}
    >
      <div className="p-3 min-h-[80px]">
        {/* Loading skeleton or place details */}
        <div className="space-y-2">
          {isExecuting && (
            <>
              {/* Skeleton loading */}
              <motion.div
                className="h-4 bg-gray-200 rounded w-3/4"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="h-3 bg-gray-200 rounded w-1/2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
              <div className="flex gap-2">
                <motion.div
                  className="h-3 bg-gray-200 rounded w-16"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                />
                <motion.div
                  className="h-3 bg-gray-200 rounded w-20"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                />
              </div>
            </>
          )}

          {isCompleted && place && (
            <>
              {/* Place name with reveal animation */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="font-medium text-sm text-gray-900"
              >
                {place.name}
              </motion.div>

              {/* Address */}
              {place.address && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-xs text-gray-500 truncate"
                >
                  {place.address}
                </motion.div>
              )}

              {/* Details row */}
              <motion.div
                className="flex items-center gap-3 flex-wrap"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {/* Rating */}
                {place.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-gray-700">{place.rating}</span>
                  </div>
                )}

                {/* Open status */}
                {place.openNow !== undefined && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span
                      className={`text-xs ${
                        place.openNow ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {place.openNow ? 'Open' : 'Closed'}
                    </span>
                  </div>
                )}

                {/* Phone */}
                {place.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{place.phone}</span>
                  </div>
                )}

                {/* Website */}
                {place.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-blue-500">Website</span>
                  </div>
                )}
              </motion.div>
            </>
          )}

          {(status === 'error' || status === 'failed') && (
            <span className="text-xs text-red-600">
              Failed to get place details
            </span>
          )}
        </div>
      </div>
    </ToolRendererWrapper>
  );
}
