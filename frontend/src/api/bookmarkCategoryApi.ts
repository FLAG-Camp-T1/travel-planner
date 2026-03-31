import axiosClient from './axiosClient';

export interface BookmarkCategory {
  categoryId: number;
  categoryName: string;
}

export interface CreateBookmarkCategoryRequest {
  categoryName: string;
}

export const getBookmarkCategories = (): Promise<BookmarkCategory[]> => {
  return axiosClient.get('/bookmark-categories');
};

export const createBookmarkCategory = (
  request: CreateBookmarkCategoryRequest,
): Promise<BookmarkCategory> => {
  return axiosClient.post('/bookmark-categories', request);
};

export const deleteBookmarkCategory = (categoryId: number): Promise<void> => {
  return axiosClient.delete(`/bookmark-categories/${categoryId}`);
};
