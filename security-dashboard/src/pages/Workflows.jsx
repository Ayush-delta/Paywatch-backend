import { useState } from "react";
import { triggerReminder } from "../api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Play, Activity, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import PieChart from "../components/charts/PieChart";

export default function Workflows() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Mock Data for UI
    const recentRuns = [
        { id: "wf_123", name: "Subscription Reminder", status: "success", time: "2 mins ago", duration: "1.2s" },
        { id: "wf_124", name: "Daily Keep-Alive", status: "success", time: "1 hour ago", duration: "0.5s" },
        { id: "wf_125", name: "Subscription Reminder", status: "failed", time: "3 hours ago", duration: "5.0s" },
        { id: "wf_126", name: "Data Sync", status: "success", time: "5 hours ago", duration: "2.3s" },
    ];

    const stats = [
        { label: "Total Runs", value: "1,245", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Success Rate", value: "98.5%", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Avg Duration", value: "1.4s", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    ];

    const pieData = [
        { name: "Success", value: 980 },
        { name: "Failed", value: 15 },
        { name: "Pending", value: 45 },
    ];

    const pieColors = ["#10b981", "#ef4444", "#fbbf24"];

    const handleTrigger = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await triggerReminder();
            setMessage({ type: "success", text: res.data?.message || "Workflow triggered successfully!" });
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Failed to trigger workflow." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                        Workflows & Automation
                    </h1>
                    <p className="text-slate-400">Manage background jobs and scheduled tasks.</p>
                </div>
                <Button
                    onClick={handleTrigger}
                    loading={loading}
                    variant="primary"
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border-none shadow-lg shadow-pink-500/20"
                >
                    <Play size={16} className="mr-2" />
                    Trigger Reminders
                </Button>
            </div>

            {/* Message Feedback */}
            {message && (
                <div className={`p-4 rounded-lg border flex items-center gap-3 ${message.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                    {message.type === "success" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    {message.text}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="hover:border-slate-700 transition-all">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-100">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Executions Table */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Executions</CardTitle>
                    </CardHeader>
                    <div className="px-6 pb-6">
                        <table className="w-full text-sm text-left">
                            <thead className="text-slate-400 font-medium border-b border-slate-800">
                                <tr>
                                    <th className="py-3">Workflow</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3">Duration</th>
                                    <th className="py-3 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {recentRuns.map((run) => (
                                    <tr key={run.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 font-medium text-slate-200">{run.name}</td>
                                        <td className="py-3">
                                            <Badge variant={run.status === "success" ? "success" : "danger"}>
                                                {run.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-slate-400 font-mono">{run.duration}</td>
                                        <td className="py-3 text-right text-slate-500">{run.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Success Rate Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Execution Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PieChart data={pieData} colors={pieColors} />
                    </CardContent>
                </Card>
            </div>

            {/* Info Section */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-900 border-indigo-500/20">
                <CardHeader>
                    <CardTitle className="text-indigo-400 flex items-center gap-2">
                        <Activity size={20} />
                        How it works
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-400 leading-relaxed">
                        This dashboard connects to your Upstash QStash message queue.
                        When you click "Trigger Reminders", a message is published to the
                        <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">/api/v1/workflows/subscription/reminder</code>
                        endpoint, which initiates the renewal checks for all active subscriptions.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
