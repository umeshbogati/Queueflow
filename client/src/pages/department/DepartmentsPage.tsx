import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchBranches } from "../../store/slices/branchSlice";
import {
  fetchDepartments,
  addDepartment,
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

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (!branchId) {
      return;
    }

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
                  onChange={(event) =>
                    setName(event.target.value)
                  }
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
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
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
                  onChange={(event) =>
                    setBranchId(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select Branch
                  </option>

                  {branches.map((branch) => (
                    <option
                      key={branch._id}
                      value={branch._id}
                    >
                      {branch.name}
                    </option>
                  ))}
                </select>

                {branches.length === 0 && !loading && (
                  <p className="mt-2 text-sm text-red-500">
                    No branches available. Create a
                    branch first.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving || branches.length === 0}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Add Department"}
              </button>

            </div>
          </form>

          <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">

            <h2 className="text-xl font-bold">
              Departments
            </h2>

            {loading ? (
              <p className="mt-5 text-gray-500">
                Loading departments...
              </p>
            ) : departments.length === 0 ? (
              <p className="mt-5 text-gray-500">
                No departments found.
              </p>
            ) : (
              <div className="mt-5 space-y-3">

                {departments.map((department) => (
                  <div
                    key={department._id}
                    className="rounded-lg border p-4"
                  >
                    <h3 className="text-lg font-bold">
                      {department.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {department.description ||
                        "No description"}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Branch:{" "}
                      {department.branch?.name || "N/A"}
                    </p>
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
