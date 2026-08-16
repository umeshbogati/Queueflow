import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Queueflow
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Smart Queue Management System
        </p>

        <p className="mt-3 text-gray-500">
          Manage branches, departments, queues, counters,
          staff, and real-time queue updates from one system.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Login
          </Link>

          <Link
            to="/dashboard"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HomePage;