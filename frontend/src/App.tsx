import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/pages/LoginPage';
import PlannerPage from '@/pages/PlannerPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route Group that requires Topbar and Left Sidebar */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/planner" />} />
          <Route path="planner" element={<PlannerPage />} />
        </Route>

        {/* Route Group for Individual Pages */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
