import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const authNoticeFromStore = useAppStore((state) => state.authNotice);
  const clearAuthNotice = useAppStore((state) => state.clearAuthNotice);
  const clearAuthError = useAppStore((state) => state.clearAuthError);
  const login = useAppStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    clearAuthNotice();
    clearAuthError();

    try {
      await login({ email, password });
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
      <p className="text-center text-gray-500">Please enter your email and password to log in</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {authNoticeFromStore && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              authNoticeFromStore.messageTone === 'warning'
                ? 'border-amber-100 bg-amber-50 text-amber-700'
                : 'border-green-100 bg-green-50 text-green-700'
            }`}
          >
            {authNoticeFromStore.message}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Enter your email"
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
