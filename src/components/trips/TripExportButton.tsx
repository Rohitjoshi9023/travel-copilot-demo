'use client';

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { exportTripToPDF } from '@/services/tripExport';
import type { Trip } from '@/types';

interface TripExportButtonProps {
  trip: Trip;
}

export function TripExportButton({ trip }: TripExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (trip.items.length === 0) {
      alert('Add some places to your trip before exporting.');
      return;
    }

    setIsExporting(true);
    try {
      await exportTripToPDF(trip, {
        includeNotes: true,
        includeAddress: true,
        includeTime: true,
      });
    } catch (error) {
      console.error('Failed to export trip:', error);
      alert('Failed to export trip. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export as PDF
        </>
      )}
    </button>
  );
}
