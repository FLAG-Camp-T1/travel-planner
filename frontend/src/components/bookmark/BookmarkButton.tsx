import { useState } from 'react';
import { Star } from 'lucide-react';
import BookmarkCategoryDialog from '@/components/bookmark/BookmarkCategoryDialog';
import { useAppStore } from '@/stores/useAppStore';

interface BookmarkButtonProps {
  googlePlaceId: string;
  poiName: string;
  poiAddress: string;
  poiLatitude: number | null;
  poiLongitude: number | null;
  size?: 'sm' | 'md';
}

export default function BookmarkButton({
  googlePlaceId,
  poiName,
  poiAddress,
  poiLatitude,
  poiLongitude,
  size = 'md',
}: BookmarkButtonProps) {
  const currentBookmark = useAppStore((state) =>
    state.bookmarks.find((bookmark) => bookmark.googlePlaceId === googlePlaceId),
  );
  const createBookmark = useAppStore((state) => state.createBookmark);
  const isPending = useAppStore((state) => Boolean(state.pendingByPlaceId[googlePlaceId]));
  const removeBookmark = useAppStore((state) => state.removeBookmark);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const isBookmarked = currentBookmark !== undefined;
  const buttonSizeClass = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const iconSizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const canCreateBookmark = poiLatitude !== null && poiLongitude !== null;

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (currentBookmark) {
      try {
        await removeBookmark(currentBookmark.bookmarkId, googlePlaceId);
      } catch {
        return;
      }
      return;
    }

    if (!canCreateBookmark) {
      return;
    }

    setDialogError(null);
    setIsCategoryDialogOpen(true);
  };

  const handleCreateBookmark = async (category: string | null) => {
    if (poiLatitude === null || poiLongitude === null) {
      throw new Error('Bookmark coordinates are unavailable.');
    }

    try {
      setDialogError(null);
      await createBookmark({
        googlePlaceId,
        poiName,
        poiAddress,
        poiLatitude,
        poiLongitude,
        category,
      });
    } catch (error) {
      setDialogError(error instanceof Error ? error.message : 'Failed to save bookmark.');
      throw error;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || (!isBookmarked && !canCreateBookmark)}
        aria-label={
          isBookmarked ? `Remove bookmark for ${poiName}` : `Save bookmark for ${poiName}`
        }
        title={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
        className={`inline-flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${buttonSizeClass}`}
      >
        <Star
          className={`${iconSizeClass} transition-colors ${
            isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-400'
          }`}
        />
      </button>

      {isCategoryDialogOpen ? (
        <BookmarkCategoryDialog
          mode="create"
          placeName={poiName}
          placeAddress={poiAddress}
          initialCategory={currentBookmark?.category ?? null}
          isSubmitting={isPending}
          error={dialogError}
          onClose={() => {
            if (!isPending) {
              setIsCategoryDialogOpen(false);
              setDialogError(null);
            }
          }}
          onSubmit={handleCreateBookmark}
        />
      ) : null}
    </>
  );
}
