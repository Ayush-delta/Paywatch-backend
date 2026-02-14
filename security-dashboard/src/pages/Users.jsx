import { useEffect, useState } from "react";
import { fetchUsers } from "../api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Search, MoreVertical, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        async function load() {
            try {
                const res = await fetchUsers();
                setUsers(res.data?.data || res.data || []);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filtered.length / pageSize);

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Users</h1>
                    <p className="text-slate-400">Manage access and account details.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none w-64 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <Loader2 className="animate-spin mx-auto h-8 w-8 text-indigo-500" />
                                        </td>
                                    </tr>
                                ) : paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((user) => (
                                        <tr key={user._id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg shadow-indigo-500/20">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-200">{user.name}</div>
                                                        <div className="text-xs text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="default">Customer</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="success">Active</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-400 hover:text-slate-200 transition-colors">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Showing {Math.min(filtered.length, (page - 1) * pageSize + 1)} to {Math.min(filtered.length, page * pageSize)} of {filtered.length} results
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => p - 1)}
                                disabled={page === 1}
                                className="p-1 rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= totalPages}
                                className="p-1 rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
