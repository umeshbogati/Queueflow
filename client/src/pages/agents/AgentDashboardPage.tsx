import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAgentStats, clearAgentError } from "../../store/slices/agentSlice";
import { socket } from "../../socket/socket";
import { useAdminSocket } from "../../socket/useSocket";

const AgentDashboardPage = () => {
  const dispatch = useAppDispatch();
  useAdminSocket();

  const { stats, loading, error } = useAppSelector((state) => state.agent);

  useEffect(() => {
    dispatch(fetchAgentStats());
  }, [dispatch]);

  // Keep the dashboard live across admin browsers/tabs: whenever any agent or
  // queue status changes (or stats update), re-fetch the authoritative stats
  // from the server instead of relying on the initial mount snapshot.
  useEffect(() => {
    const refresh = () => dispatch(fetchAgentStats());
    socket.on("agent:updated", refresh);
    socket.on("queue:created", refresh);
    socket.on("queue:updated", refresh);
    socket.on("queue:called", refresh);
    socket.on("stats:updated", refresh);
    return () => {
      socket.off("agent:updated", refresh);
      socket.off("queue:created", refresh);
      socket.off("queue:updated", refresh);
      socket.off("queue:called", refresh);
      socket.off("stats:updated", refresh);
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearAgentError());
    };
  }, [dispatch]);

  const nameOf = (ref: string | { name?: string } | undefined) => {
    if (!ref) return "Unknown";
    if (typeof ref === "string") return ref;
    return ref.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of all service agents and their daily performance.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {loading && <p className="text-gray-500">Loading agent stats...</p>}

        {!loading && stats.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">No agents found. Create agents in Agent Management.</p>
          </div>
        )}

        {!loading && stats.length > 0 && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-5 shadow">
                <p className="text-sm font-medium text-gray-500">Total Agents</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.length}</p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow">
                <p className="text-sm font-medium text-gray-500">Available Now</p>
                <p className="mt-1 text-3xl font-bold text-green-600">
                  {stats.filter((s) => s.agent.status === "available").length}
                </p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow">
                <p className="text-sm font-medium text-gray-500">Busy Now</p>
                <p className="mt-1 text-3xl font-bold text-yellow-600">
                  {stats.filter((s) => s.agent.status === "busy").length}
                </p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow">
                <p className="text-sm font-medium text-gray-500">Offline</p>
                <p className="mt-1 text-3xl font-bold text-red-600">
                  {stats.filter((s) => s.agent.status === "offline").length}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {stats.map((s) => (
                <div key={s.agent._id} className="rounded-xl bg-white p-6 shadow">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {nameOf(s.agent.user)}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Counter {s.agent.counterNumber} | {nameOf(s.agent.department)} - {nameOf(s.agent.branch)}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Office: {s.agent.officeStart}:00 - {s.agent.officeEnd}:00
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        s.agent.status === "available" ? "bg-green-100 text-green-700"
                        : s.agent.status === "busy" ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                      }`}>
                        {s.agent.status}
                      </span>
                      {s.officeHoursActive ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Office Open
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                          Office Closed
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-xs font-medium text-gray-500">Served Today</p>
                      <p className="text-xl font-bold text-gray-900">{s.completedToday}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-xs font-medium text-gray-500">Currently Serving</p>
                      <p className="text-xl font-bold text-blue-600">{s.currentlyServing}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-xs font-medium text-gray-500">Tokens Left</p>
                      <p className={`text-xl font-bold ${s.tokensRemaining > 0 ? "text-green-600" : "text-red-600"}`}>
                        {s.tokensRemaining}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-xs font-medium text-gray-500">Daily Token Limit</p>
                      <p className="text-xl font-bold text-gray-900">
                        {s.agent.tokensServedToday}
                        <span className="text-base font-normal text-gray-400"> / {s.agent.maxTokensPerDay}</span>
                      </p>
                      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            s.agent.tokensServedToday >= s.agent.maxTokensPerDay
                              ? "bg-red-500"
                              : s.agent.tokensServedToday >= s.agent.maxTokensPerDay * 0.8
                              ? "bg-yellow-500"
                              : "bg-blue-600"
                          }`}
                          style={{
                            width: `${Math.min(100, (s.agent.tokensServedToday / s.agent.maxTokensPerDay) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {Math.round((s.agent.tokensServedToday / s.agent.maxTokensPerDay) * 100)}% used
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentDashboardPage;
