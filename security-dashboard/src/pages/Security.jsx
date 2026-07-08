import { useEffect, useState } from "react";
import { fetchLogs as fetchSecurityLogs, fetchStats as fetchSecurityStats } from "../api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { StatsCard } from "../components/ui/StatsCard";
import { Table, Td } from "../components/ui/Table";
import { ShieldAlert, Lock, Globe, Server, AlertCircle, ShieldOff } from "lucide-react";
import AreaChart from "../components/charts/AreaChart";
import BarChart from "../components/charts/BarChart";

const methodColors = {
    GET: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    POST: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
    PUT: "bg-amber-500/10 text-amber-500 border-amber-500/20",
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

    const timeMap = {};
    logs.forEach((log) => {
        const time = new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        timeMap[time] = (timeMap[time] || 0) + 1;
    });

    const timeData = Object.entries(timeMap)
        .sort((a, b) => new Date("1970/01/01 " + a[0]) - new Date("1970/01/01 " + b[0]))
        .map(([name, value]) => ({ name, value }));

    const ipData = (stats.topIps || []).slice(0, 5).map((ip) => ({
        name: ip._id,
        value: ip.count,
    }));

    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        Security Intelligence
                    </h1>
                    <p className="text-gray-500">Real-time threat monitoring and WAF analytics.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-xs font-semibold w-fit">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE MONITORING
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Threats Blocked" value={stats.total} icon={ShieldAlert} trend="up" color="rose" />
                <StatsCard
                    title="Active Bans"
                    value={stats.topIps?.length || 0}
                    icon={Lock}
                    trend="neutral"
                    color="amber"
                />
                <StatsCard title="Suspicious IPs" value={stats.topIps?.length || 0} icon={Globe} trend="neutral" color="indigo" />
                <StatsCard title="Recent Events" value={logs.length} icon={Server} trend="neutral" color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
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
                <Table
                    loading={loading}
                    empty={!loading && logs.length === 0}
                    emptyIcon={ShieldOff}
                    emptyLabel="No threats detected recently."
                    emptyHint="Your system is secure. Blocked requests will appear here in real time."
                    columns={[
                        { key: "time", label: "Timestamp" },
                        { key: "ip", label: "Source IP" },
                        { key: "method", label: "Method" },
                        { key: "path", label: "Path" },
                        { key: "reason", label: "Reason" },
                    ]}
                >
                    {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-100/60 transition-colors font-mono text-xs">
                            <Td className="text-gray-500 whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleTimeString()}
                            </Td>
                            <Td className="text-red-500">{log.ip}</Td>
                            <Td>
                                <span
                                    className={`px-2 py-0.5 rounded border ${methodColors[log.method] || "bg-gray-100 text-gray-500 border-gray-300"
                                        }`}
                                >
                                    {log.method}
                                </span>
                            </Td>
                            <Td className="text-gray-700 truncate max-w-[200px]">{log.path}</Td>
                            <Td className="text-red-500">{log.reason}</Td>
                        </tr>
                    ))}
                </Table>
            </Card>
        </div>
    );
}
