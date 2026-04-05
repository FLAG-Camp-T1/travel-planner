import { useShallow } from 'zustand/react/shallow';
import BookmarkList from '@/components/bookmark/BookmarkList';
import CandidatePlaceCard from '@/components/trip-plan/candidate/CandidatePlaceCard';
import { useAppStore } from '@/stores/useAppStore';

export default function CandidatePlacesSection() {
  const { currentTrip, days, daysStatus, selectedDayNumber, tripStatus } = useAppStore(
    useShallow((state) => ({
      currentTrip: state.currentTrip,
      days: state.days,
      daysStatus: state.daysStatus,
      selectedDayNumber: state.selectedDayNumber,
      tripStatus: state.tripStatus,
    })),
  );

  const isSelectedDayReady =
    currentTrip !== null &&
    tripStatus === 'ready' &&
    daysStatus === 'ready' &&
    selectedDayNumber !== null &&
    days.some((day) => day.dayNumber === selectedDayNumber);
  const disabledCtaLabel = isSelectedDayReady
    ? `Add to Day ${selectedDayNumber}`
    : 'Select a trip day first';
  const disabledCtaHelperText = isSelectedDayReady
    ? 'Adding places directly to a day is coming soon.'
    : 'Choose a day before adding places to your itinerary.';
  const disabledCtaTooltipText =
    'You can browse saved places now. Adding them directly to an itinerary is not available yet.';

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Candidate Places</h2>
          <p className="mt-1 text-sm text-gray-500">
            Browse saved places you may want to add later.
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          Saved Places
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div>
            <div className="text-sm font-medium text-gray-800">Saved Bookmarks</div>
            <div className="mt-1 text-xs text-gray-500">Save places here for later planning.</div>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
            {isSelectedDayReady ? `Day ${selectedDayNumber}` : 'Choose a day'}
          </span>
        </div>

        <div className="px-4 py-3">
          <BookmarkList
            loadingMessage="Loading bookmark source data."
            listClassName="divide-y divide-gray-100"
            renderBookmark={(bookmark) => (
              <CandidatePlaceCard
                bookmark={bookmark}
                ctaHelperText={disabledCtaHelperText}
                ctaLabel={disabledCtaLabel}
                ctaTooltipText={disabledCtaTooltipText}
              />
            )}
          />
        </div>
      </div>
    </section>
  );
}
