import { AnimatePresence, motion } from "framer-motion";
import {
    BarChart3,
    Users,
    CreditCard,
    Activity,
    ShieldAlert,
    Settings,
    LogOut,
    Menu
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import paywatchLogo from "../assets/logo2.svg";

const SIDEBAR_ITEMS = [
    { name: "Overview", icon: BarChart3, color: "#6366f1", href: "/" },
    { name: "Users", icon: Users, color: "#8b5cf6", href: "/users" },
    { name: "Subscriptions", icon: CreditCard, color: "#10b981", href: "/subscriptions" },
    { name: "Workflows", icon: Activity, color: "#ec4899", href: "/workflows" },
    { name: "Security", icon: ShieldAlert, color: "#f43f5e", href: "/security" },
];

export default function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <motion.div
            className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? "w-64" : "w-20"
                }`}
            animate={{ width: isSidebarOpen ? 256 : 80 }}
        >
            <div className="h-full bg-slate-900 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-slate-800">
                {/* Branding */}
                <div className="flex items-center gap-3 mb-4 px-2">
                    <img
                        src={paywatchLogo}
                        alt="Paywatch"
                        className="w-9 h-9 rounded-xl shrink-0 shadow-lg shadow-indigo-500/20 object-cover"
                    />
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.span
                                className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent whitespace-nowrap"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                            >
                                Paywatch
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-full hover:bg-slate-800 transition-colors max-w-fit"
                >
                    <Menu size={24} />
                </motion.button>

                <nav className="mt-8 flex-grow">
                    {SIDEBAR_ITEMS.map((item) => (
                        <NavItem
                            key={item.href}
                            item={item}
                            isOpen={isSidebarOpen}
                        />
                    ))}
                </nav>
            </div>
        </motion.div>
    );
}

function NavItem({ item, isOpen }) {
    const location = useLocation();
    const isActive = location.pathname === item.href;

    return (
        <NavLink to={item.href}>
            <motion.div
                className={`flex items-center p-4 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors mb-2 ${isActive ? "bg-slate-800 text-slate-100" : "text-slate-400"
                    }`}
            >
                <item.icon
                    size={20}
                    style={{ color: item.color, minWidth: "20px" }}
                />

                <AnimatePresence>
                    {isOpen && (
                        <motion.span
                            className="ml-4 whitespace-nowrap"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2, delay: 0.3 }}
                        >
                            {item.name}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>
        </NavLink>
    );
}
