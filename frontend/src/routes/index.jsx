import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "../components/layout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { privateRoutes, publicRoutes } from "./routeList";

const RouteLoading = () => <div className="route-loading">Loading...</div>;

export const AppRoutes = () => (
  <Routes>
    <Route element={<PublicRoute />}>
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<Suspense fallback={<RouteLoading />}>{route.component}</Suspense>}
        />
      ))}
    </Route>
    <Route element={<Layout />}>
			<Route element={<ProtectedRoute/>}>
      {privateRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute requiredPermission={route.permission}>
              <Suspense fallback={<RouteLoading />}>
               {route.component}
              </Suspense>
            </ProtectedRoute>
          }
        />
      ))}

			</Route>
    </Route>
    <Route path="*" element={<>Not Found</>} />
  </Routes>
);
