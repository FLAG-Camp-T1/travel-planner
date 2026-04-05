import { Bookmark, Compass, Map } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import type { PlannerPanel } from '@/stores/types';

export const PLANNER_NAV_RAIL_WIDTH = 88;

const NAV_ITEMS: Array<{
  panel: PlannerPanel;
  label: string;
  Icon: typeof Map;
}> = [
  {
    panel: 'explore',
    label: 'Explore',
    Icon: Compass,
  },
  {
    panel: 'trips',
    label: 'Trips',
    Icon: Map,
  },
  {
    panel: 'bookmarks',
    label: 'Bookmarks',
    Icon: Bookmark,
  },
];

export default function PlannerNavRail() {
  const activePlannerPanel = useAppStore((state) => state.activePlannerPanel);
  const setActivePlannerPanel = useAppStore((state) => state.setActivePlannerPanel);

  return (
    <aside
      style={{ width: PLANNER_NAV_RAIL_WIDTH }}
      className="shrink-0 border-r border-slate-200 bg-slate-50 px-2 py-4 text-slate-700"
    >
      <div className="flex h-full flex-col">
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ Icon, label, panel }) => {
            const isActive = activePlannerPanel === panel;

            return (
              <button
                key={panel}
                type="button"
                onClick={() => setActivePlannerPanel(panel)}
                className={`group flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-100'
                    : 'text-slate-500 hover:bg-white hover:text-slate-800'
                }`}
              >
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-semibold tracking-[0.04em]">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
