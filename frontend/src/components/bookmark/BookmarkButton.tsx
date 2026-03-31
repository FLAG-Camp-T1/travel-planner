import { Star } from 'lucide-react';
import { useState } from 'react';
import { createBookmark, deleteBookmark } from '@/api/bookmarkApi';

// 这个文件的功能：
// 在界面显示一颗星星，用户点击后，星星会变成黄色的，表示收藏成功，再次点击后，星星会变成灰色的，表示取消收藏。

interface BookmarkButtonProps {
    initialBookmarkId?: string;
    googlePlaceId: string;
    poiName: string;
    poiAddress: string;
    poiLatitude: number;
    poiLongitude: number;
    category?: string;
}
export default function BookmarkButton({ 
    initialBookmarkId,
    googlePlaceId,
    poiName,
    poiAddress,
    poiLatitude,
    poiLongitude,
    category,
}: BookmarkButtonProps) {
    const [loading, setLoading] = useState(false);
    const [currentBookmarkId, setCurrentBookmarkId] = useState<string | null>(
        initialBookmarkId || null
    );
    const isBookmarked = currentBookmarkId !== null;
    const handleClick = async () => {
        setLoading(true);
        try {
            if (currentBookmarkId !== null) {
                await deleteBookmark(currentBookmarkId);
                setCurrentBookmarkId(null);
            } else {
                const newBookmark = await createBookmark({
                    googlePlaceId,
                    poiName,
                    poiAddress,
                    poiLatitude,
                    poiLongitude,
                    category,
                });
                setCurrentBookmarkId(newBookmark.bookmarkId);
            }
            
        } catch (error) {
            console.error(isBookmarked ? 'Failed to delete bookmark:' : 'Failed to create bookmark:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <button
      onClick={handleClick}
      disabled={loading}
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