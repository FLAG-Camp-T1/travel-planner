import BookmarkList from '@/components/bookmark/BookmarkList';
import { useState } from 'react';
import CategoryFilter from '@/components/bookmark/CategoryFilter';

export default function SideBar() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  return (
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

        {/* Bookmarks 区块 */}
        <hr className="my-6 border-gray-100" />
        <h2 className="text-lg font-semibold mb-4 text-gray-700">My Bookmarks</h2>
        <CategoryFilter selectedCategoryId={selectedCategoryId} onCategorySelect={setSelectedCategoryId} />
        <BookmarkList selectedCategoryId={selectedCategoryId} />
      </div>
    </aside>
  );
}
