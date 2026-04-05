import type { Bookmark } from '@/api/bookmarkApi';
import BookmarkButton from '@/components/bookmark/BookmarkButton';
import { useAppStore } from '@/stores/useAppStore';
import type { ActiveDetailOverlay } from '@/stores/types';

type SavedBookmarkCardProps = {
  bookmark: Bookmark;
  ctaLabel: string;
  ctaHelperText: string;
  ctaTooltipText?: string;
};

const toBookmarkDetailOverlay = (bookmark: Bookmark): ActiveDetailOverlay => ({
  kind: 'bookmark',
  placeId: bookmark.googlePlaceId,
  sourceSummary: {
    placeId: bookmark.googlePlaceId,
    name: bookmark.poiName,
    address: bookmark.poiAddress,
    latitude: bookmark.poiLatitude,
    longitude: bookmark.poiLongitude,
    categoryLabel: bookmark.category ?? null,
    rating: null,
  },
});

export default function SavedBookmarkCard({
  bookmark,
  ctaHelperText,
  ctaLabel,
  ctaTooltipText,
}: SavedBookmarkCardProps) {
  const openPlaceDetail = useAppStore((state) => state.openPlaceDetail);

  return (
    <div
      className="relative cursor-pointer px-4 py-4 transition-colors hover:bg-slate-50/80"
      onClick={() => void openPlaceDetail(toBookmarkDetailOverlay(bookmark))}
    >
      <div className="absolute right-4 top-4">
        <BookmarkButton
          googlePlaceId={bookmark.googlePlaceId}
          poiName={bookmark.poiName}
          poiAddress={bookmark.poiAddress}
          poiLatitude={bookmark.poiLatitude}
          poiLongitude={bookmark.poiLongitude}
          category={bookmark.category}
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

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
          {bookmark.category ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {bookmark.category}
            </span>
          ) : null}
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-full bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500"
            >
              {ctaLabel}
            </button>
            {ctaTooltipText ? (
              <span
                title={ctaTooltipText}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[11px] font-medium text-gray-500"
                aria-label="More information"
              >
                i
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-gray-500">{ctaHelperText}</p>
        </div>
      </div>
    </div>
  );
}
