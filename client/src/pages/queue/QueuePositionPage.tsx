import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchQueueById, changeQueueStatus } from "../../store/slices/queueSlice";
import { useQueueSocket } from "../../socket/useSocket";

const QueuePositionPage = () => {
  const dispatch = useAppDispatch();
  const { selectedQueue, loading, saving, error } = useAppSelector(
    (state) => state.queue
  );
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?._id ?? user?.id;
  useQueueSocket(userId);

  const [queueId, setQueueId] = useState("");

  const checkPosition = async () => {
    if (!queueId.trim()) {
      return;
    }
    dispatch(fetchQueueById(queueId.trim()));
  };

  const cancelQueue = async () => {
    if (!selectedQueue) return;
    dispatch(
      changeQueueStatus({ id: selectedQueue._id, status: "cancelled" })
    );
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

        <div className="mt-8 rounded-xl bg-white p-6 shadow">

          <label className="text-sm font-medium">
            Queue ID
          </label>

          <input
            value={queueId}
            onChange={(e) =>
              setQueueId(e.target.value)
            }
            placeholder="Enter queue ID"
            className="mt-2 w-full rounded-lg border px-4 py-3"
          />

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={checkPosition}
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? "Checking..."
              : "Check Position"}
          </button>

          {selectedQueue && (
            <div className="mt-8 rounded-xl border p-6 text-center">

              <p className="text-sm text-gray-500">
                Your Queue Number
              </p>

              <h2 className="mt-2 text-5xl font-bold text-blue-600">
                {selectedQueue.displayNumber}
              </h2>

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

              {selectedQueue.position !== undefined && (
                <p className="mt-2">
                  Position:{" "}
                  <strong>{selectedQueue.position}</strong>
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
                <p className="mt-4 text-sm text-red-500">
                  This queue has been cancelled.
                </p>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default QueuePositionPage;
