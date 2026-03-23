import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout.jsx";
import Heading from "./components/Heading.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Spinner from "./components/Spinner.jsx";

import { Toaster } from "@/components/Toaster.jsx";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const MFA = lazy(() => import("./pages/mfa.jsx"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback.jsx"));
const Satellites = lazy(() => import("./pages/Satellites.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const Tle = lazy(() => import("./pages/Tle.jsx"));
const Tles = lazy(() => import("./pages/Tles.jsx"));
const Users = lazy(() => import("./pages/Users.jsx"));
const Account = lazy(() => import("./pages/Account.jsx"));
const Tracker = lazy(() => import("./pages/Tracker.jsx"));
const SkyPlotPage = lazy(() => import("./pages/SkyPlotPage.jsx"));
const Compare = lazy(() => import("./pages/Compare.jsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false}></ReactQueryDevtools>
      <Toaster>
        <BrowserRouter>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout></AppLayout>
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={<Navigate replace to="dashboard"></Navigate>}
                />
                <Route path="dashboard" element={<Dashboard></Dashboard>} />
                <Route path="Satellites" element={<Satellites></Satellites>} />
                <Route path="TLEs" element={<Tles></Tles>} />
                <Route path="TLEs/:satellite_id" element={<Tle></Tle>} />
                <Route path="tracker" element={<Tracker />} />
                <Route path="sky-plot" element={<SkyPlotPage />} />
                <Route path="compare" element={<Compare />} />
                <Route path="Users" element={<Users></Users>} />
                <Route path="Settings" element={<Settings></Settings>} />
                <Route path="account" element={<Account></Account>}></Route>
              </Route>

              <Route path="login" element={<Login></Login>} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="mfa" element={<MFA></MFA>}></Route>
              <Route
                path="*"
                element={<Heading>You Go to Wrong Path</Heading>}
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </Toaster>
      {/* <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: "p8x" }}
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 3000 },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
            backgroundColor: "var(--color-grey-0)",
            color: "var(--color-grey-700)",
          },
        }}
      ></Toaster> */}
    </QueryClientProvider>
  );
}

export default App;
