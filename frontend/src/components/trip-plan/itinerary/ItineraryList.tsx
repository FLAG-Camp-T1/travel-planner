import type { ItineraryItem } from '@/api/tripApi';
import ItineraryLegNode from './ItineraryLegNode';
import ItineraryStopNode from './ItineraryStopNode';
import { getArrivalMethod } from './itineraryPresentation';

type ItineraryListProps = {
  items: ItineraryItem[];
};

export default function ItineraryList({ items }: ItineraryListProps) {
  return (
    <div className="py-2">
      {items.map((item, itemIndex) => {
        const arrivalMethod = getArrivalMethod(item, itemIndex);
        const showLineAboveStop = itemIndex > 0;
        const showLineBelowStop = itemIndex < items.length - 1;

        return (
          <div key={item.itemId}>
            {itemIndex > 0 ? <ItineraryLegNode travelMethod={arrivalMethod} /> : null}
            <ItineraryStopNode
              item={item}
              showLineAbove={showLineAboveStop}
              showLineBelow={showLineBelowStop}
            />
          </div>
        );
      })}
    </div>
  );
}
