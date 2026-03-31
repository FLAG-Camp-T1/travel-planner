import { http, HttpResponse } from 'msw';
import type { Bookmark, CreateBookmarkRequest } from '@/api/bookmarkApi';

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

let nextBookmarkSequence = 3;

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

export const handlers = [
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
];
