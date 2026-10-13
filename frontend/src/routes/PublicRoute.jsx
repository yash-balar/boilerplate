import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../api/auth/token";

const PublicRoute = () => {
  if (getAccessToken()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;