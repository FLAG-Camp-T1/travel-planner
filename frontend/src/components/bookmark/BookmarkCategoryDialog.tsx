import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const CATEGORY_MAX_LENGTH = 20;

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
  const [categoryInput, setCategoryInput] = useState(initialCategory ?? '');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const trimmedCategory = categoryInput.trim();
  const normalizedCategory = trimmedCategory ? trimmedCategory : null;
  const categoryTooLong = trimmedCategory.length > CATEGORY_MAX_LENGTH;
  const helperCopy = useMemo(() => {
    return mode === 'create'
      ? 'Save this place now and optionally give it your own tag.'
      : 'Update the saved tag for this bookmark. Leave it empty to clear the tag.';
  }, [mode]);
  const title = mode === 'create' ? 'Save Bookmark' : 'Edit Bookmark Tag';
  const submitLabel =
    mode === 'create'
      ? isSubmitting
        ? 'Saving Bookmark'
        : 'Save Bookmark'
      : isSubmitting
        ? 'Saving Tag'
        : 'Save Tag';
  const canSubmit = !isSubmitting && !categoryTooLong;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    void (async () => {
      try {
        await onSubmit(normalizedCategory);
        onClose();
      } catch {
        return;
      }
    })();
  };

  const modal = (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!isSubmitting) {
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
            disabled={isSubmitting}
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
            <span className="text-sm font-medium text-gray-700">Your bookmark tag</span>
            <input
              type="text"
              value={categoryInput}
              onChange={(event) => setCategoryInput(event.target.value)}
              placeholder="Weekend food spots"
              maxLength={CATEGORY_MAX_LENGTH + 1}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
              <span>Optional. Up to {CATEGORY_MAX_LENGTH} characters.</span>
              <span className={categoryTooLong ? 'font-medium text-red-600' : ''}>
                {trimmedCategory.length}/{CATEGORY_MAX_LENGTH}
              </span>
            </div>
          </label>

          {categoryTooLong ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              Bookmark tag must be at most {CATEGORY_MAX_LENGTH} characters.
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
