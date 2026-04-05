import type { RouteViewport } from '@/api/tripApi';

type DayRouteViewportFocusListener = (viewport: RouteViewport) => void;

const listeners = new Set<DayRouteViewportFocusListener>();

export const emitDayRouteViewportFocus = (viewport: RouteViewport) => {
  listeners.forEach((listener) => listener(viewport));
};

export const subscribeToDayRouteViewportFocus = (listener: DayRouteViewportFocusListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
