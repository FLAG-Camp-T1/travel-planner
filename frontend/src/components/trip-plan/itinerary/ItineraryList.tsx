import type { ItineraryItem, TripTravelMethodCommand } from '@/api/tripApi';
import ItineraryLegNode from './ItineraryLegNode';
import ItineraryStopNode from './ItineraryStopNode';
import { getArrivalMethod } from './itineraryPresentation';

type ItineraryListProps = {
  items: ItineraryItem[];
  deletingTargetItemId: number | null;
  deletionStatus: 'idle' | 'loading' | 'ready' | 'error';
  onDeleteItem: (itemId: number) => void;
  onMoveItemDown: (itemId: number) => void;
  onMoveItemUp: (itemId: number) => void;
  onUpdateTravelMethod: (itemId: number, travelMethod: TripTravelMethodCommand) => void;
  reorderStatus: 'idle' | 'loading' | 'ready' | 'error';
  updatingTargetItemId: number | null;
  updateStatus: 'idle' | 'loading' | 'ready' | 'error';
};

export default function ItineraryList({
  items,
  deletingTargetItemId,
  deletionStatus,
  onDeleteItem,
  onMoveItemDown,
  onMoveItemUp,
  onUpdateTravelMethod,
  reorderStatus,
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
        const isListReordering = reorderStatus === 'loading';

        return (
          <div key={item.itemId}>
            {itemIndex > 0 ? (
              <ItineraryLegNode
                disabled={isUpdating || isDeleting || isListReordering}
                onUpdateTravelMethod={(travelMethod) =>
                  onUpdateTravelMethod(item.itemId, travelMethod)
                }
                travelMethod={arrivalMethod}
              />
            ) : null}
            <ItineraryStopNode
              canMoveDown={itemIndex < items.length - 1}
              canMoveUp={itemIndex > 0}
              isBusy={isDeleting || isUpdating || isListReordering}
              isDeleting={isDeleting}
              item={item}
              onDelete={() => onDeleteItem(item.itemId)}
              onMoveDown={() => onMoveItemDown(item.itemId)}
              onMoveUp={() => onMoveItemUp(item.itemId)}
              showLineAbove={showLineAboveStop}
              showLineBelow={showLineBelowStop}
            />
          </div>
        );
      })}
    </div>
  );
}
