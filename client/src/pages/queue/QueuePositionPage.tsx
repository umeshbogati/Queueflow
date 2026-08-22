import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchMyQueues,
  cancelMyTicket,
  clearQueueError,
} from "../../store/slices/queueSlice";
import { useQueueSocket } from "../../socket/useSocket";

const QueuePositionPage = () => {
  const dispatch = useAppDispatch();
  const { selectedQueue, loading, saving, error } = useAppSelector(
    (state) => state.queue
  );
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?._id ?? user?.id;
  useQueueSocket(userId);

  // Auto-load the user's tickets and pick the newest waiting/called one
  useEffect(() => {
    dispatch(fetchMyQueues());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearQueueError());
    };
  }, [dispatch]);

  const cancelQueue = async () => {
    if (!selectedQueue) return;
    dispatch(cancelMyTicket(selectedQueue._id));
  };

  const canCancel =
    selectedQueue &&
    (selectedQueue.status === "waiting" || selectedQueue.status === "called");

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-xl">

        <h1 className="text-3xl font-bold">
          Queue Position
        </h1>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading && !selectedQueue ? (
          <p className="mt-8 text-center text-gray-500">Loading your ticket...</p>
        ) : selectedQueue ? (
          <div className="mt-8 rounded-xl bg-white p-6 shadow">
            <div className="rounded-xl border p-6 text-center">

              <p className="text-sm text-gray-500">
                Your Queue Number
              </p>

              <h2 className="mt-2 text-5xl font-bold text-blue-600">
                {selectedQueue.displayNumber}
              </h2>

              {/* Live spot in line - server pushes updates via socket,
                  so this changes on its own while you wait */}
              {selectedQueue.status === "waiting" && selectedQueue.position != null && (
                <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3">
                  <p className="text-sm text-gray-500">Your position</p>
                  <p className="text-2xl font-bold text-blue-700">
                    #{selectedQueue.position}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {selectedQueue.position === 1
                      ? "You are next!"
                      : `${selectedQueue.position - 1} ${
                          selectedQueue.position - 1 === 1 ? "person" : "people"
                        } ahead of you`}
                  </p>
                </div>
              )}

              <p className="mt-4">
                Status:{" "}
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedQueue.status === "waiting" ? "bg-yellow-100 text-yellow-700"
                  : selectedQueue.status === "serving" ? "bg-blue-100 text-blue-700"
                  : selectedQueue.status === "called" ? "bg-purple-100 text-purple-700"
                  : selectedQueue.status === "cancelled" ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
                }`}>
                  {selectedQueue.status}
                </span>
              </p>

              {selectedQueue.branch && (
                <p className="mt-2 text-sm text-gray-500">
                  Branch: <span className="font-medium text-gray-700">{selectedQueue.branch.name}</span>
                </p>
              )}

              {selectedQueue.department && (
                <p className="mt-1 text-sm text-gray-500">
                  Department: <span className="font-medium text-gray-700">{selectedQueue.department.name}</span>
                </p>
              )}

              {selectedQueue.counterNumber && (
                <p className="mt-2">
                  Counter:{" "}
                  <strong>{selectedQueue.counterNumber}</strong>
                </p>
              )}

              {canCancel && (
                <button
                  onClick={cancelQueue}
                  disabled={saving}
                  className="mt-6 w-full rounded-lg border border-red-300 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {saving ? "Cancelling..." : "Cancel Queue"}
                </button>
              )}

              {selectedQueue.status === "cancelled" && (
                <div>
                  <p className="mt-4 text-sm text-red-500">
                    This queue has been cancelled.
                  </p>
                  <Link
                    to="/queue"
                    className="mt-4 inline-block w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Take a New Ticket
                  </Link>
                </div>
              )}

              {(selectedQueue.status === "completed") && (
                <div>
                  <p className="mt-4 text-sm text-green-600">
                    This visit is completed. Thank you!
                  </p>
                  <Link
                    to="/queue"
                    className="mt-4 inline-block w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Take a New Ticket
                  </Link>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl bg-white p-8 text-center shadow">
            <h2 className="text-lg font-semibold text-gray-800">
              No active ticket
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              You don't have a waiting or called ticket right now.
            </p>
            <Link
              to="/queue"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Take a Ticket
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default QueuePositionPage;
