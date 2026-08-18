import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="text-center">

        <h1 className="text-7xl font-bold text-red-600">
          Error
        </h1>

        <p className="mt-4 text-xl text-gray-600">
          Something went wrong.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Go Home
        </Link>

      </div>
    </div>
  );
};

export default ErrorPage;