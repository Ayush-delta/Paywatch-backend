import { ResponsiveContainer, AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl shadow-xl">
                <p className="font-medium text-slate-200 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm font-semibold" style={{ color: entry.stroke }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AreaChart({ data, dataKey, name = "Value", color = "#6366f1" }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsAreaChart data={data}>
                <defs>
                    <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="#475569"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    dy={10}
                />
                <YAxis
                    stroke="#475569"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#475569", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    name={name}
                    stroke={color}
                    fillOpacity={1}
                    fill={`url(#color${dataKey})`}
                    strokeWidth={3}
                    activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                />
            </RechartsAreaChart>
        </ResponsiveContainer>
    );
}
