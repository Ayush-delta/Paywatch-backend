import { AnimatePresence, motion } from "framer-motion";
import {
    BarChart3,
    Users,
    CreditCard,
    Activity,
    ShieldAlert,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import paywatchLogo from "../assets/new-logo.svg";

const SIDEBAR_ITEMS = [
    { name: "Overview", icon: BarChart3, color: "#6366f1", href: "/" },
    { name: "Users", icon: Users, color: "#8b5cf6", href: "/users" },
    { name: "Subscriptions", icon: CreditCard, color: "#10b981", href: "/subscriptions" },
    { name: "Workflows", icon: Activity, color: "#ec4899", href: "/workflows" },
    { name: "Security", icon: ShieldAlert, color: "#f43f5e", href: "/security" },
];

/**
 * Sidebar renders two distinct behaviors from one source of truth:
 *  - Desktop (md+): an in-flow rail that collapses between icon-only and
 *    labeled widths, exactly like the original component.
 *  - Mobile (<md): a fixed off-canvas drawer, toggled by the hamburger
 *    button in <MobileTopBar>, closing on navigation or backdrop tap.
 */
export default function Sidebar({ mobileOpen, onMobileClose }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <>
            {/* Desktop rail */}
            <motion.div
                className={`hidden md:block relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 h-full py-4 pl-4 pr-0 ${isSidebarOpen ? "w-64" : "w-24"
                    }`}
                animate={{ width: isSidebarOpen ? 256 : 96 }}
            >
                <SidebarContent
                    isOpen={isSidebarOpen}
                    onToggle={() => setIsSidebarOpen((v) => !v)}
                />
            </motion.div>

            {/* Mobile off-canvas drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onMobileClose}
                            className="md:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.25 }}
                            className="md:hidden fixed inset-y-0 left-0 z-50 w-72 py-4 pl-4 pr-4"
                        >
                            <SidebarContent
                                isOpen
                                onToggle={onMobileClose}
                                toggleIcon={X}
                                onNavigate={onMobileClose}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function SidebarContent({ isOpen, onToggle, toggleIcon: ToggleIcon = Menu, onNavigate }) {
    return (
        <div className="h-full bg-black rounded-[2rem] p-4 flex flex-col shadow-2xl">
            {/* Branding */}
            <div className="flex items-center gap-3 mb-4 px-2">
                <img
                    src={paywatchLogo}
                    alt="Paywatch"
                    className="w-9 h-9 rounded-xl shrink-0 p-1 bg-white object-cover"
                />
                <AnimatePresence>
                    {isOpen && (
                        <motion.span
                            className="text-xl font-bold text-white whitespace-nowrap"
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
                onClick={onToggle}
                aria-label={ToggleIcon === X ? "Close menu" : "Toggle sidebar"}
                className="p-2 rounded-full text-white hover:bg-gray-800/80 transition-colors max-w-fit"
            >
                <ToggleIcon size={24} />
            </motion.button>

            <nav className="mt-8 flex-grow overflow-y-auto custom-scrollbar">
                {SIDEBAR_ITEMS.map((item) => (
                    <NavItem key={item.href} item={item} isOpen={isOpen} onNavigate={onNavigate} />
                ))}
            </nav>
        </div>
    );
}

function NavItem({ item, isOpen, onNavigate }) {
    const location = useLocation();
    const isActive = location.pathname === item.href;

    return (
        <NavLink to={item.href} onClick={onNavigate}>
            <motion.div
                className={`flex items-center p-4 text-sm font-semibold rounded-2xl transition-colors mb-2 ${isActive ? "bg-white text-black" : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
            >
                <item.icon
                    size={20}
                    style={{ color: isActive ? "#000" : item.color, minWidth: "20px" }}
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
