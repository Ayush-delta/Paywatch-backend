import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl shadow-xl">
                <p className="font-medium text-slate-200 mb-2">{label}</p>
                <p className="text-sm font-semibold text-indigo-400">
                    {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

export default function BarChart({ data, dataKey, color = "#818cf8" }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={data}>
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
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b" }} />
                <Bar
                    dataKey={dataKey}
                    fill={color}
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                />
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}
