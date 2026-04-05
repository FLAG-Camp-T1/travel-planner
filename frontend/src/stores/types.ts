import type { Bookmark, CreateBookmarkRequest } from '@/api/bookmarkApi';
import type { LoginCredentials, SignupData } from '@/api/authApi';
import type { PlaceDetailDto } from '@/api/placeApi';
import type { POIDto, POISearchRequest } from '@/api/poiApi';
import type { RouteSummary } from '@/api/routeApi';
import type {
  CreateTripRequest,
  DayRouteSegment,
  DayRouteSummary,
  ItineraryItem,
  TripDay,
  TripSummary,
} from '@/api/tripApi';
import type { StateCreator } from 'zustand';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';
export type AuthStatus = 'hydrating' | 'authenticated' | 'unauthenticated';
export type PlannerPanel = 'trips' | 'explore' | 'bookmarks';
export type TripDayCacheKey = string;

export interface RouteSlice {
  originId: string | null;
  destinationId: string | null;
  routeSummary: RouteSummary | null;
  routeStatus: LoadStatus;
  routeError: string | null;
  requestRoute: (originId: string, destinationId: string) => Promise<void>;
  clearRoute: () => void;
}

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
  currentTrip: TripSummary | null;
  lastBootstrapTripId: number | null;
  days: TripDay[];
  selectedDayNumber: number | null;
  dayItemsByDayNumber: Record<number, ItineraryItem[]>;
  dayItemsStatusByDayNumber: Record<number, LoadStatus>;
  dayItemsErrorByDayNumber: Record<number, string | null>;
  dayRouteByDayNumber: Record<number, DayRouteSummary | null>;
  dayRouteSegmentsByDayNumber: Record<number, DayRouteSegment[]>;
  dayRouteStatusByDayNumber: Record<number, LoadStatus>;
  dayRouteErrorByDayNumber: Record<number, string | null>;
  tripStatus: LoadStatus;
  daysStatus: LoadStatus;
  tripError: string | null;
  daysError: string | null;
  tripCreationStatus: LoadStatus;
  tripCreationError: string | null;
  tripBootstrapStatus: LoadStatus;
  tripBootstrapError: string | null;
  createTrip: (request: CreateTripRequest) => Promise<void>;
  bootstrapTrip: (tripId: number) => Promise<void>;
  fetchTrip: (tripId: number) => Promise<void>;
  fetchTripDays: (tripId: number) => Promise<void>;
  selectDay: (dayNumber: number) => void;
  fetchDayItems: (tripId: number, dayNumber: number) => Promise<void>;
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
  name: string;
  address: string;
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

export type AppStore = RouteSlice &
  BookmarkSlice &
  AuthSlice &
  TripPlanningSlice &
  MapViewSlice &
  POISlice &
  PlaceDetailSlice;

export type AppStoreCreator<T> = StateCreator<AppStore, [['zustand/devtools', never]], [], T>;
