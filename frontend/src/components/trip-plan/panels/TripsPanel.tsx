import { useShallow } from 'zustand/react/shallow';
import MyTripsSection from '@/components/trip-plan/sections/MyTripsSection';
import SelectedDayPlanSection from '@/components/trip-plan/sections/SelectedDayPlanSection';
import TripDayNavigationSection from '@/components/trip-plan/sections/TripDayNavigationSection';
import TripOverviewSection from '@/components/trip-plan/sections/TripOverviewSection';
import { useAppStore } from '@/stores/useAppStore';

export default function TripsPanel() {
  const {
    bootstrapTrip,
    clearTripPlanning,
    currentTrip,
    lastBootstrapTripId,
    tripBootstrapError,
    tripBootstrapStatus,
  } = useAppStore(
    useShallow((state) => ({
      bootstrapTrip: state.bootstrapTrip,
      clearTripPlanning: state.clearTripPlanning,
      currentTrip: state.currentTrip,
      lastBootstrapTripId: state.lastBootstrapTripId,
      tripBootstrapError: state.tripBootstrapError,
      tripBootstrapStatus: state.tripBootstrapStatus,
    })),
  );

  const showTripPlanningSections = tripBootstrapStatus === 'ready' && currentTrip !== null;
  const showEmptyState = currentTrip === null && tripBootstrapStatus === 'idle';

  return (
    <>
      <MyTripsSection />

      {tripBootstrapStatus === 'loading' ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Preparing your trip</h2>
            <p className="mt-1 text-sm text-gray-500">Loading your trip details and daily plan.</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-500 shadow-sm">
            Preparing your trip...
          </div>
        </section>
      ) : null}

      {tripBootstrapStatus === 'error' ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">We couldn’t open this trip</h2>
            <p className="mt-1 text-sm text-gray-500">
              Try again or go back and choose another saved trip.
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600 shadow-sm">
            {tripBootstrapError ?? 'We couldn’t open this trip.'}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (lastBootstrapTripId !== null) {
                  void bootstrapTrip(lastBootstrapTripId);
                }
              }}
              disabled={lastBootstrapTripId === null}
              className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={clearTripPlanning}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              Clear Selection
            </button>
          </div>
        </section>
      ) : null}

      {showEmptyState ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Current Trip</h2>
            <p className="mt-1 text-sm text-gray-500">
              Pick a saved trip above or create a new one to load itinerary details here.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-4 py-5 text-sm text-gray-500">
            Trip overview, days, itinerary stops, and route planning will appear here once a trip is
            active.
          </div>
        </section>
      ) : null}

      {showTripPlanningSections ? (
        <>
          <TripOverviewSection />
          <TripDayNavigationSection />
          <SelectedDayPlanSection />
        </>
      ) : null}
    </>
  );
}
