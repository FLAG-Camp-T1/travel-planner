import type { ItineraryItem, TripTravelMethodCommand } from '@/api/tripApi';
import ItineraryLegNode from './ItineraryLegNode';
import ItineraryStopNode from './ItineraryStopNode';
import { getArrivalMethod } from './itineraryPresentation';

type ItineraryListProps = {
  items: ItineraryItem[];
  deletingTargetItemId: number | null;
  deletionStatus: 'idle' | 'loading' | 'ready' | 'error';
  onDeleteItem: (itemId: number) => void;
  onUpdateTravelMethod: (itemId: number, travelMethod: TripTravelMethodCommand) => void;
  updatingTargetItemId: number | null;
  updateStatus: 'idle' | 'loading' | 'ready' | 'error';
};

export default function ItineraryList({
  items,
  deletingTargetItemId,
  deletionStatus,
  onDeleteItem,
  onUpdateTravelMethod,
  updatingTargetItemId,
  updateStatus,
}: ItineraryListProps) {
  return (
    <div className="py-2">
      {items.map((item, itemIndex) => {
        const arrivalMethod = getArrivalMethod(item, itemIndex);
        const showLineAboveStop = itemIndex > 0;
        const showLineBelowStop = itemIndex < items.length - 1;
        const isDeleting = deletionStatus === 'loading' && deletingTargetItemId === item.itemId;
        const isUpdating = updateStatus === 'loading' && updatingTargetItemId === item.itemId;

        return (
          <div key={item.itemId}>
            {itemIndex > 0 ? (
              <ItineraryLegNode
                disabled={isUpdating || isDeleting}
                onUpdateTravelMethod={(travelMethod) =>
                  onUpdateTravelMethod(item.itemId, travelMethod)
                }
                travelMethod={arrivalMethod}
              />
            ) : null}
            <ItineraryStopNode
              isBusy={isDeleting || isUpdating}
              isDeleting={isDeleting}
              item={item}
              onDelete={() => onDeleteItem(item.itemId)}
              showLineAbove={showLineAboveStop}
              showLineBelow={showLineBelowStop}
            />
          </div>
        );
      })}
    </div>
  );
}
