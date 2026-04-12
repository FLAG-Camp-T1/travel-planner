import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import BookmarkList from '@/components/bookmark/BookmarkList';
import ManageBookmarkCategoriesDialog from '@/components/bookmark/ManageBookmarkCategoriesDialog';
import SectionInfoHint from '@/components/trip-plan/SectionInfoHint';
import SavedBookmarkCard from '@/components/trip-plan/bookmark/SavedBookmarkCard';
import { useAppStore } from '@/stores/useAppStore';
import type { BookmarkCategoryFilter } from '@/stores/types';
import { getFilteredBookmarks, isSameBookmarkCategoryFilter } from '@/utils/bookmarkFilters';

const isFilterSelected = (
  currentFilter: BookmarkCategoryFilter,
  candidateFilter: BookmarkCategoryFilter,
) => {
  return isSameBookmarkCategoryFilter(currentFilter, candidateFilter);
};

export default function SavedBookmarksSection() {
  const {
    bookmarkCategories,
    bookmarkCategoriesError,
    bookmarkCategoriesStatus,
    bookmarks,
    bookmarksError,
    bookmarksStatus,
    fetchBookmarkCategories,
    fetchBookmarks,
    selectedBookmarkCategoryFilter,
    setBookmarkCategoryFilter,
  } = useAppStore(
    useShallow((state) => ({
      bookmarkCategories: state.bookmarkCategories,
      bookmarkCategoriesError: state.bookmarkCategoriesError,
      bookmarkCategoriesStatus: state.bookmarkCategoriesStatus,
      bookmarks: state.bookmarks,
      bookmarksError: state.bookmarksError,
      bookmarksStatus: state.bookmarksStatus,
      fetchBookmarkCategories: state.fetchBookmarkCategories,
      fetchBookmarks: state.fetchBookmarks,
      selectedBookmarkCategoryFilter: state.selectedBookmarkCategoryFilter,
      setBookmarkCategoryFilter: state.setBookmarkCategoryFilter,
    })),
  );

  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  useEffect(() => {
    if (bookmarksStatus === 'idle') {
      void fetchBookmarks();
    }
  }, [bookmarksStatus, fetchBookmarks]);

  useEffect(() => {
    if (bookmarkCategoriesStatus === 'idle') {
      void fetchBookmarkCategories();
    }
  }, [bookmarkCategoriesStatus, fetchBookmarkCategories]);

  const filteredBookmarks = useMemo(() => {
    return getFilteredBookmarks(bookmarks, selectedBookmarkCategoryFilter);
  }, [bookmarks, selectedBookmarkCategoryFilter]);
  const uncategorizedCount = useMemo(() => {
    return bookmarks.filter((bookmark) => !bookmark.category).length;
  }, [bookmarks]);
  const filterOptions = useMemo(() => {
    return [
      {
        key: 'all',
        label: 'All',
        count: bookmarks.length,
        filter: { kind: 'all' } as const,
      },
      ...bookmarkCategories.map((category) => ({
        key: `category-${category.categoryId}`,
        label: category.name,
        count: category.bookmarkCount,
        filter: { kind: 'category', categoryName: category.name } as const,
      })),
      {
        key: 'uncategorized',
        label: 'Uncategorized',
        count: uncategorizedCount,
        filter: { kind: 'uncategorized' } as const,
      },
    ];
  }, [bookmarkCategories, bookmarks.length, uncategorizedCount]);
  const emptyMessage =
    bookmarks.length === 0 ? 'No saved bookmarks yet.' : 'No bookmarks in this category.';

  return (
    <>
      <section className="space-y-3">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-700">Saved Bookmarks</h2>
              <SectionInfoHint tooltip="Review saved places, organize them with categories, and reuse them later in planning." />
            </div>

            <button
              type="button"
              onClick={() => setIsManageCategoriesOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              Manage Categories
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="text-sm font-medium text-gray-800">Bookmark Library</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const isSelected = isFilterSelected(selectedBookmarkCategoryFilter, option.filter);

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setBookmarkCategoryFilter(option.filter)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                    <span className={`ml-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      {option.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {bookmarkCategoriesError ? (
            <div className="border-b border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {bookmarkCategoriesError}
            </div>
          ) : null}

          {bookmarksStatus === 'loading' && bookmarks.length === 0 ? (
            <div className="px-4 py-4 text-sm text-gray-500">Loading saved bookmarks...</div>
          ) : null}

          {bookmarksStatus === 'error' ? (
            <div className="px-4 py-4 text-sm text-red-600">
              {bookmarksError ?? 'Failed to load bookmarks.'}
            </div>
          ) : null}

          {bookmarksStatus !== 'error' &&
          !(bookmarksStatus === 'loading' && bookmarks.length === 0) ? (
            <div className="px-4 py-3">
              <BookmarkList
                bookmarks={filteredBookmarks}
                emptyMessage={emptyMessage}
                listClassName="space-y-3"
                renderBookmark={(bookmark) => <SavedBookmarkCard bookmark={bookmark} />}
              />
            </div>
          ) : null}
        </div>
      </section>

      {isManageCategoriesOpen ? (
        <ManageBookmarkCategoriesDialog onClose={() => setIsManageCategoriesOpen(false)} />
      ) : null}
    </>
  );
}
