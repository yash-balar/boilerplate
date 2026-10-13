import {
  Dashboard,
  Login,
  ManagerDetails,
  ManagerForm,
  Managers,
  Profile,
  Register,
} from "./routeComponents";
import { PERMISSIONS } from "../utils/permissions";

export const publicRoutes = [
  { path: "/login", component: <Login /> },
  { path: "/register", component: <Register /> },
];

export const privateRoutes = [
  { path: "/", component: <Dashboard />, label: "Dashboard", inSidebar: true, permission: PERMISSIONS.DASHBOARD_READ },
  { path: "/manager", component: <Managers />, label: "Managers", inSidebar: true, permission: PERMISSIONS.MANAGERS_READ },
  { path: "/manager/new", component: <ManagerForm />, permission: PERMISSIONS.MANAGERS_CREATE },
  { path: "/manager/:managerId/edit", component: <ManagerForm />, permission: PERMISSIONS.MANAGERS_UPDATE },
  { path: "/manager/:managerId", component: <ManagerDetails />, permission: PERMISSIONS.MANAGERS_READ },
  { path: "/profile", component: <Profile />, label: "Profile", inSidebar: true, permission: PERMISSIONS.PROFILE_READ },
];
