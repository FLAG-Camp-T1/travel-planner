import type { PointerEvent, ReactNode } from 'react';

type TripPlanSidebarShellProps = {
  children: ReactNode;
  overlay?: ReactNode;
  width: number;
  onResizeStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onResetWidth: () => void;
};

export default function TripPlanSidebarShell({
  children,
  onResizeStart,
  onResetWidth,
  overlay,
  width,
}: TripPlanSidebarShellProps) {
  return (
    <aside
      style={{ width }}
      className="relative shrink-0 bg-white border-r border-gray-200 overflow-visible z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col"
    >
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6">{children}</div>
      {overlay}
      <button
        type="button"
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        onPointerDown={onResizeStart}
        onDoubleClick={onResetWidth}
        className="group absolute right-0 top-0 z-10 h-full w-6 translate-x-1/2 cursor-col-resize touch-none"
      >
        <span className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full bg-gray-200 transition-colors group-hover:bg-blue-400" />
      </button>
    </aside>
  );
}
