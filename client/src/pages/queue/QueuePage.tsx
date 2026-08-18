import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../../api/axios";

interface Branch {
  _id: string;
  name: string;
}

interface Department {
  _id: string;
  name: string;
  branch?: { _id: string; name: string } | string;
}

interface Queue {
  _id: string;
  displayNumber: string;
  status: "waiting" | "called" | "serving" | "completed" | "cancelled";
  counterNumber?: number;
  branch?: { _id: string; name: string };
  department?: { _id: string; name: string };
}

const QueuePage = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);

  const [branchId, setBranchId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [branchRes, deptRes, queueRes] = await Promise.all([
          api.get("/branches"),
          api.get("/departments"),
          api.get("/queues"),
        ]);

        if (cancelled) return;

        setBranches(branchRes.data.data ?? []);
        setDepartments(deptRes.data.data ?? []);
        setQueues(queueRes.data.data ?? []);
      } catch (err: unknown) {
        if (cancelled) return;
        console.error("Queue load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const getDepartmentBranchId = (dept: Department): string => {
    const b = dept.branch;
    if (!b) return "";
    if (typeof b === "string") return b;
    return b._id ?? "";
  };

  const filteredDepartments = departments.filter((dept) => {
    if (!branchId) return false;
    return getDepartmentBranchId(dept) === branchId;
  });

  const handleCreateQueue = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!branchId) { setError("Please select a branch."); return; }
    if (!departmentId) { setError("Please select a department."); return; }

    try {
      setCreating(true);
      setError("");
      await api.post("/queues", { branch: branchId, department: departmentId });
      setBranchId("");
      setDepartmentId("");
      const queueRes = await api.get("/queues");
      setQueues(queueRes.data.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create queue.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Queue Management</h1>
          <p className="mt-2 text-gray-600">Select a branch and department to get a queue number.</p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900">Take Queue</h2>

            <form onSubmit={handleCreateQueue} className="mt-5 space-y-4">
              <div>
                <label htmlFor="queue-branch" className="mb-2 block text-sm font-medium text-gray-700">Branch</label>
                <select
                  id="queue-branch"
                  value={branchId}
                  onChange={(e) => { setBranchId(e.target.value); setDepartmentId(""); }}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select branch</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
                {branches.length === 0 && !loading && (
                  <p className="mt-2 text-sm text-red-500">No branches available.</p>
                )}
              </div>

              <div>
                <label htmlFor="queue-department" className="mb-2 block text-sm font-medium text-gray-700">Department</label>
                <select
                  id="queue-department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                  disabled={!branchId}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">Select department</option>
                  {filteredDepartments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
                {branchId && filteredDepartments.length === 0 && (
                  <p className="mt-2 text-sm text-red-500">No departments found for this branch.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={creating || !branchId || !departmentId}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating..." : "Get Queue Number"}
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Current Queues</h2>
                <p className="mt-1 text-sm text-gray-500">{queues.length} queue{queues.length !== 1 ? "s" : ""}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  const queueRes = await api.get("/queues");
                  setQueues(queueRes.data.data ?? []);
                  setLoading(false);
                }}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-8 text-center"><p className="text-gray-500">Loading queues...</p></div>
            ) : queues.length === 0 ? (
              <div className="mt-8 rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <h3 className="font-semibold text-gray-700">No queues found</h3>
                <p className="mt-2 text-sm text-gray-500">No queue has been created yet.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {queues.map((queue) => (
                  <div key={queue._id} className="rounded-xl border border-gray-200 p-5 hover:shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-2xl font-bold text-gray-900">{queue.displayNumber}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        queue.status === "waiting" ? "bg-yellow-100 text-yellow-700"
                        : queue.status === "serving" ? "bg-blue-100 text-blue-700"
                        : queue.status === "called" ? "bg-purple-100 text-purple-700"
                        : queue.status === "cancelled" ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                      }`}>{queue.status}</span>
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Branch: </span>
                        {queue.branch?.name || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Department: </span>
                        {queue.department?.name || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Counter: </span>
                        {queue.counterNumber ?? "Not assigned"}
                      </p>
                    </div>
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

export default QueuePage;
