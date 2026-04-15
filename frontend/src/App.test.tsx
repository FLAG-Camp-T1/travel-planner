import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import { AppRoutes } from '@/App';
import { emitAuthSessionExpired } from '@/api/authSessionBus';
import { AUTH_TOKEN_STORAGE_KEY } from '@/utils/authStorage';
import { useAppStore } from '@/stores/useAppStore';

vi.mock('@/layouts/MainLayout', () => ({
  default: () => <Outlet />,
}));

vi.mock('@/layouts/AuthLayout', () => ({
  default: () => <Outlet />,
}));

vi.mock('@/pages/PlannerPage', () => ({
  default: () => <div>Planner Page</div>,
}));

vi.mock('@/pages/SignupPage', () => ({
  default: () => <div>Signup Page</div>,
}));

const initialState = useAppStore.getState();

describe('App auth routing', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects to login with a warning notice when the session expires', async () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'mock-token-traveler@example.com');
    useAppStore.setState({
      token: 'mock-token-traveler@example.com',
      authStatus: 'authenticated',
      isAuthenticated: true,
      authError: null,
    });

    render(
      <MemoryRouter initialEntries={['/planner']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Planner Page')).toBeTruthy();

    emitAuthSessionExpired('Your session expired. Please log in again.');

    expect(await screen.findByText('Welcome Back')).toBeTruthy();
    expect(screen.getByText('Your session expired. Please log in again.')).toBeTruthy();
    expect(useAppStore.getState().authStatus).toBe('unauthenticated');
    expect(useAppStore.getState().authNotice).toEqual({
      message: 'Your session expired. Please log in again.',
      messageTone: 'warning',
    });
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });
});
