import { useNavigate } from 'react-router-dom';
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
    <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm">
      {/* Top Left Logo and Title */}
      <div className="flex items-center gap-2">
        {/* Logo Placeholder */}
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">T</span>
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
          Travel Planner
        </h1>
      </div>

      {/* User Profile and Logout */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
        >
          Log Out
        </button>
        <div className="w-9 h-9 bg-gray-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
          <span className="text-sm text-gray-500">U</span>
        </div>
      </div>
    </header>
  );
}
