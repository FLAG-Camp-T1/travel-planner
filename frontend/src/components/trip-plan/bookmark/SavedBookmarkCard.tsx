import { useState } from 'react';
import type { Bookmark } from '@/api/bookmarkApi';
import AddBookmarkToDayDialog from '@/components/bookmark/AddBookmarkToDayDialog';
import BookmarkButton from '@/components/bookmark/BookmarkButton';
import BookmarkCategoryDialog from '@/components/bookmark/BookmarkCategoryDialog';
import { createBookmarkDetailOverlay } from '@/components/place/placeDetailOverlayFactory';
import { useAppStore } from '@/stores/useAppStore';

type SavedBookmarkCardProps = {
  bookmark: Bookmark;
};

export default function SavedBookmarkCard({ bookmark }: SavedBookmarkCardProps) {
  const openPlaceDetail = useAppStore((state) => state.openPlaceDetail);
  const bookmarkUpdateError = useAppStore((state) => state.bookmarkUpdateError);
  const bookmarkUpdateStatus = useAppStore((state) => state.bookmarkUpdateStatus);
  const bookmarkUpdateTargetId = useAppStore((state) => state.bookmarkUpdateTargetId);
  const updateBookmarkCategory = useAppStore((state) => state.updateBookmarkCategory);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isAddToDayDialogOpen, setIsAddToDayDialogOpen] = useState(false);

  const isUpdatingThisBookmark =
    bookmarkUpdateStatus === 'loading' && bookmarkUpdateTargetId === bookmark.bookmarkId;
  const updateErrorForThisBookmark =
    bookmarkUpdateTargetId === bookmark.bookmarkId ? bookmarkUpdateError : null;

  const handleEditCategory = async (category: string | null) => {
    await updateBookmarkCategory(bookmark.bookmarkId, category);
  };

  return (
    <>
      <div
        className="relative cursor-pointer px-4 py-4 transition-colors hover:bg-slate-50/80"
        onClick={() => void openPlaceDetail(createBookmarkDetailOverlay(bookmark))}
      >
        <div className="absolute right-4 top-4">
          <BookmarkButton
            googlePlaceId={bookmark.googlePlaceId}
            poiName={bookmark.poiName}
            poiAddress={bookmark.poiAddress}
            poiLatitude={bookmark.poiLatitude}
            poiLongitude={bookmark.poiLongitude}
            size="sm"
          />
        </div>

        <div className="min-w-0 pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-medium text-gray-900">{bookmark.poiName}</h3>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
              Bookmark
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-500">{bookmark.poiAddress}</p>

          {bookmark.category ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                Saved in {bookmark.category}
              </span>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsAddToDayDialogOpen(true);
              }}
              className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
            >
              Add to Day
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsCategoryDialogOpen(true);
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Edit Tag
            </button>
          </div>
        </div>
      </div>

      {isCategoryDialogOpen ? (
        <BookmarkCategoryDialog
          mode="edit"
          placeName={bookmark.poiName}
          placeAddress={bookmark.poiAddress}
          initialCategory={bookmark.category}
          isSubmitting={isUpdatingThisBookmark}
          error={updateErrorForThisBookmark}
          onClose={() => {
            if (!isUpdatingThisBookmark) {
              setIsCategoryDialogOpen(false);
            }
          }}
          onSubmit={handleEditCategory}
        />
      ) : null}

      <AddBookmarkToDayDialog
        open={isAddToDayDialogOpen}
        bookmark={bookmark}
        onClose={() => setIsAddToDayDialogOpen(false)}
      />
    </>
  );
}
