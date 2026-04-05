import type { ItineraryItem } from '@/api/tripApi';
import ItineraryItemCard from './ItineraryItemCard';

type ItineraryListProps = {
  items: ItineraryItem[];
};

export default function ItineraryList({ items }: ItineraryListProps) {
  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => (
        <ItineraryItemCard key={item.itemId} item={item} />
      ))}
    </div>
  );
}
