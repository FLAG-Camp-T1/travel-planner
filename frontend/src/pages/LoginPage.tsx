export default function LoginPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">Welcome</h2>
      <p className="text-center text-gray-500">Please enter your account and password to log in</p>
      {/* 假装这里有个表单 */}
      <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold mt-4 hover:bg-blue-700 transition-colors">
        Log In
      </button>
    </div>
  );
}
