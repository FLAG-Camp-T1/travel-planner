import { Bookmark, Compass, Map } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import type { PlannerPanel } from '@/stores/types';

export const PLANNER_NAV_RAIL_WIDTH = 68;
const NAV_BUTTON_WIDTH_PX = 52;
const NAV_BUTTON_HEIGHT_PX = 52;
const NAV_BUTTON_GAP_PX = 12;

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
  const activeIndex = NAV_ITEMS.findIndex(({ panel }) => panel === activePlannerPanel);

  return (
    <aside
      style={{ width: PLANNER_NAV_RAIL_WIDTH }}
      className="shrink-0 border-r border-slate-200 bg-slate-50 px-1.5 py-4 text-slate-700"
    >
      <div className="flex h-full flex-col">
        <nav className="relative flex flex-col gap-3">
          {activeIndex >= 0 ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute z-0 rounded-l-[1.3rem] rounded-r-none border border-slate-200 border-r-white bg-white transition-all duration-300 ease-out"
              style={{
                width: `${NAV_BUTTON_WIDTH_PX}px`,
                height: `${NAV_BUTTON_HEIGHT_PX}px`,
                left: '50%',
                top: `${activeIndex * (NAV_BUTTON_HEIGHT_PX + NAV_BUTTON_GAP_PX)}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <span className="absolute right-[-10px] top-0 h-full w-3 bg-white" />
            </div>
          ) : null}
          {NAV_ITEMS.map(({ Icon, label, panel }) => {
            const isActive = activePlannerPanel === panel;

            return (
              <button
                key={panel}
                type="button"
                tabIndex={-1}
                onClick={() => setActivePlannerPanel(panel)}
                title={label}
                aria-label={label}
                className={`group relative z-10 mx-auto flex h-[3.25rem] w-[3.25rem] flex-col items-center justify-center gap-1 px-1 py-2.5 text-center outline-none transition-colors duration-200 focus:outline-none focus-visible:outline-none ${
                  isActive
                    ? 'rounded-l-[1.3rem] rounded-r-none text-blue-700'
                    : 'rounded-[1.1rem] text-slate-500 hover:text-slate-800'
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center transition-colors duration-200 ${
                    isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                >
                  <Icon className="h-[1.1rem] w-[1.1rem]" />
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
