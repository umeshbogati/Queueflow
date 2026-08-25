import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAgents,
  addAgent,
  editAgent,
  removeAgent,
  clearAgentError,
} from "../../store/slices/agentSlice";
import { fetchBranches } from "../../store/slices/branchSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import type { Agent } from "../../api/agentApi";

const AgentsPage = () => {
  const dispatch = useAppDispatch();
  const { agents, loading, saving, error } = useAppSelector(
    (state) => state.agent
  );
  const { branches } = useAppSelector((state) => state.branch);
  const { departments } = useAppSelector((state) => state.department);

  const [userId, setUserId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [counterNumber, setCounterNumber] = useState(1);
  const [officeStart, setOfficeStart] = useState(9);
  const [officeEnd, setOfficeEnd] = useState(17);
  const [maxTokensPerDay, setMaxTokensPerDay] = useState(20);
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCounter, setEditCounter] = useState(1);
  const [editOfficeStart, setEditOfficeStart] = useState(9);
  const [editOfficeEnd, setEditOfficeEnd] = useState(17);
  const [editMaxTokens, setEditMaxTokens] = useState(20);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAgents());
    dispatch(fetchBranches());
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearAgentError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");

    if (!userId.trim() || !branchId || !departmentId) return;

    const result = await dispatch(
      addAgent({
        user: userId.trim(),
        branch: branchId,
        department: departmentId,
        counterNumber,
        officeStart,
        officeEnd,
        maxTokensPerDay,
      })
    );

    if (addAgent.fulfilled.match(result)) {
      setUserId("");
      setBranchId("");
      setDepartmentId("");
      setCounterNumber(1);
      setOfficeStart(9);
      setOfficeEnd(17);
      setMaxTokensPerDay(20);
      setSuccess("Agent created successfully.");
    }
  };

  const startEdit = (agent: Agent) => {
    setEditingId(agent._id);
    setEditCounter(agent.counterNumber);
    setEditOfficeStart(agent.officeStart);
    setEditOfficeEnd(agent.officeEnd);
    setEditMaxTokens(agent.maxTokensPerDay);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCounter(1);
    setEditOfficeStart(9);
    setEditOfficeEnd(17);
    setEditMaxTokens(20);
  };

  const handleEdit = async (id: string) => {
    const result = await dispatch(
      editAgent({
        id,
        data: {
          counterNumber: editCounter,
          officeStart: editOfficeStart,
          officeEnd: editOfficeEnd,
          maxTokensPerDay: editMaxTokens,
        },
      })
    );
    if (editAgent.fulfilled.match(result)) {
      cancelEdit();
      setSuccess("Agent updated successfully.");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await dispatch(removeAgent(id));
    if (removeAgent.fulfilled.match(result)) {
      setDeleteConfirmId(null);
      setSuccess("Agent deleted successfully.");
    }
  };

  const handleToggleActive = async (agent: Agent) => {
    const result = await dispatch(
      editAgent({ id: agent._id, data: { isActive: !agent.isActive } })
    );
    if (editAgent.fulfilled.match(result)) {
      setSuccess(
        `Agent is now ${result.payload.isActive ? "active" : "inactive"}.`
      );
    }
  };

  const getUserName = (user: Agent["user"]) => {
    if (typeof user === "string") return user;
    return user.name || "Unknown";
  };

  const getBranchName = (branch: Agent["branch"]) => {
    if (typeof branch === "string") return branch;
    return branch.name || "Unknown";
  };

  const getDeptName = (dept: Agent["department"]) => {
    if (typeof dept === "string") return dept;
    return dept.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
            <p className="mt-1 text-gray-500">
              Manage service agents, office hours, and daily token limits.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(fetchAgents())}
            disabled={loading}
            className="rounded-lg border bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {success && (
          <div className="mt-5 rounded-lg bg-green-50 p-4 text-green-700">{success}</div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900">Add Agent</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="agent-user" className="mb-2 block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <input
                  id="agent-user"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="User MongoDB ID"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label htmlFor="agent-branch" className="mb-2 block text-sm font-medium text-gray-700">
                  Branch
                </label>
                <select
                  id="agent-branch"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select branch</option>
                  {branches.filter((b) => b.isActive !== false).map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="agent-department" className="mb-2 block text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  id="agent-department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select department</option>
                  {departments.filter((d) => d.isActive !== false).map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="agent-counter" className="mb-2 block text-sm font-medium text-gray-700">
                  Counter Number
                </label>
                <input
                  id="agent-counter"
                  type="number"
                  min={1}
                  max={999}
                  value={counterNumber}
                  onChange={(e) => setCounterNumber(Number(e.target.value))}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="agent-office-start" className="mb-2 block text-sm font-medium text-gray-700">
                    Office Start (hour)
                  </label>
                  <input
                    id="agent-office-start"
                    type="number"
                    min={0}
                    max={23}
                    value={officeStart}
                    onChange={(e) => setOfficeStart(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label htmlFor="agent-office-end" className="mb-2 block text-sm font-medium text-gray-700">
                    Office End (hour)
                  </label>
                  <input
                    id="agent-office-end"
                    type="number"
                    min={0}
                    max={23}
                    value={officeEnd}
                    onChange={(e) => setOfficeEnd(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="agent-max-tokens" className="mb-2 block text-sm font-medium text-gray-700">
                  Max Tokens Per Day
                </label>
                <input
                  id="agent-max-tokens"
                  type="number"
                  min={1}
                  value={maxTokensPerDay}
                  onChange={(e) => setMaxTokensPerDay(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating..." : "Add Agent"}
              </button>
            </div>
          </form>

          <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Agents</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {agents.length} {agents.length === 1 ? "agent" : "agents"}
                </p>
              </div>
            </div>

            {loading && <p className="mt-6 text-gray-500">Loading agents...</p>}

            {!loading && agents.length === 0 && (
              <p className="mt-6 text-gray-500">No agents found. Create one to get started.</p>
            )}

            {!loading && agents.length > 0 && (
              <div className="mt-6 space-y-3">
                {agents.map((agent) => (
                  <div key={agent._id} className="rounded-lg border border-gray-200 p-5">
                    {editingId === agent._id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500">Counter</label>
                            <input
                              type="number"
                              min={1}
                              max={999}
                              value={editCounter}
                              onChange={(e) => setEditCounter(Number(e.target.value))}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500">Max Tokens/Day</label>
                            <input
                              type="number"
                              min={1}
                              value={editMaxTokens}
                              onChange={(e) => setEditMaxTokens(Number(e.target.value))}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500">Office Start</label>
                            <input
                              type="number"
                              min={0}
                              max={23}
                              value={editOfficeStart}
                              onChange={(e) => setEditOfficeStart(Number(e.target.value))}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500">Office End</label>
                            <input
                              type="number"
                              min={0}
                              max={23}
                              value={editOfficeEnd}
                              onChange={(e) => setEditOfficeEnd(Number(e.target.value))}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(agent._id)}
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : deleteConfirmId === agent._id ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-700">
                          Delete agent for "{getUserName(agent.user)}"? This cannot be undone.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleDelete(agent._id)}
                            disabled={saving}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {saving ? "Deleting..." : "Yes, Delete"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-gray-900">
                            {getUserName(agent.user)}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Counter: {agent.counterNumber} | {getDeptName(agent.department)} - {getBranchName(agent.branch)}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Office: {agent.officeStart}:00 - {agent.officeEnd}:00 | Tokens today: {agent.tokensServedToday}/{agent.maxTokensPerDay}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              agent.status === "available"
                                ? "bg-green-100 text-green-700"
                                : agent.status === "busy"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {agent.status}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              agent.isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {agent.isActive ? "Active" : "Inactive"}
                          </span>
                          <button
                            onClick={() => handleToggleActive(agent)}
                            disabled={saving}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                              agent.isActive
                                ? "border border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                : "border border-green-300 text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {agent.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => startEdit(agent)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(agent._id)}
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsPage;
