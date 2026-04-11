import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Bookmark } from '@/api/bookmarkApi';
import { getTripDays, getTrips } from '@/api/tripApi';
import type { TripDay, TripSummary } from '@/api/tripApi';
import { emitTripActionFeedback } from '@/components/map/tripActionFeedbackBus';
import type { LoadStatus } from '@/stores/types';
import { useAppStore } from '@/stores/useAppStore';

type AddBookmarkToDayDialogProps = {
  open: boolean;
  bookmark: Bookmark;
  onClose: () => void;
};

export default function AddBookmarkToDayDialog({
  open,
  bookmark,
  onClose,
}: AddBookmarkToDayDialogProps) {
  const createDayItem = useAppStore((state) => state.createDayItem);
  const currentTrip = useAppStore((state) => state.currentTrip);
  const selectedDayNumber = useAppStore((state) => state.selectedDayNumber);

  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [tripsStatus, setTripsStatus] = useState<LoadStatus>('idle');
  const [tripsError, setTripsError] = useState<string | null>(null);
  const [days, setDays] = useState<TripDay[]>([]);
  const [daysStatus, setDaysStatus] = useState<LoadStatus>('idle');
  const [daysError, setDaysError] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [selectedTargetDay, setSelectedTargetDay] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setTripsStatus('loading');
      setTripsError(null);
      setSubmitError(null);
      setDays([]);
      setDaysStatus('idle');
      setDaysError(null);

      try {
        const loadedTrips = await getTrips();
        if (cancelled) {
          return;
        }

        setTrips(loadedTrips);
        setTripsStatus('ready');

        const defaultTripId =
          currentTrip && loadedTrips.some((trip) => trip.tripId === currentTrip.tripId)
            ? currentTrip.tripId
            : (loadedTrips[0]?.tripId ?? null);
        setSelectedTripId(defaultTripId);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setTrips([]);
        setTripsStatus('error');
        setTripsError(error instanceof Error ? error.message : 'Failed to load trips.');
        setSelectedTripId(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentTrip, open]);

  useEffect(() => {
    if (!open || selectedTripId === null) {
      if (!open) {
        setSelectedTargetDay(null);
      }
      return;
    }

    let cancelled = false;

    void (async () => {
      setDaysStatus('loading');
      setDaysError(null);
      setSubmitError(null);

      try {
        const response = await getTripDays(selectedTripId);
        if (cancelled) {
          return;
        }

        setDays(response.days);
        setDaysStatus('ready');

        const defaultDayNumber =
          currentTrip?.tripId === selectedTripId &&
          selectedDayNumber !== null &&
          response.days.some((day) => day.dayNumber === selectedDayNumber)
            ? selectedDayNumber
            : (response.days[0]?.dayNumber ?? null);
        setSelectedTargetDay(defaultDayNumber);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setDays([]);
        setDaysStatus('error');
        setDaysError(error instanceof Error ? error.message : 'Failed to load trip days.');
        setSelectedTargetDay(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentTrip?.tripId, open, selectedDayNumber, selectedTripId]);

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.tripId === selectedTripId) ?? null,
    [selectedTripId, trips],
  );
  const canSubmit =
    !isSubmitting &&
    selectedTripId !== null &&
    selectedTargetDay !== null &&
    tripsStatus === 'ready' &&
    daysStatus === 'ready';

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || selectedTripId === null || selectedTargetDay === null || !selectedTrip) {
      return;
    }

    void (async () => {
      try {
        setIsSubmitting(true);
        setSubmitError(null);
        await createDayItem(selectedTripId, selectedTargetDay, {
          placeId: bookmark.googlePlaceId,
        });
        emitTripActionFeedback(
          `Added ${bookmark.poiName} to ${selectedTrip.title} · Day ${selectedTargetDay}`,
        );
        onClose();
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to add bookmark to the trip day.',
        );
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const modal = (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!isSubmitting) {
            onClose();
          }
        }}
      />

      <section className="relative z-10 w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-800">Add Bookmark to Trip Day</h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose where this saved place should be added.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-sm font-semibold text-slate-800">{bookmark.poiName}</div>
          <div className="mt-1 text-sm text-slate-500">{bookmark.poiAddress}</div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Trip</span>
            <select
              value={selectedTripId ?? ''}
              onChange={(event) =>
                setSelectedTripId(event.target.value ? Number(event.target.value) : null)
              }
              disabled={tripsStatus === 'loading' || trips.length === 0 || isSubmitting}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {trips.length === 0 ? <option value="">No trips available</option> : null}
              {trips.map((trip) => (
                <option key={trip.tripId} value={trip.tripId}>
                  {trip.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Day</span>
            <select
              value={selectedTargetDay ?? ''}
              onChange={(event) =>
                setSelectedTargetDay(event.target.value ? Number(event.target.value) : null)
              }
              disabled={daysStatus !== 'ready' || days.length === 0 || isSubmitting}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {days.length === 0 ? <option value="">No days available</option> : null}
              {days.map((day) => (
                <option key={day.dayNumber} value={day.dayNumber}>
                  {day.date ? `Day ${day.dayNumber} · ${day.date}` : `Day ${day.dayNumber}`}
                </option>
              ))}
            </select>
          </label>

          {tripsStatus === 'error' && tripsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {tripsError}
            </div>
          ) : null}

          {daysStatus === 'error' && daysError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {daysError}
            </div>
          ) : null}

          {tripsStatus === 'ready' && trips.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Create a trip first before adding saved bookmarks to an itinerary.
            </div>
          ) : null}

          {submitError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {submitError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
          >
            {isSubmitting ? 'Adding to Day' : 'Add to Day'}
          </button>
        </form>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
