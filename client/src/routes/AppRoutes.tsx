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

const AppRoutes = () => {
  return (
    
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================== */}

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* =========================
            PROTECTED ROUTES
        ========================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<UserDashboardPage />}
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
            path="/queues"
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

        {/* =========================
            ADMIN ROUTES
        ========================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["admin", "super_admin"]}
            />
          }
        >
          <Route
            path="/admin"
            element={<AdminDashboardPage />}
          />

          <Route
            path="/statistics"
            element={<StatisticsPage />}
          />
        </Route>

        {/* =========================
            SYSTEM ROUTES
        ========================== */}

        <Route
          path="/loading"
          element={<LoadingPage />}
        />

        <Route
          path="/error"
          element={<ErrorPage />}
        />

        <Route
          path="/empty"
          element={<EmptyPage />}
        />

        {/* =========================
            404
        ========================== */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />

      </Routes>

  );
};

export default AppRoutes;