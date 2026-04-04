import { type SubmitEvent, useMemo, useState } from 'react';
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

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    void createTrip({
      title: title.trim(),
      durationDays: durationValue,
      startDate: startDate || undefined,
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Create Trip</h2>
          <p className="mt-1 text-sm text-gray-500">
            Start the planner by creating a trip. The sidebar will switch into the active trip
            workspace only after the new trip finishes bootstrapping.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Creation-First
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Scheduling Mode
            </div>
            <div className="mt-1 text-sm font-medium text-gray-700">{helperCopy}</div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
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
  );
}
