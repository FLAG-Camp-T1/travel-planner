import type { DayRouteSummary } from '@/api/tripApi';

type DayRouteSummaryCardProps = {
  routeSummary: DayRouteSummary;
};

const formatDistance = (distanceMeters: number) => {
  if (distanceMeters < 1000) {
    return `${distanceMeters} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
};

const formatDuration = (durationSeconds: number) => {
  const totalMinutes = Math.round(durationSeconds / 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
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
          {formatDuration(routeSummary.totalDurationSeconds)}
        </p>
      </div>
    </div>
  );
}
