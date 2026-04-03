import type {} from '@redux-devtools/extension';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createAuthSlice } from './slices/authSlice';
import { createBookmarkSlice } from './slices/bookmarkSlice';
import { createRouteSlice } from './slices/routeSlice';
import { createTripPlanningSlice } from './slices/tripPlanningSlice';
import type { AppStore } from './types';

// One store with slices keeps shared state discoverable as the app grows.
// Async actions live here, while API modules stay focused on transport concerns.
// Ephemeral page inputs stay local so the store only owns cross-route shared state.
export const useAppStore = create<AppStore>()(
  devtools(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createRouteSlice(...args),
      ...createBookmarkSlice(...args),
      ...createTripPlanningSlice(...args),
    }),
    {
      name: 'travel-planner-store',
      enabled: import.meta.env.DEV,
    },
  ),
);
