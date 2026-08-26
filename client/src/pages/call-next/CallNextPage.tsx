import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  callNext,
  changeQueueStatus,
  fetchQueues,
  clearQueueError,
  clearAutoCallNext,
} from "../../store/slices/queueSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import {
  fetchAgents,
  callNextByAgent,
} from "../../store/slices/agentSlice";
import { useAdminSocket } from "../../socket/useSocket";
import { useCountdown } from "../../hooks/useCountdown";
import type { Agent } from "../../api/agentApi";

const NO_SHOW_TIMEOUT_MS = 120_000;

const CallNextPage = () => {
  const dispatch = useAppDispatch();
  useAdminSocket();

  const { currentQueue, queues, saving, error } = useAppSelector(
    (state) => state.queue
  );
  const { departments } = useAppSelector((state) => state.department);
  const { agents } = useAppSelector((state) => state.agent);
  const counterNumber = useAppSelector(
    (state) => state.counter.currentCounterNumber
  );
  const autoCallNext = useAppSelector((state) => state.queue.autoCallNext);

  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");

  useEffect(() => {
    dispatch(fetchQueues());
    dispatch(fetchDepartments());
    dispatch(fetchAgents());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearQueueError());
    };
  }, [dispatch]);

  const activeQueue =
    currentQueue ??
    queues.find((q) => q.status === "called" || q.status === "serving");

  const noShowRemaining = useCountdown(
    activeQueue?.status === "called" ? activeQueue.calledAt : null,
    NO_SHOW_TIMEOUT_MS,
  );

  const autoCallRemaining = useCountdown(
    autoCallNext?.startedAt,
    autoCallNext?.delayMs ?? 30_000,
  );

  // Auto-clear auto-call-next state when countdown finishes
  useEffect(() => {
    if (autoCallRemaining === 0 && autoCallNext) {
      dispatch(clearAutoCallNext());
    }
  }, [autoCallRemaining, autoCallNext, dispatch]);

  const activeDepartments = departments.filter((d) => d.isActive !== false);

  const selectedAgent = agents.find((a) => a._id === selectedAgentId);
  const availableAgents = agents.filter(
    (a) =>
      a.isActive &&
      a.status === "available" &&
      (!selectedDepartmentId || a.department?._id === selectedDepartmentId)
  );

  const getUserName = (user: Agent["user"]) => {
    if (typeof user === "string") return user;
    return user.name || "Unknown";
  };

  const handleCallNext = () => {
    // If an agent is selected, use agent-based call
    if (selectedAgentId) {
      dispatch(callNextByAgent(selectedAgentId));
      return;
    }

    // Otherwise use the standard admin call-next
    dispatch(
      callNext({
        counterNumber,
        ...(selectedDepartmentId ? { departmentId: selectedDepartmentId } : {}),
      })
    );
  };

  const updateStatus = (
    status: "serving" | "completed" | "cancelled"
  ) => {
    if (!activeQueue) return;
    dispatch(
      changeQueueStatus({
        id: activeQueue._id,
        status,
        counterNumber: activeQueue.counterNumber || counterNumber,
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Call Next</h1>
          <p className="mt-2 text-gray-600">
            Call the next customer in the queue.
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 text-center shadow">
          {/* Agent selector */}
          <div className="mb-6">
            <label
              htmlFor="call-next-agent"
              className="mb-2 block text-left text-sm font-medium text-gray-700"
            >
              Select Agent (optional)
            </label>
            <select
              id="call-next-agent"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">No agent (admin manual)</option>
              {availableAgents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {getUserName(agent.user)} - Counter {agent.counterNumber} (
                  {agent.tokensServedToday}/{agent.maxTokensPerDay} tokens)
                </option>
              ))}
            </select>
            <p className="mt-1 text-left text-xs text-gray-400">
              Pick an agent to auto-assign tickets and enforce limits.
            </p>
          </div>

          {/* Agent info card */}
          {selectedAgent && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">
                    {getUserName(selectedAgent.user)}
                  </p>
                  <p className="text-sm text-blue-700">
                    Counter {selectedAgent.counterNumber} |{" "}
                    {selectedAgent.department?.name || "Dept"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedAgent.status === "available"
                      ? "bg-green-100 text-green-700"
                      : selectedAgent.status === "busy"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedAgent.status}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-blue-700">
                <span>
                  Office: {selectedAgent.officeStart}:00 -{" "}
                  {selectedAgent.officeEnd}:00
                </span>
                <span>
                  Tokens: {selectedAgent.tokensServedToday}/
                  {selectedAgent.maxTokensPerDay}
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-blue-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (selectedAgent.tokensServedToday /
                        selectedAgent.maxTokensPerDay) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Counter number (only show when no agent selected) */}
          {!selectedAgentId && (
            <div className="mb-6">
              <label className="mb-2 block text-left text-sm font-medium text-gray-700">
                Your Counter Number
              </label>
              <p className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl font-bold">
                {counterNumber}
              </p>
            </div>
          )}

          {/* Department filter */}
          <div className="mb-6">
            <label
              htmlFor="call-next-department"
              className="mb-2 block text-left text-sm font-medium text-gray-700"
            >
              Serving Department
            </label>
            <select
              id="call-next-department"
              value={selectedDepartmentId}
              onChange={(e) => {
                setSelectedDepartmentId(e.target.value);
                setSelectedAgentId("");
              }}
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All departments</option>
              {activeDepartments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                  {dept.branch?.name ? ` — ${dept.branch.name}` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1 text-left text-xs text-gray-400">
              Pick a department to serve only its waiting tickets.
            </p>
          </div>

          {/* Active queue display */}
          {activeQueue ? (
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Now Serving
              </p>

              <h2 className="mt-3 text-6xl font-bold text-blue-600">
                {activeQueue.displayNumber}
              </h2>

              <p className="mt-4 text-gray-600">
                Status:{" "}
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    activeQueue.status === "waiting"
                      ? "bg-yellow-100 text-yellow-700"
                      : activeQueue.status === "serving"
                      ? "bg-blue-100 text-blue-700"
                      : activeQueue.status === "called"
                      ? "bg-purple-100 text-purple-700"
                      : activeQueue.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {activeQueue.status}
                </span>
              </p>

              {activeQueue.branch && (
                <p className="mt-2 text-sm text-gray-500">
                  Branch:{" "}
                  <span className="font-medium text-gray-700">
                    {activeQueue.branch.name}
                  </span>
                </p>
              )}

              {activeQueue.department && (
                <p className="mt-1 text-sm text-gray-500">
                  Department:{" "}
                  <span className="font-medium text-gray-700">
                    {activeQueue.department.name}
                  </span>
                </p>
              )}

              <p className="mt-1 text-sm text-gray-500">
                Counter:{" "}
                <span className="font-medium text-gray-700">
                  {activeQueue.counterNumber ?? counterNumber}
                </span>
              </p>

              {activeQueue.status === "called" && noShowRemaining != null && (
                <div className="mt-3 rounded-lg bg-amber-50 px-4 py-3">
                  <p className="text-sm text-amber-700">No-show timer</p>
                  <p className={`text-2xl font-bold tabular-nums ${
                    noShowRemaining <= 30 ? "text-red-600" : "text-amber-700"
                  }`}>
                    {Math.floor(noShowRemaining / 60)}:{String(noShowRemaining % 60).padStart(2, "0")}
                  </p>
                  <p className="text-xs text-amber-600">
                    {noShowRemaining <= 30
                      ? "Customer will be skipped soon."
                      : "Customer has this much time to arrive."}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                {activeQueue.status === "called" && (
                  <button
                    type="button"
                    onClick={() => updateStatus("serving")}
                    disabled={saving}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Start Serving
                  </button>
                )}

                {activeQueue.status === "serving" && (
                  <button
                    type="button"
                    onClick={() => updateStatus("completed")}
                    disabled={saving}
                    className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Complete
                  </button>
                )}

                {(activeQueue.status === "called" ||
                  activeQueue.status === "serving") && (
                  <button
                    type="button"
                    onClick={() => updateStatus("cancelled")}
                    disabled={saving}
                    className="w-full rounded-lg border border-red-300 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}

                {activeQueue.status === "completed" ||
                  (activeQueue.status === "cancelled" && (
                    <p className="text-sm text-gray-500">
                      This queue has been {activeQueue.status}.
                    </p>
                  ))}
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

          {autoCallNext && autoCallRemaining != null && autoCallRemaining > 0 && (
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-sm font-medium text-blue-700">
                Auto-calling next ticket in{" "}
                <span className="text-lg font-bold tabular-nums text-blue-900">
                  {autoCallRemaining}s
                </span>
              </p>
              <p className="text-xs text-blue-600">
                {autoCallNext.waitingCount} ticket{autoCallNext.waitingCount !== 1 ? "s" : ""} waiting
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleCallNext}
            disabled={
              saving ||
              (!!selectedAgentId && selectedAgent?.status !== "available")
            }
            className="mt-8 w-full rounded-lg bg-gray-900 px-4 py-4 text-lg font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Calling..."
              : selectedAgentId
              ? `Call Next (${getUserName(selectedAgent!.user)})`
              : "Call Next Customer"}
          </button>

          <p className="mt-4 text-xs text-gray-400">
            No-show timeout: 2 minutes. Auto-call-next: 30s after completing a ticket.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallNextPage;
