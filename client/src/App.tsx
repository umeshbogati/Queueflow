import AppRoutes from "./routes/AppRoutes";
import { useSocketConnection } from "./socket/useSocket";
import useAuthSync from "./hooks/useAuthSync";

const App = () => {
  useSocketConnection();
  useAuthSync();

  return <AppRoutes />;
};

export default App;