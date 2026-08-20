import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchBranches, addBranch, editBranch, removeBranch, clearBranchError } from "../../store/slices/branchSlice";
import type { Branch } from "../../api/branchApi";

const BranchesPage = () => {
  const dispatch = useAppDispatch();
  const { branches, loading, saving, error } = useAppSelector(
    (state) => state.branch
  );

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearBranchError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");

    const branchName = name.trim();
    const branchLocation = location.trim();

    if (!branchName || !branchLocation) return;

    const result = await dispatch(addBranch({ name: branchName, location: branchLocation }));

    if (addBranch.fulfilled.match(result)) {
      setName("");
      setLocation("");
      setSuccess("Branch created successfully.");
    }
  };

  const startEdit = (branch: Branch) => {
    setEditingId(branch._id);
    setEditName(branch.name);
    setEditLocation(branch.location || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditLocation("");
  };

  const handleEdit = async (id: string) => {
    const result = await dispatch(editBranch({ id, data: { name: editName.trim(), location: editLocation.trim() } }));
    if (editBranch.fulfilled.match(result)) {
      cancelEdit();
      setSuccess("Branch updated successfully.");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await dispatch(removeBranch(id));
    if (removeBranch.fulfilled.match(result)) {
      setDeleteConfirmId(null);
      setSuccess("Branch deleted successfully.");
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
            onClick={() => dispatch(fetchBranches())}
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
                    {editingId === branch._id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                          placeholder="Branch name"
                        />
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                          placeholder="Location"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(branch._id)}
                            disabled={saving || !editName.trim() || !editLocation.trim()}
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
                    ) : deleteConfirmId === branch._id ? (
                      <div>
                        <p className="text-sm text-red-600">Delete "{branch.name}"? This cannot be undone.</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleDelete(branch._id)}
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
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{branch.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">Location: {branch.location}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              branch.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {branch.isActive ? "Active" : "Inactive"}
                          </span>
                          <button
                            onClick={() => startEdit(branch)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(branch._id)}
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

export default BranchesPage;
