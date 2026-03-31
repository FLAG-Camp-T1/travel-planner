import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import PlannerPage from '@/pages/PlannerPage';
import { useAppStore } from '@/stores/useAppStore';

function AuthLoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">Checking session...</div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authStatus = useAppStore((state) => state.authStatus);

  if (authStatus === 'hydrating') return <AuthLoadingScreen />;
  if (authStatus !== 'authenticated') return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const authStatus = useAppStore((state) => state.authStatus);

  if (authStatus === 'hydrating') return <AuthLoadingScreen />;
  if (authStatus === 'authenticated') return <Navigate to="/planner" replace />;

  return <>{children}</>;
}

function App() {
  const hydrateAuth = useAppStore((state) => state.hydrateAuth);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Route Group that requires Topbar and Left Sidebar */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/planner" replace />} />
          <Route path="planner" element={<PlannerPage />} />
        </Route>

        {/* Route Group for Individual Pages (Auth) */}
        <Route
          element={
            <PublicRoute>
              <AuthLayout />
            </PublicRoute>
          }
        >
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
