import { useState } from 'react';
import type { Bookmark } from '@/api/bookmarkApi';
import BookmarkButton from '@/components/bookmark/BookmarkButton';
import BookmarkCategoryDialog from '@/components/bookmark/BookmarkCategoryDialog';
import { createBookmarkDetailOverlay } from '@/components/place/placeDetailOverlayFactory';
import AddPlaceToDayMenu from '@/components/trip-plan/AddPlaceToDayMenu';
import { useAppStore } from '@/stores/useAppStore';

type SavedBookmarkCardProps = {
  bookmark: Bookmark;
};

const getCategoryChipClassName = (category: string | null) => {
  return category
    ? 'bg-slate-100 text-slate-700'
    : 'border border-dashed border-slate-200 bg-white text-slate-500';
};

export default function SavedBookmarkCard({ bookmark }: SavedBookmarkCardProps) {
  const openPlaceDetail = useAppStore((state) => state.openPlaceDetail);
  const bookmarkUpdateError = useAppStore((state) => state.bookmarkUpdateError);
  const bookmarkUpdateStatus = useAppStore((state) => state.bookmarkUpdateStatus);
  const bookmarkUpdateTargetId = useAppStore((state) => state.bookmarkUpdateTargetId);
  const setHoveredBookmarkId = useAppStore((state) => state.setHoveredBookmarkId);
  const updateBookmarkCategory = useAppStore((state) => state.updateBookmarkCategory);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

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
        className="cursor-pointer rounded-2xl bg-white px-4 py-4 transition hover:bg-slate-50"
        onMouseEnter={() => setHoveredBookmarkId(bookmark.bookmarkId)}
        onMouseLeave={() => setHoveredBookmarkId(null)}
        onClick={() => void openPlaceDetail(createBookmarkDetailOverlay(bookmark))}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900">
                  {bookmark.poiName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{bookmark.poiAddress}</p>
              </div>

              <div className="shrink-0" onClick={(event) => event.stopPropagation()}>
                <BookmarkButton
                  googlePlaceId={bookmark.googlePlaceId}
                  poiName={bookmark.poiName}
                  poiAddress={bookmark.poiAddress}
                  poiLatitude={bookmark.poiLatitude}
                  poiLongitude={bookmark.poiLongitude}
                  size="sm"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getCategoryChipClassName(
                  bookmark.category,
                )}`}
              >
                {bookmark.category ?? 'Uncategorized'}
              </span>
            </div>

            <div
              className="mt-4 flex flex-wrap items-center gap-2"
              onClick={(event) => event.stopPropagation()}
            >
              <AddPlaceToDayMenu
                placeAddress={bookmark.poiAddress}
                placeId={bookmark.googlePlaceId}
                placeName={bookmark.poiName}
                buttonClassName="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
              />
              <button
                type="button"
                onClick={() => setIsCategoryDialogOpen(true)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Edit Category
              </button>
            </div>

            {updateErrorForThisBookmark ? (
              <div
                className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                onClick={(event) => event.stopPropagation()}
              >
                {updateErrorForThisBookmark}
              </div>
            ) : null}
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
    </>
  );
}
