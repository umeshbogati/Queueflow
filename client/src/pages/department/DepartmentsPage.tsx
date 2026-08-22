import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchBranches } from "../../store/slices/branchSlice";
import {
  fetchDepartments,
  addDepartment,
  editDepartment,
  removeDepartment,
  clearDepartmentError,
} from "../../store/slices/departmentSlice";
import { useAdminSocket } from "../../socket/useSocket";

const DepartmentPage = () => {
  const dispatch = useAppDispatch();
  useAdminSocket();

  const { departments, loading: deptLoading, saving, error: deptError } = useAppSelector(
    (state) => state.department
  );
  const { branches, loading: branchLoading } = useAppSelector(
    (state) => state.branch
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [branchId, setBranchId] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBranchId, setEditBranchId] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  const loading = deptLoading || branchLoading;
  const error = deptError;

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchBranches());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearDepartmentError());
    };
  }, [dispatch]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !branchId) return;

    const result = await dispatch(
      addDepartment({
        name: name.trim(),
        branch: branchId,
        ...(description.trim() ? { description: description.trim() } : {}),
      })
    );

    if (addDepartment.fulfilled.match(result)) {
      setName("");
      setDescription("");
      setBranchId("");
      setSuccess("Department created successfully.");
    }
  };

  const startEdit = (dept: typeof departments[0]) => {
    setEditingId(dept._id);
    setEditName(dept.name);
    setEditDescription(dept.description || "");
    setEditBranchId(dept.branch?._id || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditBranchId("");
  };

  const handleEdit = async (id: string) => {
    const result = await dispatch(editDepartment({
      id,
      data: {
        name: editName.trim(),
        branch: editBranchId,
        ...(editDescription.trim() ? { description: editDescription.trim() } : {}),
      },
    }));
    if (editDepartment.fulfilled.match(result)) {
      cancelEdit();
      setSuccess("Department updated successfully.");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await dispatch(removeDepartment(id));
    if (removeDepartment.fulfilled.match(result)) {
      setDeleteConfirmId(null);
      setSuccess("Department deleted successfully.");
    }
  };

  const handleToggleActive = async (department: typeof departments[0]) => {
    const result = await dispatch(
      editDepartment({
        id: department._id,
        data: { isActive: department.isActive === false },
      })
    );
    if (editDepartment.fulfilled.match(result)) {
      setSuccess(
        `"${result.payload.name}" is now ${result.payload.isActive === false ? "inactive" : "active"}.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-3xl font-bold text-gray-900">
          Department Management
        </h1>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-700">{success}</div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          <form
            onSubmit={handleSubmit}
            className="rounded-xl bg-white p-6 shadow"
          >
            <h2 className="text-xl font-bold">
              Add Department
            </h2>

            <div className="mt-5 space-y-4">

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Department Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Cardiology"
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Department description"
                  rows={4}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Branch
                </label>

                <select
                  value={branchId}
                  onChange={(event) => setBranchId(event.target.value)}
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>

                {branches.length === 0 && !loading && (
                  <p className="mt-2 text-sm text-red-500">
                    No branches available. Create a branch first.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving || branches.length === 0}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Add Department"}
              </button>

            </div>
          </form>

          <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">

            <h2 className="text-xl font-bold">
              Departments
            </h2>

            {loading ? (
              <p className="mt-5 text-gray-500">Loading departments...</p>
            ) : departments.length === 0 ? (
              <p className="mt-5 text-gray-500">No departments found.</p>
            ) : (
              <div className="mt-5 space-y-3">

                {departments.map((department) => (
                  <div key={department._id} className="rounded-lg border p-4">
                    {editingId === department._id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                          placeholder="Department name"
                        />
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                          placeholder="Description"
                        />
                        <select
                          value={editBranchId}
                          onChange={(e) => setEditBranchId(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="">Select Branch</option>
                          {branches.map((b) => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(department._id)}
                            disabled={saving || !editName.trim() || !editBranchId}
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
                    ) : deleteConfirmId === department._id ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-700">Delete "{department.name}"? This cannot be undone.</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleDelete(department._id)}
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
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold">{department.name}</h3>
                            {department.prefix && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                                {department.prefix}
                              </span>
                            )}
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                department.isActive === false
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {department.isActive === false ? "Inactive" : "Active"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleActive(department)}
                              disabled={saving}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                                department.isActive === false
                                  ? "border border-green-300 text-green-700 hover:bg-green-50"
                                  : "border border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                              }`}
                            >
                              {department.isActive === false ? "Activate" : "Deactivate"}
                            </button>
                            <button
                              onClick={() => startEdit(department)}
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(department._id)}
                              className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {department.description || "No description"}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Branch: {department.branch?.name || "N/A"}
                        </p>
                      </>
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

export default DepartmentPage;
