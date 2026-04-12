const decodeBase64Url = (value: string) => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return atob(padded);
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

  const jwtPayload = token.split('.')[1];
  if (!jwtPayload) {
    return null;
  }

  const decodedPayload = decodeBase64Url(jwtPayload);
  if (!decodedPayload) {
    return null;
  }

  try {
    const parsedPayload = JSON.parse(decodedPayload) as Record<string, unknown>;
    const displayValue =
      parsedPayload.preferred_username ??
      parsedPayload.username ??
      parsedPayload.name ??
      parsedPayload.email ??
      parsedPayload.sub;

    return typeof displayValue === 'string' && displayValue.trim() ? displayValue.trim() : null;
  } catch {
    return null;
  }
};
