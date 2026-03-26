import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <Outlet />
      </div>
    </div>
  );
}
