import { Inbox } from "lucide-react";
import { cn } from "./Card";

export function EmptyState({
    icon: Icon = Inbox,
    label = "Nothing here yet.",
    hint,
    action,
    compact = false,
    className,
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center text-gray-400",
                compact ? "py-4" : "py-12",
                className
            )}
        >
            <Icon size={compact ? 24 : 32} className="mb-2 opacity-40" />
            <p className={cn("font-medium text-gray-500", compact ? "text-sm" : "text-base")}>
                {label}
            </p>
            {hint && <p className="text-xs text-gray-400 mt-1 max-w-xs">{hint}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
