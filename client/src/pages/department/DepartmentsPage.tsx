import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import api from "../../api/axios";

interface Branch {
  _id: string;
  name: string;
  location?: string;
}

interface Department {
  _id: string;
  name: string;
  description?: string;
  branch?: {
    _id: string;
    name: string;
  };
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

const DepartmentPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [branchId, setBranchId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [departmentResponse, branchResponse] =
        await Promise.all([
          api.get<
            Department[] | ApiResponse<Department[]>
          >("/departments"),

          api.get<
            Branch[] | ApiResponse<Branch[]>
          >("/branches"),
        ]);

      // -------------------------
      // Departments
      // -------------------------

      const departmentData = departmentResponse.data;

      const departmentList = Array.isArray(departmentData)
        ? departmentData
        : Array.isArray(departmentData.data)
          ? departmentData.data
          : [];

      // -------------------------
      // Branches
      // -------------------------

      const branchData = branchResponse.data;

      const branchList = Array.isArray(branchData)
        ? branchData
        : Array.isArray(branchData.data)
          ? branchData.data
          : [];

      setDepartments(departmentList);
      setBranches(branchList);

      console.log("Department response:", departmentData);
      console.log("Branch response:", branchData);
      console.log("Departments:", departmentList);
      console.log("Branches:", branchList);
    } catch (err: unknown) {
      console.error("Load data error:", err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
          "Failed to load data."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadData();
    };

    void load();
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Department name is required.");
      return;
    }

    if (!branchId) {
      setError("Please select a branch.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post("/departments", {
        name: name.trim(),
        description: description.trim(),
        branch: branchId,
      });

      setName("");
      setDescription("");
      setBranchId("");

      await loadData();
    } catch (err: unknown) {
      console.error(
        "Create department error:",
        err
      );

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Failed to create department."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create department.");
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredBranches = branches;

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

          {/* Create Department */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl bg-white p-6 shadow"
          >
            <h2 className="text-xl font-bold">
              Add Department
            </h2>

            <div className="mt-5 space-y-4">

              {/* Department Name */}
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

              {/* Description */}
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

              {/* Branch */}
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

                  {filteredBranches.map((branch) => (
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

              {/* Submit */}
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

          {/* Department List */}
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