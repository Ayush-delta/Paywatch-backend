import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout.jsx";
import Overview from "./pages/Overview.jsx";
import Users from "./pages/Users.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Workflows from "./pages/Workflows.jsx";
import Security from "./pages/Security.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/users" element={<Users />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/security" element={<Security />} />
      </Route>
    </Routes>
  );
}
