import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "./Card";

const ToastContext = createContext(null);

const ICONS = {
    success: CheckCircle,
    error: AlertTriangle,
    info: Info,
};

const STYLES = {
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    error: "bg-red-500/10 border-red-500/20 text-red-500",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-500",
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(
        ({ type = "info", title, description, duration = 4000 }) => {
            const id = ++idRef.current;
            setToasts((prev) => [...prev, { id, type, title, description }]);
            if (duration) {
                setTimeout(() => dismiss(id), duration);
            }
            return id;
        },
        [dismiss]
    );

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-96">
                <AnimatePresence>
                    {toasts.map((t) => {
                        const Icon = ICONS[t.type] || Info;
                        return (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 40, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    "flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm bg-white",
                                    STYLES[t.type]
                                )}
                            >
                                <Icon size={18} className="shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    {t.title && (
                                        <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                                    )}
                                    {t.description && (
                                        <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => dismiss(t.id)}
                                    className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                                    aria-label="Dismiss notification"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within a ToastProvider");
    return ctx;
}
