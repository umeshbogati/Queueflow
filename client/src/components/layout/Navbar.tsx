import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/authSlice";
import NotificationBell from "../notifications/NotificationBell";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // Read from Redux so the header always matches the token in use,
  // even when another tab overwrites localStorage
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role ?? null;
  const isAdmin = role?.toLowerCase() === "admin";

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate("/login");
    });
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

          {/* Bell + dropdown + live toast for queue updates */}
          <NotificationBell />

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
