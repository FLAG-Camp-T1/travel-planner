import { useNavigate } from 'react-router-dom';
import POISearchPanel from '@/components/poi/POISearchPanel';
import type { AuthNoticeState } from '@/types/authNotice';
import { useAppStore } from '@/stores/useAppStore';

export default function TopBar() {
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();

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
              Search around the map and compare places faster.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center">
          <POISearchPanel layout="topbar" />
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <button
            onClick={handleLogout}
            className="inline-flex h-9 items-center text-sm font-medium text-gray-500 transition-colors hover:text-red-600"
          >
            Log Out
          </button>
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-200 shadow-sm">
            <span className="text-sm text-gray-500">U</span>
          </div>
        </div>
      </div>
    </header>
  );
}
