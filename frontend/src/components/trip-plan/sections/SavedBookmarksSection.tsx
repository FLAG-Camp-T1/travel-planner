import BookmarkList from '@/components/bookmark/BookmarkList';
import SavedBookmarkCard from '@/components/trip-plan/bookmark/SavedBookmarkCard';

export default function SavedBookmarksSection() {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Saved Bookmarks</h2>
          <p className="mt-1 text-sm text-gray-500">
            Browse saved places you may want to reuse later in planning.
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          Saved Places
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div>
            <div className="text-sm font-medium text-gray-800">Bookmark Library</div>
            <div className="mt-1 text-xs text-gray-500">
              Saved places stay available even before a trip exists, and can now be added later.
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            Ready to Reuse
          </span>
        </div>

        <div className="px-4 py-3">
          <BookmarkList
            loadingMessage="Loading bookmark source data."
            listClassName="divide-y divide-gray-100"
            renderBookmark={(bookmark) => <SavedBookmarkCard bookmark={bookmark} />}
          />
        </div>
      </div>
    </section>
  );
}
