import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
// Listens for live "notification:new" socket pushes for the logged-in user.
// Mounted here so it covers EVERY page rendered inside MainLayout.
import { useNotificationSocket } from "../../socket/useSocket";

const MainLayout = () => {
  useNotificationSocket();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;