const decodeBase64Url = (value: string) => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return atob(padded);
  } catch {
    return null;
  }
};

const parseJwtPayload = (token: string) => {
  if (token.startsWith('mock-token-')) {
    return null;
  }

  const jwtPayload = token.split('.')[1];
  if (!jwtPayload) {
    return null;
  }

  const decodedPayload = decodeBase64Url(jwtPayload);
  if (!decodedPayload) {
    return null;
  }

  try {
    return JSON.parse(decodedPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const getDisplayNameFromToken = (token: string | null) => {
  if (!token) {
    return null;
  }

  if (token.startsWith('mock-token-')) {
    return token.slice('mock-token-'.length) || null;
  }

  const parsedPayload = parseJwtPayload(token);
  if (!parsedPayload) {
    return null;
  }

  const displayValue =
    parsedPayload.preferred_username ??
    parsedPayload.username ??
    parsedPayload.name ??
    parsedPayload.email ??
    parsedPayload.sub;

  return typeof displayValue === 'string' && displayValue.trim() ? displayValue.trim() : null;
};

export const isAuthTokenExpired = (token: string | null, now = Date.now()) => {
  if (!token || token.startsWith('mock-token-')) {
    return false;
  }

  const parsedPayload = parseJwtPayload(token);
  const exp = parsedPayload?.exp;
  if (typeof exp !== 'number') {
    return false;
  }

  return exp * 1000 <= now;
};
