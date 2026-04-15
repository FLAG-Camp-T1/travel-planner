import { describe, expect, it, vi } from 'vitest';
import axiosClient from '@/api/axiosClient';
import { subscribeToAuthSessionExpired } from '@/api/authSessionBus';

describe('axiosClient auth session handling', () => {
  it('emits a session-expired event for 401 responses', async () => {
    const sessionListener = vi.fn();
    const unsubscribe = subscribeToAuthSessionExpired(sessionListener);
    const responseHandlers = (
      axiosClient.interceptors.response as { handlers: Array<unknown> } & {
        handlers: Array<{ rejected?: (error: unknown) => Promise<never> }>;
      }
    ).handlers;
    const rejectedHandler = responseHandlers[0]?.rejected;

    await expect(
      rejectedHandler?.({
        response: {
          status: 401,
          data: { message: 'Your session expired. Please log in again.' },
        },
        config: {
          headers: {
            Authorization: 'Bearer mock-token-traveler@example.com',
          },
        },
        message: 'Unauthorized',
      }),
    ).rejects.toThrow('Your session expired. Please log in again.');

    expect(sessionListener).toHaveBeenCalledWith('Your session expired. Please log in again.');

    unsubscribe();
  });

  it('does not emit a session-expired event for public-request 401 responses', async () => {
    const sessionListener = vi.fn();
    const unsubscribe = subscribeToAuthSessionExpired(sessionListener);
    const responseHandlers = (
      axiosClient.interceptors.response as { handlers: Array<unknown> } & {
        handlers: Array<{ rejected?: (error: unknown) => Promise<never> }>;
      }
    ).handlers;
    const rejectedHandler = responseHandlers[0]?.rejected;

    await expect(
      rejectedHandler?.({
        response: {
          status: 401,
          data: { message: 'Invalid email or password.' },
        },
        config: {
          headers: {},
        },
        message: 'Unauthorized',
      }),
    ).rejects.toThrow('Invalid email or password.');

    expect(sessionListener).not.toHaveBeenCalled();

    unsubscribe();
  });
});
