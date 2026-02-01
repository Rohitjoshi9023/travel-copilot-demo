'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, MapPin, Calendar, Check } from 'lucide-react';
import { useTripsStore, useTrips, useActiveTripId } from '@/stores/tripsStore';
import { CreateTripModal } from './CreateTripModal';
import type { TripStatus } from '@/types';

const statusConfig: Record<TripStatus, { label: string; color: string; bgColor: string }> = {
  planning: { label: 'Planning', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  upcoming: { label: 'Upcoming', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  ongoing: { label: 'Ongoing', color: 'text-green-600', bgColor: 'bg-green-100' },
  completed: { label: 'Completed', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export function TripSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const trips = useTrips();
  const activeTripId = useActiveTripId();
  const setActiveTrip = useTripsStore((s) => s.setActiveTrip);

  const activeTrip = trips.find((t) => t.id === activeTripId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTrip = (tripId: string) => {
    setActiveTrip(tripId);
    setIsOpen(false);
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate) return null;
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!endDate) return start;
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <>
      <div className="relative pointer-events-auto" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors min-w-[140px] max-w-[200px]"
          style={{ backgroundColor: '#ffffff' }}
        >
          <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 truncate flex-1 text-left">
            {activeTrip ? activeTrip.name : 'Select Trip'}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
            >
              {/* Trip List */}
              <div className="max-h-[300px] overflow-y-auto">
                {trips.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No trips yet</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first trip to get started</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {trips.map((trip) => {
                      const statusInfo = statusConfig[trip.status];
                      const isActive = trip.id === activeTripId;
                      const dateRange = formatDateRange(trip.startDate, trip.endDate);

                      return (
                        <button
                          key={trip.id}
                          onClick={() => handleSelectTrip(trip.id)}
                          className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                            isActive ? 'bg-indigo-50' : ''
                          }`}
                        >
                          {/* Check mark for active */}
                          <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                            {isActive && (
                              <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Trip info */}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {trip.name}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 text-xs font-medium rounded ${statusInfo.bgColor} ${statusInfo.color}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                            {trip.destination && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500 truncate">{trip.destination}</span>
                              </div>
                            )}
                            {dateRange && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{dateRange}</span>
                              </div>
                            )}
                          </div>

                          {/* Item count */}
                          <div className="flex-shrink-0 text-right">
                            <span className="text-xs text-gray-400">
                              {trip.items.length} {trip.items.length === 1 ? 'place' : 'places'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Create New Trip Button */}
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Trip
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
