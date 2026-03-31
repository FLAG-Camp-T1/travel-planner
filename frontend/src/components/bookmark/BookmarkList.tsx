import { useState, useEffect } from 'react';
import { getBookmarks, type Bookmark } from '@/api/bookmarkApi';
import BookmarkButton from './BookmarkButton';

// 这个文件的功能：
// 显示一个列表，列表中包含所有的收藏。
// 列表有三种状态：加载中、没有收藏（空列表）、有收藏（非空列表）。

export default function BookmarkList() {
  const [loading, setLoading] = useState(true);
  // bookmarks 是从后端获得的收藏列表，数据结构是 Bookmark[]
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchBookmarks = async () => {
      try {
        const fetchedBookmarks = await getBookmarks();
        setBookmarks(fetchedBookmarks);
      } catch (error) {
        console.error('Failed to get bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
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
            initialBookmarkId={bookmark.bookmarkId}
            googlePlaceId={bookmark.googlePlaceId}
            poiName={bookmark.poiName}
            poiAddress={bookmark.poiAddress}
            poiLatitude={bookmark.poiLatitude}
            poiLongitude={bookmark.poiLongitude}
          />
        </li>
      ))}
    </ul>
  );
}
