import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    // Set viewport height and width (h-screen w-screen)，hide overflow (overflow-hidden)，vertical Flex layout
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 text-gray-800 font-sans">
      {/* Top Navigation Bar */}
      {/* shrink-0 prevent shrinkage, z-20 ensure it's above sidebar and map */}
      <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm">
        {/* Top Left Logo and Title */}
        <div className="flex items-center gap-2">
          {/* Logo Placeholder */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
            Travel Planner
          </h1>
        </div>

        {/* User Avatar Placeholder */}
        <div className="w-9 h-9 bg-gray-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
          <span className="text-sm text-gray-500">U</span>
        </div>
      </header>

      {/* Main Content Area */}
      {/* flex-1 Occupy the remaining vertical space, horizontal Flex layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Vertical Sidebar */}
        {/* Fix width w-80 (320px)，Enable vertical scrolling (overflow-y-auto) */}
        <aside className="w-80 shrink-0 bg-white border-r border-gray-200 overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="p-5 flex-1">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">My Schedule</h2>

            {/* Plan Items Placeholder */}
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                <div className="font-medium text-blue-600 mb-1">Day 1: ABC</div>
                <div className="text-sm text-gray-500">Lorem ipsum dolor sit amet...</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                <div className="font-medium text-blue-600 mb-1">Day 2: XYZ</div>
                <div className="text-sm text-gray-500">Lorem ipsum dolor sit amet...</div>
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-blue-500 hover:text-blue-600 transition-colors">
              + Add New Day
            </button>
          </div>
        </aside>

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
