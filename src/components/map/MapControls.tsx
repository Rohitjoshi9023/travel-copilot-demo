'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Minus,
  Compass,
  Locate,
  Layers,
  Moon,
  Sun,
} from 'lucide-react';
import { useMapStore } from '@/stores/mapStore';

interface MapControlsProps {
  onLocateUser?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function MapControls({
  onLocateUser,
  isDarkMode = false,
  onToggleDarkMode,
}: MapControlsProps) {
  const { camera, setCamera, viewMode, setViewMode } = useMapStore();

  const handleZoomIn = useCallback(() => {
    setCamera({ zoom: Math.min(camera.zoom + 1, 20) });
  }, [camera.zoom, setCamera]);

  const handleZoomOut = useCallback(() => {
    setCamera({ zoom: Math.max(camera.zoom - 1, 1) });
  }, [camera.zoom, setCamera]);

  const handleResetNorth = useCallback(() => {
    setCamera({ heading: 0 });
  }, [setCamera]);

  const handleResetTilt = useCallback(() => {
    setCamera({ tilt: 0, heading: 0 });
  }, [setCamera]);

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
      {/* Zoom controls */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <ControlButton
          icon={Plus}
          onClick={handleZoomIn}
          label="Zoom in"
        />
        <div className="h-px bg-gray-200" />
        <ControlButton
          icon={Minus}
          onClick={handleZoomOut}
          label="Zoom out"
        />
      </div>

      {/* Compass / Reset North */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <ControlButton
          icon={Compass}
          onClick={viewMode === 'map3d' ? handleResetTilt : handleResetNorth}
          label="Reset north"
          rotation={camera.heading}
        />
      </div>

      {/* Locate user */}
      {onLocateUser && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <ControlButton
            icon={Locate}
            onClick={onLocateUser}
            label="My location"
          />
        </div>
      )}

      {/* Theme toggle */}
      {onToggleDarkMode && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <ControlButton
            icon={isDarkMode ? Sun : Moon}
            onClick={onToggleDarkMode}
            label={isDarkMode ? 'Light mode' : 'Dark mode'}
          />
        </div>
      )}
    </div>
  );
}

interface ControlButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  label: string;
  rotation?: number;
  isActive?: boolean;
}

function ControlButton({
  icon: Icon,
  onClick,
  label,
  rotation = 0,
  isActive = false,
}: ControlButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        p-2.5 transition-colors
        ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}
      `}
      title={label}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Icon className="w-5 h-5" />
      </motion.div>
    </motion.button>
  );
}

// Bottom controls for mobile
export function MapControlsBottom({
  onLocateUser,
}: {
  onLocateUser?: () => void;
}) {
  const { camera, setCamera } = useMapStore();

  const handleZoomIn = useCallback(() => {
    setCamera({ zoom: Math.min(camera.zoom + 1, 20) });
  }, [camera.zoom, setCamera]);

  const handleZoomOut = useCallback(() => {
    setCamera({ zoom: Math.max(camera.zoom - 1, 1) });
  }, [camera.zoom, setCamera]);

  return (
    <div className="absolute bottom-24 right-4 z-10 flex flex-col gap-2">
      <div className="bg-white rounded-full shadow-lg overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="p-3 text-gray-600 hover:bg-gray-50"
          title="Zoom in"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="bg-white rounded-full shadow-lg overflow-hidden">
        <button
          onClick={handleZoomOut}
          className="p-3 text-gray-600 hover:bg-gray-50"
          title="Zoom out"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
      {onLocateUser && (
        <div className="bg-white rounded-full shadow-lg overflow-hidden">
          <button
            onClick={onLocateUser}
            className="p-3 text-gray-600 hover:bg-gray-50"
            title="My location"
          >
            <Locate className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
