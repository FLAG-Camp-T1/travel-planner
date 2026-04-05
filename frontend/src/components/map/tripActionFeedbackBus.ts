export type TripActionFeedbackEvent = {
  id: number;
  message: string;
};

type TripActionFeedbackListener = (event: TripActionFeedbackEvent) => void;

const listeners = new Set<TripActionFeedbackListener>();
let nextEventId = 1;

export const emitTripActionFeedback = (message: string) => {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    return;
  }

  const event: TripActionFeedbackEvent = {
    id: nextEventId,
    message: trimmedMessage,
  };
  nextEventId += 1;

  listeners.forEach((listener) => listener(event));
};

export const subscribeToTripActionFeedback = (listener: TripActionFeedbackListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
