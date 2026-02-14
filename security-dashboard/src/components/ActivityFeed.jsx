import { motion } from "framer-motion";
import { UserPlus, CreditCard, ShieldAlert, Activity } from "lucide-react";

const ICON_MAP = {
    user: { icon: UserPlus, color: "bg-indigo-500/20 text-indigo-400" },
    subscription: { icon: CreditCard, color: "bg-emerald-500/20 text-emerald-400" },
    security: { icon: ShieldAlert, color: "bg-red-500/20 text-red-400" },
    workflow: { icon: Activity, color: "bg-amber-500/20 text-amber-400" },
};

function timeAgo(dateStr) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const TYPE_LABELS = {
    user: "User",
    subscription: "Subscription",
    security: "Security",
    workflow: "Workflow",
};

export default function ActivityFeed({ activities = [], loading = false }) {
    // Skeleton loader
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-xl animate-pulse">
                        <div className="w-9 h-9 rounded-lg bg-slate-700/60" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-32 bg-slate-700/60 rounded" />
                            <div className="h-2.5 w-48 bg-slate-700/40 rounded" />
                        </div>
                        <div className="h-2.5 w-14 bg-slate-700/40 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (!activities.length) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <Activity size={32} className="mb-2 opacity-40" />
                <p className="text-sm">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {activities.map((activity, index) => {
                const mapping = ICON_MAP[activity.type] || ICON_MAP.workflow;
                const IconComponent = mapping.icon;

                return (
                    <motion.div
                        key={activity._id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
                    >
                        <div className={`p-2 rounded-lg shrink-0 ${mapping.color}`}>
                            <IconComponent size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-700/60 text-slate-300">
                                    {TYPE_LABELS[activity.type] || activity.type}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate">
                                {activity.message}
                            </p>
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
                            {timeAgo(activity.createdAt)}
                        </span>
                    </motion.div>
                );
            })}
        </div>
    );
}
