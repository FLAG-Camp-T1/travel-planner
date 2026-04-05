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
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Preparing Trip Workspace</h2>
              <p className="mt-1 text-sm text-gray-500">
                The sidebar stays in this bootstrap branch until the active trip has finished
                loading its overview and day structure.
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              Bootstrap Loading
            </span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-500 shadow-sm">
            Loading the active trip and initializing its day-by-day planner context.
          </div>
        </section>
      ) : null}

      {tripBootstrapStatus === 'error' ? (
        <section className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Trip Bootstrap Failed</h2>
              <p className="mt-1 text-sm text-gray-500">
                The planner could not finish initializing an active trip, so the normal sidebar
                content stays hidden until bootstrap succeeds.
              </p>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
              Bootstrap Error
            </span>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600 shadow-sm">
            {tripBootstrapError ?? 'Failed to bootstrap the active trip.'}
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
              Retry Bootstrap
            </button>
            <button
              type="button"
              onClick={clearTripPlanning}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              Back to Trip Creation
            </button>
          </div>

          <p className="text-xs text-gray-500">
            After clearing a mock failure flag such as `tpMock=clear`, you can retry bootstrap
            directly or return to the creation-first entry without refreshing the page.
          </p>
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
