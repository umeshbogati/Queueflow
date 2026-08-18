import { NavLink } from "react-router-dom";
import { getUserRole } from "../../utils/auth";

const Sidebar = () => {
  const role = getUserRole();
  const isAdmin = role?.toLowerCase() === "admin" || role?.toLowerCase() === "super_admin";

  const userItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Join Queue", path: "/queue" },
    { name: "Queue Position", path: "/queue-position" },
    { name: "Departments", path: "/departments" },
  ];

  const adminItems = [
    { name: "Admin Dashboard", path: "/admin" },
    { name: "Branches", path: "/branches" },
    { name: "Departments", path: "/departments" },
    { name: "All Queues", path: "/queue" },
    { name: "Call Next", path: "/call-next" },
    { name: "Counter Staff", path: "/counter" },
    { name: "Statistics", path: "/statistics" },
  ];

  const items = isAdmin ? adminItems : userItems;

  return (
    <aside className="hidden min-h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white md:block">
      <div className="p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {isAdmin ? "Admin Menu" : "Main Menu"}
        </p>

        <nav className="space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
