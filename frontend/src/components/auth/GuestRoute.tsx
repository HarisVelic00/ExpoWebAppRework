import { Outlet, Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";

function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export default GuestRoute;
