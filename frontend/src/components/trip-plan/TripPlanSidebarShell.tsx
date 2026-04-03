import type { ReactNode } from 'react';

type TripPlanSidebarShellProps = {
  children: ReactNode;
};

export default function TripPlanSidebarShell({ children }: TripPlanSidebarShellProps) {
  return (
    <aside className="w-80 shrink-0 bg-white border-r border-gray-200 overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col">
      <div className="p-5 flex-1 space-y-6">{children}</div>
    </aside>
  );
}
