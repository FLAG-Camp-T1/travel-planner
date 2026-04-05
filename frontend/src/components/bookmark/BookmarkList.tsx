import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Bookmark } from '@/api/bookmarkApi';
import { useAppStore } from '@/stores/useAppStore';
import BookmarkButton from './BookmarkButton';

type BookmarkListProps = {
  className?: string;
  emptyMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  listClassName?: string;
  renderBookmark?: (bookmark: Bookmark) => ReactNode;
};

const defaultRenderBookmark = (bookmark: Bookmark) => {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium text-gray-900">{bookmark.poiName}</h3>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
            Bookmark
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-500">{bookmark.poiAddress}</p>

        {bookmark.category ? (
          <div className="mt-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {bookmark.category}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col items-end gap-2">
        <BookmarkButton
          googlePlaceId={bookmark.googlePlaceId}
          poiName={bookmark.poiName}
          poiAddress={bookmark.poiAddress}
          poiLatitude={bookmark.poiLatitude}
          poiLongitude={bookmark.poiLongitude}
          category={bookmark.category}
        />
      </div>
    </div>
  );
};

export default function BookmarkList({
  className,
  emptyMessage = 'No saved bookmarks yet.',
  errorMessage,
  loadingMessage = 'Loading bookmarks.',
  listClassName,
  renderBookmark = defaultRenderBookmark,
}: BookmarkListProps) {
  const { bookmarks, bookmarksError, bookmarksStatus, fetchBookmarks } = useAppStore(
    useShallow((state) => ({
      bookmarks: state.bookmarks,
      bookmarksError: state.bookmarksError,
      bookmarksStatus: state.bookmarksStatus,
      fetchBookmarks: state.fetchBookmarks,
    })),
  );

  useEffect(() => {
    if (bookmarksStatus === 'idle') {
      void fetchBookmarks();
    }
  }, [bookmarksStatus, fetchBookmarks]);

  if (bookmarksStatus === 'idle' || bookmarksStatus === 'loading') {
    return (
      <div className={`px-4 py-4 text-sm text-gray-500 ${className ?? ''}`}>{loadingMessage}</div>
    );
  }

  if (bookmarksStatus === 'error') {
    return (
      <div className={`px-4 py-4 text-sm text-red-600 ${className ?? ''}`}>
        {bookmarksError ?? errorMessage ?? 'Failed to load bookmarks.'}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className={`px-4 py-4 text-sm text-gray-500 ${className ?? ''}`}>{emptyMessage}</div>
    );
  }

  return (
    <div className={className}>
      <div className={listClassName ?? 'space-y-3'}>
        {bookmarks.map((bookmark) => (
          <div key={bookmark.bookmarkId}>{renderBookmark(bookmark)}</div>
        ))}
      </div>
    </div>
  );
}
