import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { TripActionFeedbackEvent } from '@/components/map/tripActionFeedbackBus';
import { subscribeToTripActionFeedback } from '@/components/map/tripActionFeedbackBus';

const AUTO_DISMISS_MS = 2400;
const ENTER_DELAY_MS = 10;

type ToastItem = TripActionFeedbackEvent & {
  visible: boolean;
};

export default function TripActionSuccessToast() {
  const [toastItem, setToastItem] = useState<ToastItem | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }

      if (enterTimerRef.current) {
        clearTimeout(enterTimerRef.current);
        enterTimerRef.current = null;
      }
    };

    const unsubscribe = subscribeToTripActionFeedback((event) => {
      clearTimers();
      setToastItem({ ...event, visible: false });

      enterTimerRef.current = setTimeout(() => {
        setToastItem((currentItem) =>
          currentItem && currentItem.id === event.id
            ? { ...currentItem, visible: true }
            : currentItem,
        );
        enterTimerRef.current = null;
      }, ENTER_DELAY_MS);

      dismissTimerRef.current = setTimeout(() => {
        setToastItem(null);
        dismissTimerRef.current = null;
      }, AUTO_DISMISS_MS);
    });

    return () => {
      unsubscribe();
      clearTimers();
    };
  }, []);

  if (!toastItem) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1090] flex justify-center px-4 pt-4">
      <div
        className={`pointer-events-auto inline-flex max-w-lg items-center gap-3 rounded-full border border-emerald-200 bg-white/96 px-4 py-2.5 text-sm text-emerald-900 shadow-[0_14px_32px_rgba(5,150,105,0.16)] backdrop-blur-sm transition-all duration-300 ${
          toastItem.visible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        }`}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <span className="font-medium">{toastItem.message}</span>
      </div>
    </div>
  );
}
