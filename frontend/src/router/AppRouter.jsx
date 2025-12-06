import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layout
import PageWrapper from "../components/layout/PageWrapper";

import ChooseProfession from "../pages/Auth/ChooseProfession";
// Pages
import Login from "../pages/Auth/Login";
import AuthSuccess from "../pages/Auth/AuthSuccess";
import ClientsList from "../pages/Clients/ClientsList";
import ClientDetails from "../pages/Clients/ClientDetails";
import Dashboard from "../pages/Dashboard";
import LeadsList from "../pages/Leads/LeadsList";
import LeadDetails from "../pages/Leads/LeadDetails";
import Settings from "../pages/Settings";
import ProjectDetails from "../pages/Projects/ProjectDetails";
import ProjectsList from "../pages/Projects/ProjectsList";

// ---------- Protected Route Wrapper ----------
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p className="p-6">Checking authentication...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <PageWrapper>{children}</PageWrapper>;
}


// ---------- Router ----------
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth-success" element={<AuthSuccess />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <ProjectsList />
            </PrivateRoute>
          }
        />
        <Route path="/choose-profession" element={<ChooseProfession />} />
        <Route
          path="/leads"
          element={
            <PrivateRoute>
              <LeadsList />
            </PrivateRoute>
          }
        />

        <Route
          path="/leads/:id"
          element={
            <PrivateRoute>
              <LeadDetails />
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
        path="/clients"
        element={
            <PrivateRoute>
            <ClientsList />
            </PrivateRoute>
        }
        />

        <Route
        path="/clients/:id"
        element={
            <PrivateRoute>
            <ClientDetails />
            </PrivateRoute>
        }
        />
        <Route
          path="/projects/:id"
          element={
            <PrivateRoute>
              <ProjectDetails />
            </PrivateRoute>
          }
        />


        {/* Default → redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 fallback */}
        <Route path="*" element={<p className="p-6">Page not found</p>} />
      </Routes>
    </BrowserRouter>
  );
}
