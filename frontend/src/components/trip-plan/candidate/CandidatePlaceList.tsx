import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';
import CandidatePlaceCard from './CandidatePlaceCard';

type CandidatePlaceListProps = {
  ctaHelperText: string;
  ctaLabel: string;
};

export default function CandidatePlaceList({ ctaHelperText, ctaLabel }: CandidatePlaceListProps) {
  const { bookmarks, bookmarksError, bookmarksStatus, fetchBookmarks } = useAppStore(
    useShallow((state) => ({
      bookmarks: state.bookmarks,
      bookmarksError: state.bookmarksError,
      bookmarksStatus: state.bookmarksStatus,
      fetchBookmarks: state.fetchBookmarks,
    })),
  );

  useEffect(() => {
    if (bookmarksStatus === 'idle') {
      void fetchBookmarks();
    }
  }, [bookmarksStatus, fetchBookmarks]);

  if (bookmarksStatus === 'idle' || bookmarksStatus === 'loading') {
    return <div className="px-4 py-4 text-sm text-gray-500">Loading bookmark source data.</div>;
  }

  if (bookmarksStatus === 'error') {
    return (
      <div className="px-4 py-4 text-sm text-red-600">
        {bookmarksError ?? 'Failed to load bookmarks.'}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return <div className="px-4 py-4 text-sm text-gray-500">No saved bookmarks yet.</div>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {bookmarks.map((bookmark) => (
        <CandidatePlaceCard
          key={bookmark.bookmarkId}
          bookmark={bookmark}
          ctaHelperText={ctaHelperText}
          ctaLabel={ctaLabel}
        />
      ))}
    </div>
  );
}
