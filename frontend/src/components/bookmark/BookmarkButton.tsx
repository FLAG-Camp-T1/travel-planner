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
  size?: 'sm' | 'md';
}
export default function BookmarkButton({
  googlePlaceId,
  poiName,
  poiAddress,
  poiLatitude,
  poiLongitude,
  category,
  size = 'md',
}: BookmarkButtonProps) {
  const currentBookmark = useAppStore((state) =>
    state.bookmarks.find((bookmark) => bookmark.googlePlaceId === googlePlaceId),
  );
  const createBookmark = useAppStore((state) => state.createBookmark);
  const isPending = useAppStore((state) => Boolean(state.pendingByPlaceId[googlePlaceId]));
  const removeBookmark = useAppStore((state) => state.removeBookmark);
  const isBookmarked = currentBookmark !== undefined;
  const buttonSizeClass = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const iconSizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

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
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isBookmarked ? `Remove bookmark for ${poiName}` : `Save bookmark for ${poiName}`}
      title={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
      className={`inline-flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${buttonSizeClass}`}
    >
      <Star
        className={`${iconSizeClass} transition-colors ${
          isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-400'
        }`}
      />
    </button>
  );
}
