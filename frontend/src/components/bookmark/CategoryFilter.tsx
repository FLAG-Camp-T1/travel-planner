import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';

/**
 * 这个文件的功能：
 * 在 BookmarkList 顶部，会显示一个分类选择器，用户可以选择一个分类，然后只显示该分类下的所有收藏。用户也可以删去分类。
 */

interface CategoryFilterProps {
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number | null) => void;
}

export default function CategoryFilter({
  selectedCategoryId,
  onCategorySelect,
}: CategoryFilterProps) {
  const { categories, categoriesStatus, fetchCategories, removeCategory } = useAppStore(
    useShallow((state) => ({
      categories: state.categories,
      categoriesStatus: state.categoriesStatus,
      fetchCategories: state.fetchCategories,
      removeCategory: state.removeCategory,
    })),
  );

  useEffect(() => {
    if (categoriesStatus === 'idle') {
      void fetchCategories();
    }
  }, [categoriesStatus, fetchCategories]);

  const handleDeleteCategory = async (categoryId: number) => {
    await removeCategory(categoryId);
    if (selectedCategoryId === categoryId) {
      onCategorySelect(null);
    }
  };

  if (categoriesStatus === 'idle' || categoriesStatus === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => onCategorySelect(null)}
        className={`w-full text-left px-2 py-1 rounded text-sm ${
          selectedCategoryId === null ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
        }`}
      >
        All categories
      </button>

      {categories.map((category) => (
        <div key={category.categoryId} className="flex items-center gap-1">
          <button
            onClick={() => onCategorySelect(category.categoryId)}
            className={`flex-1 text-left px-2 py-1 rounded text-sm ${
              selectedCategoryId === category.categoryId
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            {category.categoryName}
          </button>
          <button
            onClick={() => void handleDeleteCategory(category.categoryId)}
            className="text-gray-400 hover:text-red-500 px-1"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
