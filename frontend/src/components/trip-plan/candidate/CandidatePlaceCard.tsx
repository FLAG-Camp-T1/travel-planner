import type { Bookmark } from '@/api/bookmarkApi';
import BookmarkButton from '@/components/bookmark/BookmarkButton';

type CandidatePlaceCardProps = {
  bookmark: Bookmark;
};

export default function CandidatePlaceCard({ bookmark }: CandidatePlaceCardProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium text-gray-900">{bookmark.poiName}</h3>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
            Bookmark source
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-500">{bookmark.poiAddress}</p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
          {bookmark.category ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {bookmark.category}
            </span>
          ) : null}
          <span className="rounded-full bg-gray-50 px-3 py-1">Candidate place</span>
        </div>
      </div>

      <div className="shrink-0">
        <BookmarkButton
          googlePlaceId={bookmark.googlePlaceId}
          poiName={bookmark.poiName}
          poiAddress={bookmark.poiAddress}
          poiLatitude={bookmark.poiLatitude}
          poiLongitude={bookmark.poiLongitude}
          category={bookmark.category}
        />
      </div>
    </div>
  );
}
