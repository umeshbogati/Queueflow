import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchMyQueues } from "../../store/slices/queueSlice";
import { useQueueSocket } from "../../socket/useSocket";

const UserDashboardPage = () => {
  const dispatch = useAppDispatch();

  const { selectedQueue } = useAppSelector((state) => state.queue);
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?._id ?? user?.id;

  // Live updates for my ticket (status + queue position) without refreshing
  useQueueSocket(userId);

  // Load my newest active ticket on mount; socket pushes keep it fresh
  useEffect(() => {
    dispatch(fetchMyQueues());
  }, [dispatch]);

  const activeTicket =
    selectedQueue &&
    (selectedQueue.status === "waiting" || selectedQueue.status === "called")
      ? selectedQueue
      : null;

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

        {activeTicket && (
          <Link
            to="/queue-position"
            className="mb-8 block rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  My Active Ticket
                </p>
                <p className="mt-1 text-3xl font-bold text-blue-700">
                  {activeTicket.displayNumber}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTicket.department?.name ?? ""}
                  {activeTicket.branch?.name ? ` - ${activeTicket.branch.name}` : ""}
                </p>
              </div>

              {activeTicket.position != null && activeTicket.status === "waiting" ? (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Your position</p>
                  <p className="text-4xl font-bold text-blue-700">
                    #{activeTicket.position}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {activeTicket.position === 1
                      ? "You are next!"
                      : `${activeTicket.position - 1} ${
                          activeTicket.position - 1 === 1 ? "person" : "people"
                        } ahead of you`}
                  </p>
                </div>
              ) : (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  activeTicket.status === "called"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {activeTicket.status === "called"
                    ? "It's your turn - go to the counter!"
                    : activeTicket.status}
                </span>
            )}
            </div>
            <p className="mt-3 text-xs font-medium text-blue-600">
              View full details &rarr;
            </p>
          </Link>
        )}

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
