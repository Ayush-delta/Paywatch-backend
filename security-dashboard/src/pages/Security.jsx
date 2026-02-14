import { useEffect, useState } from "react";
import { fetchLogs as fetchSecurityLogs, fetchStats as fetchSecurityStats } from "../api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { StatsCard } from "../components/ui/StatsCard";
import { ShieldAlert, Lock, Globe, Server, AlertCircle } from "lucide-react";
import AreaChart from "../components/charts/AreaChart";
import BarChart from "../components/charts/BarChart";

// Helper for log method coloring
const methodColors = {
    GET: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    POST: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
    PUT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function Security() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ total: 0, topIps: [], topRoutes: [] });
    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            const [l, s] = await Promise.all([fetchSecurityLogs(), fetchSecurityStats()]);
            setLogs(l.data?.data || l.data || []);
            setStats(s.data || { total: 0, topIps: [], topRoutes: [] });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        const interval = setInterval(load, 5000); // Auto-refresh
        return () => clearInterval(interval);
    }, []);

    // Prepare chart data
    const timeMap = {};
    logs.forEach(log => {
        const time = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeMap[time] = (timeMap[time] || 0) + 1;
    });

    const timeData = Object.entries(timeMap)
        .sort((a, b) => new Date('1970/01/01 ' + a[0]) - new Date('1970/01/01 ' + b[0]))
        .map(([name, value]) => ({ name, value }));

    const ipData = (stats.topIps || []).slice(0, 5).map(ip => ({
        name: ip._id,
        value: ip.count
    }));

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        Security Intelligence
                    </h1>
                    <p className="text-slate-400">Real-time threat monitoring and WAF analytics.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-semibold animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    LIVE MONITORING
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    title="Threats Blocked"
                    value={stats.total}
                    icon={ShieldAlert}
                    change="+24"
                    trend="up"
                    color="rose"
                />
                <StatsCard
                    title="Active Bans"
                    value={stats.topIps?.length || 0}
                    icon={Lock}
                    change="0"
                    trend="neutral"
                    color="amber"
                />
                <StatsCard
                    title="Suspicious IPs"
                    value={12}
                    icon={Globe}
                    change="-4"
                    trend="down"
                    color="indigo"
                />
                <StatsCard
                    title="System Load"
                    value="42%"
                    icon={Server}
                    change="+2%"
                    trend="up"
                    color="emerald"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle>Attack Frequency (Last Hour)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AreaChart data={timeData} dataKey="value" name="Attacks" color="#f43f5e" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Attacking IPs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart data={ipData} dataKey="value" color="#f59e0b" />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Logs Table */}
            <Card className="border-red-500/10 shadow-red-500/5">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle size={20} className="text-red-500" />
                            Recent Security Events
                        </CardTitle>
                        <Badge variant="danger">{logs.length} events</Badge>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-900/50 text-slate-400 font-medium whitespace-nowrap">
                            <tr>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">Source IP</th>
                                <th className="px-6 py-3">Method</th>
                                <th className="px-6 py-3">Path</th>
                                <th className="px-6 py-3">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        No threats detected recently. System secure.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-800/30 transition-colors font-mono text-xs">
                                        <td className="px-6 py-3 text-slate-400">
                                            {new Date(log.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-3 text-red-300">
                                            {log.ip}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-0.5 rounded border ${methodColors[log.method] || "bg-slate-800 text-slate-400 border-slate-700"}`}>
                                                {log.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-300 truncate max-w-[200px]">
                                            {log.path}
                                        </td>
                                        <td className="px-6 py-3 text-red-400">
                                            {log.reason}
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
