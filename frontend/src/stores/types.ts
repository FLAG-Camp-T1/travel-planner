import type { Bookmark, CreateBookmarkRequest } from '@/api/bookmarkApi';
import type { LoginCredentials, SignupData } from '@/api/authApi';
import type { POIDto, POISearchRequest } from '@/api/poiApi';
import type { RouteSummary } from '@/api/routeApi';
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

export interface POISlice {
  poiResults: POIDto[];
  poiStatus: LoadStatus;
  poiError: string | null;
  selectedPOI: POIDto | null;
  searchPOI: (request: POISearchRequest) => Promise<void>;
  selectPOI: (poi: POIDto | null) => void;
  clearPOIResults: () => void;
}

export type AppStore = RouteSlice & BookmarkSlice & AuthSlice & POISlice;

export type AppStoreCreator<T> = StateCreator<AppStore, [['zustand/devtools', never]], [], T>;
