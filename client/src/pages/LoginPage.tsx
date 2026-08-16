import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900">
        Login
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Login page will be completed in Part 7.
      </p>

      <div className="mt-6 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button
          type="button"
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          Login
        </button>
      </div>

      <div className="mt-5 text-center">
        <Link
          to="/"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;