import type { ItineraryItem, TripDay, TripTravelMethodCommand } from '@/api/tripApi';
import type { RouteSegmentRow } from '@/components/trip-plan/route/routePresentation';
import type { DayRouteColorMode } from '@/utils/dayRouteColorPresentation';
import ItineraryLegNode from './ItineraryLegNode';
import ItineraryStopNode from './ItineraryStopNode';
import { getArrivalMethod } from './itineraryPresentation';
import { getDayRouteSegmentColors } from '@/utils/dayRouteColorPresentation';

type ItineraryListProps = {
  items: ItineraryItem[];
  legRows?: RouteSegmentRow[];
  activeSegmentIndex?: number | null;
  colorMode?: DayRouteColorMode;
  deletingTargetItemId: number | null;
  deletionStatus: 'idle' | 'loading' | 'ready' | 'error';
  moveOptions: TripDay[];
  moveStatus: 'idle' | 'loading' | 'ready' | 'error';
  movingTargetItemId: number | null;
  onDeleteItem: (itemId: number) => void;
  onMoveItemDown: (itemId: number) => void;
  onMoveItemUp: (itemId: number) => void;
  onMoveToDay: (itemId: number, targetDayNumber: number) => void;
  onFocusSegment?: (segmentIndex: number, segment: RouteSegmentRow) => void;
  onUpdateTravelMethod: (itemId: number, travelMethod: TripTravelMethodCommand) => void;
  reorderStatus: 'idle' | 'loading' | 'ready' | 'error';
  updatingTargetItemId: number | null;
  updateStatus: 'idle' | 'loading' | 'ready' | 'error';
};

export default function ItineraryList({
  items,
  legRows = [],
  activeSegmentIndex = null,
  colorMode = 'travelMethod',
  deletingTargetItemId,
  deletionStatus,
  moveOptions,
  moveStatus,
  movingTargetItemId,
  onDeleteItem,
  onMoveItemDown,
  onMoveItemUp,
  onMoveToDay,
  onFocusSegment,
  onUpdateTravelMethod,
  reorderStatus,
  updatingTargetItemId,
  updateStatus,
}: ItineraryListProps) {
  const segmentColors = getDayRouteSegmentColors(legRows, colorMode);

  return (
    <div className="py-2">
      {items.map((item, itemIndex) => {
        const arrivalMethod = getArrivalMethod(item, itemIndex);
        const legRow = itemIndex > 0 ? legRows[itemIndex - 1] : null;
        const showLineAboveStop = itemIndex > 0;
        const showLineBelowStop = itemIndex < items.length - 1;
        const isDeleting = deletionStatus === 'loading' && deletingTargetItemId === item.itemId;
        const isMoving = moveStatus === 'loading' && movingTargetItemId === item.itemId;
        const isUpdating = updateStatus === 'loading' && updatingTargetItemId === item.itemId;
        const isListReordering = reorderStatus === 'loading';
        const isListMoving = moveStatus === 'loading';

        return (
          <div key={item.itemId}>
            {itemIndex > 0 ? (
              <ItineraryLegNode
                disabled={isUpdating || isDeleting || isListReordering || isListMoving}
                colorMode={colorMode}
                contrastColor={segmentColors[itemIndex - 1] ?? null}
                distanceLabel={legRow?.distanceLabel ?? null}
                durationLabel={legRow?.durationLabel ?? null}
                isFocused={activeSegmentIndex === itemIndex - 1}
                isInferred={legRow?.isInferred ?? false}
                onFocus={
                  legRow && onFocusSegment
                    ? () => {
                        onFocusSegment(itemIndex - 1, legRow);
                      }
                    : undefined
                }
                onUpdateTravelMethod={(travelMethod) =>
                  onUpdateTravelMethod(item.itemId, travelMethod)
                }
                toLabel={item.name ?? `Stop ${item.visitOrder}`}
                travelMethod={legRow?.travelMethod ?? arrivalMethod}
              />
            ) : null}
            <ItineraryStopNode
              canMoveDown={itemIndex < items.length - 1}
              canMoveUp={itemIndex > 0}
              isBusy={isDeleting || isUpdating || isListReordering || isListMoving}
              isDeleting={isDeleting}
              isMoving={isMoving}
              item={item}
              moveOptions={moveOptions}
              onDelete={() => onDeleteItem(item.itemId)}
              onMoveDown={() => onMoveItemDown(item.itemId)}
              onMoveUp={() => onMoveItemUp(item.itemId)}
              onMoveToDay={(targetDayNumber) => onMoveToDay(item.itemId, targetDayNumber)}
              showLineAbove={showLineAboveStop}
              showLineBelow={showLineBelowStop}
            />
          </div>
        );
      })}
    </div>
  );
}
