import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import CategorySelector from './CategorySelector';

// 这个文件的功能：
// 在界面显示一颗星星，用户点击后，星星会变成黄色的，表示收藏成功，再次点击后，星星会变成灰色的，表示取消收藏。
// 用户点击收藏时，会弹出一个 CategorySelector，用户可以选择一个分类，然后创建收藏。

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

  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const handleStarClick = async () => {
    if (currentBookmark) {
      await removeBookmark(currentBookmark.bookmarkId, googlePlaceId);
      return;
    }
    setShowCategorySelector(true);
  };

  const handleCreateBookmark = async () => {
    await createBookmark({
      googlePlaceId,
      poiName,
      poiAddress,
      poiLatitude,
      poiLongitude,
      category,
      categoryId: selectedCategoryId ?? undefined,
    });
    setShowCategorySelector(false);
  };

  return (
    <div>
      <button
        onClick={handleStarClick}
        disabled={isPending}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <Star
          className={`w-5 h-5 transition-colors ${
            isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-400'
          }`}
        />
      </button>

      {showCategorySelector && (
        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-xl shadow-md">
          <CategorySelector
            selectedBookmarkCategoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategoryId}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreateBookmark}
              disabled={isPending}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Create and Set Category
            </button>
            <button
              onClick={() => setShowCategorySelector(false)}
              className="w-full py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
