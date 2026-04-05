import { AlertCircle, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiErrorEvent } from '@/api/apiErrorBus';
import { subscribeToApiErrors } from '@/api/apiErrorBus';

const AUTO_DISMISS_MS = 3000;
const ENTER_DELAY_MS = 10;
const MAX_RENDERED_BANNERS = 5;

type BannerItem = ApiErrorEvent & {
  visible: boolean;
};

const getBannerDepthClassName = (index: number) => {
  if (index === 0) {
    return 'opacity-100 scale-100';
  }

  if (index === 1) {
    return 'opacity-95 scale-[0.995]';
  }

  if (index === 2) {
    return 'opacity-85 scale-[0.99]';
  }

  if (index === 3) {
    return 'opacity-65 scale-[0.985]';
  }

  return 'opacity-40 scale-[0.98]';
};

export default function GlobalApiErrorBanner() {
  const [bannerItems, setBannerItems] = useState<BannerItem[]>([]);
  const dismissTimersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const enterTimersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const clearDismissTimer = useCallback((id: number) => {
    const timer = dismissTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      dismissTimersRef.current.delete(id);
    }
  }, []);

  const clearEnterTimer = useCallback((id: number) => {
    const timer = enterTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      enterTimersRef.current.delete(id);
    }
  }, []);

  const closeBanner = useCallback(
    (id: number) => {
      clearDismissTimer(id);
      clearEnterTimer(id);
      setBannerItems((currentItems) => currentItems.filter((item) => item.id !== id));
    },
    [clearDismissTimer, clearEnterTimer],
  );

  useEffect(() => {
    const clearTimers = () => {
      dismissTimersRef.current.forEach((timer) => clearTimeout(timer));
      dismissTimersRef.current.clear();
      enterTimersRef.current.forEach((timer) => clearTimeout(timer));
      enterTimersRef.current.clear();
    };

    const unsubscribe = subscribeToApiErrors((event) => {
      clearDismissTimer(event.id);
      clearEnterTimer(event.id);

      setBannerItems((currentItems) => [{ ...event, visible: false }, ...currentItems]);

      const enterTimer = setTimeout(() => {
        setBannerItems((currentItems) =>
          currentItems.map((item) => (item.id === event.id ? { ...item, visible: true } : item)),
        );
        enterTimersRef.current.delete(event.id);
      }, ENTER_DELAY_MS);
      enterTimersRef.current.set(event.id, enterTimer);

      const dismissTimer = setTimeout(() => {
        closeBanner(event.id);
      }, AUTO_DISMISS_MS);
      dismissTimersRef.current.set(event.id, dismissTimer);
    });

    return () => {
      unsubscribe();
      clearTimers();
    };
  }, [clearDismissTimer, clearEnterTimer, closeBanner]);

  if (bannerItems.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1100] flex justify-center px-4 pt-4">
      <div className="flex w-full max-w-2xl flex-col gap-3">
        {bannerItems.slice(0, MAX_RENDERED_BANNERS).map((item, index) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-[0_18px_40px_rgba(127,29,29,0.18)] ring-1 ring-red-100 transition-all duration-300 ease-out ${
              item.visible ? 'translate-y-0' : '-translate-y-4'
            } ${item.visible ? getBannerDepthClassName(index) : 'opacity-0'} ${
              index >= 3 ? 'backdrop-blur-[1px]' : ''
            }`}
          >
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
              <AlertCircle className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">API request failed</div>
              <p className="mt-1 text-sm text-red-700">{item.message}</p>
            </div>

            <button
              type="button"
              onClick={() => closeBanner(item.id)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-200 bg-white/80 text-red-600 transition hover:bg-white"
              aria-label="Dismiss API error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
