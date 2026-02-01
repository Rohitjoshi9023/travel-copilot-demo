import type { ComponentType } from 'react';
import { FlyToLocationRenderer } from './FlyToLocationRenderer';
import { SearchPlacesRenderer } from './SearchPlacesRenderer';
import { SearchNearbyRenderer } from './SearchNearbyRenderer';
import { SetMapViewRenderer } from './SetMapViewRenderer';
import { AddMarkerRenderer } from './AddMarkerRenderer';
import { ClearMarkersRenderer } from './ClearMarkersRenderer';
import { GetPlaceDetailsRenderer } from './GetPlaceDetailsRenderer';
import { GetDirectionsRenderer } from './GetDirectionsRenderer';
import { AddToItineraryRenderer } from './AddToItineraryRenderer';
import { AdjustZoomRenderer } from './AdjustZoomRenderer';
import { CreateTripRenderer } from './CreateTripRenderer';
import { ListTripsRenderer } from './ListTripsRenderer';
import {
  DeleteTripRenderer,
  DeleteTripItemRenderer,
  MoveTripItemRenderer,
  RemovePlacesFromTripRenderer,
  ReschedulePlacesRenderer,
  GetTripDetailsRenderer,
  UpdateDayInfoRenderer,
} from './TripManagementRenderers';
import type { ToolExecution } from './ToolRendererWrapper';

// Type for a tool renderer that accepts an execution prop
type ToolRenderer = ComponentType<{ execution: ToolExecution }>;

// Renderers map matching the SDK's ToolRenderers type
export const toolRenderers: Record<string, ToolRenderer> = {
  flyToLocation: FlyToLocationRenderer,
  searchPlaces: SearchPlacesRenderer,
  searchNearby: SearchNearbyRenderer,
  setMapView: SetMapViewRenderer,
  addMarker: AddMarkerRenderer,
  clearMarkers: ClearMarkersRenderer,
  getPlaceDetails: GetPlaceDetailsRenderer,
  getDirections: GetDirectionsRenderer,
  addToItinerary: AddToItineraryRenderer,
  adjustZoom: AdjustZoomRenderer,
  createTrip: CreateTripRenderer,
  listTrips: ListTripsRenderer,
  deleteTrip: DeleteTripRenderer,
  deleteTripItem: DeleteTripItemRenderer,
  moveTripItem: MoveTripItemRenderer,
  removePlacesFromTrip: RemovePlacesFromTripRenderer,
  reschedulePlaces: ReschedulePlacesRenderer,
  getTripDetails: GetTripDetailsRenderer,
  updateDayInfo: UpdateDayInfoRenderer,
};

export type ToolName = keyof typeof toolRenderers;

export { ToolRendererWrapper } from './ToolRendererWrapper';
export type { ToolStatus, ToolExecution } from './ToolRendererWrapper';
