import { Loader2 } from "lucide-react";
import { cn } from "./Card";
import { EmptyState } from "./EmptyState";

/**
 * Table
 * A thin, consistent wrapper around <table> that standardizes horizontal
 * scrolling on small screens, loading state, and empty state across pages.
 *
 * Usage:
 *   <Table
 *     columns={[{ key: "name", label: "User" }, { key: "status", label: "Status" }]}
 *     loading={loading}
 *     empty={rows.length === 0}
 *     emptyLabel="No users found."
 *   >
 *     {rows.map(row => <tr key={row.id}>...</tr>)}
 *   </Table>
 */
export function Table({
    columns,
    loading,
    empty,
    emptyIcon,
    emptyLabel = "Nothing to show yet.",
    emptyHint,
    className,
    children,
}) {
    const colCount = columns?.length || 1;

    return (
        <div className={cn("overflow-x-auto", className)}>
            <table className="w-full text-sm text-left min-w-[560px]">
                {columns && (
                    <thead className="bg-white text-gray-500 font-medium border-b border-gray-200 whitespace-nowrap">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        "px-6 py-4",
                                        col.align === "right" && "text-right"
                                    )}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody className="divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan={colCount} className="px-6 py-16 text-center">
                                <Loader2 className="animate-spin mx-auto h-6 w-6 text-indigo-500" />
                            </td>
                        </tr>
                    ) : empty ? (
                        <tr>
                            <td colSpan={colCount} className="px-6 py-12">
                                <EmptyState icon={emptyIcon} label={emptyLabel} hint={emptyHint} compact />
                            </td>
                        </tr>
                    ) : (
                        children
                    )}
                </tbody>
            </table>
        </div>
    );
}

export function Td({ className, children, ...props }) {
    return (
        <td className={cn("px-6 py-4", className)} {...props}>
            {children}
        </td>
    );
}
