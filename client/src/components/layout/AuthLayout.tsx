import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-600">
            Queueflow
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Smart Queue Management System
          </p>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;