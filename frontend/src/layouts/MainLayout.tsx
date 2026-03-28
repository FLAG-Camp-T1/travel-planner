import { Outlet } from 'react-router-dom';
import TopBar from '@/layouts/TopBar';
import SideBar from '@/layouts/SideBar';

export default function MainLayout() {
  return (
    // Set viewport height and width (h-screen w-screen)，hide overflow (overflow-hidden)，vertical Flex layout
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 text-gray-800 font-sans">
      {/* Top Navigation Bar */}
      <TopBar />

      {/* Main Content Area */}
      {/* flex-1 Occupy the remaining vertical space, horizontal Flex layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Vertical Sidebar */}
        <SideBar />

        {/* Map Container */}
        {/* relative for positioning absolute children */}
        <main className="flex-1 relative bg-gray-100 flex flex-col">
          {/* Map Placeholder. inset-0 and absolute to fill the container */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
