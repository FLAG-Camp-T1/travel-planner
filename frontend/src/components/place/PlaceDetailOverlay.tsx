import { ArrowLeft, Clock3, ExternalLink, Globe, MapPinned, Star } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import BookmarkButton from '@/components/bookmark/BookmarkButton';
import { useAppStore } from '@/stores/useAppStore';

const formatCoordinate = (value: number | null) => {
  return value == null ? 'Unavailable' : value.toFixed(5);
};

const formatRatingCount = (count: number | null) => {
  return count == null ? null : `${count.toLocaleString()} reviews`;
};

export default function PlaceDetailOverlay() {
  const {
    activeDetailOverlay,
    createDayItem,
    currentTrip,
    dayItemCreationError,
    dayItemCreationStatus,
    dayItemCreationTargetPlaceId,
    days,
    daysStatus,
    closePlaceDetail,
    placeDetail,
    placeDetailError,
    placeDetailStatus,
    selectedDayNumber,
    setActivePlannerPanel,
    tripStatus,
  } = useAppStore(
    useShallow((state) => ({
      activeDetailOverlay: state.activeDetailOverlay,
      createDayItem: state.createDayItem,
      currentTrip: state.currentTrip,
      dayItemCreationError: state.dayItemCreationError,
      dayItemCreationStatus: state.dayItemCreationStatus,
      dayItemCreationTargetPlaceId: state.dayItemCreationTargetPlaceId,
      days: state.days,
      daysStatus: state.daysStatus,
      closePlaceDetail: state.closePlaceDetail,
      placeDetail: state.placeDetail,
      placeDetailError: state.placeDetailError,
      placeDetailStatus: state.placeDetailStatus,
      selectedDayNumber: state.selectedDayNumber,
      setActivePlannerPanel: state.setActivePlannerPanel,
      tripStatus: state.tripStatus,
    })),
  );

  if (!activeDetailOverlay) {
    return null;
  }

  const summary = activeDetailOverlay.sourceSummary;
  const name = placeDetail?.name ?? summary.name;
  const address = placeDetail?.address ?? summary.address;
  const categoryLabel = placeDetail?.categoryLabel ?? summary.categoryLabel;
  const rating = placeDetail?.rating ?? summary.rating;
  const ratingCount = formatRatingCount(placeDetail?.userRatingCount ?? null);
  const latitude = placeDetail?.latitude ?? summary.latitude;
  const longitude = placeDetail?.longitude ?? summary.longitude;
  const openingHours = placeDetail?.openingWeekdayDescriptions ?? [];
  const googleMapsUri = placeDetail?.googleMapsUri;
  const websiteUri = placeDetail?.websiteUri;
  const canBookmark = latitude != null && longitude != null;
  const isSelectedDayReady =
    currentTrip !== null &&
    tripStatus === 'ready' &&
    daysStatus === 'ready' &&
    selectedDayNumber !== null &&
    days.some((day) => day.dayNumber === selectedDayNumber);
  const canAddToDay = activeDetailOverlay.kind === 'poi' && isSelectedDayReady;
  const isAddingThisPlace =
    dayItemCreationStatus === 'loading' &&
    dayItemCreationTargetPlaceId === activeDetailOverlay.placeId;
  const creationErrorForThisPlace =
    dayItemCreationTargetPlaceId === activeDetailOverlay.placeId ? dayItemCreationError : null;

  const handleAddToDay = async () => {
    if (!currentTrip || selectedDayNumber === null || activeDetailOverlay.kind !== 'poi') {
      return;
    }

    try {
      await createDayItem(currentTrip.tripId, selectedDayNumber, {
        placeId: activeDetailOverlay.placeId,
      });
      setActivePlannerPanel('trips');
    } catch {
      return;
    }
  };

  return (
    <div className="absolute inset-0 z-10 bg-white/72 backdrop-blur-sm">
      <div className="absolute inset-0 flex h-full flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              {activeDetailOverlay.kind === 'bookmark' ? 'Saved Bookmark' : 'Place Details'}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-slate-800">Place Overview</h2>
          </div>

          <button
            type="button"
            onClick={closePlaceDetail}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 px-4 py-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{address}</p>
                </div>

                {canBookmark ? (
                  <BookmarkButton
                    googlePlaceId={activeDetailOverlay.placeId}
                    poiName={name}
                    poiAddress={address}
                    poiLatitude={latitude}
                    poiLongitude={longitude}
                    category={categoryLabel ?? undefined}
                  />
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {categoryLabel ? (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {categoryLabel}
                  </span>
                ) : null}
                {rating != null ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {rating.toFixed(1)}
                    {ratingCount ? <span className="text-amber-600/80">{ratingCount}</span> : null}
                  </span>
                ) : null}
              </div>

              {placeDetailStatus === 'loading' ? (
                <p className="mt-4 text-xs text-slate-500">Loading richer place details…</p>
              ) : null}
              {placeDetailStatus === 'error' ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {placeDetailError ?? 'We could not load richer place details right now.'}
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-800">Quick Actions</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeDetailOverlay.kind === 'poi' ? (
                  <button
                    type="button"
                    onClick={() => void handleAddToDay()}
                    disabled={!canAddToDay || isAddingThisPlace}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                  >
                    {isAddingThisPlace
                      ? 'Adding...'
                      : canAddToDay
                        ? `Add to Day ${selectedDayNumber}`
                        : 'Select a Trip Day'}
                  </button>
                ) : null}
                {googleMapsUri ? (
                  <a
                    href={googleMapsUri}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    <MapPinned className="h-3.5 w-3.5" />
                    Open in Google Maps
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
                {websiteUri ? (
                  <a
                    href={websiteUri}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Visit Website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
              {activeDetailOverlay.kind === 'poi' && currentTrip && selectedDayNumber !== null ? (
                <p className="mt-3 text-sm text-slate-500">
                  Adds this place to{' '}
                  <span className="font-medium text-slate-700">{currentTrip.title}</span> on Day{' '}
                  {selectedDayNumber}.
                </p>
              ) : null}
              {activeDetailOverlay.kind === 'poi' && !canAddToDay ? (
                <p className="mt-3 text-sm text-slate-500">
                  Choose a trip day before adding this place to your itinerary.
                </p>
              ) : null}
              {activeDetailOverlay.kind === 'poi' && creationErrorForThisPlace ? (
                <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {creationErrorForThisPlace}
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-800">Location</div>
              <dl className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500">Address</dt>
                  <dd className="max-w-[60%] text-right text-slate-700">{address}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500">Latitude</dt>
                  <dd className="font-mono text-slate-700">{formatCoordinate(latitude)}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500">Longitude</dt>
                  <dd className="font-mono text-slate-700">{formatCoordinate(longitude)}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Clock3 className="h-4 w-4 text-slate-500" />
                Opening Hours
              </div>
              {openingHours.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {openingHours.map((line) => (
                    <li key={line} className="rounded-2xl bg-slate-50 px-3 py-2">
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Opening hours are unavailable.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
