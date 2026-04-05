import type { TripPlanningSlice } from '../types';

export const getTripDayCacheKey = (tripId: number, dayNumber: number) => `${tripId}:${dayNumber}`;

export const getInvalidatedDayRouteState = (
  state: TripPlanningSlice,
  tripId: number,
  dayNumber: number,
) => {
  const cacheKey = getTripDayCacheKey(tripId, dayNumber);

  return {
    dayRouteByDayNumber: {
      ...state.dayRouteByDayNumber,
      [cacheKey]: null,
    },
    dayRouteSegmentsByDayNumber: {
      ...state.dayRouteSegmentsByDayNumber,
      [cacheKey]: [],
    },
    dayRouteStatusByDayNumber: {
      ...state.dayRouteStatusByDayNumber,
      [cacheKey]: 'idle' as const,
    },
    dayRouteErrorByDayNumber: {
      ...state.dayRouteErrorByDayNumber,
      [cacheKey]: null,
    },
  };
};

export const getPrunedTripDayCachesState = (
  state: TripPlanningSlice,
  tripId: number,
  validDayNumbers: number[],
) => {
  const validCacheKeys = new Set(
    validDayNumbers.map((dayNumber) => getTripDayCacheKey(tripId, dayNumber)),
  );

  const keepCacheKey = (cacheKey: string) =>
    !cacheKey.startsWith(`${tripId}:`) || validCacheKeys.has(cacheKey);

  return {
    dayItemsByDayNumber: Object.fromEntries(
      Object.entries(state.dayItemsByDayNumber).filter(([cacheKey]) => keepCacheKey(cacheKey)),
    ),
    dayItemsStatusByDayNumber: Object.fromEntries(
      Object.entries(state.dayItemsStatusByDayNumber).filter(([cacheKey]) =>
        keepCacheKey(cacheKey),
      ),
    ),
    dayItemsErrorByDayNumber: Object.fromEntries(
      Object.entries(state.dayItemsErrorByDayNumber).filter(([cacheKey]) => keepCacheKey(cacheKey)),
    ),
    dayRouteByDayNumber: Object.fromEntries(
      Object.entries(state.dayRouteByDayNumber).filter(([cacheKey]) => keepCacheKey(cacheKey)),
    ),
    dayRouteSegmentsByDayNumber: Object.fromEntries(
      Object.entries(state.dayRouteSegmentsByDayNumber).filter(([cacheKey]) =>
        keepCacheKey(cacheKey),
      ),
    ),
    dayRouteStatusByDayNumber: Object.fromEntries(
      Object.entries(state.dayRouteStatusByDayNumber).filter(([cacheKey]) =>
        keepCacheKey(cacheKey),
      ),
    ),
    dayRouteErrorByDayNumber: Object.fromEntries(
      Object.entries(state.dayRouteErrorByDayNumber).filter(([cacheKey]) => keepCacheKey(cacheKey)),
    ),
  };
};

export const getCachedDayItemTravelMethodState = (
  state: TripPlanningSlice,
  tripId: number,
  dayNumber: number,
  itemId: number,
  travelMethod: string | null,
) => {
  const cacheKey = getTripDayCacheKey(tripId, dayNumber);

  return {
    dayItemsByDayNumber: {
      ...state.dayItemsByDayNumber,
      [cacheKey]: (state.dayItemsByDayNumber[cacheKey] ?? []).map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              travelMethod,
            }
          : item,
      ),
    },
  };
};

export const getRemovedCachedDayItemState = (
  state: TripPlanningSlice,
  tripId: number,
  dayNumber: number,
  itemId: number,
) => {
  const cacheKey = getTripDayCacheKey(tripId, dayNumber);

  return {
    dayItemsByDayNumber: {
      ...state.dayItemsByDayNumber,
      [cacheKey]: (state.dayItemsByDayNumber[cacheKey] ?? [])
        .filter((item) => item.itemId !== itemId)
        .map((item, index) => ({
          ...item,
          visitOrder: index + 1,
        })),
    },
  };
};

export const getReorderedCachedDayItemsState = (
  state: TripPlanningSlice,
  tripId: number,
  dayNumber: number,
  itemIds: number[],
) => {
  const cacheKey = getTripDayCacheKey(tripId, dayNumber);
  const currentItems = state.dayItemsByDayNumber[cacheKey] ?? [];
  const itemsById = new Map(currentItems.map((item) => [item.itemId, item]));

  return {
    dayItemsByDayNumber: {
      ...state.dayItemsByDayNumber,
      [cacheKey]: itemIds
        .map((itemId) => itemsById.get(itemId))
        .filter((item): item is (typeof currentItems)[number] => item !== undefined)
        .map((item, index) => ({
          ...item,
          visitOrder: index + 1,
        })),
    },
  };
};

export const getMovedCachedDayItemState = (
  state: TripPlanningSlice,
  tripId: number,
  sourceDayNumber: number,
  targetDayNumber: number,
  itemId: number,
) => {
  const sourceCacheKey = getTripDayCacheKey(tripId, sourceDayNumber);
  const targetCacheKey = getTripDayCacheKey(tripId, targetDayNumber);
  const sourceItems = state.dayItemsByDayNumber[sourceCacheKey] ?? [];
  const movedItem = sourceItems.find((item) => item.itemId === itemId);

  if (!movedItem) {
    return {};
  }

  const nextDayItems = {
    ...state.dayItemsByDayNumber,
    [sourceCacheKey]: sourceItems
      .filter((item) => item.itemId !== itemId)
      .map((item, index) => ({
        ...item,
        visitOrder: index + 1,
      })),
  };

  if (Object.prototype.hasOwnProperty.call(state.dayItemsByDayNumber, targetCacheKey)) {
    const targetItems = state.dayItemsByDayNumber[targetCacheKey] ?? [];
    nextDayItems[targetCacheKey] = [
      ...targetItems,
      {
        ...movedItem,
        visitOrder: targetItems.length + 1,
      },
    ];
  }

  return {
    dayItemsByDayNumber: nextDayItems,
  };
};
