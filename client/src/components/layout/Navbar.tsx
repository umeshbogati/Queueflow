import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <Link
          to="/dashboard"
          className="text-xl font-bold text-blue-600"
        >
          Queueflow
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-600 sm:block">
            Welcome to Queueflow
          </span>

          <button
            type="button"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;