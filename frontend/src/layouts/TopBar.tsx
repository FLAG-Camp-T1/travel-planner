export default function TopBar() {
  return (
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
  );
}
