import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Branches",
      path: "/branches",
    },
    {
      name: "Departments",
      path: "/departments",
    },
    {
      name: "Queue",
      path: "/queue",
    },
  ];

  return (
    <aside className="hidden min-h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white md:block">
      <div className="p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Main Menu
        </p>

        <nav className="space-y-1">
          {navigationItems.map((item) => (
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