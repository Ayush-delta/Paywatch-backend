import { useEffect, useState } from "react";
import { fetchSubscriptions } from "../api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { StatsCard } from "../components/ui/StatsCard";
import { Search, Filter, DollarSign, Repeat, XCircle, CheckCircle } from "lucide-react";
import AreaChart from "../components/charts/AreaChart";

// Status Colors Helper
const statusColors = {
    active: "success",
    cancelled: "danger",
    expired: "warning",
};

const statusIcons = {
    active: CheckCircle,
    cancelled: XCircle,
    expired: XCircle,
};

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

    // Calculate Stats
    const totalRevenue = subs.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const activeSubs = subs.filter((s) => s.status === "active").length;
    const churnRate = subs.length ? ((subs.filter(s => s.status === 'cancelled').length / subs.length) * 100).toFixed(1) : 0;

    // Mock Graph Data based on real totals (distributing over months for visual)
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
                <p className="text-slate-400">Monitor recurring revenue and customer retention.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Monthly Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    change="+12.5%"
                    trend="up"
                    color="emerald"
                />
                <StatsCard
                    title="Active Subscriptions"
                    value={activeSubs}
                    icon={Repeat}
                    change="+34"
                    trend="up"
                    color="indigo"
                />
                <StatsCard
                    title="Churn Rate"
                    value={`${churnRate}%`}
                    icon={XCircle}
                    change="-0.5%"
                    trend="down"
                    color="rose"
                />
            </div>

            {/* Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <AreaChart data={revenueData} dataKey="value" name="Revenue" color="#10b981" />
                    </div>
                </CardContent>
            </Card>

            {/* Subscription List Table */}
            <Card>
                <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2 p-1 bg-slate-900 rounded-lg">
                        {["all", "active", "cancelled"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === f
                                        ? "bg-slate-800 text-slate-100 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200"
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search subscriptions..."
                            className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:ring-2 focus:ring-emerald-500/50 outline-none w-full transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-900/50 text-slate-400 font-medium whitespace-nowrap">
                            <tr>
                                <th className="px-6 py-3">Subscription</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Frequency</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Renewal Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        No subscriptions found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((sub) => (
                                    <tr key={sub._id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200 capitalize">
                                            {sub.name}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-emerald-400">
                                            {sub.currency} {sub.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 capitalize text-slate-400">
                                            {sub.frequency}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={statusColors[sub.status] || "default"}>
                                                {sub.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {new Date(sub.renewalDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
