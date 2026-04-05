export type ApiErrorEvent = {
  id: number;
  message: string;
};

type ApiErrorListener = (event: ApiErrorEvent) => void;

const listeners = new Set<ApiErrorListener>();
let nextEventId = 1;

export const emitApiError = (message: string) => {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    return;
  }

  const event: ApiErrorEvent = {
    id: nextEventId,
    message: trimmedMessage,
  };
  nextEventId += 1;

  listeners.forEach((listener) => listener(event));
};

export const subscribeToApiErrors = (listener: ApiErrorListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
