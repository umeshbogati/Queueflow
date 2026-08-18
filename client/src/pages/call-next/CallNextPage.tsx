import { useState } from "react";
import api from "../../api/axios";

interface Queue {
  _id: string;
  displayNumber: string;
  status: "waiting" | "called" | "serving" | "completed" | "cancelled";
  counterNumber?: number;
  branch?: { name: string };
  department?: { name: string };
}

const CallNextPage = () => {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [counterNumber, setCounterNumber] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const callNext = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.patch<{ data: Queue | null }>(
        "/queues/call-next",
        { counterNumber }
      );

      if (!response.data.data) {
        setError("No waiting queues. Create a queue ticket first.");
        return;
      }

      setQueue(response.data.data);
    } catch (err: any) {
      console.error("Call next error:", err);
      setError(err.response?.data?.message || err.message || "Failed to call next queue.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: "serving" | "completed" | "cancelled") => {
    if (!queue) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.patch<{ data: Queue }>(
        `/queues/${queue._id}/status`,
        { status, counterNumber: queue.counterNumber || counterNumber }
      );

      setQueue(response.data.data);
    } catch (err: any) {
      console.error("Update status error:", err);
      setError(err.response?.data?.message || err.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Call Next
          </h1>

          <p className="mt-2 text-gray-600">
            Call the next customer in the queue.
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 text-center shadow">

          <div className="mb-6">
            <label htmlFor="counter-input" className="mb-2 block text-left text-sm font-medium text-gray-700">
              Your Counter Number
            </label>
            <input
              id="counter-input"
              type="number"
              min={1}
              value={counterNumber}
              onChange={(e) => setCounterNumber(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

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

              <p className="mt-1 text-sm text-gray-500">
                Counter: <span className="font-medium text-gray-700">{queue.counterNumber ?? counterNumber}</span>
              </p>

              <div className="mt-6 flex flex-col gap-3">
                {queue.status === "called" && (
                  <button
                    type="button"
                    onClick={() => updateStatus("serving")}
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Start Serving
                  </button>
                )}

                {queue.status === "serving" && (
                  <button
                    type="button"
                    onClick={() => updateStatus("completed")}
                    disabled={loading}
                    className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Complete
                  </button>
                )}

                {(queue.status === "called" || queue.status === "serving") && (
                  <button
                    type="button"
                    onClick={() => updateStatus("cancelled")}
                    disabled={loading}
                    className="w-full rounded-lg border border-red-300 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}

                {(queue.status === "completed" || queue.status === "cancelled") && (
                  <p className="text-sm text-gray-500">
                    This queue has been {queue.status}.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-500">
                No queue is currently being served.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={callNext}
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-gray-900 px-4 py-4 text-lg font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Calling..." : "Call Next Customer"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default CallNextPage;
