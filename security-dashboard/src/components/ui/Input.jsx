import { forwardRef } from "react";
import { cn } from "./Card";

export const Input = forwardRef(function Input(
    { icon: Icon, className, containerClassName, ...props },
    ref
) {
    return (
        <div className={cn("relative", containerClassName)}>
            {Icon && (
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            )}
            <input
                ref={ref}
                className={cn(
                    "w-full py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all",
                    Icon ? "pl-9 pr-4" : "px-4",
                    className
                )}
                {...props}
            />
        </div>
    );
});

export function Select({ className, children, ...props }) {
    return (
        <select
            className={cn(
                "py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all",
                className
            )}
            {...props}
        >
            {children}
        </select>
    );
}

export function FormField({ label, hint, error, children, className }) {
    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">{label}</label>
            )}
            {children}
            {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
