import AppRoutes from "./routes/AppRoutes";
import { useSocketConnection } from "./socket/useSocket";
import useAuthSync from "./hooks/useAuthSync";

// App: Main application component that sets up socket connection and auth sync
const App = () => {
  useSocketConnection();
  useAuthSync();

  return <AppRoutes />;
};

export default App;