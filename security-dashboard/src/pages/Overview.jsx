import { useEffect, useState } from "react";
import { Users, CreditCard, Activity, ShieldAlert } from "lucide-react";
import { StatsCard } from "../components/ui/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import AreaChart from "../components/charts/AreaChart";
import PieChart from "../components/charts/PieChart";
import BarChart from "../components/charts/BarChart";
import ActivityFeed from "../components/ActivityFeed";
import { fetchSubscriptions } from "../api";
import { fetchUserStats, fetchSecurityStats, fetchActivity } from "../api/admin";

export default function Overview() {
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState({ total: 0, newToday: 0 });
    const [securityStats, setSecurityStats] = useState({ total: 0, todayBlocks: 0, topIps: [] });
    const [activity, setActivity] = useState([]);
    const [subsStats, setSubsStats] = useState({ active: 0, expired: 0, cancelled: 0 });

    useEffect(() => {
        async function loadData() {
            try {
                const [userRes, secRes, actRes, subsRes] = await Promise.allSettled([
                    fetchUserStats(),
                    fetchSecurityStats(),
                    fetchActivity(),
                    fetchSubscriptions(),
                ]);

                // User stats from admin API
                if (userRes.status === "fulfilled" && userRes.value?.data) {
                    setUserStats(userRes.value.data);
                }

                // Security stats from admin API
                if (secRes.status === "fulfilled" && secRes.value?.data) {
                    setSecurityStats(secRes.value.data);
                }

                // Activity from admin API
                if (actRes.status === "fulfilled" && actRes.value?.data) {
                    setActivity(actRes.value.data);
                }

                // Subscriptions breakdown
                if (subsRes.status === "fulfilled") {
                    const subsData = subsRes.value.data?.data || [];
                    setSubsStats({
                        active: subsData.filter(s => s.status === "active").length,
                        expired: subsData.filter(s => s.status === "expired").length,
                        cancelled: subsData.filter(s => s.status === "cancelled").length,
                    });
                }
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const chartData = [
        { name: "Mon", value: 12 },
        { name: "Tue", value: 18 },
        { name: "Wed", value: 45 },
        { name: "Thu", value: 30 },
        { name: "Fri", value: 55 },
        { name: "Sat", value: 40 },
        { name: "Sun", value: 60 },
    ];

    const pieData = [
        { name: "Active", value: subsStats.active },
        { name: "Expired", value: subsStats.expired },
        { name: "Cancelled", value: subsStats.cancelled },
    ];

    const pieColors = ["#10b981", "#f59e0b", "#ef4444"];

    // Skeleton block for stats cards
    const StatsSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="hover:border-slate-700">
                    <CardContent className="flex items-start justify-between p-6">
                        <div className="space-y-3 animate-pulse">
                            <div className="h-3 w-24 bg-slate-700/60 rounded" />
                            <div className="h-7 w-16 bg-slate-700/60 rounded" />
                            <div className="h-2.5 w-20 bg-slate-700/40 rounded" />
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-700/40 animate-pulse" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                    Dashboard Overview
                </h1>
                <p className="text-slate-400">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            {/* Stats Row */}
            {loading ? (
                <StatsSkeleton />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Users"
                        value={userStats.total}
                        icon={Users}
                        change={userStats.newToday > 0 ? `+${userStats.newToday} today` : "No new today"}
                        trend={userStats.newToday > 0 ? "up" : "neutral"}
                        color="indigo"
                    />
                    <StatsCard
                        title="Active Subscriptions"
                        value={subsStats.active}
                        icon={CreditCard}
                        change={`${subsStats.expired} expired`}
                        trend={subsStats.active > 0 ? "up" : "neutral"}
                        color="emerald"
                    />
                    <StatsCard
                        title="Workflows Executed"
                        value={activity.filter(a => a.type === "workflow").length}
                        icon={Activity}
                        trend="neutral"
                        color="amber"
                    />
                    <StatsCard
                        title="Security Blocks"
                        value={securityStats.total}
                        icon={ShieldAlert}
                        change={securityStats.todayBlocks > 0 ? `+${securityStats.todayBlocks} today` : "None today"}
                        trend={securityStats.todayBlocks > 0 ? "up" : "neutral"}
                        color="rose"
                    />
                </div>
            )}

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Growth Area Chart - Spans 2 columns */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>User Growth & Traffic</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AreaChart data={chartData} dataKey="value" color="#6366f1" name="Users" />
                    </CardContent>
                </Card>

                {/* Recent Activity Feed */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ActivityFeed activities={activity} loading={loading} />
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PieChart data={pieData} colors={pieColors} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Top Blocked IPs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {securityStats.topIps.length > 0 ? (
                            <BarChart
                                data={securityStats.topIps.map(ip => ({
                                    name: ip._id,
                                    value: ip.count,
                                }))}
                                dataKey="value"
                                color="#ef4444"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-slate-500 text-sm">
                                No blocked IPs recorded yet
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
