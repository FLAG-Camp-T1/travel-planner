import {
  createBookmark as createBookmarkRequest,
  createBookmarkCategory as createBookmarkCategoryRequest,
  deleteBookmarkCategory as deleteBookmarkCategoryRequest,
  deleteBookmark as deleteBookmarkRequest,
  getBookmarkCategories,
  getBookmarks,
  updateBookmark as updateBookmarkRequest,
} from '@/api/bookmarkApi';
import type { Bookmark, BookmarkCategory, CreateBookmarkRequest } from '@/api/bookmarkApi';
import type { AppStoreCreator, BookmarkSlice } from '../types';
import {
  DEFAULT_BOOKMARK_CATEGORY_FILTER,
  isSameBookmarkCategoryFilter,
} from '@/utils/bookmarkFilters';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Failed to update bookmarks.';
};

const clearPendingFlag = (pendingByPlaceId: Record<string, boolean>, googlePlaceId: string) => {
  const remainingPending = { ...pendingByPlaceId };
  delete remainingPending[googlePlaceId];
  return remainingPending;
};

const buildOptimisticBookmark = (request: CreateBookmarkRequest): Bookmark => {
  return {
    bookmarkId: `optimistic-${request.googlePlaceId}`,
    poiId: `optimistic-${request.googlePlaceId}`,
    googlePlaceId: request.googlePlaceId,
    poiName: request.poiName,
    poiAddress: request.poiAddress,
    poiLatitude: request.poiLatitude,
    poiLongitude: request.poiLongitude,
    category: request.category ?? null,
  };
};

const sortCategories = (categories: BookmarkCategory[]) => {
  return [...categories].sort((left, right) => left.name.localeCompare(right.name));
};

const refreshBookmarkCategoriesIfLoaded = (get: () => BookmarkSlice) => {
  if (get().bookmarkCategoriesStatus === 'idle') {
    return;
  }

  void get().fetchBookmarkCategories();
};

export const createBookmarkSlice: AppStoreCreator<BookmarkSlice> = (set, get) => ({
  bookmarks: [],
  bookmarksStatus: 'idle',
  bookmarksError: null,
  bookmarkCategories: [],
  bookmarkCategoriesStatus: 'idle',
  bookmarkCategoriesError: null,
  bookmarkCategoryDeleteStatus: 'idle',
  bookmarkCategoryDeleteError: null,
  bookmarkCategoryDeleteTargetId: null,
  hoveredBookmarkId: null,
  selectedBookmarkCategoryFilter: DEFAULT_BOOKMARK_CATEGORY_FILTER,
  bookmarkUpdateStatus: 'idle',
  bookmarkUpdateError: null,
  bookmarkUpdateTargetId: null,
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
          hoveredBookmarkId:
            get().hoveredBookmarkId &&
            bookmarks.some((bookmark) => bookmark.bookmarkId === get().hoveredBookmarkId)
              ? get().hoveredBookmarkId
              : null,
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

  fetchBookmarkCategories: async () => {
    if (get().bookmarkCategoriesStatus === 'loading') {
      return;
    }

    set(
      {
        bookmarkCategoriesStatus: 'loading',
        bookmarkCategoriesError: null,
      },
      false,
      'bookmark-categories/fetch:start',
    );

    try {
      const bookmarkCategories = await getBookmarkCategories();

      set(
        {
          bookmarkCategories: sortCategories(bookmarkCategories),
          bookmarkCategoriesStatus: 'ready',
          bookmarkCategoriesError: null,
        },
        false,
        'bookmark-categories/fetch:success',
      );
    } catch (error) {
      set(
        {
          bookmarkCategoriesStatus: 'error',
          bookmarkCategoriesError: getErrorMessage(error),
        },
        false,
        'bookmark-categories/fetch:error',
      );
    }
  },

  createBookmark: async (request) => {
    const { googlePlaceId } = request;
    const optimisticBookmark = buildOptimisticBookmark(request);

    if (get().pendingByPlaceId[googlePlaceId]) {
      return;
    }

    set(
      (state) => ({
        bookmarks: [
          ...state.bookmarks.filter((item) => item.googlePlaceId !== googlePlaceId),
          optimisticBookmark,
        ],
        bookmarksStatus: state.bookmarksStatus === 'idle' ? 'ready' : state.bookmarksStatus,
        bookmarksError: null,
        pendingByPlaceId: {
          ...state.pendingByPlaceId,
          [googlePlaceId]: true,
        },
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

      refreshBookmarkCategoriesIfLoaded(get);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      set(
        (state) => ({
          bookmarks: state.bookmarks.filter((item) => item.googlePlaceId !== googlePlaceId),
          bookmarksError: errorMessage,
          pendingByPlaceId: clearPendingFlag(state.pendingByPlaceId, googlePlaceId),
        }),
        false,
        'bookmarks/create:error',
      );

      throw error instanceof Error ? error : new Error(errorMessage);
    }
  },

  createBookmarkCategory: async (name) => {
    set(
      {
        bookmarkCategoriesStatus: 'loading',
        bookmarkCategoriesError: null,
      },
      false,
      'bookmark-categories/create:start',
    );

    try {
      const createdCategory = await createBookmarkCategoryRequest({ name });

      set(
        (state) => ({
          bookmarkCategories: sortCategories([
            ...state.bookmarkCategories.filter(
              (category) => category.categoryId !== createdCategory.categoryId,
            ),
            createdCategory,
          ]),
          bookmarkCategoriesStatus: 'ready',
          bookmarkCategoriesError: null,
        }),
        false,
        'bookmark-categories/create:success',
      );

      return createdCategory;
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      set(
        {
          bookmarkCategoriesStatus: 'error',
          bookmarkCategoriesError: errorMessage,
        },
        false,
        'bookmark-categories/create:error',
      );

      throw error instanceof Error ? error : new Error(errorMessage);
    }
  },

  deleteBookmarkCategory: async (categoryId, deleteBookmarks) => {
    set(
      {
        bookmarkCategoryDeleteStatus: 'loading',
        bookmarkCategoryDeleteError: null,
        bookmarkCategoryDeleteTargetId: categoryId,
      },
      false,
      'bookmark-categories/delete:start',
    );

    try {
      await deleteBookmarkCategoryRequest(categoryId, deleteBookmarks);

      set(
        (state) => ({
          bookmarkCategories: state.bookmarkCategories.filter(
            (category) => category.categoryId !== categoryId,
          ),
          bookmarkCategoryDeleteStatus: 'ready',
          bookmarkCategoryDeleteError: null,
          bookmarkCategoryDeleteTargetId: null,
        }),
        false,
        'bookmark-categories/delete:success',
      );

      await Promise.all([get().fetchBookmarks(), get().fetchBookmarkCategories()]);

      const currentFilter = get().selectedBookmarkCategoryFilter;
      const categoryStillExists =
        currentFilter.kind === 'category'
          ? get().bookmarkCategories.some(
              (category) => category.name === currentFilter.categoryName,
            )
          : true;

      if (currentFilter.kind === 'category' && !categoryStillExists) {
        set(
          {
            selectedBookmarkCategoryFilter: DEFAULT_BOOKMARK_CATEGORY_FILTER,
          },
          false,
          'bookmark-categories/filter:reset-after-delete',
        );
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      set(
        {
          bookmarkCategoryDeleteStatus: 'error',
          bookmarkCategoryDeleteError: errorMessage,
          bookmarkCategoryDeleteTargetId: categoryId,
        },
        false,
        'bookmark-categories/delete:error',
      );

      throw error instanceof Error ? error : new Error(errorMessage);
    }
  },

  setHoveredBookmarkId: (bookmarkId) => {
    set(
      {
        hoveredBookmarkId: bookmarkId,
      },
      false,
      'bookmarks/hover',
    );
  },

  setBookmarkCategoryFilter: (filter) => {
    if (isSameBookmarkCategoryFilter(get().selectedBookmarkCategoryFilter, filter)) {
      return;
    }

    set(
      {
        selectedBookmarkCategoryFilter: filter,
      },
      false,
      'bookmark-categories/filter:set',
    );
  },

  updateBookmarkCategory: async (bookmarkId, category) => {
    const existingBookmark = get().bookmarks.find((bookmark) => bookmark.bookmarkId === bookmarkId);
    if (!existingBookmark) {
      throw new Error(`Bookmark ${bookmarkId} not found.`);
    }

    const normalizedCategory = category?.trim() ? category.trim() : null;

    set(
      (state) => ({
        bookmarks: state.bookmarks.map((bookmark) =>
          bookmark.bookmarkId === bookmarkId
            ? { ...bookmark, category: normalizedCategory }
            : bookmark,
        ),
        bookmarkUpdateStatus: 'loading',
        bookmarkUpdateError: null,
        bookmarkUpdateTargetId: bookmarkId,
      }),
      false,
      'bookmarks/update:start',
    );

    try {
      const updatedBookmark = await updateBookmarkRequest(bookmarkId, {
        category: normalizedCategory,
      });

      set(
        (state) => ({
          bookmarks: state.bookmarks.map((bookmark) =>
            bookmark.bookmarkId === bookmarkId ? updatedBookmark : bookmark,
          ),
          bookmarkUpdateStatus: 'ready',
          bookmarkUpdateError: null,
          bookmarkUpdateTargetId: null,
        }),
        false,
        'bookmarks/update:success',
      );

      refreshBookmarkCategoriesIfLoaded(get);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      set(
        (state) => ({
          bookmarks: state.bookmarks.map((bookmark) =>
            bookmark.bookmarkId === bookmarkId ? existingBookmark : bookmark,
          ),
          bookmarkUpdateStatus: 'error',
          bookmarkUpdateError: errorMessage,
          bookmarkUpdateTargetId: bookmarkId,
        }),
        false,
        'bookmarks/update:error',
      );

      throw error instanceof Error ? error : new Error(errorMessage);
    }
  },

  removeBookmark: async (bookmarkId, googlePlaceId) => {
    const existingBookmarks = get().bookmarks;
    const removedBookmarkIndex = existingBookmarks.findIndex(
      (bookmark) => bookmark.bookmarkId === bookmarkId,
    );
    const removedBookmark =
      removedBookmarkIndex >= 0 ? existingBookmarks[removedBookmarkIndex] : undefined;

    if (get().pendingByPlaceId[googlePlaceId]) {
      return;
    }

    set(
      (state) => ({
        bookmarks: state.bookmarks.filter((bookmark) => bookmark.bookmarkId !== bookmarkId),
        bookmarksStatus: state.bookmarksStatus === 'idle' ? 'ready' : state.bookmarksStatus,
        bookmarksError: null,
        pendingByPlaceId: {
          ...state.pendingByPlaceId,
          [googlePlaceId]: true,
        },
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

      refreshBookmarkCategoriesIfLoaded(get);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      set(
        (state) => ({
          bookmarks:
            removedBookmark &&
            !state.bookmarks.some((bookmark) => bookmark.bookmarkId === bookmarkId)
              ? [
                  ...state.bookmarks.slice(0, Math.max(removedBookmarkIndex, 0)),
                  removedBookmark,
                  ...state.bookmarks.slice(Math.max(removedBookmarkIndex, 0)),
                ]
              : state.bookmarks,
          bookmarksError: errorMessage,
          pendingByPlaceId: clearPendingFlag(state.pendingByPlaceId, googlePlaceId),
        }),
        false,
        'bookmarks/remove:error',
      );

      throw error instanceof Error ? error : new Error(errorMessage);
    }
  },
});
