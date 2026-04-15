type AuthSessionExpiredListener = (message: string) => void;

const listeners = new Set<AuthSessionExpiredListener>();

export const emitAuthSessionExpired = (message: string) => {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    return;
  }

  listeners.forEach((listener) => listener(trimmedMessage));
};

export const subscribeToAuthSessionExpired = (listener: AuthSessionExpiredListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
