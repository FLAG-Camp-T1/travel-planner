import {
  createBookmark as createBookmarkRequest,
  deleteBookmark as deleteBookmarkRequest,
  updateBookmark as updateBookmarkRequest,
  getBookmarks,
} from '@/api/bookmarkApi';
import type { AppStoreCreator, BookmarkSlice } from '../types';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Failed to update bookmarks.';
};

const clearPendingFlag = (pendingByPlaceId: Record<string, boolean>, googlePlacesId: string) => {
  const remainingPending = { ...pendingByPlaceId };
  delete remainingPending[googlePlacesId];
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
    const { googlePlacesId } = request;

    if (get().pendingByPlaceId[googlePlacesId]) {
      return;
    }

    set(
      (state) => ({
        pendingByPlaceId: {
          ...state.pendingByPlaceId,
          [googlePlacesId]: true,
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
            ...state.bookmarks.filter((item) => item.googlePlacesId !== bookmark.googlePlacesId),
            bookmark,
          ],
          bookmarksStatus: 'ready',
          bookmarksError: null,
          pendingByPlaceId: clearPendingFlag(state.pendingByPlaceId, googlePlacesId),
        }),
        false,
        'bookmarks/create:success',
      );
    } catch (error) {
      set(
        (state) => ({
          bookmarksError: getErrorMessage(error),
          pendingByPlaceId: clearPendingFlag(state.pendingByPlaceId, googlePlacesId),
        }),
        false,
        'bookmarks/create:error',
      );
    }
  },

  updateBookmarkCategory: async (bookmarkId, categoryId) => {
    try {
      const updated = await updateBookmarkRequest(bookmarkId, categoryId);
      set(
        (state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.bookmarkId === bookmarkId ? updated : b,
          ),
        }),
        false,
        'bookmarks/updateCategory:success',
      );
    } catch (error) {
      set(
        { bookmarksError: getErrorMessage(error) },
        false,
        'bookmarks/updateCategory:error',
      );
    }
  },

  removeBookmark: async (bookmarkId, googlePlacesId) => {
    if (get().pendingByPlaceId[googlePlacesId]) {
      return;
    }

    set(
      (state) => ({
        pendingByPlaceId: {
          ...state.pendingByPlaceId,
          [googlePlacesId]: true,
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
          pendingByPlaceId: clearPendingFlag(state.pendingByPlaceId, googlePlacesId),
        }),
        false,
        'bookmarks/remove:success',
      );
    } catch (error) {
      set(
        (state) => ({
          bookmarksError: getErrorMessage(error),
          pendingByPlaceId: clearPendingFlag(state.pendingByPlaceId, googlePlacesId),
        }),
        false,
        'bookmarks/remove:error',
      );
    }
  },
});
