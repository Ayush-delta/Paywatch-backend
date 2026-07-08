import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./Card";

export function Pagination({ page, totalPages, totalCount, pageSize, onPageChange, className }) {
    const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(totalCount, page * pageSize);

    return (
        <div
            className={cn(
                "px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3",
                className
            )}
        >
            <span className="text-xs text-gray-400 order-2 sm:order-1">
                Showing {from} to {to} of {totalCount} results
            </span>
            <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    aria-label="Previous page"
                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-medium text-gray-600 min-w-[70px] text-center">
                    Page {totalPages === 0 ? 0 : page} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                    className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
