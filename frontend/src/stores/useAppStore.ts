import type {} from '@redux-devtools/extension';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createBookmarkSlice } from './slices/bookmarkSlice';
import { createRouteSlice } from './slices/routeSlice';
import type { AppStore } from './types';

// One store with slices keeps shared state discoverable as the app grows.
// Async actions live here, while API modules stay focused on transport concerns.
export const useAppStore = create<AppStore>()(
  devtools(
    (...args) => ({
      ...createRouteSlice(...args),
      ...createBookmarkSlice(...args),
    }),
    {
      name: 'travel-planner-store',
      enabled: import.meta.env.DEV,
    },
  ),
);
