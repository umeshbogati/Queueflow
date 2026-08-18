import { useState } from "react";
import api from "../../api/axios";

interface Queue {
  _id: string;
  displayNumber: string;
  status: string;
  counterNumber?: number;
  position?: number;
}

const QueuePositionPage = () => {
  const [queueId, setQueueId] = useState("");
  const [queue, setQueue] = useState<Queue | null>(null);

  const [loading, setLoading] = useState(false);
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
                <strong>{queue.status}</strong>
              </p>

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

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default QueuePositionPage;