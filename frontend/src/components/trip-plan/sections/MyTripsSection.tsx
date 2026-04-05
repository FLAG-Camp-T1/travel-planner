import { CalendarDays, MoreHorizontal, PencilLine, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TripEditSection from '@/components/trip-plan/sections/TripEditSection';
import TripCreationSection from '@/components/trip-plan/sections/TripCreationSection';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';

const formatTripSchedule = (startDate?: string | null) => {
  if (!startDate) {
    return 'Flexible dates';
  }

  const parsed = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return startDate;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
};

export default function MyTripsSection() {
  const {
    bootstrapTrip,
    currentTrip,
    deleteTrip,
    fetchTrips,
    lastBootstrapTripId,
    tripDeletionError,
    tripDeletionStatus,
    tripDeletionTargetId,
    trips,
    tripsError,
    tripsStatus,
    tripBootstrapStatus,
  } = useAppStore(
    useShallow((state) => ({
      bootstrapTrip: state.bootstrapTrip,
      currentTrip: state.currentTrip,
      deleteTrip: state.deleteTrip,
      fetchTrips: state.fetchTrips,
      lastBootstrapTripId: state.lastBootstrapTripId,
      tripDeletionError: state.tripDeletionError,
      tripDeletionStatus: state.tripDeletionStatus,
      tripDeletionTargetId: state.tripDeletionTargetId,
      trips: state.trips,
      tripsError: state.tripsError,
      tripsStatus: state.tripsStatus,
      tripBootstrapStatus: state.tripBootstrapStatus,
    })),
  );

  useEffect(() => {
    if (tripsStatus === 'idle') {
      void fetchTrips();
    }
  }, [fetchTrips, tripsStatus]);
  const [openActionsTripId, setOpenActionsTripId] = useState<number | null>(null);
  const [editingTrip, setEditingTrip] = useState<(typeof trips)[number] | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (openActionsTripId === null) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionsMenuRef.current?.contains(event.target as Node)) {
        setOpenActionsTripId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenActionsTripId(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openActionsTripId]);

  return (
    <section className="space-y-3">
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-700">My Trips</h2>
          <div className="ml-auto flex shrink-0 items-center gap-2 whitespace-nowrap">
            <button
              type="button"
              onClick={() => void fetchTrips()}
              disabled={tripsStatus === 'loading'}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${tripsStatus === 'loading' ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
            <TripCreationSection />
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Switch between saved trips or create a new one here.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {tripsStatus === 'loading' && trips.length === 0 ? (
          <div className="px-4 py-4 text-sm text-gray-500">Loading your saved trips…</div>
        ) : null}

        {tripDeletionStatus === 'error' ? (
          <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {tripDeletionError ?? 'We couldn’t delete this trip.'}
          </div>
        ) : null}

        {tripsStatus === 'error' ? (
          <div className="space-y-3 px-4 py-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-600">
              {tripsError ?? 'We couldn’t load your trip list.'}
            </div>
            <button
              type="button"
              onClick={() => void fetchTrips()}
              className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : null}

        {tripsStatus !== 'error' && trips.length === 0 && tripsStatus !== 'loading' ? (
          <div className="px-4 py-4 text-sm text-gray-500">
            No trips yet. Create your first trip to start building an itinerary.
          </div>
        ) : null}

        {trips.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {trips.map((trip, tripIndex) => {
              const isSelected = currentTrip?.tripId === trip.tripId;
              const isLoadingTarget =
                tripBootstrapStatus === 'loading' && lastBootstrapTripId === trip.tripId;
              const isDeletingTarget =
                tripDeletionStatus === 'loading' && tripDeletionTargetId === trip.tripId;
              const isActionsOpen = openActionsTripId === trip.tripId;
              const rowEdgeRoundingClass =
                tripIndex === 0
                  ? 'rounded-t-2xl'
                  : tripIndex === trips.length - 1
                    ? 'rounded-b-2xl'
                    : '';

              return (
                <li key={trip.tripId} className={isActionsOpen ? 'relative z-30' : 'relative'}>
                  <div
                    className={`flex items-stretch gap-3 px-4 py-4 transition ${rowEdgeRoundingClass} ${
                      isSelected ? 'bg-blue-50/70' : 'bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void bootstrapTrip(trip.tripId)}
                      disabled={tripBootstrapStatus === 'loading' || isDeletingTarget}
                      className={`min-w-0 flex-1 text-left ${
                        isSelected
                          ? ''
                          : 'hover:bg-slate-50 disabled:cursor-wait disabled:hover:bg-transparent'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-semibold text-gray-900">
                              {trip.title}
                            </span>
                            {isSelected ? (
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                                Current Trip
                              </span>
                            ) : null}
                          </div>
                          {isLoadingTarget ? (
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                              Opening…
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span>{trip.durationDays} days</span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatTripSchedule(trip.startDate)}
                          </span>
                        </div>
                      </div>
                    </button>

                    <div
                      className="relative shrink-0 self-start"
                      ref={openActionsTripId === trip.tripId ? actionsMenuRef : undefined}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            tripDeletionStatus !== 'loading' &&
                            tripBootstrapStatus !== 'loading'
                          ) {
                            setOpenActionsTripId((currentId) =>
                              currentId === trip.tripId ? null : trip.tripId,
                            );
                          }
                        }}
                        disabled={
                          tripDeletionStatus === 'loading' || tripBootstrapStatus === 'loading'
                        }
                        aria-expanded={openActionsTripId === trip.tripId}
                        aria-haspopup="menu"
                        aria-label={isDeletingTarget ? 'Removing trip' : 'Trip actions'}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {isActionsOpen ? (
                        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 min-w-44 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenActionsTripId(null);
                              setEditingTrip(trip);
                            }}
                            className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                          >
                            <span>Edit Trip</span>
                            <PencilLine className="h-4 w-4" />
                          </button>
                          <div className="my-2 h-px bg-gray-100" />
                          <button
                            type="button"
                            onClick={() => {
                              setOpenActionsTripId(null);
                              if (
                                window.confirm(
                                  `Delete "${trip.title}"? This will remove its days and itinerary items.`,
                                )
                              ) {
                                void deleteTrip(trip.tripId);
                              }
                            }}
                            className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                          >
                            <span>{isDeletingTarget ? 'Removing...' : 'Delete Trip'}</span>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <TripEditSection
        trip={editingTrip}
        open={editingTrip !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setEditingTrip(null);
          }
        }}
      />
    </section>
  );
}
