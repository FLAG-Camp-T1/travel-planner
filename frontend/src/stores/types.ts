import type { Bookmark, CreateBookmarkRequest } from '@/api/bookmarkApi';
import type { RouteSummary } from '@/api/routeApi';
import type { StateCreator } from 'zustand';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

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

export type AppStore = RouteSlice & BookmarkSlice;

export type AppStoreCreator<T> = StateCreator<AppStore, [['zustand/devtools', never]], [], T>;
