import { X } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

export default function RouteFocusHintOverlay() {
  const activeDayRouteSegmentIndex = useAppStore((state) => state.activeDayRouteSegmentIndex);
  const setActiveDayRouteSegmentIndex = useAppStore((state) => state.setActiveDayRouteSegmentIndex);
  const isVisible = activeDayRouteSegmentIndex !== null;

  return (
    <div
      className={`absolute inset-x-0 top-4 z-[1050] flex justify-center px-4 transition-all duration-200 ease-out ${
        isVisible
          ? 'pointer-events-none translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-2 opacity-0'
      }`}
      aria-hidden={!isVisible}
    >
      <div className="pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50/95 px-4 py-3 text-xs text-sky-800 shadow-[0_12px_30px_rgba(14,116,144,0.18)] backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          Focus mode is on. Click the same segment again to return to the full route view.
        </div>
        <button
          type="button"
          onClick={() => setActiveDayRouteSegmentIndex(null)}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-white/80 text-sky-700 transition hover:bg-white"
          aria-label="Exit focus mode"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
