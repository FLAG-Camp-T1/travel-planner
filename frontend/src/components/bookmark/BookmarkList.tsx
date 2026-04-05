import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';
import BookmarkButton from './BookmarkButton';

// 这个文件的功能：
// 显示一个列表，列表中包含所有的收藏。
// 列表有三种状态：加载中、没有收藏（空列表）、有收藏（非空列表）。
// 每个收藏旁边有一个下拉框，用户可以修改该收藏的分类。

interface BookmarkListProps {
  selectedCategoryId: number | null;
}

export default function BookmarkList({ selectedCategoryId }: BookmarkListProps) {
  const {
    bookmarks,
    bookmarksError,
    bookmarksStatus,
    fetchBookmarks,
    updateBookmarkCategory,
    categories,
  } = useAppStore(
    useShallow((state) => ({
      bookmarks: state.bookmarks,
      bookmarksError: state.bookmarksError,
      bookmarksStatus: state.bookmarksStatus,
      fetchBookmarks: state.fetchBookmarks,
      updateBookmarkCategory: state.updateBookmarkCategory,
      categories: state.categories,
    })),
  );

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (bookmarksStatus === 'idle') {
      void fetchBookmarks();
    }
  }, [bookmarksStatus, fetchBookmarks]);

  const handleUpdateCategory = async (bookmarkId: string, categoryId: number | null) => {
    setUpdatingId(bookmarkId);
    try {
      await updateBookmarkCategory(bookmarkId, categoryId);
    } finally {
      setUpdatingId(null);
    }
  };

  if (bookmarksStatus === 'idle' || bookmarksStatus === 'loading') {
    return <div>Loading...</div>;
  }

  if (bookmarksStatus === 'error') {
    return <div>{bookmarksError ?? 'Failed to load bookmarks.'}</div>;
  }

  if (bookmarks.length === 0) {
    return <div>Waiting for your first bookmark</div>;
  }

  const filteredBookmarks =
    selectedCategoryId === null
      ? bookmarks
      : bookmarks.filter((bookmark) => bookmark.categoryId === selectedCategoryId);

  return (
    <ul className="space-y-2">
      {filteredBookmarks.map((bookmark) => (
        <li key={bookmark.bookmarkId} className="flex items-center gap-2">
          <span className="flex-1 text-sm truncate">{bookmark.poiName}</span>
          <select
            value={bookmark.categoryId ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              void handleUpdateCategory(bookmark.bookmarkId, val === '' ? null : Number(val));
            }}
            disabled={updatingId === bookmark.bookmarkId}
            className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-500 disabled:opacity-50"
          >
            <option value="">无分类</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>
          <BookmarkButton googlePlacesId={bookmark.googlePlacesId} />
        </li>
      ))}
    </ul>
  );
}
