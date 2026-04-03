const previewItineraryItems = [
  { visitOrder: 1, placeName: 'Georgetown Waterfront', travelMethod: 'Walk' },
  { visitOrder: 2, placeName: 'Lincoln Memorial', travelMethod: 'Drive' },
  { visitOrder: 3, placeName: 'Smithsonian Castle', travelMethod: 'Transit' },
];

export default function ItinerarySection() {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Selected Day Itinerary</h2>
          <p className="mt-1 text-sm text-gray-500">
            Preview only. These rows illustrate the future itinerary structure.
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          Static Preview
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
          Trip-day items will appear here once real selected-day state and item data are connected.
        </div>

        <div className="divide-y divide-gray-100">
          {previewItineraryItems.map((item) => (
            <div
              key={`${item.visitOrder}-${item.placeName}`}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                  {item.visitOrder}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.placeName}</div>
                  <div className="mt-1 text-xs text-gray-500">Preview itinerary item</div>
                </div>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {item.travelMethod}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
