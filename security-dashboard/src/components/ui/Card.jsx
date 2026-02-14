import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }) {
    return (
        <div className={cn("p-6 border-b border-slate-800/50", className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }) {
    return (
        <h3 className={cn("text-lg font-semibold text-slate-100", className)} {...props}>
            {children}
        </h3>
    );
}

export function CardContent({ className, children, ...props }) {
    return (
        <div className={cn("p-6", className)} {...props}>
            {children}
        </div>
    );
}
