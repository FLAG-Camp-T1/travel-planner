import type { Bookmark } from '@/api/bookmarkApi';
import BookmarkButton from '@/components/bookmark/BookmarkButton';

type CandidatePlaceCardProps = {
  bookmark: Bookmark;
  ctaLabel: string;
  ctaHelperText: string;
};

export default function CandidatePlaceCard({
  bookmark,
  ctaHelperText,
  ctaLabel,
}: CandidatePlaceCardProps) {
  return (
    <div className="relative px-4 py-4">
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
          <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500">
            Candidate for planning
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
          <button
            type="button"
            disabled
            className="rounded-full bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 cursor-not-allowed"
          >
            {ctaLabel}
          </button>
          <p className="mt-2 text-xs text-gray-500">{ctaHelperText}</p>
          <p className="mt-2 text-[11px] text-gray-400">Remove only affects bookmark source.</p>
        </div>
      </div>
    </div>
  );
}
