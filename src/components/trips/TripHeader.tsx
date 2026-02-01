'use client';

import { useState } from 'react';
import { MapPin, Calendar, Edit2, Trash2, MoreVertical, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripsStore } from '@/stores/tripsStore';
import { EditTripModal } from './EditTripModal';
import type { Trip, TripStatus } from '@/types';

const statusConfig: Record<TripStatus, { label: string; color: string; bgColor: string }> = {
  planning: { label: 'Planning', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  upcoming: { label: 'Upcoming', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  ongoing: { label: 'Ongoing', color: 'text-green-600', bgColor: 'bg-green-100' },
  completed: { label: 'Completed', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

interface TripHeaderProps {
  trip: Trip;
}

export function TripHeader({ trip }: TripHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteTrip = useTripsStore((s) => s.deleteTrip);
  const setActiveTrip = useTripsStore((s) => s.setActiveTrip);

  const statusInfo = statusConfig[trip.status];

  const formatDateRange = () => {
    if (!trip.startDate) return null;
    const start = new Date(trip.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (!trip.endDate) return start;
    const end = new Date(trip.endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} - ${end}`;
  };

  const handleDelete = () => {
    deleteTrip(trip.id);
    setShowDeleteConfirm(false);
    setIsMenuOpen(false);
  };

  const dateRange = formatDateRange();

  return (
    <>
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTrip(null)}
                className="flex items-center text-indigo-600 hover:text-indigo-700 -ml-1"
                title="All Trips"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 truncate">{trip.name}</h2>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {trip.destination && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500">{trip.destination}</span>
              </div>
            )}

            {dateRange && (
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500">{dateRange}</span>
              </div>
            )}

            {trip.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{trip.description}</p>
            )}
          </div>

          {/* Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 z-10"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsEditModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Trip
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Trip
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{trip.items.length}</div>
            <div className="text-xs text-gray-500">Places</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {trip.daysCount || Math.max(1, ...trip.items.map((i) => i.day), 1)}
            </div>
            <div className="text-xs text-gray-500">Days</div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditTripModal
        trip={trip}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-black/40 z-[100] pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-[101] p-6 pointer-events-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900">Delete Trip?</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete "{trip.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
