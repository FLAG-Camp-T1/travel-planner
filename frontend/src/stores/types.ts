import type { Bookmark, CreateBookmarkRequest } from '@/api/bookmarkApi';
import type { LoginCredentials, SignupData } from '@/api/authApi';
import type { PlaceDetailDto } from '@/api/placeApi';
import type { POIDto, POISearchRequest } from '@/api/poiApi';
import type {
  CreateTripDayItemRequest,
  CreateTripRequest,
  DayRouteSegment,
  DayRouteSummary,
  ItineraryItem,
  MoveTripDayItemRequest,
  ReorderTripDayItemsRequest,
  TripDay,
  TripSummary,
  UpdateTripDayItemRequest,
  UpdateTripRequest,
} from '@/api/tripApi';
import type { DayRouteColorMode } from '@/utils/dayRouteColorPresentation';
import type { StateCreator } from 'zustand';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';
export type AuthStatus = 'hydrating' | 'authenticated' | 'unauthenticated';
export type PlannerPanel = 'trips' | 'explore' | 'bookmarks';
export type TripDayCacheKey = string;

export interface BookmarkSlice {
  bookmarks: Bookmark[];
  bookmarksStatus: LoadStatus;
  bookmarksError: string | null;
  pendingByPlaceId: Record<string, boolean>;
  fetchBookmarks: () => Promise<void>;
  createBookmark: (request: CreateBookmarkRequest) => Promise<void>;
  removeBookmark: (bookmarkId: string, googlePlaceId: string) => Promise<void>;
}

export interface AuthSlice {
  token: string | null;
  authStatus: AuthStatus;
  authError: string | null;
  isAuthenticated: boolean;
  hydrateAuth: () => void;
  clearAuthError: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (
    userData: SignupData,
    options?: {
      autoLogin?: boolean;
    },
  ) => Promise<{
    redirectedToLogin: boolean;
  }>;
  logout: () => Promise<{
    serverSynced: boolean;
  }>;
}

export interface TripPlanningSlice {
  trips: TripSummary[];
  tripsStatus: LoadStatus;
  tripsError: string | null;
  activePlannerPanel: PlannerPanel;
  currentTrip: TripSummary | null;
  lastBootstrapTripId: number | null;
  days: TripDay[];
  selectedDayNumber: number | null;
  dayItemsByDayNumber: Record<TripDayCacheKey, ItineraryItem[]>;
  dayItemsStatusByDayNumber: Record<TripDayCacheKey, LoadStatus>;
  dayItemsErrorByDayNumber: Record<TripDayCacheKey, string | null>;
  dayRouteByDayNumber: Record<TripDayCacheKey, DayRouteSummary | null>;
  dayRouteSegmentsByDayNumber: Record<TripDayCacheKey, DayRouteSegment[]>;
  dayRouteStatusByDayNumber: Record<TripDayCacheKey, LoadStatus>;
  dayRouteErrorByDayNumber: Record<TripDayCacheKey, string | null>;
  dayRouteColorMode: DayRouteColorMode;
  tripStatus: LoadStatus;
  daysStatus: LoadStatus;
  tripError: string | null;
  daysError: string | null;
  tripCreationStatus: LoadStatus;
  tripCreationError: string | null;
  tripUpdateStatus: LoadStatus;
  tripUpdateError: string | null;
  tripDeletionStatus: LoadStatus;
  tripDeletionError: string | null;
  tripDeletionTargetId: number | null;
  dayItemCreationStatus: LoadStatus;
  dayItemCreationError: string | null;
  dayItemCreationTargetPlaceId: string | null;
  dayItemUpdateStatus: LoadStatus;
  dayItemUpdateError: string | null;
  dayItemUpdateTargetId: number | null;
  dayItemDeletionStatus: LoadStatus;
  dayItemDeletionError: string | null;
  dayItemDeletionTargetId: number | null;
  dayItemReorderStatus: LoadStatus;
  dayItemReorderError: string | null;
  dayItemReorderTargetId: number | null;
  dayItemMoveStatus: LoadStatus;
  dayItemMoveError: string | null;
  dayItemMoveTargetId: number | null;
  tripBootstrapStatus: LoadStatus;
  tripBootstrapError: string | null;
  fetchTrips: () => Promise<void>;
  setActivePlannerPanel: (panel: PlannerPanel) => void;
  createTrip: (request: CreateTripRequest) => Promise<void>;
  updateTrip: (tripId: number, request: UpdateTripRequest) => Promise<void>;
  deleteTrip: (tripId: number) => Promise<void>;
  bootstrapTrip: (tripId: number) => Promise<void>;
  fetchTrip: (tripId: number) => Promise<void>;
  fetchTripDays: (tripId: number) => Promise<void>;
  selectDay: (dayNumber: number) => void;
  setDayRouteColorMode: (mode: DayRouteColorMode) => void;
  fetchDayItems: (tripId: number, dayNumber: number) => Promise<void>;
  createDayItem: (
    tripId: number,
    dayNumber: number,
    request: CreateTripDayItemRequest,
  ) => Promise<void>;
  updateDayItem: (
    tripId: number,
    dayNumber: number,
    itemId: number,
    request: UpdateTripDayItemRequest,
  ) => Promise<void>;
  deleteDayItem: (tripId: number, dayNumber: number, itemId: number) => Promise<void>;
  reorderDayItems: (
    tripId: number,
    dayNumber: number,
    request: ReorderTripDayItemsRequest,
    targetItemId: number,
  ) => Promise<void>;
  moveDayItem: (
    tripId: number,
    dayNumber: number,
    itemId: number,
    request: MoveTripDayItemRequest,
  ) => Promise<void>;
  generateDayRoute: (tripId: number, dayNumber: number) => Promise<void>;
  clearTripPlanning: () => void;
}

export interface MapViewSlice {
  mapCenter: google.maps.LatLngLiteral;
  mapZoom: number;
  setMapCamera: (camera: { center: google.maps.LatLngLiteral; zoom: number }) => void;
}

export interface POISlice {
  poiResults: POIDto[];
  poiStatus: LoadStatus;
  poiError: string | null;
  selectedPOI: POIDto | null;
  hoveredPOI: POIDto | null;
  searchPOI: (request: POISearchRequest) => Promise<void>;
  selectPOI: (poi: POIDto | null) => void;
  setHoveredPOI: (poi: POIDto | null) => void;
  clearPOIResults: () => void;
}

export type DetailOverlayKind = 'poi' | 'bookmark';

export interface PlaceDetailSourceSummary {
  placeId: string;
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  categoryLabel: string | null;
  rating: number | null;
}

export interface ActiveDetailOverlay {
  kind: DetailOverlayKind;
  placeId: string;
  sourceSummary: PlaceDetailSourceSummary;
}

export interface PlaceDetailSlice {
  activeDetailOverlay: ActiveDetailOverlay | null;
  placeDetail: PlaceDetailDto | null;
  placeDetailStatus: LoadStatus;
  placeDetailError: string | null;
  openPlaceDetail: (overlay: ActiveDetailOverlay) => Promise<void>;
  closePlaceDetail: () => void;
}

export type AppStore = BookmarkSlice &
  AuthSlice &
  TripPlanningSlice &
  MapViewSlice &
  POISlice &
  PlaceDetailSlice;

export type AppStoreCreator<T> = StateCreator<AppStore, [['zustand/devtools', never]], [], T>;
