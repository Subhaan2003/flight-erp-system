import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DBProvider } from "./contexts/DBContext";

// Layout Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Airlines from "./pages/Airlines";
import Airports from "./pages/Airports";
import Aircrafts from "./pages/Aircrafts";
import Flights from "./pages/Flights";
import Bookings from "./pages/Bookings";
import Passengers from "./pages/Passengers";
import Employees from "./pages/Employees";
import Pilots from "./pages/Pilots";
import Operations from "./pages/Operations";
import CheckInBoarding from "./pages/CheckInBoarding";
import CustomerSupport from "./pages/CustomerSupport";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// Role-based access map
const ROLE_ACCESS = {
  "/airlines": ["Super Admin", "Airline Admin"],
  "/airports": ["Super Admin", "Airline Admin", "Flight Manager"],
  "/aircrafts": ["Super Admin", "Airline Admin", "Flight Manager"],
  "/flights": ["Super Admin", "Airline Admin", "Flight Manager", "Pilot", "Cabin Crew"],
  "/bookings": ["Super Admin", "Reservation Manager", "Passenger"],
  "/passengers": ["Super Admin", "Reservation Manager", "Customer Support"],
  "/employees": ["Super Admin", "HR Manager", "Finance Manager"],
  "/operations": ["Super Admin", "Flight Manager", "Pilot", "Cabin Crew"],
  "/check-in": ["Super Admin", "Reservation Manager", "Passenger"],
  "/support": ["Super Admin", "Customer Support", "Passenger"],
  "/reports": ["Super Admin", "Finance Manager", "Airline Admin"],
  "/settings": ["Super Admin"],
};

function RequireAuth({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-app)" }}>
      <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>✈️</div>
        <div style={{ fontSize: "1rem", fontWeight: 600 }}>Loading AeroERP...</div>
      </div>
    </div>
  );
  return currentUser ? children : <Navigate to="/login" replace />;
}

function RequireRole({ path, children }) {
  const { currentUser } = useAuth();
  const allowed = ROLE_ACCESS[path];
  if (!allowed) return children;
  if (!allowed.includes(currentUser?.role)) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔒</div>
        <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "8px" }}>Access Restricted</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Your current role (<strong>{currentUser?.role}</strong>) does not have permission to view this module.
        </p>
      </div>
    );
  }
  return children;
}

function AppShell({ children, path }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? "active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <Sidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setIsSidebarOpen((value) => !value)} />
        <div className="content-body">
          <RequireRole path={path}>{children}</RequireRole>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />} />

      <Route path="/dashboard" element={<RequireAuth><AppShell path="/dashboard"><Dashboard /></AppShell></RequireAuth>} />
      <Route path="/airlines" element={<RequireAuth><AppShell path="/airlines"><Airlines /></AppShell></RequireAuth>} />
      <Route path="/airports" element={<RequireAuth><AppShell path="/airports"><Airports /></AppShell></RequireAuth>} />
      <Route path="/aircrafts" element={<RequireAuth><AppShell path="/aircrafts"><Aircrafts /></AppShell></RequireAuth>} />
      <Route path="/flights" element={<RequireAuth><AppShell path="/flights"><Flights /></AppShell></RequireAuth>} />
      <Route path="/bookings" element={<RequireAuth><AppShell path="/bookings"><Bookings /></AppShell></RequireAuth>} />
      <Route path="/passengers" element={<RequireAuth><AppShell path="/passengers"><Passengers /></AppShell></RequireAuth>} />
      <Route path="/employees" element={<RequireAuth><AppShell path="/employees"><Employees /></AppShell></RequireAuth>} />
      <Route path="/pilots" element={<RequireAuth><AppShell path="/pilots"><Pilots /></AppShell></RequireAuth>} />
      <Route path="/operations" element={<RequireAuth><AppShell path="/operations"><Operations /></AppShell></RequireAuth>} />
      <Route path="/check-in" element={<RequireAuth><AppShell path="/check-in"><CheckInBoarding /></AppShell></RequireAuth>} />
      <Route path="/support" element={<RequireAuth><AppShell path="/support"><CustomerSupport /></AppShell></RequireAuth>} />
      <Route path="/reports" element={<RequireAuth><AppShell path="/reports"><Reports /></AppShell></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><AppShell path="/settings"><Settings /></AppShell></RequireAuth>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DBProvider>
        <AuthProvider>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
          />
        </AuthProvider>
      </DBProvider>
    </BrowserRouter>
  );
}