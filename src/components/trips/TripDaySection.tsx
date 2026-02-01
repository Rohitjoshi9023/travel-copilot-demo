'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Calendar, Plus, ChevronDown, ChevronUp, Edit2, X, Check } from 'lucide-react';
import { TripItemCard } from './TripItemCard';
import { TripItemEditor } from './TripItemEditor';
import { useTripsStore } from '@/stores/tripsStore';
import type { TripItem, TripDayInfo } from '@/types';

interface TripDaySectionProps {
  tripId: string;
  day: number;
  items: TripItem[];
  startDate?: string;
  dayInfo?: TripDayInfo;
}

export function TripDaySection({ tripId, day, items, startDate, dayInfo }: TripDaySectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingItem, setEditingItem] = useState<TripItem | null>(null);
  const [isEditingDay, setIsEditingDay] = useState(false);
  const [dayTitle, setDayTitle] = useState(dayInfo?.title || '');
  const [dayDescription, setDayDescription] = useState(dayInfo?.description || '');

  const removeItemFromTrip = useTripsStore((s) => s.removeItemFromTrip);
  const updateDayInfo = useTripsStore((s) => s.updateDayInfo);

  // Make the day section a droppable area
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day}`,
  });

  const handleDelete = (itemId: string) => {
    removeItemFromTrip(tripId, itemId);
  };

  const handleEdit = (item: TripItem) => {
    setEditingItem(item);
  };

  const handleSaveDayInfo = () => {
    updateDayInfo(tripId, day, {
      title: dayTitle.trim() || undefined,
      description: dayDescription.trim() || undefined,
    });
    setIsEditingDay(false);
  };

  const handleCancelDayEdit = () => {
    setDayTitle(dayInfo?.title || '');
    setDayDescription(dayInfo?.description || '');
    setIsEditingDay(false);
  };

  // Calculate the date for this day
  const getDayDate = () => {
    if (!startDate) return null;
    const date = new Date(startDate);
    date.setDate(date.getDate() + day - 1);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const dayDate = getDayDate();

  return (
    <div
      ref={setNodeRef}
      className={`border rounded-xl overflow-hidden bg-white transition-colors ${
        isOver ? 'border-indigo-400 bg-indigo-50/30' : 'border-gray-200'
      }`}
    >
      {/* Day Header */}
      <div className="bg-gray-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-nowrap">
                <h3 className="text-sm font-semibold text-gray-900 whitespace-nowrap flex-shrink-0">Day {day}</h3>
                {dayInfo?.title && !isEditingDay && (
                  <span className="text-xs text-indigo-500 truncate">
                    — {dayInfo.title}
                  </span>
                )}
              </div>
              {dayDate && <p className="text-xs text-gray-500">{dayDate}</p>}
              {dayInfo?.description && !isEditingDay && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{dayInfo.description}</p>
              )}
            </div>
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isEditingDay && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingDay(true);
                }}
                className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit day title"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
              {items.length} {items.length === 1 ? 'place' : 'places'}
            </span>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Day Title/Description Edit Form */}
        {isEditingDay && (
          <div className="px-4 pb-3 space-y-2 border-t border-gray-100 pt-3">
            <input
              type="text"
              value={dayTitle}
              onChange={(e) => setDayTitle(e.target.value)}
              placeholder="Day title (e.g., Beach & Adventure)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
              autoFocus
            />
            <textarea
              value={dayDescription}
              onChange={(e) => setDayDescription(e.target.value)}
              placeholder="Brief description of the day's activities..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelDayEdit}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5 inline mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSaveDayInfo}
                className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#4f46e5' }}
              >
                <Check className="w-3.5 h-3.5 inline mr-1" />
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      {!isCollapsed && (
        <div className="p-3 space-y-2 min-h-[60px]">
          {items.length === 0 ? (
            <div className={`flex flex-col items-center py-6 text-center rounded-lg transition-colors ${
              isOver ? 'bg-indigo-100/50 border-2 border-dashed border-indigo-300' : ''
            }`}>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <Plus className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                {isOver ? 'Drop here to add' : 'No places added yet'}
              </p>
              {!isOver && (
                <p className="text-xs text-gray-400 mt-1">
                  Drag places here or search to add
                </p>
              )}
            </div>
          ) : (
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <TripItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          )}
        </div>
      )}

      {/* Item Editor Modal */}
      <TripItemEditor
        tripId={tripId}
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
}
