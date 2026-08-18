import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createBranch, getBranches } from "../../api/branchApi";
import type { Branch } from "../../api/branchApi";

const BranchesPage = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBranches = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await getBranches();
      const list = response.data ?? response.branches ?? [];
      setBranches(Array.isArray(response) ? response : list);
    } catch (err: unknown) {
      console.error("Load branches error:", err);
      setError(err instanceof Error ? err.message : "Failed to load branches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBranches(false);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const branchName = name.trim();
    const branchLocation = location.trim();

    if (!branchName) {
      setError("Branch name is required.");
      return;
    }
    if (!branchLocation) {
      setError("Branch location is required.");
      return;
    }

    try {
      setSaving(true);
      await createBranch({ name: branchName, location: branchLocation });
      setName("");
      setLocation("");
      setSuccess("Branch created successfully.");
      await loadBranches();
    } catch (err: any) {
      console.error("Create branch error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to create branch.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Branch Management</h1>
            <p className="mt-1 text-gray-500">Create and manage Queueflow branches.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadBranches()}
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
            <h2 className="text-xl font-bold text-gray-900">Add Branch</h2>
            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="branch-name" className="mb-2 block text-sm font-medium text-gray-700">
                  Branch Name
                </label>
                <input
                  id="branch-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kathmandu Main Branch"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label htmlFor="branch-location" className="mb-2 block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  id="branch-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kathmandu"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating..." : "Add Branch"}
              </button>
            </div>
          </form>

          <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Branches</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {branches.length} {branches.length === 1 ? "branch" : "branches"}
                </p>
              </div>
            </div>

            {loading && <p className="mt-6 text-gray-500">Loading branches...</p>}

            {!loading && branches.length === 0 && (
              <p className="mt-6 text-gray-500">No branches found.</p>
            )}

            {!loading && branches.length > 0 && (
              <div className="mt-6 space-y-3">
                {branches.map((branch) => (
                  <div key={branch._id} className="rounded-lg border border-gray-200 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-bold text-gray-900">{branch.name}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          branch.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {branch.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Location: {branch.location}</p>
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

export default BranchesPage;
