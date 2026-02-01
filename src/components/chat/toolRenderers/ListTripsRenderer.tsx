'use client';

import { motion } from 'framer-motion';
import { List, MapPin, Calendar, CheckCircle, Clock, Plane } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

interface TripSummary {
  id: string;
  name: string;
  destination?: string;
  status: 'planning' | 'upcoming' | 'ongoing' | 'completed';
  itemCount: number;
  startDate?: string;
  endDate?: string;
}

interface ListTripsRendererProps {
  execution: ToolExecution;
}

const statusIcons = {
  planning: Clock,
  upcoming: Calendar,
  ongoing: Plane,
  completed: CheckCircle,
};

const statusColors = {
  planning: 'text-blue-500 bg-blue-100',
  upcoming: 'text-amber-500 bg-amber-100',
  ongoing: 'text-green-500 bg-green-100',
  completed: 'text-gray-500 bg-gray-100',
};

export function ListTripsRenderer({ execution }: ListTripsRendererProps) {
  const { status, result, error } = execution;
  const typedResult = result as {
    success: boolean;
    count: number;
    trips: TripSummary[];
    activeTrip?: { id: string; name: string } | null;
    message?: string;
  } | undefined;

  const isExecuting = status === 'executing';
  const isCompleted = status === 'completed';
  const trips = typedResult?.trips || [];

  return (
    <ToolRendererWrapper
      status={status}
      icon={<List className="w-4 h-4 text-indigo-500" />}
      title="Your trips"
      subtitle={typedResult ? `${typedResult.count} trip${typedResult.count !== 1 ? 's' : ''}` : 'Loading...'}
      error={error}
    >
      <div className="p-3 min-h-[80px]">
        {isExecuting && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="h-14 bg-gray-100 rounded-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        )}

        {isCompleted && trips.length === 0 && (
          <motion.div
            className="text-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No trips yet</p>
            <p className="text-xs text-gray-400 mt-1">Create a trip to start planning</p>
          </motion.div>
        )}

        {isCompleted && trips.length > 0 && (
          <div className="space-y-2">
            {trips.slice(0, 5).map((trip, index) => {
              const StatusIcon = statusIcons[trip.status];
              const isActive = typedResult?.activeTrip?.id === trip.id;

              return (
                <motion.div
                  key={trip.id}
                  className={`relative p-3 rounded-lg border transition-colors ${
                    isActive
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusColors[trip.status]}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {trip.name}
                        </span>
                        {isActive && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-indigo-500 text-white rounded">
                            Active
                          </span>
                        )}
                      </div>

                      {trip.destination && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">
                            {trip.destination}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">
                          {trip.itemCount} {trip.itemCount === 1 ? 'place' : 'places'}
                        </span>
                        {trip.startDate && (
                          <span className="text-xs text-gray-400">
                            {new Date(trip.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {trips.length > 5 && (
              <motion.p
                className="text-xs text-gray-500 text-center pt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                +{trips.length - 5} more trips
              </motion.p>
            )}
          </div>
        )}
      </div>
    </ToolRendererWrapper>
  );
}
