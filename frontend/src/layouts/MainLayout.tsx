import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import PlannerNavRail, { PLANNER_NAV_RAIL_WIDTH } from '@/components/trip-plan/PlannerNavRail';
import TopBar from '@/layouts/TopBar';
import SideBar from '@/layouts/SideBar';

const DEFAULT_SIDEBAR_WIDTH = 450;
const MIN_SIDEBAR_WIDTH = 350;
const MAX_SIDEBAR_WIDTH = 700;

export default function MainLayout() {
  const contentRowRef = useRef<HTMLDivElement | null>(null);
  const isResizingRef = useRef(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isResizingRef.current || !contentRowRef.current) {
        return;
      }

      const rowBounds = contentRowRef.current.getBoundingClientRect();
      const nextWidth = event.clientX - rowBounds.left - PLANNER_NAV_RAIL_WIDTH;
      const clampedWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, nextWidth));

      setSidebarWidth(clampedWidth);
    };

    const handlePointerUp = () => {
      if (!isResizingRef.current) {
        return;
      }

      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  const handleSidebarResizeStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 text-gray-800 font-sans">
      <TopBar />

      <div ref={contentRowRef} className="flex flex-1 overflow-hidden">
        <PlannerNavRail />

        <SideBar onResizeStart={handleSidebarResizeStart} width={sidebarWidth} />

        <main className="flex-1 relative bg-gray-100 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
