import AppRoutes from "./routes/AppRoutes";
import { useSocketConnection } from "./socket/useSocket";

const App = () => {
  useSocketConnection();

  return <AppRoutes />;
};

export default App;