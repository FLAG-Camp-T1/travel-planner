import { type SubmitEvent, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';

export default function TripCreationSection() {
  const { createTrip, tripBootstrapStatus, tripCreationError, tripCreationStatus } = useAppStore(
    useShallow((state) => ({
      createTrip: state.createTrip,
      tripBootstrapStatus: state.tripBootstrapStatus,
      tripCreationError: state.tripCreationError,
      tripCreationStatus: state.tripCreationStatus,
    })),
  );
  const [title, setTitle] = useState('');
  const [durationDays, setDurationDays] = useState('3');
  const [startDate, setStartDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const durationValue = Number(durationDays);
  const schedulingModeLabel = startDate ? 'Fixed' : 'Flexible';
  const canSubmit =
    title.trim().length > 0 &&
    Number.isFinite(durationValue) &&
    durationValue >= 1 &&
    tripCreationStatus !== 'loading' &&
    tripBootstrapStatus !== 'loading';

  const helperCopy = useMemo(() => {
    return startDate
      ? 'A fixed start date will initialize the trip in Fixed scheduling mode.'
      : 'Leaving start date empty will initialize the trip in Flexible scheduling mode.';
  }, [startDate]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && tripCreationStatus !== 'loading') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, tripCreationStatus]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    void (async () => {
      await createTrip({
        title: title.trim(),
        durationDays: durationValue,
        startDate: startDate || undefined,
      });

      if (useAppStore.getState().tripCreationStatus === 'ready') {
        setIsOpen(false);
        setTitle('');
        setDurationDays('3');
        setStartDate('');
      }
    })();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        Create
      </button>
    );
  }

  const modal = (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={() => {
          if (tripCreationStatus !== 'loading') {
            setIsOpen(false);
          }
        }}
      />

      <section className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-700">Create Trip</h2>
            <p className="mt-1 text-sm text-gray-500">Create a new trip to start planning.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={tripCreationStatus === 'loading'}
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
            <span className="text-sm font-medium text-gray-700">Duration in Days</span>
            <input
              type="number"
              min={1}
              step={1}
              value={durationDays}
              onChange={(event) => setDurationDays(event.target.value)}
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
            <span className="block text-xs text-gray-500">
              Optional. Leave empty for a flexible trip.
            </span>
          </label>

          {tripCreationStatus === 'error' ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {tripCreationError ?? 'Failed to create the new trip.'}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
          >
            {tripCreationStatus === 'loading' ? 'Creating Trip' : 'Create Trip'}
          </button>
        </form>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
