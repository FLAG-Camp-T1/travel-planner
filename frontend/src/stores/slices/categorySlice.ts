import {
  getBookmarkCategories,
  createBookmarkCategory,
  deleteBookmarkCategory,
} from '@/api/bookmarkCategoryApi';
import type { AppStoreCreator, CategorySlice } from '../types';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Failed to update categories.';
};

export const createCategorySlice: AppStoreCreator<CategorySlice> = (set, get) => ({
  categories: [],
  categoriesStatus: 'idle',
  categoriesError: null,

  fetchCategories: async () => {
    if (get().categoriesStatus === 'loading') {
      return;
    }

    set(
      { categoriesStatus: 'loading', categoriesError: null },
      false,
      'categories/fetch:start',
    );

    try {
      const categories = await getBookmarkCategories();
      set(
        { categories, categoriesStatus: 'ready', categoriesError: null },
        false,
        'categories/fetch:success',
      );
    } catch (error) {
      set(
        { categoriesStatus: 'error', categoriesError: getErrorMessage(error) },
        false,
        'categories/fetch:error',
      );
    }
  },

  addCategory: async (categoryName) => {
    try {
      const newCategory = await createBookmarkCategory({ categoryName });
      set(
        (state) => ({ categories: [...state.categories, newCategory] }),
        false,
        'categories/add:success',
      );
      return newCategory;
    } catch (error) {
      set(
        { categoriesError: getErrorMessage(error) },
        false,
        'categories/add:error',
      );
      throw error;
    }
  },

  removeCategory: async (categoryId) => {
    try {
      await deleteBookmarkCategory(categoryId);
      set(
        (state) => ({
          categories: state.categories.filter((c) => c.categoryId !== categoryId),
        }),
        false,
        'categories/remove:success',
      );
    } catch (error) {
      set(
        { categoriesError: getErrorMessage(error) },
        false,
        'categories/remove:error',
      );
      throw error;
    }
  },
});
