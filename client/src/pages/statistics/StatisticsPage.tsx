import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

interface QueueStats {
  total: number;
  waiting: number;
  called: number;
  serving: number;
  completed: number;
  cancelled: number;
}

const StatisticsPage = () => {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get<{ data: QueueStats }>("/queues/stats");
        setStats(response.data.data);
      } catch (err: unknown) {
        console.error("Failed to load stats:", err);
        setError("Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Queue Statistics
            </h1>
            <p className="mt-2 text-gray-600">
              Overview of all queue activity.
            </p>
          </div>
          <Link
            to="/admin"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Admin
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {stats && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Total Queues
                </p>
                <p className="mt-2 text-4xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Waiting
                </p>
                <p className="mt-2 text-4xl font-bold text-yellow-600">
                  {stats.waiting}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Called
                </p>
                <p className="mt-2 text-4xl font-bold text-blue-600">
                  {stats.called}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Serving
                </p>
                <p className="mt-2 text-4xl font-bold text-green-600">
                  {stats.serving}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Completed
                </p>
                <p className="mt-2 text-4xl font-bold text-emerald-600">
                  {stats.completed}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Cancelled
                </p>
                <p className="mt-2 text-4xl font-bold text-red-500">
                  {stats.cancelled}
                </p>
              </div>

            </div>

            {/* Progress bar */}
            <div className="mt-10 rounded-xl bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Queue Progress
              </h3>
              <div className="flex h-6 overflow-hidden rounded-full bg-gray-200">
                {stats.total > 0 && (
                  <>
                    <div
                      className="bg-yellow-500"
                      style={{ width: `${(stats.waiting / stats.total) * 100}%` }}
                      title={`Waiting: ${stats.waiting}`}
                    />
                    <div
                      className="bg-blue-500"
                      style={{ width: `${(stats.called / stats.total) * 100}%` }}
                      title={`Called: ${stats.called}`}
                    />
                    <div
                      className="bg-green-500"
                      style={{ width: `${(stats.serving / stats.total) * 100}%` }}
                      title={`Serving: ${stats.serving}`}
                    />
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                      title={`Completed: ${stats.completed}`}
                    />
                    <div
                      className="bg-red-500"
                      style={{ width: `${(stats.cancelled / stats.total) * 100}%` }}
                      title={`Cancelled: ${stats.cancelled}`}
                    />
                  </>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" /> Waiting
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" /> Called
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Serving
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Completed
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Cancelled
                </span>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default StatisticsPage;
