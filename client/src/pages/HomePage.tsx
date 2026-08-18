import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-blue-600">
            Queueflow
          </h1>

          <div className="flex gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-4 font-semibold text-blue-600">
            SMART QUEUE MANAGEMENT
          </p>

          <h2 className="text-5xl font-bold leading-tight text-gray-900">
            Manage queues smarter with Queueflow.
          </h2>

          <p className="mt-6 text-lg text-gray-600">
            Manage branches, departments, queues, counters and
            customers from one centralized system.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="text-xl font-bold">
              Queue Management
            </h3>
            <p className="mt-2 text-gray-600">
              Create and manage customer queues.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="text-xl font-bold">
              Branch Management
            </h3>
            <p className="mt-2 text-gray-600">
              Organize multiple branches.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="text-xl font-bold">
              Real-time System
            </h3>
            <p className="mt-2 text-gray-600">
              Track queue positions and serving status.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HomePage;