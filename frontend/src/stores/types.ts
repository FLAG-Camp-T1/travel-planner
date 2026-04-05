import type { Bookmark, CreateBookmarkRequest } from '@/api/bookmarkApi';
import type { BookmarkCategory } from '@/api/bookmarkCategoryApi';
import type { LoginCredentials, SignupData } from '@/api/authApi';
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
  updateBookmarkCategory: (bookmarkId: string, categoryId: number | null) => Promise<void>;
  removeBookmark: (bookmarkId: string, googlePlacesId: string) => Promise<void>;
}

export interface CategorySlice {
  categories: BookmarkCategory[];
  categoriesStatus: LoadStatus;
  categoriesError: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (categoryName: string) => Promise<BookmarkCategory>;
  removeCategory: (categoryId: number) => Promise<void>;
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

export type AppStore = RouteSlice & BookmarkSlice & CategorySlice & AuthSlice;

export type AppStoreCreator<T> = StateCreator<AppStore, [['zustand/devtools', never]], [], T>;
