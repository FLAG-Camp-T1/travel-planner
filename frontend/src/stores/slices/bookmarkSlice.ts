import {
  createBookmark as createBookmarkRequest,
  deleteBookmark as deleteBookmarkRequest,
  getBookmarks,
} from '@/api/bookmarkApi';
import type { AppStoreCreator, BookmarkSlice } from '../types';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Failed to update bookmarks.';
};

const clearPendingFlag = (pendingByPlaceId: Record<string, boolean>, googlePlaceId: string) => {
  const remainingPending = { ...pendingByPlaceId };
  delete remainingPending[googlePlaceId];
  return remainingPending;
};

export const createBookmarkSlice: AppStoreCreator<BookmarkSlice> = (set, get) => ({
  bookmarks: [],
  bookmarksStatus: 'idle',
  bookmarksError: null,
  pendingByPlaceId: {},

  fetchBookmarks: async () => {
    if (get().bookmarksStatus === 'loading') {
      return;
    }

    set(
      {
        bookmarksStatus: 'loading',
        bookmarksError: null,
      },
      false,
      'bookmarks/fetch:start',
    );

    try {
      const bookmarks = await getBookmarks();

      set(
        {
          bookmarks,
          bookmarksStatus: 'ready',
          bookmarksError: null,
        },
        false,
        'bookmarks/fetch:success',
      );
    } catch (error) {
      set(
        {
          bookmarksStatus: 'error',
          bookmarksError: getErrorMessage(error),
        },
        false,
        'bookmarks/fetch:error',
      );
    }
  },

  createBookmark: async (request) => {
    const { googlePlaceId } = request;

    if (get().pendingByPlaceId[googlePlaceId]) {
      return;
    }

    set(
      (state) => ({
        pendingByPlaceId: {
          ...state.pendingByPlaceId,
          [googlePlaceId]: true,
        },
        bookmarksError: null,
      }),
      false,
      'bookmarks/create:start',
    );

    try {
      const bookmark = await createBookmarkRequest(request);

      set(
        (state) => ({
          bookmarks: [
            ...state.bookmarks.filter((item) => item.googlePlaceId !== bookmark.googlePlaceId),
            bookmark,
          ],
          bookmarksStatus: 'ready',
          bookmarksError: null,
          pendingByPlaceId: clearPendingFlag(state.pendingByPlaceId, googlePlaceId),
        }),
        false,
        'bookmarks/create:success',
      );
    } catch (error) {
      set(
        (state) => ({
          bookmarksError: getErrorMessage(error),
          pendingByPlaceId: clearPendingFlag(state.pendingByPlaceId, googlePlaceId),
        }),
        false,
        'bookmarks/create:error',
      );
    }
  },

  removeBookmark: async (bookmarkId, googlePlaceId) => {
    if (get().pendingByPlaceId[googlePlaceId]) {
      return;
    }

    set(
      (state) => ({
        pendingByPlaceId: {
          ...state.pendingByPlaceId,
          [googlePlaceId]: true,
        },
        bookmarksError: null,
      }),
      false,
      'bookmarks/remove:start',
    );

    try {
      await deleteBookmarkRequest(bookmarkId);

      set(
        (state) => ({
          bookmarks: state.bookmarks.filter((bookmark) => bookmark.bookmarkId !== bookmarkId),
          bookmarksStatus: state.bookmarksStatus === 'idle' ? 'ready' : state.bookmarksStatus,
          bookmarksError: null,
          pendingByPlaceId: clearPendingFlag(state.pendingByPlaceId, googlePlaceId),
        }),
        false,
        'bookmarks/remove:success',
      );
    } catch (error) {
      set(
        (state) => ({
          bookmarksError: getErrorMessage(error),
          pendingByPlaceId: clearPendingFlag(state.pendingByPlaceId, googlePlaceId),
        }),
        false,
        'bookmarks/remove:error',
      );
    }
  },
});
