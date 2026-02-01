'use client';

import { motion } from 'framer-motion';
import { Trash2, ArrowRight, Calendar, Check, MapPin, List, FileText } from 'lucide-react';
import { ToolRendererWrapper, type ToolExecution } from './ToolRendererWrapper';

// Delete Trip Renderer
export function DeleteTripRenderer({ execution }: { execution: ToolExecution }) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { tripName?: string; confirmed?: boolean };
  const typedResult = result as {
    success: boolean;
    deletedTripName?: string;
    requiresConfirmation?: boolean;
    tripToDelete?: { name: string; itemCount: number; daysCount: number };
  } | undefined;

  const isCompleted = status === 'completed';
  const isConfirmation = typedResult?.requiresConfirmation;
  const wasDeleted = isCompleted && typedResult?.success;

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Trash2 className="w-4 h-4 text-red-500" />}
      title={isConfirmation ? "Confirm deletion" : wasDeleted ? "Trip deleted" : "Deleting trip"}
      subtitle={typedResult?.tripToDelete?.name || typedResult?.deletedTripName || typedArgs.tripName || 'Trip'}
      error={error}
    >
      <div className="p-3">
        <motion.div
          className={`flex items-center gap-3 p-3 rounded-lg border ${
            isConfirmation
              ? 'bg-amber-50 border-amber-200'
              : 'bg-red-50 border-red-100'
          }`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            wasDeleted ? 'bg-red-500' : isConfirmation ? 'bg-amber-400' : 'bg-red-200'
          }`}>
            {wasDeleted ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Trash2 className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {typedResult?.tripToDelete?.name || typedResult?.deletedTripName || typedArgs.tripName || 'Trip'}
            </div>
            <div className="text-xs text-gray-500">
              {wasDeleted
                ? 'Trip deleted successfully'
                : isConfirmation
                  ? `${typedResult?.tripToDelete?.itemCount || 0} places · ${typedResult?.tripToDelete?.daysCount || 0} days`
                  : 'Processing...'}
            </div>
          </div>
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}

// Delete Trip Item Renderer
export function DeleteTripItemRenderer({ execution }: { execution: ToolExecution }) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { placeName: string };
  const typedResult = result as { success: boolean; removedPlace?: string; fromDay?: number } | undefined;

  const isCompleted = status === 'completed';

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Trash2 className="w-4 h-4 text-orange-500" />}
      title="Removing place"
      subtitle={typedArgs.placeName}
      error={error}
    >
      <div className="p-3">
        <motion.div
          className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: isCompleted ? 0.6 : 1, x: isCompleted ? 20 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <MapPin className="w-4 h-4 text-orange-500" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {typedResult?.removedPlace || typedArgs.placeName}
            </div>
            {typedResult?.fromDay && (
              <div className="text-xs text-gray-500">From Day {typedResult.fromDay}</div>
            )}
          </div>
          {isCompleted && <Check className="w-4 h-4 text-green-500" />}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}

// Move Trip Item Renderer
export function MoveTripItemRenderer({ execution }: { execution: ToolExecution }) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { placeName: string; toDay: number };
  const typedResult = result as { success: boolean; movedPlace?: string; fromDay?: number; toDay?: number } | undefined;

  const isCompleted = status === 'completed';

  return (
    <ToolRendererWrapper
      status={status}
      icon={<ArrowRight className="w-4 h-4 text-blue-500" />}
      title="Moving place"
      subtitle={typedArgs.placeName}
      error={error}
    >
      <div className="p-3">
        <motion.div
          className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {typedResult?.movedPlace || typedArgs.placeName}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {typedResult?.fromDay && (
              <span className="px-2 py-1 bg-gray-200 rounded">Day {typedResult.fromDay}</span>
            )}
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <span className="px-2 py-1 bg-blue-200 text-blue-700 rounded font-medium">
              Day {typedResult?.toDay || typedArgs.toDay}
            </span>
          </div>
          {isCompleted && <Check className="w-4 h-4 text-green-500 ml-2" />}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}

// Remove Places From Trip Renderer (bulk delete)
export function RemovePlacesFromTripRenderer({ execution }: { execution: ToolExecution }) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { placeNames?: string[]; fromDay?: number };
  const typedResult = result as { success: boolean; deletedPlaces?: string[]; count?: number } | undefined;

  const isCompleted = status === 'completed';
  const count = typedResult?.count || typedArgs.placeNames?.length || 0;

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Trash2 className="w-4 h-4 text-red-500" />}
      title={typedArgs.fromDay ? `Clearing Day ${typedArgs.fromDay}` : 'Removing places'}
      subtitle={`${count} places`}
      error={error}
    >
      <div className="p-3">
        <motion.div
          className="p-3 bg-red-50 rounded-lg border border-red-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isCompleted ? 'bg-green-500' : 'bg-red-200'
            }`}>
              {isCompleted ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <Trash2 className="w-3 h-3 text-red-600" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {isCompleted
                ? `Removed ${typedResult?.count || 0} places`
                : `Removing ${count} places...`
              }
            </span>
          </div>
          {typedResult?.deletedPlaces && typedResult.deletedPlaces.length > 0 && (
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {typedResult.deletedPlaces.slice(0, 5).map((place, i) => (
                <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-gray-400" />
                  {place}
                </div>
              ))}
              {typedResult.deletedPlaces.length > 5 && (
                <div className="text-xs text-gray-400">
                  +{typedResult.deletedPlaces.length - 5} more
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}

// Reschedule Places Renderer (bulk move)
export function ReschedulePlacesRenderer({ execution }: { execution: ToolExecution }) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { placeNames?: string[]; fromDay?: number; toDay: number };
  const typedResult = result as { success: boolean; movedPlaces?: string[]; toDay?: number; count?: number } | undefined;

  const isCompleted = status === 'completed';
  const count = typedResult?.count || typedArgs.placeNames?.length || 0;

  return (
    <ToolRendererWrapper
      status={status}
      icon={<Calendar className="w-4 h-4 text-indigo-500" />}
      title="Rescheduling places"
      subtitle={`to Day ${typedArgs.toDay}`}
      error={error}
    >
      <div className="p-3">
        <motion.div
          className="p-3 bg-indigo-50 rounded-lg border border-indigo-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isCompleted ? 'bg-green-500' : 'bg-indigo-200'
            }`}>
              {isCompleted ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <ArrowRight className="w-3 h-3 text-indigo-600" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {isCompleted
                ? `Moved ${typedResult?.count || 0} places to Day ${typedResult?.toDay}`
                : `Moving ${count} places to Day ${typedArgs.toDay}...`
              }
            </span>
          </div>
          {typedResult?.movedPlaces && typedResult.movedPlaces.length > 0 && (
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {typedResult.movedPlaces.slice(0, 5).map((place, i) => (
                <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  {place}
                </div>
              ))}
              {typedResult.movedPlaces.length > 5 && (
                <div className="text-xs text-gray-400">
                  +{typedResult.movedPlaces.length - 5} more
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}

// Get Trip Details Renderer
export function GetTripDetailsRenderer({ execution }: { execution: ToolExecution }) {
  const { status, result, error } = execution;
  const typedResult = result as {
    success: boolean;
    trip?: { name: string; destination?: string; daysCount: number; totalPlaces: number };
    itinerary?: Record<number, { name: string }[]>;
  } | undefined;

  const isCompleted = status === 'completed';

  return (
    <ToolRendererWrapper
      status={status}
      icon={<List className="w-4 h-4 text-purple-500" />}
      title="Trip details"
      subtitle={typedResult?.trip?.name || 'Loading...'}
      error={error}
    >
      <div className="p-3">
        {isCompleted && typedResult?.trip && (
          <motion.div
            className="p-3 bg-purple-50 rounded-lg border border-purple-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-sm font-medium text-gray-900 mb-1">
              {typedResult.trip.name}
            </div>
            {typedResult.trip.destination && (
              <div className="text-xs text-gray-500 mb-2">
                {typedResult.trip.destination}
              </div>
            )}
            <div className="flex gap-3 text-xs">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                {typedResult.trip.daysCount} days
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                {typedResult.trip.totalPlaces} places
              </span>
            </div>
          </motion.div>
        )}
        {!isCompleted && (
          <div className="text-xs text-gray-500">Loading trip details...</div>
        )}
      </div>
    </ToolRendererWrapper>
  );
}

// Update Day Info Renderer
export function UpdateDayInfoRenderer({ execution }: { execution: ToolExecution }) {
  const { status, args, result, error } = execution;
  const typedArgs = args as { day: number; title?: string; description?: string };
  const typedResult = result as {
    success: boolean;
    day?: number;
    title?: string;
    description?: string;
    tripName?: string;
  } | undefined;

  const isCompleted = status === 'completed';

  return (
    <ToolRendererWrapper
      status={status}
      icon={<FileText className="w-4 h-4 text-teal-500" />}
      title={`Updating Day ${typedArgs.day}`}
      subtitle={typedArgs.title || 'Setting day info'}
      error={error}
    >
      <div className="p-3">
        <motion.div
          className="p-3 bg-teal-50 rounded-lg border border-teal-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isCompleted ? 'bg-green-500' : 'bg-teal-200'
            }`}>
              {isCompleted ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <Calendar className="w-3 h-3 text-teal-600" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">
              Day {typedResult?.day || typedArgs.day}
            </span>
          </div>
          {(typedResult?.title || typedArgs.title) && (
            <div className="text-sm text-teal-700 font-medium mb-1">
              {typedResult?.title || typedArgs.title}
            </div>
          )}
          {(typedResult?.description || typedArgs.description) && (
            <div className="text-xs text-gray-600">
              {typedResult?.description || typedArgs.description}
            </div>
          )}
        </motion.div>
      </div>
    </ToolRendererWrapper>
  );
}
