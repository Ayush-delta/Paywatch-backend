import { useState } from "react";
import { triggerReminder } from "../api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Table, Td } from "../components/ui/Table";
import { useToast } from "../components/ui/Toast";
import { Play, Activity, CheckCircle, Clock } from "lucide-react";
import PieChart from "../components/charts/PieChart";

// Placeholder execution history for the UI until GET /workflows/runs exists.
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

export default function Workflows() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleTrigger = async () => {
        setLoading(true);
        try {
            const res = await triggerReminder();
            toast({
                type: "success",
                title: "Workflow triggered",
                description: res.data?.message || "Reminders queued successfully.",
            });
        } catch (err) {
            toast({
                type: "error",
                title: "Trigger failed",
                description: err.response?.data?.message || err.message || "Failed to trigger workflow.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                        Workflows & Automation
                    </h1>
                    <p className="text-gray-500">Manage background jobs and scheduled tasks.</p>
                </div>
                <Button
                    onClick={handleTrigger}
                    loading={loading}
                    variant="primary"
                    className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border-none shadow-lg shadow-pink-500/20"
                >
                    <Play size={16} className="mr-2" />
                    Trigger Reminders
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="hover:border-gray-300 transition-all">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Executions</CardTitle>
                    </CardHeader>
                    <Table
                        columns={[
                            { key: "wf", label: "Workflow" },
                            { key: "status", label: "Status" },
                            { key: "duration", label: "Duration" },
                            { key: "time", label: "Time", align: "right" },
                        ]}
                    >
                        {recentRuns.map((run) => (
                            <tr key={run.id} className="hover:bg-gray-100/60 transition-colors">
                                <Td className="font-medium text-gray-800">{run.name}</Td>
                                <Td>
                                    <Badge variant={run.status === "success" ? "success" : "danger"}>
                                        {run.status}
                                    </Badge>
                                </Td>
                                <Td className="text-gray-500 font-mono">{run.duration}</Td>
                                <Td className="text-right text-gray-400">{run.time}</Td>
                            </tr>
                        ))}
                    </Table>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Execution Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PieChart data={pieData} colors={pieColors} />
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
                <CardHeader>
                    <CardTitle className="text-indigo-500 flex items-center gap-2">
                        <Activity size={20} />
                        How it works
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500 leading-relaxed">
                        This dashboard connects to your Upstash QStash message queue.
                        When you click "Trigger Reminders", a message is published to the{" "}
                        <code className="mx-1 px-1.5 py-0.5 rounded bg-gray-100 text-indigo-600 font-mono text-xs break-all">
                            /api/v1/workflows/subscription/reminder
                        </code>{" "}
                        endpoint, which initiates the renewal checks for all active subscriptions.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
