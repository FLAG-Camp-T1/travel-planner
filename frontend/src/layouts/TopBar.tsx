import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import POISearchPanel from '@/components/poi/POISearchPanel';
import UserProfileModal from '@/layouts/UserProfileModal';
import type { AuthNoticeState } from '@/types/authNotice';
import { useAppStore } from '@/stores/useAppStore';
import { getDisplayNameFromToken } from '@/utils/authTokenPresentation';

export default function TopBar() {
  const logout = useAppStore((state) => state.logout);
  const token = useAppStore((state) => state.token);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const displayName = useMemo(() => {
    return getDisplayNameFromToken(token) ?? 'Signed-in user';
  }, [token]);
  const avatarLabel = displayName.slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    const result = await logout();

    if (!result.serverSynced) {
      const logoutNotice: AuthNoticeState = {
        message: 'Logged out locally, but we could not confirm the server logout request.',
        messageTone: 'warning',
      };

      navigate('/login', { replace: true, state: logoutNotice });
      return;
    }

    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (!isProfileOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isProfileOpen]);

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-6">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <span className="text-white font-bold">T</span>
          </div>
          <div className="min-w-0">
            <h1 className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-xl font-bold text-transparent">
              Travel Planner
            </h1>
            <p className="text-xs text-slate-500">
              Search places, save bookmarks, and build day-by-day trips.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 justify-center xl:px-4">
          <div className="w-full max-w-5xl">
            <POISearchPanel layout="topbar" />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-200 text-slate-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-300/70"
            aria-expanded={isProfileOpen}
            aria-haspopup="dialog"
            aria-label="Open user info"
          >
            <span className="text-sm font-semibold text-gray-600">{avatarLabel}</span>
          </button>
        </div>
      </div>

      {isProfileOpen ? (
        <UserProfileModal
          displayName={displayName}
          onClose={() => setIsProfileOpen(false)}
          onLogout={async () => {
            setIsProfileOpen(false);
            await handleLogout();
          }}
        />
      ) : null}
    </header>
  );
}
