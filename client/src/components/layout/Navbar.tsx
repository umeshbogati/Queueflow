import { Link, useNavigate } from "react-router-dom";
import { getUser, getUserRole, logout } from "../../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();
  const role = getUserRole();
  const isAdmin = role?.toLowerCase() === "admin" || role?.toLowerCase() === "super_admin";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <Link
          to={isAdmin ? "/admin" : "/dashboard"}
          className="text-xl font-bold text-blue-600"
        >
          Queueflow
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-600 sm:block">
            {user?.name ?? "User"}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isAdmin
                ? "bg-purple-100 text-purple-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isAdmin ? "Admin" : "User"}
          </span>

          <button
            type="button"
            onClick={handleLogout}
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
