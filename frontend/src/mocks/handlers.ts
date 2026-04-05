import { http, HttpResponse } from 'msw';
import type { AuthResponse, LoginCredentials, SignupData } from '@/api/authApi';
import type { Bookmark, CreateBookmarkRequest } from '@/api/bookmarkApi';
import type { POIDto, POISearchRequest } from '@/api/poiApi';
import type { RouteRequest, RouteSummary } from '@/api/routeApi';
import type {
  CreateTripRequest,
  GenerateDayRouteResponse,
  ItineraryItem,
  TripDay,
  TripDayItemsResponse,
  TripDaysResponse,
  TripSummary,
} from '@/api/tripApi';
import type { MockFailureFlag } from './mockScenario';
import { MOCK_FLAGS_HEADER } from './mockScenario';
import { buildLegacyRouteSummary, buildMockTripDayRouteResult } from './routeFixtures';

const API_BASE_URL = 'http://localhost:8080/api/v1';

interface MockApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

const createSuccessResponse = <T>(data: T) => {
  return HttpResponse.json<MockApiResponse<T>>({
    code: 20000,
    message: 'OK',
    success: true,
    data,
  });
};

const createErrorResponse = (message: string, code = 40000) => {
  return HttpResponse.json<MockApiResponse<null>>({
    code,
    message,
    success: false,
    data: null,
  });
};

const MOCK_DELAY_MS = 250;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const waitForMockDelay = async () => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
};

const getMockFlagsFromRequest = (request: Request) => {
  const rawHeaderValue = request.headers.get(MOCK_FLAGS_HEADER);
  if (!rawHeaderValue) {
    return new Set<MockFailureFlag>();
  }

  const flags = rawHeaderValue
    .split(',')
    .map((flag) => flag.trim())
    .filter(
      (flag): flag is MockFailureFlag =>
        flag === 'trip-create-error' ||
        flag === 'trip-bootstrap-trip-error' ||
        flag === 'trip-bootstrap-days-error' ||
        flag === 'trip-day-route-error' ||
        flag === 'legacy-route-error',
    );

  return new Set<MockFailureFlag>(flags);
};

const parseUtcDateString = (rawValue: string) => {
  const match = ISO_DATE_PATTERN.exec(rawValue);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return null;
  }

  return utcDate;
};

const formatUtcDateString = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

const buildMockTripDays = (durationDays: number, startDate?: string | null): TripDay[] => {
  const parsedStartDate =
    typeof startDate === 'string' && startDate.trim().length > 0
      ? parseUtcDateString(startDate)
      : null;

  return Array.from({ length: durationDays }, (_, index) => {
    const currentDate = parsedStartDate
      ? new Date(parsedStartDate.getTime() + index * 24 * 60 * 60 * 1000)
      : null;

    return {
      dayNumber: index + 1,
      date: currentDate ? formatUtcDateString(currentDate) : null,
    };
  });
};

let nextBookmarkSequence = 3;
let nextTripSequence = 1002;

let mockUsers: Array<{ username: string; password: string }> = [
  {
    username: 'demo',
    password: 'demo1234',
  },
];

const createMockToken = (username: string) => `mock-token-${username}`;

let mockBookmarks: Bookmark[] = [
  {
    bookmarkId: 'bookmark-1',
    poiId: 'poi-1',
    googlePlaceId: 'ChIJVTPokywQkFQRmtVEaUZlJRA',
    poiName: 'Pike Place Market',
    poiAddress: '85 Pike St, Seattle, WA 98101, USA',
    poiLatitude: 47.609722,
    poiLongitude: -122.342222,
    category: 'market',
  },
  {
    bookmarkId: 'bookmark-2',
    poiId: 'poi-2',
    googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    poiName: 'Sydney Opera House',
    poiAddress: 'Bennelong Point, Sydney NSW 2000, Australia',
    poiLatitude: -33.856784,
    poiLongitude: 151.215297,
    category: 'landmark',
  },
];

let mockTrips: TripSummary[] = [
  {
    tripId: 1001,
    title: 'Spring DC Trip',
    durationDays: 3,
    startDate: null,
  },
];

const mockTripDaysByTripId: Record<number, TripDay[]> = {
  1001: [
    { dayNumber: 1, date: null },
    { dayNumber: 2, date: null },
    { dayNumber: 3, date: null },
  ],
};

const mockTripItemsByTripId: Record<number, Record<number, ItineraryItem[]>> = {
  1001: {
    1: [
      {
        itemId: 101,
        placeId: 'place-georgetown-waterfront',
        name: 'Georgetown Waterfront',
        visitOrder: 1,
        travelMethod: 'Walk',
      },
      {
        itemId: 102,
        placeId: 'place-lincoln-memorial',
        name: 'Lincoln Memorial',
        visitOrder: 2,
        travelMethod: 'Drive',
      },
    ],
    2: [
      {
        itemId: 201,
        placeId: 'place-smithsonian-castle',
        name: 'Smithsonian Castle',
        visitOrder: 1,
        travelMethod: null,
      },
    ],
    3: [],
  },
};

const mockPoiResults: POIDto[] = [
  {
    placeId: 'poi-search-1',
    name: 'National Air and Space Museum',
    address: '600 Independence Ave SW, Washington, DC 20560, USA',
    latitude: 38.8882,
    longitude: -77.0199,
    poiType: 'Museum',
    rating: 4.7,
  },
  {
    placeId: 'poi-search-2',
    name: 'Founding Farmers DC',
    address: '1924 Pennsylvania Ave NW, Washington, DC 20006, USA',
    latitude: 38.9007,
    longitude: -77.0447,
    poiType: 'Restaurant',
    rating: 4.4,
  },
  {
    placeId: 'poi-search-3',
    name: 'The LINE DC',
    address: '1770 Euclid St NW, Washington, DC 20009, USA',
    latitude: 38.9235,
    longitude: -77.0418,
    poiType: 'Lodging',
    rating: 4.5,
  },
  {
    placeId: 'poi-search-4',
    name: 'National Mall',
    address: 'Washington, DC 20004, USA',
    latitude: 38.8896,
    longitude: -77.023,
    poiType: 'Tourist Attraction',
    rating: 4.8,
  },
];

export const handlers = [
  http.post<never, LoginCredentials, MockApiResponse<AuthResponse> | MockApiResponse<null>>(
    `${API_BASE_URL}/login`,
    async ({ request }) => {
      const requestBody = (await request.json()) as LoginCredentials;
      const username = requestBody.username?.trim();
      const password = requestBody.password?.trim();

      if (!username || !password) {
        return createErrorResponse('Username and password are required.', 40002);
      }

      const matchedUser = mockUsers.find(
        (user) => user.username === username && user.password === password,
      );

      if (!matchedUser) {
        return createErrorResponse('Invalid username or password.', 40100);
      }

      return createSuccessResponse<AuthResponse>({
        token: createMockToken(matchedUser.username),
      });
    },
  ),

  http.post<never, SignupData, MockApiResponse<AuthResponse> | MockApiResponse<null>>(
    `${API_BASE_URL}/signup`,
    async ({ request }) => {
      const requestBody = (await request.json()) as SignupData;
      const username = requestBody.username?.trim();
      const password = requestBody.password?.trim();

      if (!username || !password) {
        return createErrorResponse('Username and password are required.', 40002);
      }

      const usernameExists = mockUsers.some((user) => user.username === username);

      if (usernameExists) {
        return createErrorResponse('Username already exists.', 40000);
      }

      mockUsers = [...mockUsers, { username, password }];

      return createSuccessResponse<AuthResponse>({
        token: createMockToken(username),
      });
    },
  ),

  http.post(`${API_BASE_URL}/logout`, () => {
    return createSuccessResponse(null);
  }),

  http.post<never, RouteRequest, MockApiResponse<RouteSummary> | MockApiResponse<null>>(
    `${API_BASE_URL}/routes/request`,
    async ({ request }) => {
      await waitForMockDelay();

      if (getMockFlagsFromRequest(request).has('legacy-route-error')) {
        return createErrorResponse('Legacy debug route request failed in mock mode.', 50010);
      }

      const requestBody = (await request.json()) as RouteRequest;
      const originPlaceId = requestBody.originPlaceId?.trim();
      const destinationPlaceId = requestBody.destinationPlaceId?.trim();

      if (!originPlaceId || !destinationPlaceId) {
        return createErrorResponse('Origin and destination place IDs are required.', 40002);
      }

      return createSuccessResponse(buildLegacyRouteSummary(originPlaceId, destinationPlaceId));
    },
  ),

  http.post<never, POISearchRequest, MockApiResponse<POIDto[]> | MockApiResponse<null>>(
    `${API_BASE_URL}/poi/search`,
    async ({ request }) => {
      await waitForMockDelay();

      const requestBody = (await request.json()) as POISearchRequest;
      const keyword = requestBody.keyword?.trim().toLowerCase();

      if (!keyword) {
        return createErrorResponse('Search keyword cannot be empty', 40002);
      }

      const results = mockPoiResults.filter((poi) => {
        const haystacks = [poi.name, poi.address, poi.poiType].map((value) => value.toLowerCase());
        return haystacks.some((value) => value.includes(keyword));
      });

      return createSuccessResponse(results);
    },
  ),

  http.get(`${API_BASE_URL}/bookmarks`, () => {
    return createSuccessResponse(mockBookmarks);
  }),

  http.post(`${API_BASE_URL}/bookmarks`, async ({ request }) => {
    const requestBody = (await request.json()) as CreateBookmarkRequest;

    const newBookmark: Bookmark = {
      bookmarkId: `bookmark-${nextBookmarkSequence}`,
      poiId: `poi-${nextBookmarkSequence}`,
      googlePlaceId: requestBody.googlePlaceId,
      poiName: requestBody.poiName,
      poiAddress: requestBody.poiAddress,
      poiLatitude: requestBody.poiLatitude,
      poiLongitude: requestBody.poiLongitude,
      category: requestBody.category,
    };

    nextBookmarkSequence += 1;
    mockBookmarks = [...mockBookmarks, newBookmark];

    return createSuccessResponse(newBookmark);
  }),

  http.delete(`${API_BASE_URL}/bookmarks/:bookmarkId`, ({ params }) => {
    const { bookmarkId } = params;

    if (typeof bookmarkId !== 'string') {
      return createErrorResponse('bookmarkId is required', 40002);
    }

    const bookmarkExists = mockBookmarks.some((bookmark) => bookmark.bookmarkId === bookmarkId);

    if (!bookmarkExists) {
      return createErrorResponse(`Bookmark ${bookmarkId} not found`);
    }

    mockBookmarks = mockBookmarks.filter((bookmark) => bookmark.bookmarkId !== bookmarkId);

    return createSuccessResponse(null);
  }),

  http.post<never, CreateTripRequest, MockApiResponse<TripSummary> | MockApiResponse<null>>(
    `${API_BASE_URL}/trips/create`,
    async ({ request }) => {
      await waitForMockDelay();

      if (getMockFlagsFromRequest(request).has('trip-create-error')) {
        return createErrorResponse('Trip creation failed in mock mode.', 50011);
      }

      const requestBody = (await request.json()) as CreateTripRequest;
      const title = requestBody.title?.trim();
      const durationDays = requestBody.durationDays;

      if (!title || !durationDays || durationDays < 1) {
        return createErrorResponse('Trip title and durationDays are required.', 40002);
      }

      const newTrip: TripSummary = {
        tripId: nextTripSequence,
        title,
        durationDays,
        startDate: requestBody.startDate ?? null,
      };

      mockTrips = [...mockTrips, newTrip];
      mockTripDaysByTripId[newTrip.tripId] = buildMockTripDays(
        durationDays,
        requestBody.startDate ?? null,
      );
      mockTripItemsByTripId[newTrip.tripId] = Object.fromEntries(
        Array.from({ length: durationDays }, (_, index) => [index + 1, []]),
      );

      nextTripSequence += 1;

      return createSuccessResponse(newTrip);
    },
  ),

  http.get<{ tripId: string }, never, MockApiResponse<TripSummary> | MockApiResponse<null>>(
    `${API_BASE_URL}/trips/:tripId`,
    async ({ params, request }) => {
      await waitForMockDelay();

      if (getMockFlagsFromRequest(request).has('trip-bootstrap-trip-error')) {
        return createErrorResponse('Trip bootstrap failed during trip fetch in mock mode.', 50012);
      }

      const tripId = Number(params.tripId);
      const trip = mockTrips.find((item) => item.tripId === tripId);

      if (!trip) {
        return createErrorResponse(`Trip ${params.tripId} not found.`, 40404);
      }

      return createSuccessResponse(trip);
    },
  ),

  http.get<{ tripId: string }, never, MockApiResponse<TripDaysResponse> | MockApiResponse<null>>(
    `${API_BASE_URL}/trips/:tripId/days`,
    async ({ params, request }) => {
      await waitForMockDelay();

      if (getMockFlagsFromRequest(request).has('trip-bootstrap-days-error')) {
        return createErrorResponse('Trip bootstrap failed during day fetch in mock mode.', 50013);
      }

      const tripId = Number(params.tripId);
      const trip = mockTrips.find((item) => item.tripId === tripId);

      if (!trip) {
        return createErrorResponse(`Trip ${params.tripId} not found.`, 40404);
      }

      const response: TripDaysResponse = {
        tripId,
        days: mockTripDaysByTripId[tripId] ?? [],
      };

      return createSuccessResponse(response);
    },
  ),

  http.get<
    { tripId: string; dayNumber: string },
    never,
    MockApiResponse<TripDayItemsResponse> | MockApiResponse<null>
  >(`${API_BASE_URL}/trips/:tripId/days/:dayNumber/items`, ({ params }) => {
    const tripId = Number(params.tripId);
    const dayNumber = Number(params.dayNumber);
    const trip = mockTrips.find((item) => item.tripId === tripId);

    if (!trip) {
      return createErrorResponse(`Trip ${params.tripId} not found.`, 40404);
    }

    const response: TripDayItemsResponse = {
      tripId,
      dayNumber,
      items: mockTripItemsByTripId[tripId]?.[dayNumber] ?? [],
    };

    return createSuccessResponse(response);
  }),

  http.post<
    { tripId: string; dayNumber: string },
    never,
    MockApiResponse<GenerateDayRouteResponse> | MockApiResponse<null>
  >(`${API_BASE_URL}/trips/:tripId/days/:dayNumber/route/generate`, async ({ params, request }) => {
    await waitForMockDelay();

    if (getMockFlagsFromRequest(request).has('trip-day-route-error')) {
      return createErrorResponse('Selected-day route generation failed in mock mode.', 50014);
    }

    const tripId = Number(params.tripId);
    const dayNumber = Number(params.dayNumber);
    const trip = mockTrips.find((item) => item.tripId === tripId);

    if (!trip) {
      return createErrorResponse(`Trip ${params.tripId} not found.`, 40404);
    }

    const items = mockTripItemsByTripId[tripId]?.[dayNumber] ?? [];
    const response: GenerateDayRouteResponse = buildMockTripDayRouteResult(
      tripId,
      dayNumber,
      items,
    );

    return createSuccessResponse(response);
  }),
];
