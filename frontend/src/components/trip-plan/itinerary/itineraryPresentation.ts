import type { ItineraryItem } from '@/api/tripApi';
export { getTravelMethodPalette } from '../travelMethodPresentation';

export const ITINERARY_TIMELINE_X = '2rem';
export const ITINERARY_CONTENT_START_X = '4rem';
export const ITINERARY_LEG_PILL_MIN_HEIGHT = '1.875rem';
export const ITINERARY_LEG_PILL_LEFT = '1.125rem';
export const ITINERARY_LEG_DOT_SIZE = '0.625rem';
export const ITINERARY_DASHED_TIMELINE_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(to bottom, rgb(209 213 219) 0 6px, transparent 6px 12px)',
};

export const getArrivalMethod = (item: ItineraryItem, itemIndex: number) => {
  return itemIndex > 0 ? item.travelMethod : null;
};
