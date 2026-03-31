import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';
import BookmarkButton from './BookmarkButton';

// 这个文件的功能：
// 显示一个列表，列表中包含所有的收藏。
// 列表有三种状态：加载中、没有收藏（空列表）、有收藏（非空列表）。

export default function BookmarkList() {
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
    return <div>Loading...</div>;
  }

  if (bookmarksStatus === 'error') {
    return <div>{bookmarksError ?? 'Failed to load bookmarks.'}</div>;
  }

  if (bookmarks.length === 0) {
    return <div>Waiting for your first bookmark</div>;
  }
  return (
    <ul>
      {bookmarks.map((bookmark) => (
        <li key={bookmark.bookmarkId}>
          {bookmark.poiName}
          <BookmarkButton
            googlePlaceId={bookmark.googlePlaceId}
            poiName={bookmark.poiName}
            poiAddress={bookmark.poiAddress}
            poiLatitude={bookmark.poiLatitude}
            poiLongitude={bookmark.poiLongitude}
            category={bookmark.category}
          />
        </li>
      ))}
    </ul>
  );
}
