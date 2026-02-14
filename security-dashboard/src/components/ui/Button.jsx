import { cn } from "./Card";
import { Loader2 } from "lucide-react";

const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20",
};

const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
};

export function Button({
    variant = "primary",
    size = "md",
    className,
    loading,
    children,
    disabled,
    ...props
}) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
}
