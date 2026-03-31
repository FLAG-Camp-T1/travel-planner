import { useState, useEffect } from 'react';
import { getBookmarkCategories, type BookmarkCategory } from '@/api/bookmarkCategoryApi';

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
  const [loading, setLoading] = useState(true);
  const [bookmarkCategories, setBookmarkCategories] = useState<BookmarkCategory[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getBookmarkCategories();
        setBookmarkCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to get categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);
  if (loading) {
    return <div className="text-sm text-gray-400">Loading...</div>;
  }
  if (bookmarkCategories.length === 0) {
    return <div className="text-sm text-gray-400">Waiting for your first category</div>;
  }
  return (
    <select
      value={selectedBookmarkCategoryId ?? ''}
      onChange={(e) => onCategorySelect(Number(e.target.value))}
      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
    >
      <option value="">Select a category</option>
      {bookmarkCategories.map((bookmarkCategory) => (
        <option key={bookmarkCategory.categoryId} value={bookmarkCategory.categoryId}>
          {bookmarkCategory.categoryName}
        </option>
      ))}
    </select>
  );
}
