import type { DayRouteSummary } from '@/api/tripApi';
import { formatDistance, formatTotalDuration } from './routePresentation';

type DayRouteSummaryCardProps = {
  routeSummary: DayRouteSummary | null;
  isPlaceholder?: boolean;
};

export default function DayRouteSummaryCard({
  routeSummary,
  isPlaceholder = false,
}: DayRouteSummaryCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-4">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
          Total Distance
        </p>
        <p className="mt-2 text-lg font-semibold text-emerald-950">
          {isPlaceholder || routeSummary === null
            ? '--'
            : formatDistance(routeSummary.totalDistanceMeters)}
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-sky-700">Total Duration</p>
        <p className="mt-2 text-lg font-semibold text-sky-950">
          {isPlaceholder || routeSummary === null
            ? '--'
            : formatTotalDuration(routeSummary.totalDurationSeconds)}
        </p>
      </div>
    </div>
  );
}
