import { type SubmitEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';

export default function TripEditSection() {
  const { currentTrip, tripBootstrapStatus, tripUpdateError, tripUpdateStatus, updateTrip } =
    useAppStore(
      useShallow((state) => ({
        currentTrip: state.currentTrip,
        tripBootstrapStatus: state.tripBootstrapStatus,
        tripUpdateError: state.tripUpdateError,
        tripUpdateStatus: state.tripUpdateStatus,
        updateTrip: state.updateTrip,
      })),
    );
  const [title, setTitle] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && tripUpdateStatus !== 'loading') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, tripUpdateStatus]);

  if (!currentTrip) {
    return null;
  }

  const schedulingModeLabel = startDate ? 'Fixed' : 'Flexible';
  const parsedDurationDays = Number(durationDays);
  const durationIsValid =
    Number.isInteger(parsedDurationDays) &&
    parsedDurationDays >= currentTrip.durationDays &&
    parsedDurationDays <= 15;
  const canSubmit =
    title.trim().length > 0 &&
    durationIsValid &&
    tripUpdateStatus !== 'loading' &&
    tripBootstrapStatus !== 'loading';
  const helperCopy = startDate
    ? 'A fixed start date will shift the trip into Fixed scheduling mode.'
    : 'Leaving start date empty keeps the trip in Flexible scheduling mode.';

  const handleOpen = () => {
    setTitle(currentTrip.title);
    setDurationDays(String(currentTrip.durationDays));
    setStartDate(currentTrip.startDate ?? '');
    setIsOpen(true);
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    void (async () => {
      await updateTrip(currentTrip.tripId, {
        title: title.trim(),
        durationDays: parsedDurationDays,
        startDate: startDate || null,
      });

      if (useAppStore.getState().tripUpdateStatus === 'ready') {
        setIsOpen(false);
      }
    })();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
      >
        Edit
      </button>
    );
  }

  const modal = (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={() => {
          if (tripUpdateStatus !== 'loading') {
            setIsOpen(false);
          }
        }}
      />

      <section className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-700">Edit Trip</h2>
            <p className="mt-1 text-sm text-gray-500">Update the current trip details.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={tripUpdateStatus === 'loading'}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4 overflow-y-auto rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Scheduling Mode
              </div>
              <div className="mt-1 break-words text-sm font-medium text-gray-700">{helperCopy}</div>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {schedulingModeLabel}
            </span>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Trip Title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Spring DC Trip"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
              <span>Optional. Clear the date to switch the trip back to flexible scheduling.</span>
              <button
                type="button"
                onClick={() => setStartDate('')}
                disabled={!startDate}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Duration</span>
            <input
              type="number"
              min={currentTrip.durationDays}
              max={15}
              step={1}
              value={durationDays}
              onChange={(event) => setDurationDays(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <div className="text-xs text-gray-500">
              You can extend this trip up to 15 days. Shortening it is not available yet.
            </div>
          </label>

          {tripUpdateStatus === 'error' ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {tripUpdateError ?? 'Failed to update the trip.'}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
          >
            {tripUpdateStatus === 'loading' ? 'Saving Changes' : 'Save Changes'}
          </button>
        </form>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
