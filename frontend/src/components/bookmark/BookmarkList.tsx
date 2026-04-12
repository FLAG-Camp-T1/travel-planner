import type { ReactNode } from 'react';
import type { Bookmark } from '@/api/bookmarkApi';

type BookmarkListProps = {
  bookmarks: Bookmark[];
  className?: string;
  emptyMessage?: string;
  listClassName?: string;
  renderBookmark: (bookmark: Bookmark) => ReactNode;
};

export default function BookmarkList({
  bookmarks,
  className,
  emptyMessage = 'No saved bookmarks yet.',
  listClassName,
  renderBookmark,
}: BookmarkListProps) {
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
