import { useEffect, useState } from "react";
import { Users, CreditCard, Activity, ShieldAlert } from "lucide-react";
import { StatsCard } from "../components/ui/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { SkeletonGrid } from "../components/ui/Skeleton";
import AreaChart from "../components/charts/AreaChart";
import PieChart from "../components/charts/PieChart";
import BarChart from "../components/charts/BarChart";
import ActivityFeed from "../components/ActivityFeed";
import {
    fetchUserStats,
    fetchSecurityStats,
    fetchActivity,
    fetchSubscriptionStats,
    fetchUserGrowth,
} from "../api/admin";

export default function Overview() {
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState({ total: 0, newToday: 0 });
    const [securityStats, setSecurityStats] = useState({ total: 0, todayBlocks: 0, topIps: [] });
    const [activity, setActivity] = useState([]);
    const [subsStats, setSubsStats] = useState({ active: 0, expired: 0, cancelled: 0 });
    const [growth, setGrowth] = useState([]);

    useEffect(() => {
        async function loadData() {
            try {
                const [userRes, secRes, actRes, subsRes, growthRes] = await Promise.allSettled([
                    fetchUserStats(),
                    fetchSecurityStats(),
                    fetchActivity(),
                    fetchSubscriptionStats(),
                    fetchUserGrowth("7d"),
                ]);

                if (userRes.status === "fulfilled" && userRes.value?.data) {
                    setUserStats(userRes.value.data);
                }

                if (secRes.status === "fulfilled" && secRes.value?.data) {
                    setSecurityStats(secRes.value.data);
                }

                if (actRes.status === "fulfilled" && actRes.value?.data) {
                    setActivity(actRes.value.data);
                }

                // Real status breakdown from a server-side aggregation,
                // instead of fetching every subscription to count client-side.
                if (subsRes.status === "fulfilled" && subsRes.value?.data) {
                    setSubsStats(subsRes.value.data);
                }

                // Real daily signup series, replacing the previous hardcoded chart data.
                if (growthRes.status === "fulfilled" && growthRes.value?.data) {
                    setGrowth(growthRes.value.data);
                }
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const pieData = [
        { name: "Active", value: subsStats.active },
        { name: "Expired", value: subsStats.expired },
        { name: "Cancelled", value: subsStats.cancelled },
    ];

    const pieColors = ["#10b981", "#f59e0b", "#ef4444"];

    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Dashboard Overview
                </h1>
                <p className="text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            {/* Stats Row */}
            {loading ? (
                <SkeletonGrid count={4} />
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
                        value={activity.filter((a) => a.type === "workflow").length}
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
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>User Growth (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AreaChart data={growth} dataKey="value" color="#6366f1" name="Signups" />
                    </CardContent>
                </Card>

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
                                data={securityStats.topIps.map((ip) => ({
                                    name: ip._id,
                                    value: ip.count,
                                }))}
                                dataKey="value"
                                color="#ef4444"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
                                No blocked IPs recorded yet
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
