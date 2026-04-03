import BookmarkList from '@/components/bookmark/BookmarkList';

export default function CandidatePlacesSection() {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">Candidate Places</h2>
        <p className="mt-1 text-sm text-gray-500">
          Saved bookmarks appear here as candidate places you may choose from when trip-day planning
          is added in a later phase.
        </p>
      </div>
      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
        Saved Bookmarks
      </div>
      <BookmarkList />
    </section>
  );
}
