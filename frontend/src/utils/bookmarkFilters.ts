import type { Bookmark } from '@/api/bookmarkApi';
import type { BookmarkCategoryFilter } from '@/stores/types';

export const DEFAULT_BOOKMARK_CATEGORY_FILTER: BookmarkCategoryFilter = { kind: 'all' };

export const isSameBookmarkCategoryFilter = (
  left: BookmarkCategoryFilter,
  right: BookmarkCategoryFilter,
) => {
  if (left.kind !== right.kind) {
    return false;
  }

  if (left.kind !== 'category' || right.kind !== 'category') {
    return true;
  }

  return left.categoryName === right.categoryName;
};

export const matchesBookmarkCategoryFilter = (
  bookmark: Bookmark,
  filter: BookmarkCategoryFilter,
) => {
  if (filter.kind === 'all') {
    return true;
  }

  if (filter.kind === 'uncategorized') {
    return !bookmark.category;
  }

  return bookmark.category === filter.categoryName;
};

export const getFilteredBookmarks = (bookmarks: Bookmark[], filter: BookmarkCategoryFilter) => {
  return bookmarks.filter((bookmark) => matchesBookmarkCategoryFilter(bookmark, filter));
};
