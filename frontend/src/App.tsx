import { Navigate, Route, Routes } from "react-router";
import { Toaster } from "./components/ui/sonner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";
import Expos from "./pages/Expos";
import CreateExpo from "./pages/CreateExpo";
import ExpoDetails from "./pages/ExpoDetails";
import Tickets from "@/pages/Tickets";
import TicketTypes from "./pages/TicketTypes";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/expos" element={<Expos />} />
          <Route path="/dashboard/expos/create" element={<CreateExpo />} />
          <Route
            path="/dashboard/expos/:expoId/edit"
            element={<CreateExpo />}
          />
          <Route path="/dashboard/expos/:expoId" element={<ExpoDetails />} />
          <Route path="/dashboard/tickets" element={<Tickets />} />
          <Route
            element={<ProtectedRoute allowedRoles={["organizer", "admin"]} />}
          >
            <Route path="/dashboard/ticket-types" element={<TicketTypes />} />
          </Route>
          <Route path="/dashboard/notifications" element={<Notifications />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
