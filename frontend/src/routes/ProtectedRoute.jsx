import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../api/auth/token";
import { hasPermission } from "../utils/permissions";

const ProtectedRoute = ({ children, requiredPermission }) => {
  if (!getAccessToken()) {
    return <Navigate to="/login" replace />;
  }
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;