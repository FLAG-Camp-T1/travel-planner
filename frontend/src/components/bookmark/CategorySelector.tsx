import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';

/**
 * 这个文件的功能：
 * 用户点击收藏 Bookmark 后，会显示一个下拉框，用户可以选择或创建一个分类。
 */

interface CategorySelectorProps {
  selectedBookmarkCategoryId: number | null;
  onCategorySelect: (categoryId: number) => void;
}

export default function CategorySelector({
  selectedBookmarkCategoryId,
  onCategorySelect,
}: CategorySelectorProps) {
  const { categories, categoriesStatus, fetchCategories, addCategory } = useAppStore(
    useShallow((state) => ({
      categories: state.categories,
      categoriesStatus: state.categoriesStatus,
      fetchCategories: state.fetchCategories,
      addCategory: state.addCategory,
    })),
  );

  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (categoriesStatus === 'idle') {
      void fetchCategories();
    }
  }, [categoriesStatus, fetchCategories]);

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (name === '') return;

    setCreating(true);
    try {
      const newCategory = await addCategory(name);
      onCategorySelect(newCategory.categoryId);
      setNewCategoryName('');
      setShowCreateCategory(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    } finally {
      setCreating(false);
    }
  };

  if (categoriesStatus === 'idle' || categoriesStatus === 'loading') {
    return <div className="text-sm text-gray-400">Loading...</div>;
  }

  return (
    <div>
      {categories.length === 0 ? (
        <div className="text-sm text-gray-400">No categories yet. Create your first one!</div>
      ) : (
        <select
          value={selectedBookmarkCategoryId ?? ''}
          onChange={(e) => onCategorySelect(Number(e.target.value))}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.categoryName}
            </option>
          ))}
        </select>
      )}

      {!showCreateCategory && (
        <button
          type="button"
          onClick={() => setShowCreateCategory(true)}
          className="mt-1 text-sm text-blue-600 hover:underline"
        >
          Create new category
        </button>
      )}

      {showCreateCategory && (
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={20}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name..."
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={creating || !newCategoryName.trim()}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? '...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateCategory(false);
                setNewCategoryName('');
              }}
              className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
          <span className="text-xs text-gray-400">{newCategoryName.length}/20</span>
        </div>
      )}
    </div>
  );
}
