import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Satellites from "./pages/Satellites.jsx";
import Users from "./pages/Users.jsx";
import Settings from "./pages/Settings.jsx";
import Heading from "./components/Heading.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout></AppLayout>}>
            <Route index element = {<Navigate replace to="dashboard"></Navigate>}></Route>
            <Route path="dashboard" element={<Dashboard></Dashboard>}></Route>
            <Route path="Satellites" element={<Satellites></Satellites>}></Route>
            <Route path="Users" element={<Users></Users>}></Route>
            <Route path="Settings" element={<Settings></Settings>}></Route>
          </Route>

          <Route path="login" element={<Heading>Login</Heading>}></Route>
          <Route path="*" element={<Heading>You Go to Wrong Path</Heading>}></Route>
        </Routes>
      
      </BrowserRouter>
    </>
  );
}

export default App;
