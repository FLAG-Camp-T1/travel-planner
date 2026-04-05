import type { DayRouteSummary } from '@/api/tripApi';
import { formatDistance, formatTotalDuration } from './routePresentation';

type DayRouteSummaryCardProps = {
  routeSummary: DayRouteSummary;
};

export default function DayRouteSummaryCard({ routeSummary }: DayRouteSummaryCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-4">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
          Total Distance
        </p>
        <p className="mt-2 text-lg font-semibold text-emerald-950">
          {formatDistance(routeSummary.totalDistanceMeters)}
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-sky-700">Total Duration</p>
        <p className="mt-2 text-lg font-semibold text-sky-950">
          {formatTotalDuration(routeSummary.totalDurationSeconds)}
        </p>
      </div>
    </div>
  );
}
