import { Routes, Route } from "react-router-dom";

// Public pages
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

// Dashboard
import UserDashboardPage from "../pages/dashboard/UserDashboardPage";

// Management
import BranchPage from "../pages/branches/BranchesPage";
import DepartmentPage from "../pages/department/DepartmentsPage";

// Queue
import QueuePage from "../pages/queue/QueuePage";
import QueuePositionPage from "../pages/queue/QueuePositionPage";

// Admin
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import StatisticsPage from "../pages/statistics/StatisticsPage";

// Counter
import CounterStaffPage from "../pages/counter/CounterStaffPage";
import CallNextPage from "../pages/call-next/CallNextPage";



// System
import LoadingPage from "../pages/system/LoadingPage";
import ErrorPage from "../pages/system/ErrorPage";
import EmptyPage from "../pages/system/EmptyPage";
import NotFoundPage from "../pages/system/NotFoundPage";

// Components
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";

const AppRoutes = () => {
  return (
    
      <Routes>

        

        <Route
          path="/"
          element={<HomePage />}  // Public Routes
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

      

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={<UserDashboardPage />}  // Protected Routes
            />

            <Route
              path="/branches"
              element={<BranchPage />}
            />

            <Route
              path="/departments"
              element={<DepartmentPage />}
            />

            <Route
              path="/queue"
              element={<QueuePage />}
            />

            <Route
              path="/queue-position"
              element={<QueuePositionPage />}
            />

            <Route
              path="/counter"
              element={<CounterStaffPage />}
            />

            <Route
              path="/call-next"
              element={<CallNextPage />}
            />
          </Route>
        </Route>


        <Route
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            />
          }
        >
          <Route element={<MainLayout />}>
            <Route
              path="/admin"
              element={<AdminDashboardPage />} //Admin Routes
            />

            <Route
              path="/statistics"
              element={<StatisticsPage />}
            />
          </Route>
        </Route>

       

        <Route
          path="/loading"
          element={<LoadingPage />}  // System Routes
        />

        <Route
          path="/error"
          element={<ErrorPage />}
        />

        <Route
          path="/empty"
          element={<EmptyPage />}
        />

      
        <Route
          path="*"
          element={<NotFoundPage />} // Not Found Route return 404
        />

      </Routes>

  );
};

export default AppRoutes;