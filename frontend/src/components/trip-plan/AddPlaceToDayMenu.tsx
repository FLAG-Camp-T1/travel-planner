import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, MapPinned } from 'lucide-react';
import { getTripDays, getTrips } from '@/api/tripApi';
import type { TripDay, TripSummary } from '@/api/tripApi';
import { emitTripActionFeedback } from '@/components/map/tripActionFeedbackBus';
import useBoundedMenuPosition from '@/components/trip-plan/useBoundedMenuPosition';
import type { LoadStatus } from '@/stores/types';
import { useAppStore } from '@/stores/useAppStore';

type AddPlaceToDayMenuProps = {
  buttonClassName: string;
  disabled?: boolean;
  placeAddress: string;
  placeId: string;
  placeName: string;
};

export default function AddPlaceToDayMenu({
  buttonClassName,
  disabled = false,
  placeAddress,
  placeId,
  placeName,
}: AddPlaceToDayMenuProps) {
  const createDayItem = useAppStore((state) => state.createDayItem);
  const currentTrip = useAppStore((state) => state.currentTrip);
  const selectedDayNumber = useAppStore((state) => state.selectedDayNumber);

  const [open, setOpen] = useState(false);
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
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { placement, menuStyle } = useBoundedMenuPosition({
    open,
    anchorRef,
    menuRef,
    preferredSide: 'right',
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!anchorRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSubmitting, open]);

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

  const handleSubmit = () => {
    if (!canSubmit || selectedTripId === null || selectedTargetDay === null || !selectedTrip) {
      return;
    }

    void (async () => {
      try {
        setIsSubmitting(true);
        setSubmitError(null);
        await createDayItem(selectedTripId, selectedTargetDay, { placeId });
        emitTripActionFeedback(
          `Added ${placeName} to ${selectedTrip.title} · Day ${selectedTargetDay}`,
        );
        setOpen(false);
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to add place to the trip day.',
        );
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div ref={anchorRef} className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={buttonClassName}
      >
        Add to Trip
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div
          ref={menuRef}
          className={`absolute z-[1200] w-[20rem] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl ${
            placement === 'right'
              ? 'left-[calc(100%+0.5rem)] top-0'
              : placement === 'left'
                ? 'right-[calc(100%+0.5rem)] top-0'
                : 'left-0 top-[calc(100%+0.5rem)]'
          }`}
          style={menuStyle}
        >
          <div className="rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="flex items-start gap-2.5">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500">
                <MapPinned className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-800">{placeName}</div>
                <div className="mt-0.5 line-clamp-2 text-xs text-slate-500">{placeAddress}</div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Trip
              </span>
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
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                <CalendarDays className="h-3.5 w-3.5" />
                Day
              </span>
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
          </div>

          {tripsStatus === 'error' && tripsError ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {tripsError}
            </div>
          ) : null}

          {daysStatus === 'error' && daysError ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {daysError}
            </div>
          ) : null}

          {tripsStatus === 'ready' && trips.length === 0 ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Create a trip first before adding places to an itinerary.
            </div>
          ) : null}

          {submitError ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {submitError}
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              {isSubmitting ? 'Adding...' : 'Add to Trip'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
