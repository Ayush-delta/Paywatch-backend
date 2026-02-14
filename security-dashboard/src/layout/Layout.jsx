import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-slate-950" />
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <Sidebar />

            <main className="flex-1 overflow-auto relative z-10">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
