import { cn } from "./Card";

export function Skeleton({ className }) {
    return <div className={cn("animate-pulse rounded bg-gray-200/60", className)} />;
}

export function SkeletonCard({ className }) {
    return (
        <div
            className={cn(
                "bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex items-start justify-between",
                className
            )}
        >
            <div className="space-y-3 w-full">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        </div>
    );
}

export function SkeletonGrid({ count = 4, className }) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
            {[...Array(count)].map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
