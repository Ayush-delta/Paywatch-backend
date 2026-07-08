import { useEffect, useState } from "react";
import { fetchSubscriptions } from "../api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { StatsCard } from "../components/ui/StatsCard";
import { Input } from "../components/ui/Input";
import { Table, Td } from "../components/ui/Table";
import { Search, DollarSign, Repeat, XCircle, CreditCard } from "lucide-react";
import AreaChart from "../components/charts/AreaChart";

const statusColors = {
    active: "success",
    cancelled: "danger",
    expired: "warning",
};

const FILTERS = ["all", "active", "cancelled", "expired"];

export default function Subscriptions() {
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const res = await fetchSubscriptions();
                setSubs(res.data?.data || res.data || []);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = subs.filter((s) => {
        const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || s.status === filter;
        return matchSearch && matchFilter;
    });

    const totalRevenue = subs.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const activeSubs = subs.filter((s) => s.status === "active").length;
    const churnRate = subs.length
        ? ((subs.filter((s) => s.status === "cancelled").length / subs.length) * 100).toFixed(1)
        : 0;

    // NOTE: distributes the current total across months for a placeholder trend line.
    // Swap for GET /admin/subscriptions/revenue-trend (real time series) when available.
    const revenueData = [
        { name: "Jan", value: totalRevenue * 0.4 },
        { name: "Feb", value: totalRevenue * 0.5 },
        { name: "Mar", value: totalRevenue * 0.7 },
        { name: "Apr", value: totalRevenue * 0.6 },
        { name: "May", value: totalRevenue * 0.8 },
        { name: "Jun", value: totalRevenue },
    ];

    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                    Subscriptions & Revenue
                </h1>
                <p className="text-gray-500">Monitor recurring revenue and customer retention.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Monthly Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend="up"
                    color="emerald"
                />
                <StatsCard
                    title="Active Subscriptions"
                    value={activeSubs}
                    icon={Repeat}
                    trend="up"
                    color="indigo"
                />
                <StatsCard
                    title="Churn Rate"
                    value={`${churnRate}%`}
                    icon={XCircle}
                    trend={churnRate > 0 ? "down" : "neutral"}
                    color="rose"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[260px] sm:h-[300px] w-full">
                        <AreaChart data={revenueData} dataKey="value" name="Revenue" color="#10b981" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${filter === f
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-800"
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    <Input
                        icon={Search}
                        type="text"
                        placeholder="Search subscriptions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        containerClassName="w-full sm:w-64"
                        className="focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    />
                </div>

                <Table
                    loading={loading}
                    empty={!loading && filtered.length === 0}
                    emptyIcon={CreditCard}
                    emptyLabel="No subscriptions found matching your filters."
                    columns={[
                        { key: "sub", label: "Subscription" },
                        { key: "price", label: "Price" },
                        { key: "freq", label: "Frequency" },
                        { key: "status", label: "Status" },
                        { key: "renewal", label: "Renewal Date" },
                    ]}
                >
                    {filtered.map((sub) => (
                        <tr key={sub._id} className="hover:bg-gray-100 transition-colors">
                            <Td className="font-medium text-gray-800 capitalize">{sub.name}</Td>
                            <Td className="font-mono text-emerald-600 whitespace-nowrap">
                                {sub.currency} {sub.price.toFixed(2)}
                            </Td>
                            <Td className="capitalize text-gray-500">{sub.frequency}</Td>
                            <Td>
                                <Badge variant={statusColors[sub.status] || "default"}>{sub.status}</Badge>
                            </Td>
                            <Td className="text-gray-500 whitespace-nowrap">
                                {new Date(sub.renewalDate).toLocaleDateString()}
                            </Td>
                        </tr>
                    ))}
                </Table>
            </Card>
        </div>
    );
}
