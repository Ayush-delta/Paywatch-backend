import { Card, CardContent } from "./Card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatsCard({ title, value, icon: Icon, change, trend = "up", color = "indigo" }) {
    const colors = {
        indigo: "bg-indigo-500/10 text-indigo-500",
        emerald: "bg-emerald-500/10 text-emerald-500",
        amber: "bg-amber-500/10 text-amber-500",
        rose: "bg-rose-500/10 text-rose-500",
    };

    const trendColors = {
        up: "text-emerald-500",
        down: "text-rose-500",
        neutral: "text-slate-500",
    };

    return (
        <Card className="hover:border-slate-700 hover:shadow-lg transition-all">
            <CardContent className="flex items-start justify-between p-6">
                <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-100">{value}</h3>

                    {change && (
                        <div className={`flex items-center mt-2 text-xs font-medium ${trendColors[trend]}`}>
                            {trend === "up" ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                            {change}
                            <span className="text-slate-500 ml-1">vs last month</span>
                        </div>
                    )}
                </div>

                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    <Icon size={24} />
                </div>
            </CardContent>
        </Card>
    );
}
