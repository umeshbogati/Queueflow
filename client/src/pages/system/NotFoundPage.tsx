import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="text-center">
        <p className="text-7xl font-bold text-blue-600">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Page Not Found
        </h1>

        <p className="mt-2 text-gray-500">
          The page you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;