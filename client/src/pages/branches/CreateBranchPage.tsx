import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addBranch } from "../../store/slices/branchSlice";

const CreateBranchPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { saving, error } = useAppSelector((state) => state.branch);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedLocation = location.trim();

    if (!trimmedName) {
      return;
    }

    const result = await dispatch(
      addBranch({ name: trimmedName, location: trimmedLocation })
    );

    if (addBranch.fulfilled.match(result)) {
      navigate("/branches");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl">

        <div className="rounded-xl bg-white p-6 shadow">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Create Branch
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Add a new branch to Queueflow.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label
                htmlFor="branch-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Branch Name
              </label>

              <input
                id="branch-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Kathmandu Branch"
                required
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="branch-location"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Location
              </label>

              <input
                id="branch-location"
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="Kathmandu"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() => navigate("/branches")}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Creating..."
                  : "Create Branch"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBranchPage;
