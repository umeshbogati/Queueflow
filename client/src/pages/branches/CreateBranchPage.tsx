import  {  useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  createBranch,
} from "../../api/branchApi";

const CreateBranchPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await createBranch({
        name,
        location,
      });

      navigate("/branches");
    } catch (error: any) {
      console.error(
        "Failed to create branch:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create branch."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">
          Create Branch
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-1 block font-medium">
              Branch Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              className="w-full rounded-lg border px-4 py-2"
              placeholder="Kathmandu Branch"
              required
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Location
            </label>

            <input
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              className="w-full rounded-lg border px-4 py-2"
              placeholder="Kathmandu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Branch"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBranchPage;