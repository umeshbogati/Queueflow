import { Link } from "react-router-dom";

const UserDashboardPage = () => {
  return (
    <div>
      <main>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            My Dashboard
          </h2>
          <p className="mt-2 text-gray-600">
            Take a queue ticket, check your position, and track your status.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            to="/queue"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              +
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Join Queue
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Select a branch and department to get a queue ticket number.
            </p>
          </Link>

          <Link
            to="/queue-position"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              ?
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Check Position
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter your queue ID to check your current position and status.
            </p>
          </Link>

          <Link
            to="/departments"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              #
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Departments
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              View available departments and their descriptions.
            </p>
          </Link>

        </div>

        <div className="mt-10 rounded-xl bg-white p-6 shadow">
          <h3 className="text-lg font-bold text-gray-900">
            How It Works
          </h3>
          <ol className="mt-3 space-y-2 text-sm text-gray-600">
            <li>1. Click <span className="font-semibold">Join Queue</span> and select your branch and department.</li>
            <li>2. You will receive a <span className="font-semibold">ticket number</span> (e.g. Q001).</li>
            <li>3. Wait for your number to be called on the display screen.</li>
            <li>4. Go to the assigned counter when your status changes to <span className="font-semibold">serving</span>.</li>
          </ol>
        </div>

      </main>
    </div>
  );
};

export default UserDashboardPage;
