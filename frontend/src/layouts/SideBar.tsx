import type { PointerEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';
import TripPlanSidebarShell from '@/components/trip-plan/TripPlanSidebarShell';
import CandidatePlacesSection from '@/components/trip-plan/sections/CandidatePlacesSection';
import DayRouteSection from '@/components/trip-plan/sections/DayRouteSection';
import ItinerarySection from '@/components/trip-plan/sections/ItinerarySection';
import TripCreationSection from '@/components/trip-plan/sections/TripCreationSection';
import TripDayNavigationSection from '@/components/trip-plan/sections/TripDayNavigationSection';
import TripOverviewSection from '@/components/trip-plan/sections/TripOverviewSection';
import { useAppStore } from '@/stores/useAppStore';

type SideBarProps = {
  width: number;
  onResizeStart: (event: PointerEvent<HTMLButtonElement>) => void;
};

export default function SideBar({ onResizeStart, width }: SideBarProps) {
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

  return (
    <TripPlanSidebarShell onResizeStart={onResizeStart} width={width}>
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
              Try again or go back and create another trip.
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
              Back
            </button>
          </div>
        </section>
      ) : null}

      {tripBootstrapStatus === 'idle' && currentTrip === null ? <TripCreationSection /> : null}

      {tripBootstrapStatus === 'ready' && currentTrip !== null ? (
        <>
          <TripOverviewSection />
          <TripDayNavigationSection />
          <ItinerarySection />
          <DayRouteSection />
          <CandidatePlacesSection />
        </>
      ) : null}
    </TripPlanSidebarShell>
  );
}
