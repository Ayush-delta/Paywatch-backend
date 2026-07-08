import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout.jsx";
import { Loader2 } from "lucide-react";

// Route-level code splitting: each page ships as its own chunk instead of
// one monolithic bundle, so the initial load only pulls in Overview.
const Overview = lazy(() => import("./pages/Overview.jsx"));
const Users = lazy(() => import("./pages/Users.jsx"));
const Subscriptions = lazy(() => import("./pages/Subscriptions.jsx"));
const Workflows = lazy(() => import("./pages/Workflows.jsx"));
const Security = lazy(() => import("./pages/Security.jsx"));

function PageLoader() {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
        </div>
    );
}

export default function App() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Overview />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/workflows" element={<Workflows />} />
                    <Route path="/security" element={<Security />} />
                </Route>
            </Routes>
        </Suspense>
    );
}
