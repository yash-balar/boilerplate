import { lazy } from "react";

export const Login = lazy(() => import("../pages/Auth/Login"));
export const Register = lazy(() => import("../pages/Auth/Register"));
export const Dashboard = lazy(() => import("../pages/Dashboard"));
export const Managers = lazy(() => import("../pages/manager/Managers"));
export const ManagerDetails = lazy(() => import("../pages/manager/ManagerDetails"));
export const ManagerForm = lazy(() => import("../pages/manager/ManagerForm"));
export const Profile = lazy(() => import("../pages/Profile"));
