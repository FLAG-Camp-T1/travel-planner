import type { ItineraryItem } from '@/api/tripApi';

type ItineraryItemCardProps = {
  item: ItineraryItem;
};

export default function ItineraryItemCard({ item }: ItineraryItemCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
          {item.visitOrder}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{item.name}</div>
          <div className="mt-1 text-xs text-gray-500">Selected-day itinerary item</div>
        </div>
      </div>

      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
        {item.travelMethod}
      </span>
    </div>
  );
}
