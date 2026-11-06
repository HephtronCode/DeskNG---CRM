import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateTicket from "./pages/CreateTicket";
import TicketDetail from "./pages/TicketDetail";
import AdminCategories from "./pages/AdminCategories";
import { Spinner } from "./components/ui";

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Restoring session" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RequireAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Restoring session" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const GuestOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Restoring session" />
      </div>
    );
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route
      path="/login"
      element={
        <GuestOnly>
          <Login />
        </GuestOnly>
      }
    />
    <Route
      path="/register"
      element={
        <GuestOnly>
          <Register />
        </GuestOnly>
      }
    />
    <Route
      path="/dashboard"
      element={
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      }
    />
    <Route
      path="/tickets/new"
      element={
        <RequireAuth>
          <CreateTicket />
        </RequireAuth>
      }
    />
    <Route
      path="/tickets/:id"
      element={
        <RequireAuth>
          <TicketDetail />
        </RequireAuth>
      }
    />
    <Route
      path="/admin/categories"
      element={
        <RequireAdmin>
          <AdminCategories />
        </RequireAdmin>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
