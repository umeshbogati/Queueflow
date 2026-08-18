import { useState } from "react";
import api from "../../api/axios";

interface Queue {
  _id: string;
  displayNumber: string;
  status: "waiting" | "called" | "serving" | "completed" | "cancelled";
  counterNumber?: number;
}

const CallNextPage = () => {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const callNext = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.patch<{ data: Queue | null }>(
        "/queues/call-next"
      );

      if (!response.data.data) {
        setError("No waiting queues. Create a queue ticket first.");
        return;
      }

      setQueue(response.data.data);
    } catch (err: unknown) {
      console.error("Call next error:", err);

      const msg =
        err instanceof Error ? err.message : "Failed to call next queue.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Call Next
          </h1>

          <p className="mt-2 text-gray-600">
            Call the next customer in the queue.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl bg-white p-8 text-center shadow">

          {/* Current Queue */}
          {queue ? (
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Now Serving
              </p>

              <h2 className="mt-3 text-6xl font-bold text-blue-600">
                {queue.displayNumber}
              </h2>

              <p className="mt-4 text-gray-600">
                Status:{" "}
                <span className="font-semibold">
                  {queue.status}
                </span>
              </p>

              {queue.counterNumber !== undefined && (
                <p className="mt-2 text-gray-600">
                  Counter:{" "}
                  <span className="font-semibold">
                    {queue.counterNumber}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-500">
                No queue is currently being served.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="button"
            onClick={callNext}
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-blue-600 px-4 py-4 text-lg font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Calling..."
              : "Call Next Customer"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default CallNextPage;