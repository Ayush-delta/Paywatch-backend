import { useEffect, useState } from "react";
import { fetchUsers } from "../api";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Table, Td } from "../components/ui/Table";
import { Pagination } from "../components/ui/Pagination";
import { Search, MoreVertical, Users as UsersIcon } from "lucide-react";

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

    // Reset to page 1 whenever the search term changes so results stay visible
    useEffect(() => {
        setPage(1);
    }, [search]);

    const filtered = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-500">Manage access and account details.</p>
                </div>
                <Input
                    icon={Search}
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    containerClassName="w-full sm:w-64"
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table
                        loading={loading}
                        empty={!loading && paginated.length === 0}
                        emptyIcon={UsersIcon}
                        emptyLabel={search ? "No users match your search." : "No users found."}
                        columns={[
                            { key: "user", label: "User" },
                            { key: "role", label: "Role" },
                            { key: "status", label: "Status" },
                            { key: "joined", label: "Joined" },
                            { key: "actions", label: "Actions", align: "right" },
                        ]}
                    >
                        {paginated.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-100 transition-colors">
                                <Td>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 shrink-0">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-gray-800 truncate">{user.name}</div>
                                            <div className="text-xs text-gray-400 truncate">{user.email}</div>
                                        </div>
                                    </div>
                                </Td>
                                <Td>
                                    <Badge variant="default">Customer</Badge>
                                </Td>
                                <Td>
                                    <Badge variant="success">Active</Badge>
                                </Td>
                                <Td className="text-gray-500 whitespace-nowrap">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </Td>
                                <Td className="text-right">
                                    <button
                                        className="text-gray-500 hover:text-gray-800 transition-colors"
                                        aria-label={`Actions for ${user.name}`}
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                </Td>
                            </tr>
                        ))}
                    </Table>

                    {!loading && filtered.length > 0 && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            totalCount={filtered.length}
                            pageSize={pageSize}
                            onPageChange={setPage}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
