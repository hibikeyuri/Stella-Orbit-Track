import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout.jsx";
import Heading from "./components/Heading.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginForm from "./features/authentication/LoginForm.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Satellites from "./pages/Satellites.jsx";
import Settings from "./pages/Settings.jsx";
import Tle from "./pages/Tle.jsx";
import Tles from "./pages/Tles.jsx";
import Users from "./pages/Users.jsx";

import { Toaster } from "@/components/Toaster.jsx";

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
              <Route path="Users" element={<Users></Users>} />
              <Route path="Settings" element={<Settings></Settings>} />
            </Route>

            <Route path="login" element={<LoginForm></LoginForm>} />
            <Route path="*" element={<Heading>You Go to Wrong Path</Heading>} />
          </Routes>
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
