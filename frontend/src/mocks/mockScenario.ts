const MOCK_QUERY_KEY = 'tpMock';
const MOCK_STORAGE_KEY = 'tp.mock.flags';
export const MOCK_FLAGS_HEADER = 'x-tp-mock-flags';

const ALLOWED_FLAGS = [
  'trip-create-error',
  'trip-bootstrap-trip-error',
  'trip-bootstrap-days-error',
  'trip-day-route-error',
  'legacy-route-error',
] as const;

export type MockFailureFlag = (typeof ALLOWED_FLAGS)[number];

const ALLOWED_FLAG_SET = new Set<string>(ALLOWED_FLAGS);
const CLEAR_VALUE = 'clear';

const parseMockFlags = (rawValue: string | null) => {
  if (!rawValue) {
    return [] as MockFailureFlag[];
  }

  return rawValue
    .split(',')
    .map((flag) => flag.trim())
    .filter((flag): flag is MockFailureFlag => ALLOWED_FLAG_SET.has(flag))
    .filter((flag, index, flags) => flags.indexOf(flag) === index);
};

const serializeMockFlags = (flags: MockFailureFlag[]) => flags.join(',');

const syncStoredFlagsFromQueryValue = (queryValue: string) => {
  if (typeof window === 'undefined') {
    return [] as MockFailureFlag[];
  }

  if (queryValue === CLEAR_VALUE) {
    window.sessionStorage.removeItem(MOCK_STORAGE_KEY);
    return [] as MockFailureFlag[];
  }

  const flags = parseMockFlags(queryValue);

  if (flags.length === 0) {
    window.sessionStorage.removeItem(MOCK_STORAGE_KEY);
    return [] as MockFailureFlag[];
  }

  window.sessionStorage.setItem(MOCK_STORAGE_KEY, serializeMockFlags(flags));
  return flags;
};

const getQueryParamValue = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return new URLSearchParams(window.location.search).get(MOCK_QUERY_KEY);
};

const getStoredFlags = () => {
  if (typeof window === 'undefined') {
    return [] as MockFailureFlag[];
  }

  return parseMockFlags(window.sessionStorage.getItem(MOCK_STORAGE_KEY));
};

export const initializeMockScenario = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const queryValue = getQueryParamValue();
  if (queryValue === null) {
    return;
  }

  syncStoredFlagsFromQueryValue(queryValue);
};

export const getActiveMockFlags = () => {
  const queryValue = getQueryParamValue();

  if (queryValue !== null) {
    return syncStoredFlagsFromQueryValue(queryValue);
  }

  return getStoredFlags();
};

export const getMockScenarioDebugState = () => ({
  queryKey: MOCK_QUERY_KEY,
  storageKey: MOCK_STORAGE_KEY,
  headerName: MOCK_FLAGS_HEADER,
  activeFlags: getActiveMockFlags(),
});
