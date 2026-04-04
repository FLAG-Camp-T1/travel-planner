import type { Bookmark, CreateBookmarkRequest } from '@/api/bookmarkApi';
import type { LoginCredentials, SignupData } from '@/api/authApi';
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

export type AppStore = RouteSlice & BookmarkSlice & AuthSlice & TripPlanningSlice;

export type AppStoreCreator<T> = StateCreator<AppStore, [['zustand/devtools', never]], [], T>;
