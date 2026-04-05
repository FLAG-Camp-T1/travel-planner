import type { TripTravelMethodCommand } from '@/api/tripApi';

export const DEFAULT_TRIP_TRAVEL_METHOD_COMMAND: TripTravelMethodCommand = 'DRIVE';
export const DEFAULT_TRIP_TRAVEL_METHOD_LABEL = 'Drive';

const DISPLAYABLE_TRIP_TRAVEL_METHOD_LABELS: Record<
  Exclude<TripTravelMethodCommand, 'TRAVEL_MODE_UNSPECIFIED'>,
  string
> = {
  DRIVE: 'Drive',
  WALK: 'Walk',
  TRANSIT: 'Transit',
  BICYCLE: 'Bicycle',
  TWO_WHEELER: 'Two Wheeler',
};

export const TRIP_TRAVEL_METHOD_OPTIONS = (
  Object.entries(DISPLAYABLE_TRIP_TRAVEL_METHOD_LABELS) as Array<
    [Exclude<TripTravelMethodCommand, 'TRAVEL_MODE_UNSPECIFIED'>, string]
  >
).map(([value, label]) => ({
  value,
  label,
}));

export const toDisplayedTripTravelMethod = (travelMethod: TripTravelMethodCommand) => {
  if (travelMethod === 'TRAVEL_MODE_UNSPECIFIED') {
    return null;
  }

  return DISPLAYABLE_TRIP_TRAVEL_METHOD_LABELS[travelMethod];
};

export const getTripTravelMethodCommandValue = (
  travelMethod: string | null,
): TripTravelMethodCommand => {
  return (
    TRIP_TRAVEL_METHOD_OPTIONS.find((option) => option.label === travelMethod)?.value ??
    DEFAULT_TRIP_TRAVEL_METHOD_COMMAND
  );
};

export const getTripTravelMethodLabel = (travelMethod: string | null) => {
  return travelMethod ?? DEFAULT_TRIP_TRAVEL_METHOD_LABEL;
};
