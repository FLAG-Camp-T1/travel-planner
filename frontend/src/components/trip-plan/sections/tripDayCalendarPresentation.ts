import type { TripDay } from '@/api/tripApi';

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

type TripDayCalendarPlaceholderCell = {
  key: string;
  isPlaceholder: true;
};

type TripDayCalendarDayCell = {
  key: string;
  isPlaceholder: false;
  dayNumber: number;
  dateLabel: string;
  itineraryCountLabel: string;
  isSelected: boolean;
};

export type TripDayCalendarCell = TripDayCalendarPlaceholderCell | TripDayCalendarDayCell;

export type TripDayCalendarModel = {
  showWeekdayHeader: boolean;
  weekdayLetters: readonly string[];
  gridColumnClassName: string;
  cells: TripDayCalendarCell[];
};

const getItineraryCountLabel = (itineraryCount: number) => {
  return itineraryCount === 1 ? '1 stop' : `${itineraryCount} stops`;
};

const parseDateStringToUtcDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getMondayFirstWeekdayIndex = (date: string | null) => {
  if (!date) {
    return null;
  }

  const parsedDate = parseDateStringToUtcDate(date);
  if (!parsedDate) {
    return null;
  }

  return (parsedDate.getUTCDay() + 6) % 7;
};

export const buildTripDayCalendarModel = ({
  days,
  itineraryCountByDayNumber,
  selectedDayNumber,
}: {
  days: TripDay[];
  itineraryCountByDayNumber: Record<number, number>;
  selectedDayNumber: number | null;
}): TripDayCalendarModel => {
  const showWeekdayHeader = days.length > 0 && days.every((day) => day.date !== null);
  const leadingPlaceholderCount = showWeekdayHeader
    ? (getMondayFirstWeekdayIndex(days[0]?.date ?? null) ?? 0)
    : 0;

  const placeholderCells: TripDayCalendarCell[] = Array.from(
    { length: leadingPlaceholderCount },
    (_, index) => ({
      key: `placeholder-${index}`,
      isPlaceholder: true,
    }),
  );

  const dayCells: TripDayCalendarCell[] = days.map((day) => {
    const itineraryCount = itineraryCountByDayNumber[day.dayNumber] ?? 0;

    return {
      key: `day-${day.dayNumber}`,
      isPlaceholder: false,
      dayNumber: day.dayNumber,
      dateLabel: day.date ?? 'No fixed date',
      itineraryCountLabel: getItineraryCountLabel(itineraryCount),
      isSelected: day.dayNumber === selectedDayNumber,
    };
  });

  return {
    showWeekdayHeader,
    weekdayLetters: WEEKDAY_LETTERS,
    gridColumnClassName: showWeekdayHeader ? 'grid-cols-7' : '',
    cells: [...placeholderCells, ...dayCells],
  };
};
