import { useState } from "react";
import api from "../../api/axios";

interface Queue {
  _id: string;
  displayNumber: string;
  status: string;
  counterNumber?: number;
  position?: number;
  branch?: { name: string };
  department?: { name: string };
}

const QueuePositionPage = () => {
  const [queueId, setQueueId] = useState("");
  const [queue, setQueue] = useState<Queue | null>(null);

  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const checkPosition = async () => {
    if (!queueId.trim()) {
      setError("Please enter queue ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get<{ success?: boolean; data?: Queue }>(
        `/queues/${queueId}`
      );

      const queueData = response.data.data ?? null;
      setQueue(queueData);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to find queue."
      );

      setQueue(null);
    } finally {
      setLoading(false);
    }
  };

  const cancelQueue = async () => {
    if (!queue) return;

    try {
      setCancelling(true);
      setError("");

      const response = await api.patch<{ data: Queue }>(
        `/queues/${queue._id}/status`,
        { status: "cancelled" }
      );

      setQueue(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to cancel queue.");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = queue && (queue.status === "waiting" || queue.status === "called");

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

          {queue && (
            <div className="mt-8 rounded-xl border p-6 text-center">

              <p className="text-sm text-gray-500">
                Your Queue Number
              </p>

              <h2 className="mt-2 text-5xl font-bold text-blue-600">
                {queue.displayNumber}
              </h2>

              <p className="mt-4">
                Status:{" "}
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  queue.status === "waiting" ? "bg-yellow-100 text-yellow-700"
                  : queue.status === "serving" ? "bg-blue-100 text-blue-700"
                  : queue.status === "called" ? "bg-purple-100 text-purple-700"
                  : queue.status === "cancelled" ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
                }`}>
                  {queue.status}
                </span>
              </p>

              {queue.branch && (
                <p className="mt-2 text-sm text-gray-500">
                  Branch: <span className="font-medium text-gray-700">{queue.branch.name}</span>
                </p>
              )}

              {queue.department && (
                <p className="mt-1 text-sm text-gray-500">
                  Department: <span className="font-medium text-gray-700">{queue.department.name}</span>
                </p>
              )}

              {queue.position !== undefined && (
                <p className="mt-2">
                  Position:{" "}
                  <strong>{queue.position}</strong>
                </p>
              )}

              {queue.counterNumber && (
                <p className="mt-2">
                  Counter:{" "}
                  <strong>{queue.counterNumber}</strong>
                </p>
              )}

              {canCancel && (
                <button
                  onClick={cancelQueue}
                  disabled={cancelling}
                  className="mt-6 w-full rounded-lg border border-red-300 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {cancelling ? "Cancelling..." : "Cancel Queue"}
                </button>
              )}

              {queue.status === "cancelled" && (
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
