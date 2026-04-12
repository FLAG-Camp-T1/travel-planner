import { Trash2 } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
import type { BookmarkCategory } from '@/api/bookmarkApi';
import { useAppStore } from '@/stores/useAppStore';

const CATEGORY_MAX_LENGTH = 20;

type ManageBookmarkCategoriesDialogProps = {
  onClose: () => void;
};

export default function ManageBookmarkCategoriesDialog({
  onClose,
}: ManageBookmarkCategoriesDialogProps) {
  const {
    bookmarkCategories,
    bookmarkCategoryDeleteError,
    bookmarkCategoryDeleteStatus,
    bookmarkCategoryDeleteTargetId,
    bookmarkCategoriesError,
    bookmarkCategoriesStatus,
    createBookmarkCategory,
    deleteBookmarkCategory,
    fetchBookmarkCategories,
  } = useAppStore(
    useShallow((state) => ({
      bookmarkCategories: state.bookmarkCategories,
      bookmarkCategoryDeleteError: state.bookmarkCategoryDeleteError,
      bookmarkCategoryDeleteStatus: state.bookmarkCategoryDeleteStatus,
      bookmarkCategoryDeleteTargetId: state.bookmarkCategoryDeleteTargetId,
      bookmarkCategoriesError: state.bookmarkCategoriesError,
      bookmarkCategoriesStatus: state.bookmarkCategoriesStatus,
      createBookmarkCategory: state.createBookmarkCategory,
      deleteBookmarkCategory: state.deleteBookmarkCategory,
      fetchBookmarkCategories: state.fetchBookmarkCategories,
    })),
  );

  const [newCategoryName, setNewCategoryName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [categoryPendingDelete, setCategoryPendingDelete] = useState<BookmarkCategory | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (bookmarkCategoriesStatus === 'idle') {
      void fetchBookmarkCategories();
    }
  }, [bookmarkCategoriesStatus, fetchBookmarkCategories]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (bookmarkCategoryDeleteStatus === 'loading') {
        return;
      }

      if (categoryPendingDelete) {
        setCategoryPendingDelete(null);
        setDeleteError(null);
        return;
      }

      if (!isCreating) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookmarkCategoryDeleteStatus, categoryPendingDelete, isCreating, onClose]);

  const trimmedCategoryName = newCategoryName.trim();
  const categoryNameTooLong = trimmedCategoryName.length > CATEGORY_MAX_LENGTH;

  const handleCreateCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCreating) {
      return;
    }

    if (!trimmedCategoryName) {
      setCreateError('Category name is required.');
      return;
    }

    if (categoryNameTooLong) {
      setCreateError(`Category name must be at most ${CATEGORY_MAX_LENGTH} characters.`);
      return;
    }

    void (async () => {
      try {
        setIsCreating(true);
        setCreateError(null);
        await createBookmarkCategory(trimmedCategoryName);
        setNewCategoryName('');
      } catch (error) {
        setCreateError(error instanceof Error ? error.message : 'Failed to create category.');
      } finally {
        setIsCreating(false);
      }
    })();
  };

  const handleDeleteCategory = (deleteBookmarks: boolean) => {
    if (!categoryPendingDelete || bookmarkCategoryDeleteStatus === 'loading') {
      return;
    }

    void (async () => {
      try {
        setDeleteError(null);
        await deleteBookmarkCategory(categoryPendingDelete.categoryId, deleteBookmarks);
        setCategoryPendingDelete(null);
      } catch (error) {
        setDeleteError(
          error instanceof Error ? error.message : 'Failed to delete bookmark category.',
        );
      }
    })();
  };

  const isDeletingSelectedCategory =
    bookmarkCategoryDeleteStatus === 'loading' &&
    bookmarkCategoryDeleteTargetId === categoryPendingDelete?.categoryId;
  const activeDeleteError =
    deleteError ??
    (bookmarkCategoryDeleteTargetId === categoryPendingDelete?.categoryId
      ? bookmarkCategoryDeleteError
      : null);
  const isAnyDeleteInFlight = bookmarkCategoryDeleteStatus === 'loading';

  const modal = (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={() => {
          if (bookmarkCategoryDeleteStatus === 'loading') {
            return;
          }

          if (categoryPendingDelete) {
            setCategoryPendingDelete(null);
            setDeleteError(null);
            return;
          }

          if (!isCreating) {
            onClose();
          }
        }}
      />

      <section className="relative z-10 w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-800">Manage Categories</h2>
            <p className="mt-1 text-sm text-gray-500">
              Create reusable categories now, even before any bookmark is assigned to them.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isCreating || isAnyDeleteInFlight}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <form
          onSubmit={handleCreateCategory}
          className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">New category</span>
            <input
              type="text"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Weekend food spots"
              maxLength={CATEGORY_MAX_LENGTH + 1}
              disabled={isCreating || isAnyDeleteInFlight}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
            <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
              <span>Up to {CATEGORY_MAX_LENGTH} characters.</span>
              <span className={categoryNameTooLong ? 'font-medium text-red-600' : ''}>
                {trimmedCategoryName.length}/{CATEGORY_MAX_LENGTH}
              </span>
            </div>
          </label>

          {createError ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {createError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isCreating || isAnyDeleteInFlight}
            className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
          >
            {isCreating ? 'Creating Category' : 'Create Category'}
          </button>
        </form>

        {bookmarkCategoriesError ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {bookmarkCategoriesError}
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-800">
            Existing Categories
          </div>

          {bookmarkCategoriesStatus === 'loading' && bookmarkCategories.length === 0 ? (
            <div className="px-4 py-4 text-sm text-slate-500">Loading categories...</div>
          ) : null}

          {bookmarkCategoriesStatus !== 'loading' && bookmarkCategories.length === 0 ? (
            <div className="px-4 py-4 text-sm text-slate-500">
              No categories yet. Create one here to reuse it while saving bookmarks.
            </div>
          ) : null}

          {bookmarkCategories.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {bookmarkCategories.map((category) => (
                <li
                  key={category.categoryId}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-800">
                      {category.name}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      {category.bookmarkCount} bookmark{category.bookmarkCount === 1 ? '' : 's'}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryPendingDelete(category);
                        setDeleteError(null);
                      }}
                      disabled={bookmarkCategoryDeleteStatus === 'loading'}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`Delete category ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {categoryPendingDelete ? (
        <div className="fixed inset-0 z-[1310] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/20"
            onClick={() => {
              if (!isDeletingSelectedCategory) {
                setCategoryPendingDelete(null);
                setDeleteError(null);
              }
            }}
          />

          <section className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-slate-800">Delete Category</h3>
                <p className="mt-1 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{categoryPendingDelete.name}</span>{' '}
                  currently has {categoryPendingDelete.bookmarkCount} bookmark
                  {categoryPendingDelete.bookmarkCount === 1 ? '' : 's'}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCategoryPendingDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeletingSelectedCategory}
                className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Close
              </button>
            </div>

            {categoryPendingDelete.bookmarkCount === 0 ? (
              <p className="mt-4 text-sm text-slate-600">
                This category is empty and can be removed safely.
              </p>
            ) : (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Choose whether to keep the bookmarks by moving them to Uncategorized, or remove the
                bookmarks together with this category.
              </div>
            )}

            {activeDeleteError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {activeDeleteError}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategoryPendingDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeletingSelectedCategory}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              {categoryPendingDelete.bookmarkCount > 0 ? (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(false)}
                  disabled={isDeletingSelectedCategory}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeletingSelectedCategory ? 'Deleting Category' : 'Delete Category Only'}
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => handleDeleteCategory(categoryPendingDelete.bookmarkCount > 0)}
                disabled={isDeletingSelectedCategory}
                className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {isDeletingSelectedCategory
                  ? 'Deleting...'
                  : categoryPendingDelete.bookmarkCount > 0
                    ? 'Delete Category and Bookmarks'
                    : 'Delete Category'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );

  return createPortal(modal, document.body);
}
