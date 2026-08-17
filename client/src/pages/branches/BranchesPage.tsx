import { useEffect, useState } from "react";
import  {
  getBranches,
} from "../../api/branchApi";
import type { Branch } from "../../api/branchApi";

const BranchPage = () => {
  const [branches, setBranches] =
    useState<Branch[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBranches();

        console.log("Branches response:", data);

        setBranches(data);
      } catch (error: any) {
        console.error(
          "Failed to load branches:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load branches."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        Loading branches...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="p-6">
        No branches found.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Branches
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <div
            key={branch._id}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold">
              {branch.name}
            </h2>

            {branch.location && (
              <p className="mt-2 text-gray-600">
                {branch.location}
              </p>
            )}

            <p className="mt-2 text-sm">
              Status:{" "}
              {branch.isActive
                ? "Active"
                : "Inactive"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BranchPage;