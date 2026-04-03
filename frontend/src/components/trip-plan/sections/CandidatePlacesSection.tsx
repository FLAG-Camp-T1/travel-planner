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
    ? `Day ${selectedDayNumber} assignment comes next. This affordance is intentionally disabled in Phase 5.`
    : 'Selected-day awareness is not ready yet, so day assignment stays unavailable.';

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Candidate Places</h2>
          <p className="mt-1 text-sm text-gray-500">
            {isSelectedDayReady
              ? `Saved bookmarks are available here as candidate places for Day ${selectedDayNumber}.`
              : 'Saved bookmarks remain available as a candidate-place source, but planner context is not ready for a selected day yet.'}
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
              Bookmark data remains unchanged. Planner context only changes the candidate wording,
              not the bookmark source state.
            </div>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
            {isSelectedDayReady
              ? `Day ${selectedDayNumber} context ready`
              : 'Planner context pending'}
          </span>
        </div>

        <div className="px-4 py-3">
          <div className="mb-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            {isSelectedDayReady
              ? `Selected-day awareness is active for Day ${selectedDayNumber}. It only changes candidate copy and the disabled Add affordance.`
              : 'Bookmark loading, empty state, and removal still belong only to the bookmark source. Candidate day-specific affordances will wait until planner context is ready.'}
          </div>
          <BookmarkList
            loadingMessage="Loading bookmark source data."
            listClassName="divide-y divide-gray-100"
            renderBookmark={(bookmark) => (
              <CandidatePlaceCard
                bookmark={bookmark}
                ctaHelperText={disabledCtaHelperText}
                ctaLabel={disabledCtaLabel}
              />
            )}
          />
        </div>
      </div>
    </section>
  );
}
