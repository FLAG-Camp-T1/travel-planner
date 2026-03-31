import { Star } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

// 这个文件的功能：
// 在界面显示一颗星星，用户点击后，星星会变成黄色的，表示收藏成功，再次点击后，星星会变成灰色的，表示取消收藏。

interface BookmarkButtonProps {
  googlePlaceId: string;
  poiName: string;
  poiAddress: string;
  poiLatitude: number;
  poiLongitude: number;
  category?: string;
}
export default function BookmarkButton({
  googlePlaceId,
  poiName,
  poiAddress,
  poiLatitude,
  poiLongitude,
  category,
}: BookmarkButtonProps) {
  const currentBookmark = useAppStore((state) =>
    state.bookmarks.find((bookmark) => bookmark.googlePlaceId === googlePlaceId),
  );
  const createBookmark = useAppStore((state) => state.createBookmark);
  const isPending = useAppStore((state) => Boolean(state.pendingByPlaceId[googlePlaceId]));
  const removeBookmark = useAppStore((state) => state.removeBookmark);
  const isBookmarked = currentBookmark !== undefined;

  const handleClick = async () => {
    if (currentBookmark) {
      await removeBookmark(currentBookmark.bookmarkId, googlePlaceId);
      return;
    }

    await createBookmark({
      googlePlaceId,
      poiName,
      poiAddress,
      poiLatitude,
      poiLongitude,
      category,
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
    >
      <Star
        className={`w-5 h-5 transition-colors ${
          isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-400'
        }`}
      />
    </button>
  );
}
