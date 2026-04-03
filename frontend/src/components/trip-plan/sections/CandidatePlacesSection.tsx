import BookmarkList from '@/components/bookmark/BookmarkList';

export default function CandidatePlacesSection() {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">My Bookmarks</h2>
        <p className="mt-1 text-sm text-gray-500">
          Saved places remain available here while the trip planning sidebar is being prepared.
        </p>
      </div>
      <BookmarkList />
    </section>
  );
}
