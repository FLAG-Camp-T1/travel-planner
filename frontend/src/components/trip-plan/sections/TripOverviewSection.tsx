import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';

const formatStartDate = (startDate?: string | null) => {
  if (!startDate) {
    return 'No fixed start date';
  }

  return startDate;
};

export default function TripOverviewSection() {
  const { currentTrip, tripError, tripStatus } = useAppStore(
    useShallow((state) => ({
      currentTrip: state.currentTrip,
      tripError: state.tripError,
      tripStatus: state.tripStatus,
    })),
  );

  const title = currentTrip?.title ?? 'Trip summary unavailable';
  const durationLabel =
    currentTrip?.durationDays !== undefined
      ? `${currentTrip.durationDays} days`
      : 'Duration pending';
  const startDateLabel = formatStartDate(currentTrip?.startDate);

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Trip Overview</h2>
          <p className="mt-1 text-sm text-gray-500">
            Read-only trip summary backed by the current mock trip bootstrap.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Read-Only Data
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-gray-900">{title}</div>
            <div className="mt-1 text-sm text-gray-500">
              {tripStatus === 'loading'
                ? 'Loading the current trip summary.'
                : tripStatus === 'error'
                  ? (tripError ?? 'Failed to load the current trip summary.')
                  : 'Current trip summary is available for read-only review.'}
            </div>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Flexible
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 px-3 py-2">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Duration
            </div>
            <div className="mt-1 text-sm font-medium text-gray-700">{durationLabel}</div>
          </div>

          <div className="rounded-xl bg-gray-50 px-3 py-2">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Start Date
            </div>
            <div className="mt-1 text-sm font-medium text-gray-700">{startDateLabel}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
