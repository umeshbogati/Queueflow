import { Link } from "react-router-dom";

const AdminDashboardPage = () => {
  return (
    <div>
      <main>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-gray-600">
            Manage branches, departments, and queue operations.
          </p>
        </div>

        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Management
        </h3>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            to="/branches"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              B
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Branches
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Create, edit, and manage branch locations.
            </p>
          </Link>

          <Link
            to="/departments"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              D
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Departments
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Create, edit, and manage departments under branches.
            </p>
          </Link>

          <Link
            to="/queue"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              Q
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              All Queues
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              View and monitor all active queues across branches.
            </p>
          </Link>

          <Link
            to="/agents"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              A
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Agents
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Manage service agents, office hours, and token limits.
            </p>
          </Link>

        </div>

        <h3 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Operations
        </h3>

        <div className="grid gap-6 sm:grid-cols-2">

          <Link
            to="/call-next"
            className="rounded-xl bg-blue-600 p-6 text-white shadow transition hover:-translate-y-1 hover:bg-blue-700"
          >
            <h3 className="text-lg font-bold">
              Call Next Customer
            </h3>
            <p className="mt-2 text-sm text-blue-100">
              Advance the queue to the next waiting customer.
            </p>
          </Link>

          <Link
            to="/agent-dashboard"
            className="rounded-xl bg-indigo-600 p-6 text-white shadow transition hover:-translate-y-1 hover:bg-indigo-700"
          >
            <h3 className="text-lg font-bold">
              Agent Dashboard
            </h3>
            <p className="mt-2 text-sm text-indigo-100">
              View agent performance, token usage, and office status.
            </p>
          </Link>

          <Link
            to="/counter"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="text-lg font-bold text-gray-900">
              Counter Staff
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Manage customers at your service counter.
            </p>
          </Link>

          <Link
            to="/statistics"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="text-lg font-bold text-gray-900">
              Statistics
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              View total, waiting, serving, and completed queue counts.
            </p>
          </Link>

        </div>

      </main>
    </div>
  );
};

export default AdminDashboardPage;
