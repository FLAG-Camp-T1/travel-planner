import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/stores/useAppStore';

const CATEGORY_MAX_LENGTH = 20;
const NO_CATEGORY_VALUE = '__none__';

type BookmarkCategoryDialogProps = {
  mode: 'create' | 'edit';
  placeName: string;
  placeAddress: string;
  initialCategory?: string | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (category: string | null) => Promise<void>;
};

export default function BookmarkCategoryDialog({
  mode,
  placeName,
  placeAddress,
  initialCategory = null,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: BookmarkCategoryDialogProps) {
  const {
    bookmarkCategories,
    bookmarkCategoriesError,
    bookmarkCategoriesStatus,
    createBookmarkCategory,
    fetchBookmarkCategories,
  } = useAppStore(
    useShallow((state) => ({
      bookmarkCategories: state.bookmarkCategories,
      bookmarkCategoriesError: state.bookmarkCategoriesError,
      bookmarkCategoriesStatus: state.bookmarkCategoriesStatus,
      createBookmarkCategory: state.createBookmarkCategory,
      fetchBookmarkCategories: state.fetchBookmarkCategories,
    })),
  );

  const [selectedCategory, setSelectedCategory] = useState(initialCategory ?? NO_CATEGORY_VALUE);
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [createCategoryError, setCreateCategoryError] = useState<string | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    setSelectedCategory(initialCategory ?? NO_CATEGORY_VALUE);
  }, [initialCategory]);

  useEffect(() => {
    if (bookmarkCategoriesStatus === 'idle') {
      void fetchBookmarkCategories();
    }
  }, [bookmarkCategoriesStatus, fetchBookmarkCategories]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting && !isCreatingCategory) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreatingCategory, isSubmitting, onClose]);

  const helperCopy = useMemo(() => {
    return mode === 'create'
      ? 'Save this place now and choose a category if you want to organize it.'
      : 'Move this bookmark into another category, or leave it uncategorized.';
  }, [mode]);
  const title = mode === 'create' ? 'Save Bookmark' : 'Edit Bookmark Category';
  const submitLabel =
    mode === 'create'
      ? isSubmitting
        ? 'Saving Bookmark'
        : 'Save Bookmark'
      : isSubmitting
        ? 'Saving Category'
        : 'Save Category';
  const canSubmit = !isSubmitting && !isCreatingCategory;
  const trimmedCategoryName = newCategoryName.trim();
  const categoryNameTooLong = trimmedCategoryName.length > CATEGORY_MAX_LENGTH;
  const hasSelectedCategory =
    selectedCategory === NO_CATEGORY_VALUE ||
    bookmarkCategories.some((category) => category.name === selectedCategory) ||
    selectedCategory === initialCategory;
  const categoryOptions = hasSelectedCategory
    ? bookmarkCategories
    : [
        ...bookmarkCategories,
        { categoryId: `ad-hoc-${selectedCategory}`, name: selectedCategory, bookmarkCount: 0 },
      ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    void (async () => {
      try {
        await onSubmit(selectedCategory === NO_CATEGORY_VALUE ? null : selectedCategory);
        onClose();
      } catch {
        return;
      }
    })();
  };

  const handleCreateCategory = (event?: FormEvent) => {
    event?.preventDefault();

    if (isCreatingCategory) {
      return;
    }

    if (!trimmedCategoryName) {
      setCreateCategoryError('Category name is required.');
      return;
    }

    if (categoryNameTooLong) {
      setCreateCategoryError(`Category name must be at most ${CATEGORY_MAX_LENGTH} characters.`);
      return;
    }

    void (async () => {
      try {
        setIsCreatingCategory(true);
        setCreateCategoryError(null);
        const createdCategory = await createBookmarkCategory(trimmedCategoryName);
        setSelectedCategory(createdCategory.name);
        setNewCategoryName('');
        setIsCreateSectionOpen(false);
      } catch (createError) {
        setCreateCategoryError(
          createError instanceof Error ? createError.message : 'Failed to create category.',
        );
      } finally {
        setIsCreatingCategory(false);
      }
    })();
  };

  const modal = (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!isSubmitting && !isCreatingCategory) {
            onClose();
          }
        }}
      />

      <section className="relative z-10 w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{helperCopy}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isCreatingCategory}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-sm font-semibold text-slate-800">{placeName}</div>
          <div className="mt-1 text-sm text-slate-500">{placeAddress}</div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Category</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              disabled={isSubmitting || isCreatingCategory}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value={NO_CATEGORY_VALUE}>No category</option>
              {categoryOptions.map((category) => (
                <option key={category.categoryId} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500">
              {bookmarkCategoriesStatus === 'loading' && bookmarkCategories.length === 0
                ? 'Loading categories...'
                : 'Choose an existing category or create a new one below.'}
            </div>
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-800">Create new category</div>
                <div className="mt-1 text-xs text-slate-500">
                  Add a reusable category without leaving this flow.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateSectionOpen((current) => !current);
                  setCreateCategoryError(null);
                }}
                disabled={isSubmitting || isCreatingCategory}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreateSectionOpen ? 'Hide' : 'Create New'}
              </button>
            </div>

            {isCreateSectionOpen ? (
              <div className="mt-3 space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-gray-700">New category name</span>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="Weekend food spots"
                    maxLength={CATEGORY_MAX_LENGTH + 1}
                    disabled={isSubmitting || isCreatingCategory}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                  <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                    <span>Up to {CATEGORY_MAX_LENGTH} characters.</span>
                    <span className={categoryNameTooLong ? 'font-medium text-red-600' : ''}>
                      {trimmedCategoryName.length}/{CATEGORY_MAX_LENGTH}
                    </span>
                  </div>
                </label>

                {createCategoryError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {createCategoryError}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => handleCreateCategory()}
                  disabled={isSubmitting || isCreatingCategory}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                >
                  {isCreatingCategory ? 'Creating Category' : 'Create Category'}
                </button>
              </div>
            ) : null}
          </div>

          {bookmarkCategoriesError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {bookmarkCategoriesError}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
          >
            {submitLabel}
          </button>
        </form>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
