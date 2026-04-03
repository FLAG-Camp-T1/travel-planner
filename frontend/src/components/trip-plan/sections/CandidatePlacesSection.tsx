import BookmarkList from '@/components/bookmark/BookmarkList';

export default function CandidatePlacesSection() {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Candidate Places</h2>
          <p className="mt-1 text-sm text-gray-500">
            Preview only. Saved bookmarks are shown here as a future candidate-place source for trip
            planning.
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          Bookmark Source
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div>
            <div className="text-sm font-medium text-gray-800">Saved Bookmarks</div>
            <div className="mt-1 text-xs text-gray-500">
              Bookmark data remains unchanged. This section only reframes the list as a candidate
              source.
            </div>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
            No day actions yet
          </span>
        </div>

        <div className="px-4 py-3">
          <BookmarkList />
        </div>
      </div>
    </section>
  );
}
