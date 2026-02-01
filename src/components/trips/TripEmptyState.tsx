'use client';

import { MapPin, Plus, Sparkles, Calendar, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { CreateTripModal } from './CreateTripModal';
import { useTrips, useTripsStore } from '@/stores/tripsStore';
import type { TripStatus } from '@/types';

interface TripEmptyStateProps {
  hasTrips: boolean;
}

const statusConfig: Record<TripStatus, { label: string; color: string; bgColor: string }> = {
  planning: { label: 'Planning', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  upcoming: { label: 'Upcoming', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  ongoing: { label: 'Ongoing', color: 'text-green-600', bgColor: 'bg-green-100' },
  completed: { label: 'Completed', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export function TripEmptyState({ hasTrips }: TripEmptyStateProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const trips = useTrips();
  const setActiveTrip = useTripsStore((s) => s.setActiveTrip);

  if (!hasTrips) {
    // No trips created yet
    return (
      <>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Create your first trip to start planning your adventure. Add places, set dates, and organize your itinerary.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
          >
            <Plus className="w-4 h-4" />
            Create Your First Trip
          </button>
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
            <Sparkles className="w-3 h-3" />
            <span>Or ask the AI to create one for you</span>
          </div>
        </div>
        <CreateTripModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      </>
    );
  }

  // Has trips but no active trip selected - show trip list
  return (
    <>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Select a Trip</h3>
          <p className="text-sm text-gray-500 mt-1">Choose a trip to view and manage</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {trips.map((trip) => {
            const statusInfo = statusConfig[trip.status];
            return (
              <button
                key={trip.id}
                onClick={() => setActiveTrip(trip.id)}
                className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{trip.name}</span>
                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    {trip.destination && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-500">{trip.destination}</span>
                      </div>
                    )}
                    {trip.startDate && (
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      {trip.items.length} {trip.items.length === 1 ? 'place' : 'places'}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
          >
            <Plus className="w-4 h-4" />
            Create New Trip
          </button>
        </div>
      </div>
      <CreateTripModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </>
  );
}
