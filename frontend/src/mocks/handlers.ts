import { http, HttpResponse } from 'msw';
import type { AuthResponse, LoginCredentials, SignupData } from '@/api/authApi';
import type {
  Bookmark,
  BookmarkCategory,
  CreateBookmarkCategoryRequest,
  CreateBookmarkRequest,
  UpdateBookmarkRequest,
} from '@/api/bookmarkApi';
import type { PlaceDetailDto } from '@/api/placeApi';
import type { POIDto, POISearchRequest } from '@/api/poiApi';
import type {
  CreateTripDayItemRequest,
  CreateTripRequest,
  GenerateDayRouteResponse,
  ItineraryItem,
  MoveTripDayItemRequest,
  ReorderTripDayItemsRequest,
  TripDay,
  TripDayItemsResponse,
  TripDaysResponse,
  TripSummary,
  UpdateTripDayItemRequest,
  UpdateTripRequest,
} from '@/api/tripApi';
import type { MockFailureFlag } from './mockScenario';
import { MOCK_FLAGS_HEADER } from './mockScenario';
import { buildMockTripDayRouteResult } from './routeFixtures';
import { API_BASE_URL } from '@/api/apiConfig';
import { toDisplayedTripTravelMethod } from '@/utils/tripTravelMethod';

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
        flag === 'trip-day-route-error',
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
let nextBookmarkCategorySequence = 3;
let nextItineraryItemSequence = 1000;
let nextTripSequence = 1002;

let mockUsers: Array<{ username: string; email: string; password: string }> = [
  {
    username: 'demo',
    email: 'demo@example.com',
    password: 'demo1234',
  },
];

const createMockToken = (email: string) => `mock-token-${email}`;

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

let mockBookmarkCategories: Array<Pick<BookmarkCategory, 'categoryId' | 'name'>> = [
  {
    categoryId: 'bookmark-category-1',
    name: 'market',
  },
  {
    categoryId: 'bookmark-category-2',
    name: 'landmark',
  },
];

const ensureMockBookmarkCategory = (name: string) => {
  const existingCategory = mockBookmarkCategories.find((category) => category.name === name);
  if (existingCategory) {
    return existingCategory;
  }

  const newCategory = {
    categoryId: `bookmark-category-${nextBookmarkCategorySequence}`,
    name,
  };
  nextBookmarkCategorySequence += 1;
  mockBookmarkCategories = [...mockBookmarkCategories, newCategory];
  return newCategory;
};

const buildMockBookmarkCategoriesResponse = (): BookmarkCategory[] => {
  return [...mockBookmarkCategories]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((category) => ({
      ...category,
      bookmarkCount: mockBookmarks.filter((bookmark) => bookmark.category === category.name).length,
    }));
};

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
        latitude: 38.90331,
        longitude: -77.06794,
        visitOrder: 1,
        travelMethod: 'Walk',
      },
      {
        itemId: 102,
        placeId: 'place-lincoln-memorial',
        name: 'Lincoln Memorial',
        latitude: 38.88927,
        longitude: -77.05018,
        visitOrder: 2,
        travelMethod: 'Drive',
      },
    ],
    2: [
      {
        itemId: 201,
        placeId: 'place-smithsonian-castle',
        name: 'Smithsonian Castle',
        latitude: 38.88868,
        longitude: -77.02603,
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

const mockPlaceDetailsById: Record<string, PlaceDetailDto> = {
  'poi-search-1': {
    placeId: 'poi-search-1',
    name: 'National Air and Space Museum',
    address: '600 Independence Ave SW, Washington, DC 20560, USA',
    latitude: 38.8882,
    longitude: -77.0199,
    categoryLabel: 'Museum',
    rating: 4.7,
    userRatingCount: 12645,
    websiteUri: 'https://airandspace.si.edu/',
    googleMapsUri: 'https://maps.google.com/?cid=123',
    openingWeekdayDescriptions: [
      'Monday: 10:00 AM – 5:30 PM',
      'Tuesday: 10:00 AM – 5:30 PM',
      'Wednesday: 10:00 AM – 5:30 PM',
    ],
  },
  'poi-search-2': {
    placeId: 'poi-search-2',
    name: 'Founding Farmers DC',
    address: '1924 Pennsylvania Ave NW, Washington, DC 20006, USA',
    latitude: 38.9007,
    longitude: -77.0447,
    categoryLabel: 'Restaurant',
    rating: 4.4,
    userRatingCount: 22193,
    websiteUri: 'https://www.wearefoundingfarmers.com/',
    googleMapsUri: 'https://maps.google.com/?cid=456',
    openingWeekdayDescriptions: ['Monday: 7:30 AM – 9:00 PM', 'Tuesday: 7:30 AM – 9:00 PM'],
  },
  'poi-search-3': {
    placeId: 'poi-search-3',
    name: 'The LINE DC',
    address: '1770 Euclid St NW, Washington, DC 20009, USA',
    latitude: 38.9235,
    longitude: -77.0418,
    categoryLabel: 'Lodging',
    rating: 4.5,
    userRatingCount: 4312,
    websiteUri: 'https://www.thelinehotel.com/dc/',
    googleMapsUri: 'https://maps.google.com/?cid=789',
    openingWeekdayDescriptions: [],
  },
  'poi-search-4': {
    placeId: 'poi-search-4',
    name: 'National Mall',
    address: 'Washington, DC 20004, USA',
    latitude: 38.8896,
    longitude: -77.023,
    categoryLabel: 'Tourist Attraction',
    rating: 4.8,
    userRatingCount: 50001,
    websiteUri: null,
    googleMapsUri: 'https://maps.google.com/?cid=888',
    openingWeekdayDescriptions: [],
  },
  ChIJVTPokywQkFQRmtVEaUZlJRA: {
    placeId: 'ChIJVTPokywQkFQRmtVEaUZlJRA',
    name: 'Pike Place Market',
    address: '85 Pike St, Seattle, WA 98101, USA',
    latitude: 47.609722,
    longitude: -122.342222,
    categoryLabel: 'Market',
    rating: 4.7,
    userRatingCount: 98765,
    websiteUri: 'https://www.pikeplacemarket.org/',
    googleMapsUri: 'https://maps.google.com/?cid=999',
    openingWeekdayDescriptions: ['Monday: 9:00 AM – 6:00 PM', 'Tuesday: 9:00 AM – 6:00 PM'],
  },
  ChIJN1t_tDeuEmsRUsoyG83frY4: {
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    name: 'Sydney Opera House',
    address: 'Bennelong Point, Sydney NSW 2000, Australia',
    latitude: -33.856784,
    longitude: 151.215297,
    categoryLabel: 'Landmark',
    rating: 4.7,
    userRatingCount: 77431,
    websiteUri: 'https://www.sydneyoperahouse.com/',
    googleMapsUri: 'https://maps.google.com/?cid=1000',
    openingWeekdayDescriptions: ['Monday: 9:00 AM – 5:00 PM', 'Tuesday: 9:00 AM – 5:00 PM'],
  },
};

export const handlers = [
  http.post<never, LoginCredentials, MockApiResponse<AuthResponse> | MockApiResponse<null>>(
    `${API_BASE_URL}/auth/login`,
    async ({ request }) => {
      const requestBody = (await request.json()) as LoginCredentials;
      const email = requestBody.email?.trim().toLowerCase();
      const password = requestBody.password?.trim();

      if (!email || !password) {
        return createErrorResponse('Email and password are required.', 40002);
      }

      const matchedUser = mockUsers.find(
        (user) => user.email === email && user.password === password,
      );

      if (!matchedUser) {
        return createErrorResponse('Invalid email or password.', 40100);
      }

      return createSuccessResponse<AuthResponse>({
        token: createMockToken(matchedUser.email),
      });
    },
  ),

  http.post<never, SignupData, MockApiResponse<AuthResponse> | MockApiResponse<null>>(
    `${API_BASE_URL}/auth/signup`,
    async ({ request }) => {
      const requestBody = (await request.json()) as SignupData;
      const username = requestBody.username?.trim();
      const email = requestBody.email?.trim().toLowerCase();
      const password = requestBody.password?.trim();

      if (!username || !email || !password) {
        return createErrorResponse('Username, email, and password are required.', 40002);
      }

      const usernameExists = mockUsers.some((user) => user.username === username);
      const emailExists = mockUsers.some((user) => user.email === email);

      if (usernameExists) {
        return createErrorResponse('Username already exists.', 40000);
      }

      if (emailExists) {
        return createErrorResponse('Email already exists.', 40000);
      }

      mockUsers = [...mockUsers, { username, email, password }];

      return createSuccessResponse<AuthResponse>({
        token: createMockToken(email),
      });
    },
  ),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return createSuccessResponse(null);
  }),

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
        const haystacks = [poi.name, poi.address, poi.poiType].map((value) =>
          (value ?? '').toLowerCase(),
        );
        return haystacks.some((value) => value.includes(keyword));
      });

      return createSuccessResponse(results);
    },
  ),

  http.get<{ placeId: string }, never, MockApiResponse<PlaceDetailDto> | MockApiResponse<null>>(
    `${API_BASE_URL}/places/:placeId`,
    ({ params }) => {
      const { placeId } = params;

      if (typeof placeId !== 'string') {
        return createErrorResponse('placeId is required', 40002);
      }

      const detail = mockPlaceDetailsById[placeId];
      if (!detail) {
        return createErrorResponse(`Place ${placeId} not found`, 40400);
      }

      return createSuccessResponse(detail);
    },
  ),

  http.get<never, never, MockApiResponse<Bookmark[]>>(`${API_BASE_URL}/bookmarks`, () => {
    return createSuccessResponse(mockBookmarks);
  }),

  http.get<never, never, MockApiResponse<BookmarkCategory[]>>(
    `${API_BASE_URL}/bookmarks/categories`,
    () => {
      return createSuccessResponse(buildMockBookmarkCategoriesResponse());
    },
  ),

  http.post<
    never,
    CreateBookmarkCategoryRequest,
    MockApiResponse<BookmarkCategory> | MockApiResponse<null>
  >(`${API_BASE_URL}/bookmarks/categories`, async ({ request }) => {
    const requestBody = (await request.json()) as CreateBookmarkCategoryRequest;
    const normalizedName = requestBody.name?.trim() ? requestBody.name.trim() : '';

    if (!normalizedName) {
      return createErrorResponse('Bookmark category name is required', 40001);
    }

    if (normalizedName.length > 20) {
      return createErrorResponse('Bookmark category must be at most 20 characters', 40001);
    }

    const category = ensureMockBookmarkCategory(normalizedName);

    return createSuccessResponse({
      ...category,
      bookmarkCount: mockBookmarks.filter((bookmark) => bookmark.category === category.name).length,
    });
  }),

  http.delete<{ categoryId: string }>(
    `${API_BASE_URL}/bookmarks/categories/:categoryId`,
    ({ params, request }) => {
      const { categoryId } = params;

      if (typeof categoryId !== 'string') {
        return createErrorResponse('categoryId is required', 40002);
      }

      const category = mockBookmarkCategories.find((item) => item.categoryId === categoryId);
      if (!category) {
        return createErrorResponse(`Category ${categoryId} not found`, 40400);
      }

      const deleteBookmarks = request.url.includes('deleteBookmarks=true');

      if (deleteBookmarks) {
        mockBookmarks = mockBookmarks.filter((bookmark) => bookmark.category !== category.name);
      } else {
        mockBookmarks = mockBookmarks.map((bookmark) =>
          bookmark.category === category.name ? { ...bookmark, category: null } : bookmark,
        );
      }

      mockBookmarkCategories = mockBookmarkCategories.filter(
        (item) => item.categoryId !== categoryId,
      );

      return createSuccessResponse(null);
    },
  ),

  http.post<never, CreateBookmarkRequest, MockApiResponse<Bookmark> | MockApiResponse<null>>(
    `${API_BASE_URL}/bookmarks`,
    async ({ request }) => {
      const requestBody = (await request.json()) as CreateBookmarkRequest;
      const normalizedCategory = requestBody.category?.trim() ? requestBody.category.trim() : null;
      const existingBookmark = mockBookmarks.find(
        (bookmark) => bookmark.googlePlaceId === requestBody.googlePlaceId,
      );

      if (normalizedCategory && normalizedCategory.length > 20) {
        return createErrorResponse('Bookmark category must be at most 20 characters', 40001);
      }

      if (normalizedCategory) {
        ensureMockBookmarkCategory(normalizedCategory);
      }

      if (existingBookmark) {
        const refreshedBookmark: Bookmark = {
          ...existingBookmark,
          poiName: requestBody.poiName,
          poiAddress: requestBody.poiAddress,
          poiLatitude: requestBody.poiLatitude,
          poiLongitude: requestBody.poiLongitude,
          category: normalizedCategory,
        };
        mockBookmarks = mockBookmarks.map((bookmark) =>
          bookmark.bookmarkId === existingBookmark.bookmarkId ? refreshedBookmark : bookmark,
        );

        return createSuccessResponse(refreshedBookmark);
      }

      const newBookmark: Bookmark = {
        bookmarkId: `bookmark-${nextBookmarkSequence}`,
        poiId: `poi-${nextBookmarkSequence}`,
        googlePlaceId: requestBody.googlePlaceId,
        poiName: requestBody.poiName,
        poiAddress: requestBody.poiAddress,
        poiLatitude: requestBody.poiLatitude,
        poiLongitude: requestBody.poiLongitude,
        category: normalizedCategory,
      };

      nextBookmarkSequence += 1;
      mockBookmarks = [...mockBookmarks, newBookmark];

      return createSuccessResponse(newBookmark);
    },
  ),

  http.patch<
    { bookmarkId: string },
    UpdateBookmarkRequest,
    MockApiResponse<Bookmark> | MockApiResponse<null>
  >(`${API_BASE_URL}/bookmarks/:bookmarkId`, async ({ params, request }) => {
    const { bookmarkId } = params;

    if (typeof bookmarkId !== 'string') {
      return createErrorResponse('bookmarkId is required', 40002);
    }

    const requestBody = (await request.json()) as UpdateBookmarkRequest;
    const bookmarkIndex = mockBookmarks.findIndex((bookmark) => bookmark.bookmarkId === bookmarkId);

    if (bookmarkIndex < 0) {
      return createErrorResponse(`Bookmark ${bookmarkId} not found`, 40400);
    }

    const normalizedCategory = requestBody.category?.trim() ? requestBody.category.trim() : null;
    if (normalizedCategory && normalizedCategory.length > 20) {
      return createErrorResponse('Bookmark category must be at most 20 characters', 40001);
    }

    if (normalizedCategory) {
      ensureMockBookmarkCategory(normalizedCategory);
    }

    const updatedBookmark: Bookmark = {
      ...mockBookmarks[bookmarkIndex],
      category: normalizedCategory,
    };
    mockBookmarks = mockBookmarks.map((bookmark) =>
      bookmark.bookmarkId === bookmarkId ? updatedBookmark : bookmark,
    );

    return createSuccessResponse(updatedBookmark);
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

  http.get(`${API_BASE_URL}/trips`, async () => {
    await waitForMockDelay();

    return createSuccessResponse([...mockTrips].sort((left, right) => right.tripId - left.tripId));
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

  http.patch<
    { tripId: string },
    UpdateTripRequest,
    MockApiResponse<TripSummary> | MockApiResponse<null>
  >(`${API_BASE_URL}/trips/:tripId`, async ({ params, request }) => {
    await waitForMockDelay();

    const tripId = Number(params.tripId);
    const tripIndex = mockTrips.findIndex((item) => item.tripId === tripId);

    if (tripIndex < 0) {
      return createErrorResponse(`Trip ${params.tripId} not found.`, 40404);
    }

    const requestBody = (await request.json()) as UpdateTripRequest;
    const title = requestBody.title?.trim();
    const durationDays = requestBody.durationDays;

    if (!title || !durationDays || durationDays < 1 || durationDays > 15) {
      return createErrorResponse('Trip title and durationDays are required.', 40002);
    }

    const existingTrip = mockTrips[tripIndex];
    if (durationDays < existingTrip.durationDays) {
      const existingDayItems = mockTripItemsByTripId[tripId] ?? {};
      const trimmedDaysContainItems = Array.from(
        { length: existingTrip.durationDays - durationDays },
        (_, index) => durationDays + index + 1,
      ).some((dayNumber) => (existingDayItems[dayNumber] ?? []).length > 0);

      if (trimmedDaysContainItems) {
        return createErrorResponse(
          'Cannot reduce trip duration while trimmed days still contain itinerary items.',
          40000,
        );
      }
    }

    const updatedTrip: TripSummary = {
      ...existingTrip,
      title,
      durationDays,
      startDate: requestBody.startDate ?? null,
    };

    mockTrips = mockTrips.map((trip) => (trip.tripId === tripId ? updatedTrip : trip));
    mockTripDaysByTripId[tripId] = buildMockTripDays(durationDays, requestBody.startDate ?? null);

    const existingDayItems = mockTripItemsByTripId[tripId] ?? {};
    mockTripItemsByTripId[tripId] = Object.fromEntries(
      Array.from({ length: durationDays }, (_, index) => {
        const dayNumber = index + 1;
        return [dayNumber, existingDayItems[dayNumber] ?? []];
      }),
    );

    return createSuccessResponse(updatedTrip);
  }),

  http.delete<{ tripId: string }, never, MockApiResponse<null>>(
    `${API_BASE_URL}/trips/:tripId`,
    async ({ params }) => {
      await waitForMockDelay();

      const tripId = Number(params.tripId);
      const tripExists = mockTrips.some((item) => item.tripId === tripId);

      if (!tripExists) {
        return createErrorResponse(`Trip ${params.tripId} not found.`, 40404);
      }

      mockTrips = mockTrips.filter((trip) => trip.tripId !== tripId);
      delete mockTripDaysByTripId[tripId];
      delete mockTripItemsByTripId[tripId];

      return createSuccessResponse(null);
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

  http.post<{ tripId: string; dayNumber: string }, CreateTripDayItemRequest, MockApiResponse<null>>(
    `${API_BASE_URL}/trips/:tripId/days/:dayNumber/items`,
    async ({ params, request }) => {
      await waitForMockDelay();

      const tripId = Number(params.tripId);
      const dayNumber = Number(params.dayNumber);
      const items = mockTripItemsByTripId[tripId]?.[dayNumber];

      if (!mockTrips.some((trip) => trip.tripId === tripId)) {
        return createErrorResponse(`Trip ${params.tripId} not found.`, 40404);
      }

      if (!items) {
        return createErrorResponse(`Trip day ${params.dayNumber} not found.`, 40404);
      }

      const requestBody = (await request.json()) as CreateTripDayItemRequest;
      const placeId = requestBody.placeId?.trim();

      if (!placeId) {
        return createErrorResponse('Place ID is required.', 40002);
      }

      const sourceDetail = mockPlaceDetailsById[placeId];
      const sourcePoi = mockPoiResults.find((poi) => poi.placeId === placeId);

      if (!sourceDetail && !sourcePoi) {
        return createErrorResponse(`Place ${placeId} not found.`, 40404);
      }

      const name = sourceDetail?.name ?? sourcePoi?.name ?? 'Selected Place';

      mockTripItemsByTripId[tripId][dayNumber] = [
        ...items,
        {
          itemId: nextItineraryItemSequence,
          placeId,
          name,
          latitude: sourceDetail?.latitude ?? sourcePoi?.latitude ?? null,
          longitude: sourceDetail?.longitude ?? sourcePoi?.longitude ?? null,
          visitOrder: items.length + 1,
          travelMethod: 'Drive',
        },
      ];

      nextItineraryItemSequence += 1;

      return createSuccessResponse(null);
    },
  ),

  http.patch<
    { tripId: string; dayNumber: string },
    ReorderTripDayItemsRequest,
    MockApiResponse<null>
  >(`${API_BASE_URL}/trips/:tripId/days/:dayNumber/items/reorder`, async ({ params, request }) => {
    await waitForMockDelay();

    const tripId = Number(params.tripId);
    const dayNumber = Number(params.dayNumber);
    const items = mockTripItemsByTripId[tripId]?.[dayNumber];

    if (!mockTrips.some((trip) => trip.tripId === tripId)) {
      return createErrorResponse(`Trip ${params.tripId} not found.`, 40404);
    }

    if (!items) {
      return createErrorResponse(`Trip day ${params.dayNumber} not found.`, 40404);
    }

    const requestBody = (await request.json()) as ReorderTripDayItemsRequest;
    const itemIds = requestBody.itemIds ?? [];

    if (itemIds.length === 0) {
      return createErrorResponse('Reorder item IDs are required.', 40002);
    }

    const uniqueItemIds = new Set(itemIds);
    const currentItemIds = new Set(items.map((item) => item.itemId));
    const isExactCurrentDaySet =
      uniqueItemIds.size === itemIds.length &&
      itemIds.length === items.length &&
      itemIds.every((itemId) => currentItemIds.has(itemId));

    if (!isExactCurrentDaySet) {
      return createErrorResponse(
        'Reorder request must include each itinerary item exactly once.',
        40002,
      );
    }

    const itemsById = new Map(items.map((item) => [item.itemId, item]));
    mockTripItemsByTripId[tripId][dayNumber] = itemIds.map((itemId, index) => ({
      ...itemsById.get(itemId)!,
      visitOrder: index + 1,
    }));

    return createSuccessResponse(null);
  }),

  http.post<
    { tripId: string; dayNumber: string; itemId: string },
    MoveTripDayItemRequest,
    MockApiResponse<null>
  >(
    `${API_BASE_URL}/trips/:tripId/days/:dayNumber/items/:itemId/move`,
    async ({ params, request }) => {
      await waitForMockDelay();

      const tripId = Number(params.tripId);
      const sourceDayNumber = Number(params.dayNumber);
      const itemId = Number(params.itemId);
      const sourceItems = mockTripItemsByTripId[tripId]?.[sourceDayNumber];

      if (!mockTrips.some((trip) => trip.tripId === tripId)) {
        return createErrorResponse(`Trip ${params.tripId} not found.`, 40404);
      }

      if (!sourceItems) {
        return createErrorResponse(`Trip day ${params.dayNumber} not found.`, 40404);
      }

      const requestBody = (await request.json()) as MoveTripDayItemRequest;
      const targetDayNumber = requestBody.targetDayNumber;
      const targetItems = mockTripItemsByTripId[tripId]?.[targetDayNumber];

      if (!targetItems) {
        return createErrorResponse(`Trip day ${targetDayNumber} not found.`, 40404);
      }

      if (targetDayNumber === sourceDayNumber) {
        return createErrorResponse('Target day must differ from the source day.', 40000);
      }

      const movedItem = sourceItems.find((item) => item.itemId === itemId);
      if (!movedItem) {
        return createErrorResponse(`Itinerary item ${params.itemId} not found.`, 40404);
      }

      mockTripItemsByTripId[tripId][sourceDayNumber] = sourceItems
        .filter((item) => item.itemId !== itemId)
        .map((item, index) => ({
          ...item,
          visitOrder: index + 1,
        }));

      mockTripItemsByTripId[tripId][targetDayNumber] = [
        ...targetItems,
        {
          ...movedItem,
          visitOrder: targetItems.length + 1,
        },
      ];

      return createSuccessResponse(null);
    },
  ),

  http.patch<
    { tripId: string; dayNumber: string; itemId: string },
    UpdateTripDayItemRequest,
    MockApiResponse<null>
  >(`${API_BASE_URL}/trips/:tripId/days/:dayNumber/items/:itemId`, async ({ params, request }) => {
    await waitForMockDelay();

    const tripId = Number(params.tripId);
    const dayNumber = Number(params.dayNumber);
    const itemId = Number(params.itemId);
    const items = mockTripItemsByTripId[tripId]?.[dayNumber];

    if (!mockTrips.some((trip) => trip.tripId === tripId)) {
      return createErrorResponse(`Trip ${params.tripId} not found.`, 40404);
    }

    if (!items) {
      return createErrorResponse(`Trip day ${params.dayNumber} not found.`, 40404);
    }

    const itemIndex = items.findIndex((item) => item.itemId === itemId);
    if (itemIndex < 0) {
      return createErrorResponse(`Itinerary item ${params.itemId} not found.`, 40404);
    }

    const requestBody = (await request.json()) as UpdateTripDayItemRequest;
    const displayTravelMethod = toDisplayedTripTravelMethod(requestBody.travelMethod);

    mockTripItemsByTripId[tripId][dayNumber] = items.map((item) =>
      item.itemId === itemId ? { ...item, travelMethod: displayTravelMethod } : item,
    );

    return createSuccessResponse(null);
  }),

  http.delete<{ tripId: string; dayNumber: string; itemId: string }, never, MockApiResponse<null>>(
    `${API_BASE_URL}/trips/:tripId/days/:dayNumber/items/:itemId`,
    async ({ params }) => {
      await waitForMockDelay();

      const tripId = Number(params.tripId);
      const dayNumber = Number(params.dayNumber);
      const itemId = Number(params.itemId);
      const items = mockTripItemsByTripId[tripId]?.[dayNumber];

      if (!mockTrips.some((trip) => trip.tripId === tripId)) {
        return createErrorResponse(`Trip ${params.tripId} not found.`, 40404);
      }

      if (!items) {
        return createErrorResponse(`Trip day ${params.dayNumber} not found.`, 40404);
      }

      if (!items.some((item) => item.itemId === itemId)) {
        return createErrorResponse(`Itinerary item ${params.itemId} not found.`, 40404);
      }

      mockTripItemsByTripId[tripId][dayNumber] = items
        .filter((item) => item.itemId !== itemId)
        .map((item, index) => ({
          ...item,
          visitOrder: index + 1,
        }));

      return createSuccessResponse(null);
    },
  ),

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
