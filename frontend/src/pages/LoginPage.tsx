import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import type { AuthNoticeState } from '@/types/authNotice';
import { useAppStore } from '@/stores/useAppStore';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const clearAuthError = useAppStore((state) => state.clearAuthError);
  const login = useAppStore((state) => state.login);
  const location = useLocation();
  const navigate = useNavigate();
  const authNotice = (location.state as AuthNoticeState | null) ?? null;
  const noticeTone = authNotice?.messageTone ?? 'success';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    clearAuthError();

    try {
      await login({ username, password });
      navigate('/planner', { replace: true });
    } catch (err) {
      const error = err as Error;
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
      <p className="text-center text-gray-500">Please enter your account and password to log in</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {authNotice?.message && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              noticeTone === 'warning'
                ? 'border-amber-100 bg-amber-50 text-amber-700'
                : 'border-green-100 bg-green-50 text-green-700'
            }`}
          >
            {authNotice.message}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold mt-4 hover:bg-blue-700 transition-colors shadow-md ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
          Sign up now
        </Link>
      </div>
    </div>
  );
}
